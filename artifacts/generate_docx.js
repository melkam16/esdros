const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = require("docx");
const fs = require("fs");
const path = require("path");

const doc = new Document({
  creator: "Esdros IT Division",
  title: "Esdros Seminary - Enterprise Architecture, Access Control, and Operations Manual",
  description: "Exceedingly detailed technical architecture, database schemas, security roles, CI/CD, and DevOps operations manual for Esdros Seminary.",
  sections: [{
    properties: {},
    children: [
      // ==========================================
      // TITLE PAGE
      // ==========================================
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 200 },
        children: [
          new TextRun({
            text: "MAHIBERE KIDUSAN NORTH AMERICA COORDINATING CENTER",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 300 },
        children: [
          new TextRun({
            text: "ESDROS THEOLOGICAL SEMINARY",
            color: "0e2a47",
            bold: true,
            size: 38,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 600 },
        children: [
          new TextRun({
            text: "Student Information & Learning Management System (SIS-LMS)\nEnterprise Architecture, Access Control, DevOps, & Operations Manual",
            color: "475569",
            bold: true,
            size: 20,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1500, after: 200 },
        children: [
          new TextRun({
            text: "Version 3.0 (Enterprise Release) • Published May 2026",
            color: "64748b",
            italic: true,
            size: 16,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 1000 },
        children: [
          new TextRun({
            text: "Prepared for: System Owners, Registrar Office, Administrative Deans, DevOps Teams, and Systems Maintainers",
            color: "64748b",
            size: 14,
            font: "Calibri",
          }),
        ],
      }),

      // ==========================================
      // 1. EXECUTIVE SUMMARY
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "1. Executive & Operational Summary",
            color: "0e2a47",
            bold: true,
            size: 28,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "The Esdros Theological Seminary Student Information System (SIS) and Learning Management System (LMS) is a modern, unified web platform engineered to support academic enrollment, identity governance, grading audits, course scheduling, legacy data migration, tuition balances, and secure multi-role access controls. Built specifically for Mahibere Kidusan North America, this portal integrates organizational administration workflows across two core traditional programs: Theology and Geez Language.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 250 },
        children: [
          new TextRun({
            text: "This document serves as the official enterprise system architecture reference manual and operational playbook. It covers the frontend and backend technology stack specifications, dual-portal layouts (public vs. private secure portals), end-to-end institutional data flows, role-based access management, comprehensive database schemas, application development standards, and DevOps/CI/CD deployment procedures.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // 2. SYSTEM ARCHITECTURE
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "2. Dual Portal System Architecture",
            color: "0e2a47",
            bold: true,
            size: 28,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "The platform operates on a split-portal structure designed for optimal performance, fast public accessibility, and absolute database isolation for private institutional sections. Public pages are optimized for search engines and require no user login sessions, whereas private portals reside securely behind custom middleware validators.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "2.1 Public-Facing Marketing & Admissions Portal",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "• Seminary Homepage (/): Introduces the seminary mission, core theological values, traditional history, and coordinations.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Dynamic Academic Calendar (/academics/academic-calendar): Displays schedule terms, final weeks, registration durations, and holidays.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Degree Programs Catalog (/academics/degree-programs): Comprehensive catalog for Theology and Geez language tracks detailing credits and requisites.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Faculty Directory (/academics/faculty-directory): Shows administrative staff, biographies, departments, and active instructor contacts.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Online Admissions Application Form (/apply): Prospective student gateway where applicants register personal information, select their tracks, and submit faith statements, immediately generating their applicant account.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "2.2 Private SIS & LMS Portal (/dashboard)",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "Governed by the Edge-compatible cookies session middleware proxy.ts. Depending on the user's role parameters stored in their signed JWT token, they are securely mapped to their layout module:\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Student Dashboard (/dashboard/student): Controls course registration, schedule lookups, balance checks, payment notifications, and registrar transcript generation.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Faculty Dashboard (/dashboard/faculty): Renders instructor cohort schedules, active classroom rosters, student attendance registers, and semester grade submission sheets.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Administrative Console (/dashboard/admin): Powers admissions CRM pipelines, degree audits, course section schedulers, and faculty offboarding controls.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Manage Admins Panel (/dashboard/admin/manage-admins): Unlocked only for super administrators to manage user access levels and delegate access settings.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // 3. END-TO-END DATA FLOWS
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "3. End-to-End System Data Flows",
            color: "0e2a47",
            bold: true,
            size: 28,
            font: "Calibri",
          }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "3.1 Student Admissions & Onboarding Data Flow",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "1. The prospective candidate fills out the public apply form. The system posts data to /api/admissions/apply.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "2. The database creates a User record with role: STUDENT and an AdmissionApplication record with status: SUBMITTED.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "3. An administrator reviews the application from the admissions console, setting application status: APPROVED and choosing a class cohort.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "4. The database creates a Student profile linked to their user account and dynamically triggers an email welcome notification with credentials.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "3.2 Course Scheduling & Faculty Roster Assignment Data Flow",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "1. An administrator creates a course section inside a term, picking class capacity, physical classroom, and faculty instructor. Posts data to /api/admin/faculty/assign-course.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "2. The database updates CourseSection records. The system hooks into lib/mail.ts, dynamically issuing an email alert to the assigned faculty member containing course codes, times, and catalog rosters.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "3. Students register for this scheduled section, which adds records into the Enrollment table and updates seats capacity in real time.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "3.3 Attendance, Evaluation, & Transcript Delivery Data Flow",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "1. Faculty submits grades and marks daily rosters. Numerical grades out of 100 are converted to GPA letters in Enrollment records.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "2. The Registrar issues transcripts from /api/admin/transcripts/send, which queries the cumulative database to tally semester GPAs and credits.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "3. The email engine packs a styled registrar HTML sheet containing all transcripts details and sends it directly to the student's institutional inbox.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // 4. USER ROLE & ACCESS MANAGEMENT
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "4. User Roles & Clearance Governance",
            color: "0e2a47",
            bold: true,
            size: 28,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "The platform implements four distinct clearance levels to isolate data access and operational actions:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "• Super Admin (Clearance: Full System Owner): Has unrestricted system permissions. Controls settings configuration, database seeds, PM2 orchestrations, tuition balance ledgers, and can delegate restricted admin permissions or manage account credential recoveries.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Restricted Admin (Clearance: Operations Staff): Permitted to manage admissions CRM, view course catalog rosters, track course section enrollments, handle grading locks, and attach legacy scans. Shielded from settings configuration, tuition invoices, and delegating permissions.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Faculty (Clearance: Academic Instructors): Restricted strictly to their assigned course sections. Permitted to print rosters, log daily attendance sheet matrices, and submit numerical student grades out of 100.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Student (Clearance: Active Candidates / Alumni): Restricted strictly to their individual dossier. Permitted to register for open term semesters, view active course logs, balance invoices, and download transcripts.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // 5. APPLICATION DEVELOPMENT STANDARDS
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "5. Application Development & Coding Standards",
            color: "0e2a47",
            bold: true,
            size: 28,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "Maintaining this platform long-term requires strict adherence to institutional development rules:\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Server & Client Boundaries: Enforce 'use client' only for interactive UI forms. All business data fetches and Prisma ORM updates must be executed in secure API route files.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Transaction Security: Multi-row database edits must be executed inside Prisma's transaction wrapper 'prisma.$transaction(async (tx) => { ... })' to guarantee ACID compliance.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Password Encryptions: Passwords must always be securely stored using cryptographically safe hashes (SHA-256 or bcrypt) and compared over secure sessions.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Styling & UI Rules: Follow the HSL design palette using Mahibere Kidusan North America colors: deep blue (#0e2a47) and light sky blue (#009fe5). Spacing matrices must support dynamic, fully fluid layouts responsive from mobile up to wide screen screens.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // 6. DEVOPS, CI/CD, AND OPERATIONS
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "6. DevOps, CI/CD, & Operations Playbook",
            color: "0e2a47",
            bold: true,
            size: 28,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "This section details the continuous integration, continuous delivery (CI/CD), hosting profiles, and maintenance scripts needed to run the seminary system safely.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "6.1 Continuous Integration & Delivery Pipeline (CI/CD)",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "Every code change is pushed through a standardized GitHub actions workflow that triggers the following pipeline automation steps:\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "1. Code Linting & Format: Verifies that styles adhere strictly to TailwindCSS and ESLint rules.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "2. Database Client Generation: Generates localized Prisma types using 'npx prisma generate'.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "3. Compilation Check: Compiles Next.js bundle pages using 'npm run build'. If a compilation or typescript error occurs, the release is aborted.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "4. Deployment Dispatch: If the branch is 'main', the compiled code is securely pushed to the cloud host (e.g. Vercel, VPS, or Docker container) and database migrations are applied.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "6.2 Deployment Settings & Environment Variables (.env)",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "The institutional .env file must contain the following production configuration parameters:\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - DATABASE_URL: PostgreSQL serverless Neon database pooled connection URI over SSL.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - JWT_SECRET: Unlocked 256-bit institutional signature key used to secure signed cookies.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM: Live SMTP configuration details for email delivery.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - NEXT_PUBLIC_APP_URL: Public domain URI of the seminary server (e.g. https://esdros.org).",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "6.3 PM2 Daemon Process Manager Execution",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "Keep the Next.js process running 24/7 in VPS environments using PM2 daemon settings:\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - PM2 Startup Launch: pm2 start npm --name 'esdros-sms' -- run start\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - Save State: pm2 save\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - Server Monitoring: pm2 monit\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - Log Inspection: pm2 logs esdros-sms",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "6.4 Maintenance Cycles & Neon DB Backups",
            color: "009fe5",
            bold: true,
            size: 24,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "To preserve institutional records, perform weekly database backups. Use Neon pg_dump tools to export data:\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - Command: pg_dump -d [DATABASE_URL] -f esdros_db_backup.sql\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "   - Verify connection limits: Maintain healthy pool parameters (e.g. pg_pool setups) to match Neon serverless scaling limits.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const destPath = path.join(process.cwd(), "artifacts", "Esdros_Seminary_Technical_Architecture_Manual_v3.docx");
  fs.writeFileSync(destPath, buffer);
  console.log(`Document successfully packed and written to: ${destPath}`);
}).catch((err) => {
  console.error("Failed to generate DOCX document:", err);
});
