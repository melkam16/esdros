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
      case 'DELETE_NODE':
        const { id, type } = data;
        let deletedRecord;

        if (type === 'department') {
          deletedRecord = await prisma.department.delete({ where: { id } });
        } else if (type === 'class') {
          deletedRecord = await prisma.class.delete({ where: { id } });
        } else if (type === 'course') {
          deletedRecord = await prisma.course.delete({ where: { id } });
        } else {
          return NextResponse.json({ error: 'Invalid entity blueprint node type.' }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: `Purged ${type} structural branch natively.`, data: deletedRecord });

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
    return NextResponse.json(
      { error: 'Database operation failure.', details: error.message },
      { status: 500 }
    );
  }
}