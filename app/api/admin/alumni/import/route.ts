import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';

export async function POST(req: Request) {
  try {
    const { students } = await req.json();

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'No student data provided' }, { status: 400 });
    }

    const importedAlumni: any[] = [];

    // Process all imports inside a single ACID compliant Prisma transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Fetch default systems variables to anchor legacy records
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
        throw new Error('No Academic Class found in the system to anchor the legacy records. Please seed a class first.');
      }
      if (!defaultFaculty) {
        throw new Error('No Faculty Instructor found in the system to anchor the legacy course sections. Please register at least one faculty first.');
      }

      for (const st of students) {
        const { firstName, lastName, track, graduationYear, email: rawEmail, courses } = st;

        if (!firstName || !lastName || !track) {
          throw new Error('Spreadsheet rows are missing required student parameters.');
        }

        // Determine programmatic class cohort
        let studentClass = track === 'THEOLOGY' ? defaultTheologyClass : defaultGeezClass;
        if (!studentClass) {
          studentClass = absoluteFallbackClass;
        }

        // Resolve clean, unique email address
        let email = rawEmail ? rawEmail.trim() : '';
        if (!email) {
          const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${graduationYear || 'legacy'}@esdros.org`.replace(/\s+/g, '');
          email = baseEmail;
          let counter = 1;
          while (await tx.user.findUnique({ where: { email } })) {
            email = `${baseEmail.replace('@', `${counter}@`)}`;
            counter++;
          }
        } else {
          // If admin provided a specific email, verify that it isn't already registered
          const existingUser = await tx.user.findUnique({ where: { email } });
          if (existingUser) {
            throw new Error(`Conflicting email: A user with email address "${email}" already exists in the system.`);
          }
        }

        // Generate dynamic secure dummy password hash
        const passwordHash = hash('sha256', Math.random().toString(36).slice(-8));

        // 1. Create User
        const user = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            passwordHash,
            role: 'STUDENT'
          }
        });

        // 2. Create Student
        const student = await tx.student.create({
          data: {
            userId: user.id,
            status: 'GRADUATED',
            track: track as any,
            classId: studentClass.id
          }
        });

        // 3. Process completed transcript courses and grades
        const dbEnrollments: any[] = [];

        if (Array.isArray(courses) && courses.length > 0) {
          for (const c of courses) {
            const { code, title, credits, grade } = c;

            // Find or dynamically auto-create Course
            let dbCourse = await tx.course.findFirst({
              where: { code: { equals: code.trim(), mode: 'insensitive' } }
            });

            if (!dbCourse) {
              dbCourse = await tx.course.create({
                data: {
                  code: code.trim().toUpperCase(),
                  title: title ? title.trim() : `${code.trim().toUpperCase()} Legacy Course`,
                  credits: parseInt(credits) || 3,
                  track: track as any,
                  classId: studentClass.id
                }
              });
            }

            // Find or dynamically auto-create CourseSection for this legacy term
            const legacySemester = `Legacy ${graduationYear || new Date().getFullYear()}`;
            let dbSection = await tx.courseSection.findFirst({
              where: {
                courseId: dbCourse.id,
                semester: legacySemester
              }
            });

            if (!dbSection) {
              dbSection = await tx.courseSection.create({
                data: {
                  courseId: dbCourse.id,
                  facultyId: defaultFaculty.id,
                  semester: legacySemester,
                  capacity: 999,
                  room: 'Legacy Archive'
                }
              });
            }

            // Create completed, sealed official Enrollment record
            const enrollment = await tx.enrollment.create({
              data: {
                studentId: student.id,
                courseSectionId: dbSection.id,
                enrollmentStatus: 'APPROVED',
                grade: grade !== null ? parseFloat(grade) : null,
                isLocked: true,
                gradedAt: new Date(),
                lockedAt: new Date()
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

        importedAlumni.push({
          id: student.id,
          user: { firstName, lastName, email },
          track,
          status: 'GRADUATED',
          enrollments: dbEnrollments,
          legacyFilePath: null
        });
      }

      return importedAlumni;
    });

    return NextResponse.json({
      success: true,
      count: transactionResult.length,
      data: transactionResult
    });

  } catch (error: any) {
    console.error("Batch Import Ingestion Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to execute batch spreadsheet import transaction.' 
    }, { status: 500 });
  }
}
