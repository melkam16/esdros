import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { departments, classes, courses } = await req.json();

    const deptsArray = Array.isArray(departments) ? departments : [];
    const classesArray = Array.isArray(classes) ? classes : [];
    const coursesArray = Array.isArray(courses) ? courses : [];

    if (deptsArray.length === 0 && classesArray.length === 0 && coursesArray.length === 0) {
      return NextResponse.json({ success: false, error: 'No data rows found in the provided Excel sheets' }, { status: 400 });
    }

    // Process all updates inside a single secure database transaction
    const result = await prisma.$transaction(async (tx) => {
      let deptsCount = 0;
      let classesCount = 0;
      let coursesCount = 0;

      // 1. Process Departments sheet
      for (const d of deptsArray) {
        const code = d.Code ? String(d.Code).trim().toUpperCase() : '';
        const name = d.Name ? String(d.Name).trim() : '';
        const description = d.Description ? String(d.Description).trim() : null;

        if (!code || !name) {
          throw new Error(`Invalid row in Departments sheet: both Code and Name are required.`);
        }

        await tx.department.upsert({
          where: { code },
          update: { name, description },
          create: { code, name, description }
        });
        deptsCount++;
      }

      // 2. Process Classes sheet
      for (const c of classesArray) {
        const code = c.Code ? String(c.Code).trim().toUpperCase() : '';
        const name = c.Name ? String(c.Name).trim() : '';
        const departmentCode = c.DepartmentCode ? String(c.DepartmentCode).trim().toUpperCase() : '';

        if (!code || !name || !departmentCode) {
          throw new Error(`Invalid row in Classes sheet: Code, Name, and DepartmentCode are required. (Row Code: "${code || 'N/A'}")`);
        }

        const dept = await tx.department.findUnique({
          where: { code: departmentCode }
        });

        if (!dept) {
          throw new Error(`Referenced Department Code "${departmentCode}" in Class "${name}" was not found. Please import the department in the same upload session.`);
        }

        await tx.class.upsert({
          where: { code },
          update: { name, departmentId: dept.id },
          create: { code, name, departmentId: dept.id }
        });
        classesCount++;
      }

      // 3. Process Courses/Subjects sheet
      for (const co of coursesArray) {
        const code = co.Code ? String(co.Code).trim().toUpperCase() : '';
        const title = co.Title ? String(co.Title).trim() : '';
        const description = co.Description ? String(co.Description).trim() : null;
        const credits = parseInt(co.Credits) || 3;
        const classCode = co.ClassCode ? String(co.ClassCode).trim().toUpperCase() : '';
        
        let track = 'THEOLOGY';
        const rawTrack = co.Track ? String(co.Track).trim().toUpperCase() : '';
        if (rawTrack === 'GEEZ_LANGUAGE' || rawTrack === 'GEEZ') {
          track = 'GEEZ_LANGUAGE';
        }

        if (!code || !title || !classCode) {
          throw new Error(`Invalid row in Courses sheet: Code, Title, and ClassCode are required. (Row Code: "${code || 'N/A'}")`);
        }

        const cls = await tx.class.findUnique({
          where: { code: classCode }
        });

        if (!cls) {
          throw new Error(`Referenced Class Code "${classCode}" in Course "${title}" was not found. Please import the class cohort in the same upload session.`);
        }

        await tx.course.upsert({
          where: { code },
          update: { title, description, credits, track: track as any, classId: cls.id },
          create: { code, title, description, credits, track: track as any, classId: cls.id }
        });
        coursesCount++;
      }

      return { deptsCount, classesCount, coursesCount };
    });

    return NextResponse.json({
      success: true,
      departmentsCount: result.deptsCount,
      classesCount: result.classesCount,
      coursesCount: result.coursesCount
    });

  } catch (error: any) {
    console.error("Academic Structure Excel Import Error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to complete academic structure batch import.' }, { status: 500 });
  }
}
