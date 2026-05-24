import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const track = formData.get('track') as string;
    const graduationYear = formData.get('graduationYear') as string;
    const file = formData.get('file') as File | null;

    if (!firstName || !lastName || !track) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Attempt to find a matching Class for this track
    let studentClass = await prisma.class.findFirst({
      where: { name: { contains: track === 'THEOLOGY' ? 'Theology' : 'Geez' } }
    });

    if (!studentClass) {
      // Fallback: Just grab ANY class. The schema strictly requires a classId.
      studentClass = await prisma.class.findFirst();
    }
    if (!studentClass) {
      return NextResponse.json({ error: 'No Academic Class found in system to anchor the legacy record.' }, { status: 500 });
    }

    // Generate a unique dummy email for the legacy record
    const baseEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${graduationYear || 'legacy'}@esderos.org`.replace(/\s+/g, '');
    let email = baseEmail;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { email } })) {
      email = `${baseEmail.replace('@', `${counter}@`)}`;
      counter++;
    }

    const passwordHash = hash('sha256', Math.random().toString(36).slice(-8));

    // Handle File Upload
    let savedFilePath = null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'legacy');
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      
      savedFilePath = `/uploads/legacy/${filename}`;
    }

    // Create Legacy Student Record
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          passwordHash,
          role: 'STUDENT'
        }
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          status: 'GRADUATED',
          track: track as any,
          classId: studentClass!.id
        }
      });

      return { user, student };
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        id: result.student.id,
        user: { firstName, lastName, email },
        track,
        status: 'GRADUATED',
        enrollments: [], // Empty initially for legacy
        legacyFilePath: savedFilePath
      }
    });

  } catch (error: any) {
    console.error("Migration Error:", error);
    return NextResponse.json({ error: 'Failed to migrate legacy record' }, { status: 500 });
  }
}
