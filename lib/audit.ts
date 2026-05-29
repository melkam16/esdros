// lib/audit.ts
import { prisma } from './prisma';
import { headers } from 'next/headers';

interface LogActivityParams {
  userId?: string | null;
  email: string;
  role?: string | null;
  action: string;
  details?: string | null;
}

/**
 * Centrally registers an administrative or user activity event.
 * Designed to execute asynchronously without blocking API responses.
 */
export async function logActivity({
  userId,
  email,
  role,
  action,
  details
}: LogActivityParams) {
  try {
    // 1. Attempt request header extraction (works inside Next.js App Router context)
    const headersList = await headers();
    
    // Check multiple proxy headers to get accurate client IP address
    const xForwardedFor = headersList.get('x-forwarded-for');
    const ipAddress = xForwardedFor 
      ? xForwardedFor.split(',')[0].trim() 
      : (headersList.get('x-real-ip') || '127.0.0.1');

    const userAgent = headersList.get('user-agent') || 'Unknown Device/Browser';

    // 2. Persist record to database
    prisma.activityLog.create({
      data: {
        userId: userId || null,
        email,
        role: role || null,
        action,
        details: details || null,
        ipAddress,
        userAgent
      }
    }).catch(err => {
      console.error('Failed to save background audit log:', err);
    });

  } catch (headersError) {
    // 3. Fallback context (e.g. running in database seed scripts, migrations, or tests)
    prisma.activityLog.create({
      data: {
        userId: userId || null,
        email,
        role: role || null,
        action,
        details: details || null,
        ipAddress: '127.0.0.1',
        userAgent: 'System Script / SEED'
      }
    }).catch(err => {
      console.error('Failed to save script fallback audit log:', err);
    });
  }
}
