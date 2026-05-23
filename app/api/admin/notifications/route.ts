import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/mail';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    
    const dbUser = await prisma.user.findUnique({ where: { id: payload.id as string } });
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Load helper context (classes and departments)
    const classes = await prisma.class.findMany({
      include: { department: true }
    });

    const departments = await prisma.department.findMany();

    // Load recent notifications
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: {
        classes,
        departments,
        notifications
      }
    });

  } catch (error: any) {
    console.error('Error fetching administrative notifications helper context:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    
    const dbUser = await prisma.user.findUnique({ where: { id: payload.id as string } });
    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, message, targetType, targetValue } = await req.json();

    if (!title || !message || !targetType) {
      return NextResponse.json({ error: 'Title, message, and targetType are required.' }, { status: 400 });
    }

    // 1. Persist notification to database
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        targetType,
        targetValue: targetValue || null
      }
    });

    // 2. Query target recipients
    let recipients: string[] = [];

    if (targetType === 'ALL_STUDENTS') {
      const students = await prisma.student.findMany({
        where: { NOT: { status: { in: ['WITHDRAWN', 'DISMISSED'] } } },
        include: { user: true }
      });
      recipients = students.map(s => s.user.email);
    } 
    else if (targetType === 'ALL_FACULTY') {
      const faculty = await prisma.faculty.findMany({
        include: { user: true }
      });
      recipients = faculty.map(f => f.user.email);
    } 
    else if (targetType === 'BATCH') {
      const students = await prisma.student.findMany({
        where: { 
          classId: targetValue,
          NOT: { status: { in: ['WITHDRAWN', 'DISMISSED'] } }
        },
        include: { user: true }
      });
      recipients = students.map(s => s.user.email);
    } 
    else if (targetType === 'DEPARTMENT') {
      // Find students and faculty in department
      const students = await prisma.student.findMany({
        where: { 
          class: { departmentId: targetValue },
          NOT: { status: { in: ['WITHDRAWN', 'DISMISSED'] } }
        },
        include: { user: true }
      });
      const faculty = await prisma.faculty.findMany({
        where: { departmentId: targetValue },
        include: { user: true }
      });
      recipients = [
        ...students.map(s => s.user.email),
        ...faculty.map(f => f.user.email)
      ];
    } 
    else if (targetType === 'INDIVIDUAL') {
      recipients = [targetValue];
    }

    // De-duplicate emails
    recipients = Array.from(new Set(recipients)).filter(email => email && email.includes('@'));

    // 3. Trigger asynchronous background emails
    Promise.all(
      recipients.map(email => 
        sendEmail({
          to: email,
          subject: `📢 [Seminary Announcement] ${title}`,
          text: `Hello,\n\nA new announcement has been published to your Esdros Seminary Portal:\n\n---\n${title}\n---\n\n${message}\n\nTo view all announcements and updates, please login to your Student/Faculty dashboard.\n\nBest regards,\nEsdros Theological Seminary`
        })
      )
    ).catch(err => console.error('Error broadcasting announcement emails:', err));

    return NextResponse.json({
      success: true,
      message: `Announcement created and broadcast queued successfully to ${recipients.length} recipient(s).`,
      recipientCount: recipients.length
    });

  } catch (error: any) {
    console.error('Error publishing administrative announcement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
