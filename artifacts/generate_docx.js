const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = require("docx");
const fs = require("fs");
const path = require("path");

const doc = new Document({
  creator: "Esdros IT Division",
  title: "Esdros Seminary - Technical Architecture and Operations Manual",
  description: "Comprehensive system architecture, security matrix, database schemas, and operations playbook for Esdros Theological Seminary.",
  sections: [{
    properties: {},
    children: [
      // ==========================================
      // TITLE PAGE
      // ==========================================
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 300 },
        children: [
          new TextRun({
            text: "MAHIBERE KIDUSAN NORTH AMERICA",
            color: "009fe5",
            bold: true,
            size: 28,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 600 },
        children: [
          new TextRun({
            text: "ESDROS THEOLOGICAL SEMINARY",
            color: "0e2a47",
            bold: true,
            size: 48,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 1200 },
        children: [
          new TextRun({
            text: "Student Information & Learning Management System (SIS-LMS)\nTechnical Architecture & Maintenance Manual",
            color: "334155",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 2400, after: 200 },
        children: [
          new TextRun({
            text: "Version 1.2 • Published May 2026",
            color: "64748b",
            italic: true,
            size: 20,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 2000 },
        children: [
          new TextRun({
            text: "Prepared for: System Administrators, Registrar Office, and System Maintainers",
            color: "64748b",
            size: 18,
            font: "Calibri",
          }),
        ],
      }),

      // ==========================================
      // EXECUTIVE SUMMARY
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "Executive Summary",
            color: "0e2a47",
            bold: true,
            size: 32,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "The Esdros Theological Seminary Student Information System (SIS) and Learning Management System (LMS) is a modern web platform engineered to support academic enrollment, identity governance, grading audits, course scheduling, legacy data migration, and secure multi-role access panels. Built for the Mahibere Kidusan North America organization, this platform consolidates operational workflows across two core tracks: Theology and Geez Language.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 300 },
        children: [
          new TextRun({
            text: "This document serves as the official system architecture reference manual and operations playbook. It describes the underpinnings of the tech stack, security policies, active middleware proxies, multi-factor authentication (MFA), relational schemas, automatic email notifications, and structural deployment instructions for maintaining the platform long-term.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // TECH STACK
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "1. Core Technology Stack",
            color: "0e2a47",
            bold: true,
            size: 32,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "• Frontend Engine: Next.js (version 16) utilizing App Router conventions for server-side layouts, dynamic routing, and fast client-side navigation. Dynamic routes are forced where live session updates are mandatory.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Database ORM Layer: Prisma ORM for robust schema definitions, automated migrations, and transactional integrity on server-side actions.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Backend Database: Neon serverless PostgreSQL, providing connection pool balancing and serverless scalability over SSL.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Styling & Responsiveness: TailwindCSS & Custom Vanilla CSS, providing glassmorphic card overlays, deep blue institutional themes, and fully fluid spacing matrices responsive from mobile to wide screen layouts.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // MIDDLEWARE & SECURITY
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "2. System Security & Access Controls",
            color: "0e2a47",
            bold: true,
            size: 32,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "Security is implemented at both the server middleware level and the physical API level:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "• Authentication Proxy (proxy.ts): A secure Edge-compatible middleware interceptor. It guarantees that only authorized, JWT-verified users access secure layouts (/dashboard). In addition, it checks path clearances to restrict non-super-admins from admin finance, settings, reporting, and credential management sections.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Session Governance: Session tokens are stored in HttpOnly cookies, rendering them immune to client-side XSS attacks.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Identity Recovery Console: Standard password reset generates dynamic 8-character, cryptographically safe temporary codes, instantly hashed using SHA-256 in the database. MFA Recovery instantly deactivates locked authenticator bindings for lockouts.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // RELATION DATA MODELS
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "3. Database Schema Blueprint",
            color: "0e2a47",
            bold: true,
            size: 32,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "The institutional database uses the following core Prisma models to guarantee relationship consistency:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "• User: Master authentication table with roles (STUDENT, FACULTY, ADMIN), SHA-256 password hash, isSuperAdmin flag, mfaEnabled, and mfaSecret columns.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Student: Tracks cohort assignments, status (ACTIVE, ACADEMIC_PROBATION, GRADUATED, ALUMNI), track enrollment (THEOLOGY, GEEZ_LANGUAGE), and references class rosters.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Faculty: Profiles teachers, departments, and linked active courses.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Course & CourseSection: Defines degree credits, tracks, semesters, rooms, and instructor relationships.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Enrollment: Tracks student grade averages, cumulative records, attendance history, and transcript details.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // AUTOMATED COMMUNICATION
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "4. Automated Email Notification Pipelines",
            color: "0e2a47",
            bold: true,
            size: 32,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "Automated triggers have been integrated into vital business processes to guarantee prompt information exchange:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "• Welcome Credential Dispatch: Triggered on user creation. Newly created Admins and Faculty members receive emails with automated login links, temporary passwords, and secure profile advice. Approved applicants receive customized welcome notifications containing onboarding checklists.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Course Section Assignment Roster: Triggered when an administrator schedules a section. Faculty members are instantly emailed complete course details, classroom rooms, capacity bounds, and roster tools.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Official Transcript E-Delivery: Generates an on-demand, registrar-verified academic transcript containing detailed semester summaries, GPAs, and credits, emailed directly to the student in rich HTML.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // DEPLOYMENT & OPERATION
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "5. Operation & Deployment Playbook",
            color: "0e2a47",
            bold: true,
            size: 32,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "To safely deploy or update the system in production, adhere to these procedural guidelines:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 150 },
        children: [
          new TextRun({
            text: "1. Environment Setup: Configure the system parameters inside the production environment host (.env):\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - DATABASE_URL: PostgreSQL Connection URI.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - JWT_SECRET: A strong 256-bit cryptographic signature key.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM: Credentials for SMTP email delivery.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "2. Schema Migrations: Execute 'npx prisma db push' or 'npx prisma migrate deploy' to update schema matrices.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "3. Build Optimized Bundle: Run 'npm run build' to perform typechecking and compile static/dynamic paths.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "4. Daemon Execution: Launch using 'npm run start' backed by PM2 or similar container orchestrators for 24/7 service resilience.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const destPath = path.join(process.cwd(), "artifacts", "Esdros_Seminary_Technical_Architecture_Manual.docx");
  fs.writeFileSync(destPath, buffer);
  console.log(`Document successfully packed and written to: ${destPath}`);
}).catch((err) => {
  console.error("Failed to generate DOCX document:", err);
});
