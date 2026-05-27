import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';
import { sendEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { students } = await req.json();

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ success: false, error: 'No student data provided' }, { status: 400 });
    }

    const importedStudents: any[] = [];

    // Process all imports inside a single transactional block
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Fetch default systems variables to anchor records
      const defaultTheologyClass = await tx.class.findFirst({
        where: { name: { contains: 'Theology', mode: 'insensitive' } }
      });
      const defaultGeezClass = await tx.class.findFirst({
        where: { name: { contains: 'Geez', mode: 'insensitive' } }
      });
      const absoluteFallbackClass = await tx.class.findFirst();

      const defaultFaculty = await tx.faculty.findFirst({
        include: { user: true }
      });

      if (!absoluteFallbackClass) {
        throw new Error('No Academic Class cohort found in the database. Please seed at least one class first.');
      }
      if (!defaultFaculty) {
        throw new Error('No Faculty found to anchor sections. Please register at least one faculty first.');
      }

      for (const st of students) {
        const { firstName, lastName, track, classCohort, email: rawEmail, courses } = st;

        if (!firstName || !lastName || !track) {
          throw new Error('Missing required student identity parameters in spreadsheet rows.');
        }

        // Determine programmatic class cohort
        let studentClass = null;
        if (classCohort) {
          studentClass = await tx.class.findFirst({
            where: {
              OR: [
                { code: { equals: classCohort.trim(), mode: 'insensitive' } },
                { name: { contains: classCohort.trim(), mode: 'insensitive' } }
              ]
            }
          });
        }
        if (!studentClass) {
          studentClass = track === 'THEOLOGY' ? defaultTheologyClass : defaultGeezClass;
        }
        if (!studentClass) {
          studentClass = absoluteFallbackClass;
        }

        // Resolve clean, unique email address
        let email = rawEmail ? rawEmail.trim() : '';
        if (!email) {
          const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@esderos.org`.replace(/\s+/g, '');
          email = baseEmail;
          let counter = 1;
          while (await tx.user.findUnique({ where: { email } })) {
            email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${counter}@esderos.org`.replace(/\s+/g, '');
            counter++;
          }
        } else {
          // If admin provided a specific email, verify that it isn't already registered
          const existingUser = await tx.user.findUnique({ where: { email } });
          if (existingUser) {
            throw new Error(`Conflicting email: A user with email address "${email}" already exists in the system.`);
          }
        }

        // Create User flagged as invited (signup pending)
        const user = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            passwordHash: '__INVITED__',
            role: 'STUDENT'
          }
        });

        // Resolve Department code
        const targetClass = await tx.class.findUnique({
          where: { id: studentClass.id },
          include: { department: true }
        });
        const deptCode = targetClass?.department?.code || (track === 'THEOLOGY' ? 'THEO' : 'GEEZ');

        // Generate sequential simple Student ID
        const count = await tx.student.count({
          where: { id: { startsWith: `${deptCode}-` } }
        });
        
        let sequentialNumber = String(count + 1).padStart(4, '0');
        let studentId = `${deptCode}-${sequentialNumber}`;
        let isUnique = false;
        let attempt = 0;
        
        while (!isUnique) {
          const existing = await tx.student.findUnique({ where: { id: studentId } });
          if (!existing) {
            isUnique = true;
          } else {
            attempt++;
            const newNum = String(count + 1 + attempt).padStart(4, '0');
            studentId = `${deptCode}-${newNum}`;
          }
        }

        // Create Student with ACTIVE status
        const student = await tx.student.create({
          data: {
            id: studentId,
            userId: user.id,
            status: 'ACTIVE',
            track: track as any,
            classId: studentClass.id
          }
        });

        const dbEnrollments: any[] = [];

        if (Array.isArray(courses) && courses.length > 0) {
          for (const c of courses) {
            const { code, title, credits, status, grade, letterGrade, semester: rawSemester } = c;

            // Find or dynamically auto-create Course
            let dbCourse = await tx.course.findFirst({
              where: { code: { equals: code.trim(), mode: 'insensitive' } }
            });

            if (!dbCourse) {
              dbCourse = await tx.course.create({
                data: {
                  code: code.trim().toUpperCase(),
                  title: title ? title.trim() : `${code.trim().toUpperCase()} Course`,
                  credits: parseInt(credits) || 3,
                  track: track as any,
                  classId: studentClass.id
                }
              });
            }

            // Find or dynamically auto-create CourseSection for this term
            const targetSemester = rawSemester ? rawSemester.trim() : 'Fall 2026';
            let dbSection = await tx.courseSection.findFirst({
              where: {
                courseId: dbCourse.id,
                semester: targetSemester
              }
            });

            if (!dbSection) {
              dbSection = await tx.courseSection.create({
                data: {
                  courseId: dbCourse.id,
                  facultyId: defaultFaculty.id,
                  semester: targetSemester,
                  capacity: 100,
                  room: 'Main Lecture Hall'
                }
              });
            }

            const isCompleted = status === 'COMPLETED';

            // Create Enrollment record
            const enrollment = await tx.enrollment.create({
              data: {
                studentId: student.id,
                courseSectionId: dbSection.id,
                enrollmentStatus: 'APPROVED',
                grade: isCompleted && grade !== null ? parseFloat(grade) : null,
                letterGrade: isCompleted && letterGrade ? letterGrade : null,
                isLocked: isCompleted,
                gradedAt: isCompleted ? new Date() : null,
                lockedAt: isCompleted ? new Date() : null
              },
              include: {
                courseSection: {
                  include: { course: true }
                }
              }
            });

            dbEnrollments.push(enrollment);
          }
        }

        // Send sign-up invitation email
        const origin = new URL(req.url).origin;
        const signupUrl = `${origin}/signup?email=${encodeURIComponent(email)}`;

        await sendEmail({
          to: email,
          subject: 'Complete Your Esderos EOTC Theological Seminary Account Setup',
          text: `Hello ${firstName} ${lastName},\n\nWelcome to Esderos EOTC Theological Seminary! Your active student record and academic enrollments have been securely loaded into our portal system by the Registrar's Office.\n\nTo sign up, set your password, and activate your student portal to see your imported transcript and class schedule details, please click the link below:\n\n${signupUrl}\n\nUsername/Institutional Email: ${email}\n\nWe look forward to supporting your theological journey.\n\nBest regards,\nRegistrar's Office\nEsderos EOTC Theological Seminary`
        }).catch((err) => {
          console.error(`Failed to send invite email to ${email}:`, err);
        });

        importedStudents.push({
          id: student.id,
          user: { firstName, lastName, email },
          track,
          status: 'ACTIVE',
          enrollments: dbEnrollments
        });
      }

      return importedStudents;
    });

    return NextResponse.json({
      success: true,
      count: transactionResult.length,
      data: transactionResult
    });

  } catch (error: any) {
    console.error("Batch Active Students Import Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to execute batch active students import transaction.' 
    }, { status: 500 });
  }
}
