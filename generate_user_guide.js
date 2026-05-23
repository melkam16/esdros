const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } = require("docx");
const PDFDocument = require("pdfkit");

// Image paths from browser subagent output
const images = {
  dashboard: path.resolve(`C:/Users/melka/.gemini/antigravity/brain/627114a8-4e05-44c4-823b-30aedd3aea02/admin_dashboard_1779562619258.png`),
  manageAdmins: path.resolve(`C:/Users/melka/.gemini/antigravity/brain/627114a8-4e05-44c4-823b-30aedd3aea02/manage_admins_1779562707104.png`),
  settings: path.resolve(`C:/Users/melka/.gemini/antigravity/brain/627114a8-4e05-44c4-823b-30aedd3aea02/admin_settings_1779562802128.png`),
  transcripts: path.resolve(`C:/Users/melka/.gemini/antigravity/brain/627114a8-4e05-44c4-823b-30aedd3aea02/admin_transcripts_1779562853320.png`),
};

// Target directory
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ----------------------------------------------------
// 1. GENERATE WORD (.DOCX) USER GUIDE
// ----------------------------------------------------
function generateDocx() {
  console.log("Generating DOCX user guide...");
  
  const docxChildren = [
    // TITLE PAGE
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
      children: [
        new TextRun({
          text: "ESDROS THEOLOGICAL SEMINARY",
          color: "0e2a47",
          bold: true,
          size: 40,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
      children: [
        new TextRun({
          text: "Student Information & Learning Management System (SIS-LMS)",
          color: "009fe5",
          bold: true,
          size: 20,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 1200 },
      children: [
        new TextRun({
          text: "COMPREHENSIVE MULTI-PORTAL USER MANUAL & SYSTEM GUIDE",
          color: "475569",
          bold: true,
          size: 16,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1500, after: 100 },
      children: [
        new TextRun({
          text: "Version 1.0 • Published May 2026",
          color: "64748b",
          italic: true,
          size: 14,
          font: "Arial",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 1000 },
      children: [
        new TextRun({
          text: "Prepared for: Administrators, Registrar, Faculty Instructors, and Enrolled Students",
          color: "64748b",
          size: 12,
          font: "Arial",
        }),
      ],
    }),

    // SECTION 1: INTRODUCTION
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "1. Platform Overview & Portals", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "Esdros Theological Seminary features a unified Student Information System (SIS) and Learning Management System (LMS) designed to automate registration, student profiles, attendance logs, numerical grade submission, official transcript delivery, and secure multi-tenant settings configuration. The platform organizes access rights across distinct dashboards based on secure system roles.",
          font: "Arial",
          size: 22,
        }),
      ],
    }),

    // SECTION 2: PUBLIC MARKETING PORTAL & CRM APPLY FORM
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "2. Public Portal & Admissions Form", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "• Marketing Page (/): Provides structural details of Theology and Geez language tracks, degree programs, and administrative contacts.\n" +
                "• Online Apply Form (/apply): Prospective applicants fill out personal credentials, track details, and faith statements. Submitted records immediately spawn PENDING applications inside the Admin CRM pipelines.\n" +
                "• Enrollment Control: Administrators can toggle settings to open or lock public applicant registrations at any time.",
          font: "Arial",
          size: 22,
        }),
      ],
    }),

    // SECTION 3: STUDENT DASHBOARD
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "3. Student Portal operations (/dashboard/student)", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "• Course Registration: Enables students to enroll in course sections active inside the current term term.\n" +
                "• Financial Invoices: View detailed ledger balances, tuition fees, scholarship records, and secure invoice lists.\n" +
                "• Two-Factor MFA Security: Logins enforce strong passwords (length > 7, uppercase, lowercase, numbers, and symbols) and scan a secure time-based TOTP QR code at setup to enforce secure logins.\n" +
                "• Request Withdrawal: Students can submit a withdrawal request outlining reasons. Once approved by the registrar, their user account transitions into secure read-only mode.\n" +
                "• Unofficial Transcripts: Generate and view instant cumulative GPA audits with letter conversions.",
          font: "Arial",
          size: 22,
        }),
      ],
    }),

    // SECTION 4: FACULTY PORTAL
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "4. Faculty Portal operations (/dashboard/faculty)", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "• Cohort Schedules: Faculty can view their assigned sections, classrooms, time schedules, and matriculation limits.\n" +
                "• Roster & Attendance Matrix: Log daily classroom attendance. Graduated, dismissed, or withdrawn students are automatically omitted from these rosters.\n" +
                "• Grade Submission Console: Instructors record student grade evaluations out of 100, which are automatically translated into GPA scale letters (A, B, C) in database tables.\n" +
                "• Faculty Announcement Center: Faculty receive direct alerts from the administration board to coordinate grading calendars.",
          font: "Arial",
          size: 22,
        }),
      ],
    }),

    // SECTION 5: ADMINISTRATOR CONSOLE
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "5. Administrator Console operations (/dashboard/admin)", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "The Administrative console acts as the primary telemetry center of Esdros Theological Seminary. The home dashboard provides real-time enrollment footprints, cohort distribution, and CRM pipelines.",
          font: "Arial",
          size: 22,
        }),
      ],
    }),
  ];

  // Embed Dashboard Image if exists
  if (fs.existsSync(images.dashboard)) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new ImageRun({
            data: fs.readFileSync(images.dashboard),
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 5.1: Esdros Seminary Admin Telemetry Overview Console", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Access Control Section
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({ text: "5.1 Manage Admins & clearance Tiers", color: "009fe5", bold: true, size: 24, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "The Access Control system segregates operations across three tiers. Super Admins can promote or demote standard and restricted administrators directly from the directory list:",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Manage Admins Image if exists
  if (fs.existsSync(images.manageAdmins)) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new ImageRun({
            data: fs.readFileSync(images.manageAdmins),
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 5.2: Directory Interface for Dynamic Clearance Promotion & Demotion", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Settings Section
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({ text: "5.2 System Settings & External Integrations", color: "009fe5", bold: true, size: 24, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "Super Administrators configure core outbound SMTP email relays and Aplos sync setups locally without executing code. Sub-cards isolate sections, letting you update parameters independently:",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Settings Image if exists
  if (fs.existsSync(images.settings)) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new ImageRun({
            data: fs.readFileSync(images.settings),
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 5.3: SMTP Outbound Mail & Accounting API Integrations Settings Portal", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Transcripts Section
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({ text: "5.3 Student Records, Transcripts & Withdrawals", color: "009fe5", bold: true, size: 24, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "The Registrar processes withdrawal requests, reviews academic files, deactivates profiles of dismissed students, and schedules dynamic transcript distribution catalogs:",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Transcripts Image if exists
  if (fs.existsSync(images.transcripts)) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new ImageRun({
            data: fs.readFileSync(images.transcripts),
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 5.4: Official Transcripts Management & Withdrawal Request processing", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  const doc = new Document({
    creator: "Esdros IT Division",
    title: "Esdros Theological Seminary - Comprehensive User Manual & Portal Guide",
    description: "Detailed user manual and workflow guides for student, faculty, and administrator portals.",
    sections: [{
      properties: {},
      children: docxChildren,
    }],
  });

  Packer.toBuffer(doc).then((buffer) => {
    const destPath = path.join(publicDir, "Esdros_Seminary_User_Guide.docx");
    fs.writeFileSync(destPath, buffer);
    console.log(`Word User Guide generated successfully at: ${destPath}`);
  }).catch((err) => {
    console.error("Failed to generate DOCX user guide:", err);
  });
}

// ----------------------------------------------------
// 2. GENERATE PDF USER GUIDE
// ----------------------------------------------------
function generatePdf() {
  console.log("Generating PDF user guide...");
  const destPath = path.join(publicDir, "Esdros_Seminary_User_Guide.pdf");
  
  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream(destPath);
  doc.pipe(writeStream);

  // Title Page
  doc.fontSize(26).fillColor("#0e2a47").text("ESDROS THEOLOGICAL SEMINARY", { align: "center" });
  doc.moveDown(0.2);
  doc.fontSize(16).fillColor("#009fe5").text("Student Information & Learning Management System (SIS-LMS)", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#475569").text("COMPREHENSIVE MULTI-PORTAL USER MANUAL & SYSTEM GUIDE", { align: "center" });
  doc.moveDown(6);
  doc.fontSize(11).fillColor("#64748b").text("Version 1.0 • Published May 2026", { align: "center" });
  doc.text("Prepared for: Administrators, Registrar, Faculty Instructors, and Enrolled Students", { align: "center" });
  doc.addPage();

  // Section 1: Platform Overview
  doc.fontSize(18).fillColor("#0e2a47").text("1. Platform Overview & Portals");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "Esdros Theological Seminary features a unified Student Information System (SIS) and Learning Management System (LMS) designed to automate registration, student profiles, attendance logs, numerical grade submission, official transcript delivery, and secure multi-tenant settings configuration. The platform organizes access rights across distinct dashboards based on secure system roles.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Section 2: Public Portal & Admissions Form
  doc.fontSize(18).fillColor("#0e2a47").text("2. Public Portal & Admissions Form");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "• Marketing Page (/): Provides structural details of Theology and Geez language tracks, degree programs, and administrative contacts.\n" +
    "• Online Apply Form (/apply): Prospective applicants fill out personal credentials, track details, and faith statements. Submitted records immediately spawn PENDING applications inside the Admin CRM pipelines.\n" +
    "• Enrollment Control: Administrators can toggle settings to open or lock public applicant registrations at any time.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Section 3: Student Dashboard
  doc.fontSize(18).fillColor("#0e2a47").text("3. Student Portal operations (/dashboard/student)");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "• Course Registration: Enables students to enroll in course sections active inside the current term.\n" +
    "• Financial Invoices: View detailed ledger balances, tuition fees, scholarship records, and secure invoice lists.\n" +
    "• Two-Factor MFA Security: Logins enforce strong passwords (length > 7, uppercase, lowercase, numbers, and symbols) and scan a secure time-based TOTP QR code at setup to enforce secure logins.\n" +
    "• Request Withdrawal: Students can submit a withdrawal request outlining reasons. Once approved by the registrar, their user account transitions into secure read-only mode.\n" +
    "• Unofficial Transcripts: Generate and view instant cumulative GPA audits with letter conversions.",
    { lineGap: 4 }
  );
  doc.addPage();

  // Section 4: Faculty Dashboard
  doc.fontSize(18).fillColor("#0e2a47").text("4. Faculty Portal operations (/dashboard/faculty)");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "• Cohort Schedules: Faculty can view their assigned sections, classrooms, time schedules, and matriculation limits.\n" +
    "• Roster & Attendance Matrix: Log daily classroom attendance. Graduated, dismissed, or withdrawn students are automatically omitted from these rosters.\n" +
    "• Grade Submission Console: Instructors record student grade evaluations out of 100, which are automatically translated into GPA scale letters (A, B, C) in database tables.\n" +
    "• Faculty Announcement Center: Faculty receive direct alerts from the administration board to coordinate grading calendars.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Section 5: Administrator Console
  doc.fontSize(18).fillColor("#0e2a47").text("5. Administrator Console operations (/dashboard/admin)");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "The Administrative console acts as the primary telemetry center of Esdros Theological Seminary. The home dashboard provides real-time enrollment footprints, cohort distribution, and CRM pipelines.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Dashboard Image
  if (fs.existsSync(images.dashboard)) {
    doc.image(images.dashboard, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 5.1: Esdros Seminary Admin Telemetry Overview Console", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Subsection 5.1: Manage Admins
  doc.fontSize(14).fillColor("#009fe5").text("5.1 Manage Admins & clearance Tiers");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "The Access Control system segregates operations across three tiers. Super Admins can promote or demote standard and restricted administrators directly from the directory list:",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Manage Admins Image
  if (fs.existsSync(images.manageAdmins)) {
    doc.image(images.manageAdmins, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 5.2: Directory Interface for Dynamic Clearance Promotion & Demotion", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Subsection 5.2: Settings
  doc.fontSize(14).fillColor("#009fe5").text("5.2 System Settings & External Integrations");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "Super Administrators configure core outbound SMTP email relays and Aplos sync setups locally without executing code. Sub-cards isolate sections, letting you update parameters independently:",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Settings Image
  if (fs.existsSync(images.settings)) {
    doc.image(images.settings, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 5.3: SMTP Outbound Mail & Accounting API Integrations Settings Portal", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Subsection 5.3: Transcripts & Records
  doc.fontSize(14).fillColor("#009fe5").text("5.3 Student Records, Transcripts & Withdrawals");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "The Registrar processes withdrawal requests, reviews academic files, deactivates profiles of dismissed students, and schedules dynamic transcript distribution catalogs:",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Transcripts Image
  if (fs.existsSync(images.transcripts)) {
    doc.image(images.transcripts, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 5.4: Official Transcripts Management & Withdrawal Request processing", { align: "center" });
  }

  doc.end();
  writeStream.on("finish", () => {
    console.log(`PDF User Guide generated successfully at: ${destPath}`);
  });
}

// Execute generations
try {
  generateDocx();
  generatePdf();
} catch (error) {
  console.error("Execution failed:", error);
}
