import { NextResponse } from 'next/server';
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
      console.log("Empty database detected. Provisioning Esdros Seminary structural test suite...");

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

    // 2. Fetch User Profile & Check Passwords
    const user = await prisma.user.findUnique({ where: { email } });
    const incomingHash = hash('sha256', password);

    if (!user || (user.passwordHash !== password && user.passwordHash !== incomingHash)) {
      return NextResponse.json({ error: 'Invalid email or password credentials' }, { status: 401 });
    }

    // 3. Issue Token
    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('2h')
      .sign(SECRET);

    // 4. Secure Cookie Environments Calculations
    const host = req.headers.get('host') || '';

    // Explicitly check if running local tests to prevent dropping on http://localhost:3000
    const isLocalTest = host.includes('localhost') || host.includes('127.0.0.1');

    // Uniform Cookie Blueprints
    const cookieOptions = {
      httpOnly: true,
      // CRITICAL FIX: Disable secure if it is a local production test on HTTP.
      secure: !isLocalTest,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7200, // Explicitly set 2 hours lifecycle
    };

    // 5. Commit Session Store ONLY on Outbound Response Object
    // Completely removed 'cookies()' import block to stop header cancellation collisions
    const response = NextResponse.json({ role: user.role });
    response.cookies.set('token', token, cookieOptions);

    return response;
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