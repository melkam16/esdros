import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';
import { SignJWT } from 'jose';
import { hash } from 'crypto';

export async function POST(req: Request) {
  try {
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { email, password } = await req.json();

    // 1. Auto-seed test accounts if no users exist yet
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("Empty database detected. Provisioning Classe365 structural test suite...");

      // A. Create default Department required for Faculty relations
      const defaultDept = await prisma.department.create({
        data: {
          name: "Department of Theology & Language Studies",
          code: "TLS",
          description: "Core seed department for testing environment."
        }
      });

      // B. Create default Class required for Student relations
      const defaultClass = await prisma.class.create({
        data: {
          name: "Theology Cohort Year 1",
          code: "TH-Y1",
          departmentId: defaultDept.id
        }
      });

      // C. Seed ADMIN Account
      await prisma.user.create({
        data: {
          email: 'admin@esdros.org',
          passwordHash: 'admin123',
          firstName: 'Melkamu',
          lastName: 'Admin',
          role: 'ADMIN',
        },
      });

      // D. Seed FACULTY Account + Faculty Profile Extension
      await prisma.user.create({
        data: {
          email: 'faculty@esdros.org',
          passwordHash: 'faculty123',
          firstName: 'Professor',
          lastName: 'Abba',
          role: 'FACULTY',
          facultyProfile: {
            create: {
              departmentId: defaultDept.id
            }
          }
        },
      });

      // E. Seed STUDENT Account + Student Profile Extension
      await prisma.user.create({
        data: {
          email: 'student@esdros.org',
          passwordHash: 'student123',
          firstName: 'Ephrem',
          lastName: 'Student',
          role: 'STUDENT',
          studentProfile: {
            create: {
              track: 'THEOLOGY',
              classId: defaultClass.id
            }
          }
        },
      });

      console.log("Structural test suite successfully seeded into PostgreSQL database.");
    }

    // 2. Fetch User Profile
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Hash incoming password to check against securely created users
    const incomingHash = hash('sha256', password);
    
    // Allow fallback to plain text for the structural seeded test accounts
    if (!user || (user.passwordHash !== password && user.passwordHash !== incomingHash)) {
      return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
    }

    // 3. Issue Token
    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(SECRET);

    const isLocalhost = req.headers.get('host')?.includes('localhost') || req.headers.get('host')?.includes('127.0.0.1');

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && !isLocalhost,
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 Hours
      path: '/',
    });

    return NextResponse.json({ role: user.role });
  } catch (error) {
    console.error("Authentication pipeline error:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}