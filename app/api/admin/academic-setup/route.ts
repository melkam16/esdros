// app/api/admin/academic-setup/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json();

    if (!action || !data) {
      return NextResponse.json({ error: 'Missing action or payload arguments' }, { status: 400 });
    }

    switch (action) {
      case 'CREATE_DEPARTMENT':
        const dept = await prisma.department.create({ data: { name: data.name, code: data.code } });
        return NextResponse.json({ success: true, data: dept });

      case 'CREATE_CLASS':
        const cls = await prisma.class.create({ data: { name: data.name, code: data.code, departmentId: data.departmentId } });
        return NextResponse.json({ success: true, data: cls });

      // Look for 'CREATE_SUBJECT' inside app/api/admin/academic-setup/route.ts
case 'CREATE_SUBJECT':
  const sub = await prisma.course.create({ 
    data: { 
      title: data.title, 
      code: data.code, 
      credits: data.credits, 
      classId: data.classId,
      track: data.track // 🌟 Map the track field straight to the database model
    } 
  });
  return NextResponse.json({ success: true, data: sub });

      // 🌟 NEW: Add the unified deletion engine block right here
      case 'DELETE_NODE': {
        const { id, type } = data;
        if (!id || !type) {
          return NextResponse.json({ error: 'Missing id or type parameters' }, { status: 400 });
        }

        let deletedRecord;

        if (type === 'department') {
          // Check for linked classes
          const classesCount = await prisma.class.count({ where: { departmentId: id } });
          if (classesCount > 0) {
            return NextResponse.json({ 
              error: `Cannot delete department because it is currently linked to ${classesCount} active Class Cohorts. Please reassign or delete the cohorts first.` 
            }, { status: 400 });
          }

          // Check for linked faculty
          const facultyCount = await prisma.faculty.count({ where: { departmentId: id } });
          if (facultyCount > 0) {
            return NextResponse.json({ 
              error: `Cannot delete department because it has ${facultyCount} associated faculty members. Please reassign or remove the faculty first.` 
            }, { status: 400 });
          }

          deletedRecord = await prisma.department.delete({ where: { id } });
          return NextResponse.json({ success: true, message: `Purged department structural branch natively.`, data: deletedRecord });
        } 
        
        if (type === 'class') {
          // Check for assigned students
          const studentsCount = await prisma.student.count({ where: { classId: id } });
          if (studentsCount > 0) {
            return NextResponse.json({ 
              error: `Cannot delete class cohort because it contains ${studentsCount} active student records. Please reassign these students to another cohort first.` 
            }, { status: 400 });
          }

          // Check for courses with active sections/schedules inside this class
          const coursesInClass = await prisma.course.findMany({ where: { classId: id } });
          for (const course of coursesInClass) {
            const sectionsCount = await prisma.courseSection.count({ where: { courseId: course.id } });
            if (sectionsCount > 0) {
              return NextResponse.json({
                error: `Cannot delete class cohort because its course "${course.title}" has ${sectionsCount} active scheduled sections. Please delete the course sections first.`
              }, { status: 400 });
            }
          }

          deletedRecord = await prisma.class.delete({ where: { id } });
          return NextResponse.json({ success: true, message: `Purged class structural branch natively.`, data: deletedRecord });
        } 
        
        if (type === 'course') {
          // Check for active scheduled sections
          const sectionsCount = await prisma.courseSection.count({ where: { courseId: id } });
          if (sectionsCount > 0) {
            const enrollmentsCount = await prisma.enrollment.count({
              where: { courseSection: { courseId: id } }
            });
            if (enrollmentsCount > 0) {
              return NextResponse.json({ 
                error: `Cannot delete course because it has ${sectionsCount} active scheduled sections with ${enrollmentsCount} student enrollments. Please unenroll the students first.` 
              }, { status: 400 });
            }
            
            return NextResponse.json({ 
              error: `Cannot delete course because it has ${sectionsCount} active scheduled sections. Please delete the sections first.` 
            }, { status: 400 });
          }

          deletedRecord = await prisma.course.delete({ where: { id } });
          return NextResponse.json({ success: true, message: `Purged course structural branch natively.`, data: deletedRecord });
        }

        return NextResponse.json({ error: 'Invalid entity blueprint node type.' }, { status: 400 });
      }

      case 'UPDATE_NODE':
        const { updateId, updateType, updateData } = data;
        let updatedRecord;

        if (updateType === 'department') {
          updatedRecord = await prisma.department.update({ where: { id: updateId }, data: updateData });
        } else if (updateType === 'class') {
          updatedRecord = await prisma.class.update({ where: { id: updateId }, data: updateData });
        } else if (updateType === 'course') {
          updatedRecord = await prisma.course.update({ where: { id: updateId }, data: updateData });
        } else {
          return NextResponse.json({ error: 'Invalid entity blueprint node type.' }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: `Updated ${updateType} structural branch natively.`, data: updatedRecord });

      default:
        return NextResponse.json({ error: 'Action type unmapped.' }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Academic Setup Pipeline Error:", error);
    const isRecordNotFound = error.code === 'P2025';
    return NextResponse.json(
      { 
        error: isRecordNotFound 
          ? 'The target academic blueprint node could not be found or has already been deleted.' 
          : 'Database operation failure.', 
        details: error.message 
      },
      { status: isRecordNotFound ? 404 : 500 }
    );
  }
}