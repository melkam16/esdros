import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

import { prisma } from './prisma';

// Get transporter
const getTransporter = async () => {
  try {
    // Try loading dynamic settings from db
    const dbSettings = await prisma.systemSetting.findMany().catch(() => []);
    const settingsMap = dbSettings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});

    const host = (settingsMap.SMTP_HOST || process.env.SMTP_HOST || '').trim();
    const portVal = (settingsMap.SMTP_PORT || process.env.SMTP_PORT || '587').trim();
    let port = parseInt(portVal, 10);
    if (isNaN(port) || port <= 0) {
      port = 587;
    }
    const user = (settingsMap.SMTP_USER || process.env.SMTP_USER || '').trim();
    const pass = (settingsMap.SMTP_PASSWORD || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '').trim();

    if (host && user && pass) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }
  } catch (err) {
    console.error('Error creating nodemailer transporter:', err);
  }
  return null;
};

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  const transporter = await getTransporter();
  
  // Try loading dynamic SMTP_FROM from db
  const dbSettings = await prisma.systemSetting.findMany().catch(() => []);
  const settingsMap = dbSettings.reduce((acc: any, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
  const from = settingsMap.SMTP_FROM || process.env.SMTP_FROM || '"Esderos EOTC Theological Seminary" <noreply@esderos.org>';

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>')
      });
      console.log(`[SMTP Email Sent] To: ${to} | Subject: ${subject}`);
      return { success: true, mode: 'SMTP' };
    } catch (error) {
      console.error(`[SMTP Email Failed] To: ${to} | Error:`, error);
      // Fall through to mock logging
    }
  }

  // MOCK LOGGING FALLBACK (creates a file inside workspace under artifacts/sent-emails.log)
  const logDir = path.join(process.cwd(), 'artifacts');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'sent-emails.log');
  const timestamp = new Date().toISOString();
  const logContent = `
========================================
[EMAIL SENT - ${timestamp}]
To: ${to}
Subject: ${subject}
----------------------------------------
${text}
========================================
`;

  try {
    fs.appendFileSync(logFile, logContent, 'utf8');
  } catch (err) {
    console.error('Failed to write mock email log file:', err);
  }

  console.log(`\n📬 [Mock Email Logged] To: ${to}\nSubject: ${subject}\nContent Summary: ${text.substring(0, 150)}...\n`);
  return { success: true, mode: 'MockLog', path: logFile };
}
