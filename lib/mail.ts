import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Get transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
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
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || '"Esdros Theological Seminary" <noreply@esdros.org>';

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
