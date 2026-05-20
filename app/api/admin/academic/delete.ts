// app/api/admin/academics/delete/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    const { url } = req;
    const { searchParams } = new URL(url);
    
    const entityType = searchParams.get('type'); // 'department' | 'class' | 'course'
    const id = searchParams.get('id');

    if (!entityType || !id) {
      return NextResponse.json(
        { error: 'Missing targeting parameters (type and id are required).' }, 
        { status: 400 }
      );
    }

    let deletionResult;

    // Route deletion processing cleanly to the correct table mapping
    switch (entityType.toLowerCase()) {
      case 'department':
        deletionResult = await prisma.department.delete({ where: { id } });
        break;
        
      case 'class':
        deletionResult = await prisma.class.delete({ where: { id } });
        break;
        
      case 'course':
      case 'subject':
        deletionResult = await prisma.course.delete({ where: { id } });
        break;

      default:
        return NextResponse.json({ error: 'Invalid entity structural type specified.' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully purged target ${entityType} from the academic blueprint tree.`,
      deletedRecord: deletionResult 
    });

  } catch (error: any) {
    console.error("Academic structural tree deletion error:", error);
    
    return NextResponse.json(
      { 
        error: 'Database operation failed.', 
        details: error.code === 'P2025' ? 'Record not found or already deleted.' : error.message 
      }, 
      { status: 500 }
    );
  }
}