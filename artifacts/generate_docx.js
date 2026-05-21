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
        spacing: { before: 1000, after: 200 },
        children: [
          new TextRun({
            text: "MAHIBERE KIDUSAN NORTH AMERICA",
            color: "009fe5",
            bold: true,
            size: 26,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 400 },
        children: [
          new TextRun({
            text: "ESDROS THEOLOGICAL SEMINARY",
            color: "0e2a47",
            bold: true,
            size: 42,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 800 },
        children: [
          new TextRun({
            text: "Student Information & Learning Management System (SIS-LMS)\nComprehensive Architecture, Operations, & Maintenance Manual",
            color: "475569",
            bold: true,
            size: 22,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 2000, after: 200 },
        children: [
          new TextRun({
            text: "Version 2.0 (Stabilized Release) • Published May 2026",
            color: "64748b",
            italic: true,
            size: 18,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 1500 },
        children: [
          new TextRun({
            text: "Prepared for: System Owners, Administrative Deans, Registrar's Office, and IT System Maintainers",
            color: "64748b",
            size: 16,
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
            size: 28,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "The Esdros Theological Seminary Student Information System (SIS) and Learning Management System (LMS) is a professional, institutional-grade platform engineered to support academic enrollment, identity governance, grading audits, course scheduling, legacy data migration, and secure multi-role access panels. Built for the Mahibere Kidusan North America organization, this platform consolidates operational workflows across two core traditional tracks: Theology and Geez Language.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 250 },
        children: [
          new TextRun({
            text: "This document serves as the official system architecture reference manual and operations playbook. It describes the underpinnings of the tech stack, public and secure layout divisions, active middleware proxies, multi-factor authentication (MFA) recovery, relational schemas, automated email notification pipelines, and structural deployment instructions for maintaining the platform long-term.",
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
            size: 28,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
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
      // NEW ARCHITECTURE & PORTALS DUALITY
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "2. Dual Portal Architecture (Public vs. SIS/LMS)",
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
            text: "The Esdros Seminary platform is split into two primary operational halves: the Public-Facing Portal (marketing, academics catalog, admissions applications) and the Private SIS-LMS Console (grades audits, transcript generators, classroom rosters, student finance ledgers, and super admin access controls). This duality keeps public access fast and unauthenticated, while restricting sensitive institutional databases to strict session clearance checks.",
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
            text: "2.1 Public-Facing Portal Pages & Modules",
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
            text: "• Seminary Homepage (/): Rich introductory sections featuring About Us, academic program descriptions (Theology & Geez tracks), alumni success highlights, and general contact listings.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Dynamic Academic Calendar (/academics/academic-calendar): Keeps current terms, drop deadlines, exam weeks, and holidays synced for student viewing.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Degree Programs Catalog (/academics/degree-programs): Comprehensive directories displaying credits, required courses, core theology catalogs, and tracks.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Public Faculty Directory (/academics/faculty-directory): Showcases biographies, assigned departments, and coordinates for institutional teachers.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Public Admissions Application Portal (/apply): The official gateway where prospective student candidates fill out their personal details, track choice (Theology vs Geez), phone contacts, and upload statements of faith. This creates their institutional applicant account immediately.",
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
            text: "2.2 Private Student Information System (SIS) & LMS Layouts",
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
            text: "The SIS and LMS segments sit securely behind the '/dashboard' layout wrapper. Every single dynamic route and API in this scope is governed by the cookie session validator proxy middleware (proxy.ts). Depending on the verified role parameter within the signed token payload, users are mapped to their specific console:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
        children: [
          new TextRun({
            text: "• Student Dashboard (/dashboard/student): Handles class registration, course schedule lookups, balance checks, payment notifications, gradebooks, and transcript downloads.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Faculty Portal (/dashboard/faculty): Renders cohort lists, assigned course roster controls, student attendance recorders, and grade entry sheets.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Admin Console (/dashboard/admin): Renders admissions CRM, degree audits, course schedulers, and faculty offboarding controls.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "• Manage Admins Panel (/dashboard/admin/manage-admins): Unlocked only for super administrators to manage institutional access delegation.",
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
            text: "2.3 System Data Flow Architecture",
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
            text: "1. Public Sign Up & Application: Applicant submits form -> User created (role: STUDENT, status: APPLICANT) -> Application created (status: SUBMITTED) inside Neon database.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "2. Academic Decisioning: Super Admin reviews application -> Sets 'APPROVED' -> Student Profile created -> Onboarding welcome email sent automatically.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "3. Course & Roster Scheduling: Admin schedules course section -> Faculty assigned -> Notification email sent -> Roster is live for student registrations.\n",
            font: "Calibri",
            size: 22,
          }),
          new TextRun({
            text: "4. Grading & Evaluation: Faculty submits grade -> Database updates Enrollment record -> Student checks grade inside portal -> Admin issues transcript via secure automated email.",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),

      // ==========================================
      // MAIN SIS MODULES
      // ==========================================
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: "3. Main Operational Modules in the SIS",
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
            text: "3.1 Admissions CRM Module",
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
            text: "Allows administrative staff to filter applicants by tracks (Theology vs Geez Language), status levels (Submitted, Under Review, Approved, Rejected), and perform secure evaluations. On approval, the system hooks into the transactional ORM to automatically spin up a corresponding active Student record, link it to the assigned class cohort, and send the onboarding welcome email containing their credentials details.",
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
            text: "3.2 Course & Section Scheduler Module",
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
            text: "Tracks the seminary's academic catalog. Admins can create sections for active terms, select physical classrooms, allocate seating capacity limits, and assign faculty. When a section is successfully scheduled, the automated email driver dispatches a notice to the assigned professor containing the course credentials, curriculum codes, and portal rosters.",
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
            text: "3.3 LMS Evaluation & Attendance Module",
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
            text: "Allows instructors to manage section logs. Professors log daily student attendance, evaluate numerical performance scores out of 100, and submit grade reports. Grade boundaries translate automatically into standard GPA scales (A+ through F) using a strict academic grading model, which students can instantly view from their portal dashboard.",
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
            text: "3.4 Registrar Records & Transcripts Module",
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
            text: "Enables Registrar administrators to review cumulative credits, semester GPAs, cohort schedules, and active registrations. Transcripts are generated dynamically and can be printed to PDF or emailed as registrar-certified, styled HTML records directly to the student's institutional email.",
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
            text: "3.5 Finance & Invoice Ledgers Module",
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
            text: "Super administrators manage invoice balances, term tuition items, and active registrations. Invoices are generated based on student course credit enrollments, keeping outstanding and paid tuition items secure.",
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
            text: "3.6 Identity Governance & Recovery Module",
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
            text: "Governs staff hierarchy and provides recovery options. Super admins delegate restricted accesses to operational administrators, shielding financial ledgers, system configurations, and identity managers. Forgotten credentials or lost MFA authenticators are resolved through recovery pathways that issue temporary credentials or deactivate active multi-factor keys directly from the login page.",
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
            text: "4. System Security & Access Controls",
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
            text: "Security is implemented at both the server middleware level and the physical API level:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
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
            text: "5. Database Schema Blueprint",
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
            text: "The institutional database uses the following core Prisma models to guarantee relationship consistency:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
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
            text: "6. Automated Email Notification Pipelines",
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
            text: "Automated triggers have been integrated into vital business processes to guarantee prompt information exchange:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
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
            text: "7. Operation & Deployment Playbook",
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
            text: "To safely deploy or update the system in production, adhere to these procedural guidelines:",
            font: "Calibri",
            size: 22,
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 120 },
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
