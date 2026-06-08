import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const { payload } = await jwtVerify(token, SECRET);
    
    // Authenticate user
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id as string }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Administrative access required' }, { status: 403 });
    }

    // Load settings from database
    const settings = await prisma.systemSetting.findMany();
    
    // Group keys nicely for easy front-end parsing
    const settingsMap = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    // Provide default fallback values if the table is currently empty
    const defaults = {
      SMTP_HOST: settingsMap.SMTP_HOST || 'smtp.gmail.com',
      SMTP_PORT: settingsMap.SMTP_PORT || '587',
      SMTP_USER: settingsMap.SMTP_USER || 'no-reply@esderos.org',
      SMTP_FROM: settingsMap.SMTP_FROM || 'Esderos Seminary <no-reply@esderos.org>',
      APLOS_API_KEY: settingsMap.APLOS_API_KEY || '',
      APLOS_PARTNER_ID: settingsMap.APLOS_PARTNER_ID || '',
      CURRENT_SEMESTER: settingsMap.CURRENT_SEMESTER || 'Fall 2026',
      SEMESTER_START: settingsMap.SEMESTER_START || '2026-09-01',
      SEMESTER_END: settingsMap.SEMESTER_END || '2026-12-25',
      REGISTRATION_LOCKED: settingsMap.REGISTRATION_LOCKED || 'false',
      PUBLIC_REGISTRATION_LOCKED: settingsMap.PUBLIC_REGISTRATION_LOCKED || 'false',
      ENFORCE_MFA: settingsMap.ENFORCE_MFA || 'false',
      IS_SUPER_ADMIN: dbUser.isSuperAdmin ? 'true' : 'false',
      IS_STANDARD_ADMIN: dbUser.isStandardAdmin ? 'true' : 'false'
    };

    return NextResponse.json({
      success: true,
      data: defaults
    });

  } catch (error: any) {
    console.error('Error loading administrative settings:', error);
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
    
    // Authenticate user
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.id as string }
    });

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Administrative access required' }, { status: 403 });
    }

    // Verify clearance status for settings card modifications
    if (!dbUser.isSuperAdmin && !dbUser.isStandardAdmin) {
      return NextResponse.json({ error: 'Forbidden: Access restricted to Super Admin or Standard Admin roles.' }, { status: 403 });
    }

    const body = await req.json();

    // Standard Admins cannot modify SMTP or Aplos integrations
    if (dbUser.isStandardAdmin && !dbUser.isSuperAdmin) {
      const restrictedKeys = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM', 'APLOS_API_KEY', 'APLOS_PARTNER_ID'];
      const attemptsToModifyRestricted = Object.keys(body).some(key => restrictedKeys.includes(key));
      if (attemptsToModifyRestricted) {
        return NextResponse.json({ 
          error: 'Forbidden: Standard Admins are not permitted to configure SMTP Mail Gateway Integration or Aplos Financial Gateways.' 
        }, { status: 403 });
      }
    }

    const updates = Object.keys(body)
      .filter(k => k !== 'IS_SUPER_ADMIN' && body[k] !== undefined && body[k] !== null && !(k === 'SMTP_PASSWORD' && String(body[k]).trim() === ''))
      .map(k => ({ key: k, value: String(body[k]).trim() }));

    if (updates.length > 0) {
      // Save inside transaction
      await prisma.$transaction(
        updates.map(u => 
          prisma.systemSetting.upsert({
            where: { key: u.key },
            update: { value: u.value },
            create: { key: u.key, value: u.value }
          })
        )
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration card updated successfully without code execution.'
    });

  } catch (error: any) {
    console.error('Error writing settings:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
