import { Document, Paragraph, TextRun, HeadingLevel, Packer, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import * as fs from "fs";
import * as path from "path";

// Helper to create a styled cell
function createStyledCell(text: string, isHeader = false, widthPct = 50) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    shading: { fill: isHeader ? "0E2A47" : "F8FAFC" },
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: isHeader,
            color: isHeader ? "FFFFFF" : "334155",
            font: "Calibri",
            size: 20,
          }),
        ],
      }),
    ],
  });
}

// Helper to create title/cover page paragraphs
function createCoverPage(title: string, subtitle: string) {
  return [
    new Paragraph({ text: "", spacing: { before: 1200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "ESDEROS EOTC THEOLOGICAL SEMINARY",
          bold: true,
          color: "0E2A47",
          font: "Calibri",
          size: 28,
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 400 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: title,
          bold: true,
          color: "009FE5",
          font: "Calibri",
          size: 40,
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 200 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: subtitle,
          italic: true,
          color: "475569",
          font: "Calibri",
          size: 22,
        }),
      ],
    }),
    new Paragraph({ text: "", spacing: { before: 1800 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Official Operations User Guide",
          bold: true,
          color: "334155",
          font: "Calibri",
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Version 1.1.0 | Date: ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
          color: "64748B",
          font: "Calibri",
          size: 18,
        }),
      ],
    }),
    new Paragraph({ text: "", pageBreakBefore: true }),
  ];
}

// 1. STUDENT PORTAL USER GUIDE
function generateStudentDoc() {
  return new Document({
    sections: [{
      properties: {},
      children: [
        ...createCoverPage("Student Portal Guide", "Authentication, Settings, Academic Enrollment, & Financial Ledger Operations"),
        
        new Paragraph({
          text: "1. Login Page Authentication & Session Setup",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "To access your Student Portal, navigate to the Seminary's central authentication portal. Enter your registered email address and credentials in the designated inputs. If Two-Factor Email Authentication is globally or personally enabled, the system redirects you to the secure MFA passcode screen, prompting you for the 6-digit security key dispatched to your inbox. Once entered successfully, an active encrypted session is created.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "2. Personal Settings & MFA Profile Console",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "The Profile Settings panel is located in the bottom left navigation sidebar. Inside this panel, you can maintain your core identity details and configure account security parameters:",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• Profile Details: Re-verify your registered first name, last name, and administrative department cohort details.\n" +
                    "• Password Modifications: Re-write your account credentials by entering your current password followed by your desired new secure password.\n" +
                    "• Self-Service Email MFA Toggle: When enabled, a verification email is sent to your inbox upon logging in. Inputting this code is required to establish a valid student portal session.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "3. Academic Enrollment Engine",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Your academic enrollment dashboard lists only active, non-legacy course offerings designated for your cohort program track (Theology or Geez Language). The board is cleanly structured into three reactive sections:",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        }),

        new Table({
          rows: [
            new TableRow({
              children: [
                createStyledCell("Enrollment Status Category", true, 40),
                createStyledCell("System Operations Description", true, 60),
              ],
            }),
            new TableRow({
              children: [
                createStyledCell("1. Available for Enrollment", false, 40),
                createStyledCell("Lists all active courses scheduled for the current semester that you are eligible to register for. Click to submit a registration request to the administration.", false, 60),
              ],
            }),
            new TableRow({
              children: [
                createStyledCell("2. Enrolled Courses", false, 40),
                createStyledCell("Displays all current subjects you are actively taking in the ongoing term, along with class details and instructor names.", false, 60),
              ],
            }),
            new TableRow({
              children: [
                createStyledCell("3. Completed Courses", false, 40),
                createStyledCell("Lists your historical database of completed courses, showing earned grades, credits, and GPA summaries.", false, 60),
              ],
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "4. Verified Transcript Requests",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "All unofficial transcript downloads have been removed from the portal, directing all transcript inquiries to verified official channels. To request your official transcripts:",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• Navigate to the Request Official Transcript form.\n• Input the name of the target university, organization, or board.\n• Provide a verified delivery physical shipping address.\n• Submit the request. Administrators will receive, verify, print, seal, and ship the official transcript directly.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "5. Tuition & Invoices Ledger",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Under the Tuition tab, you can view your personal billing ledger. This panel details all issued invoices, recorded payments, and outstanding balances. You can review individual itemized receipt breakdowns and track payment approvals in real time.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),
      ],
    }],
  });
}

// 2. FACULTY PORTAL USER GUIDE
function generateFacultyDoc() {
  return new Document({
    sections: [{
      properties: {},
      children: [
        ...createCoverPage("Faculty Portal Guide", "Login, Settings, Gradebooks, & Attendance Tracking with Lock Modals"),
        
        new Paragraph({
          text: "1. Login Page Authentication & Session Setup",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "To log into the Faculty Portal, navigate to the central login screen and enter your faculty email address and password. If global security is activated, you will be prompted to enter the 6-digit MFA passcode sent to your registered email inbox to authorize access.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "2. Personal Settings & Security Profile Console",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "The Settings page lets you update your instructor credentials and configure additional security locks:",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• Profile Updates: Review registered academic ranks, titles, and assigned departments.\n" +
                    "• Password Revisions: Update your credentials securely under Settings.\n" +
                    "• Self-Service Email MFA Toggle: Toggle personal two-factor verification code requirements on login to secure your grading ledgers.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "3. Interactive Gradebook & Spreadsheet Integration",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "The Faculty Portal provides a highly optimized grade ledger that supports both manual point entries and rapid offline Excel-based grade sheet editing:",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        }),

        new Table({
          rows: [
            new TableRow({
              children: [
                createStyledCell("Workflow Phase", true, 30),
                createStyledCell("Step-by-Step Operations Checklist", true, 70),
              ],
            }),
            new TableRow({
              children: [
                createStyledCell("1. Export Template", false, 30),
                createStyledCell("Click 'Export Grade Template' inside the Gradebook tab. The system exports a dynamic pre-populated Excel worksheet containing enrolled student names, system IDs, and evaluation headers.", false, 70),
              ],
            }),
            new TableRow({
              children: [
                createStyledCell("2. Offline Grading", false, 30),
                createStyledCell("Open the exported sheet in Microsoft Excel, Google Sheets, or Apple Numbers. Enter numeric point values for quizzes, final exams, or homework assignments under the designated columns.", false, 70),
              ],
            }),
            new TableRow({
              children: [
                createStyledCell("3. Import Grades", false, 30),
                createStyledCell("Return to the portal gradebook and upload your filled Excel sheet. The portal reads the data and auto-populates the online matrix with no manual transcription needed.", false, 70),
              ],
            }),
            new TableRow({
              children: [
                createStyledCell("4. Bulk Save", false, 30),
                createStyledCell("A highlighted 'Bulk Save' button appears upon successful import. Click to persist all graded records to the Postgres database instantly.", false, 70),
              ],
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "4. Attendance Roster & Smart Locking Mechanics",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "The daily attendance tracker enables rapid daily roster management with built-in safety controls to prevent accidental overwrites:",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• Daily Record Logging: Choose the course section and date, then mark status toggles (Present, Absent, Excused) and add custom session remarks.\n• Automatic Record Locking: If attendance has already been recorded for the selected date, the roster inputs are locked, and a notice banner appears to protect entries.\n• Modifying Records: Click the '🔓 Unlock to Modify' override trigger inside either the alert banner or the header to lift the locks, edit entries, and submit updates.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "5. Attendance Summary Ledger",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "The Attendance Summary tab compiles active student statistics for that section. You can instantly audit the total logged sessions, individual presence/absence logs, and overall attendance rate percentages shown with color-coded progress health indicators.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),
      ],
    }],
  });
}

// 3. ADMIN PORTAL USER GUIDE
function generateAdminDoc() {
  return new Document({
    sections: [{
      properties: {},
      children: [
        ...createCoverPage("Admin Portal Guide", "Security Governance, Lock Modals, CRM, & Global Settings"),
        
        new Paragraph({
          text: "1. Administrator Secure Login & Access Control",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Access to the Admin Portal is strictly restricted to authorized Super Admins and Standard Admins. Navigate to the administrator login screen, enter your email and password, and complete the mandatory two-factor email verification code challenge to establish a secure admin session.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "2. Global Settings Workspace & MFA Enforcement",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "The Admin Settings portal provides critical institutional controls for configuring portal-wide systems and managing security parameters:",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• Global MFA Security Switch: When enabled, all active student, faculty, and administrator logins are globally required to complete Two-Factor Email Verification code checks. This ensures strict institutional data privacy.\n" +
                    "• Seminary System Metrics: Configure system settings, active enrollment periods, admissions windows, and register departments.\n" +
                    "• Security Logs: Track administrator sign-ins, audit credential updates, and monitor enrollment approval records.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "3. Administrative Overview & Term Security Controls",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "The Admin Portal overview dashboard provides key metrics on students, faculty, and departments, alongside term controls:",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "🔒 Term Locking Mechanics:",
              bold: true,
              color: "0E2A47",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { before: 120, after: 80 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Click 'Lock Pending Semester Terms' to completely close and protect completed academic records from edits, securing student GPA logs and grade registries.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "4. Admissions CRM & Sequential ID Pipelines",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "The Admissions portal manages applicant pipelines. Admins can review uploaded academic transcripts, verify files, and approve or reject submissions. Approved applicants are automatically assigned department-linked sequential IDs (e.g. THEO-0001, SEML-0002) for structured cohort organization.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),

        new Paragraph({
          text: "5. Student Cohort Imports & Alumni Migrations",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "• CSV Batch Student Import: Rapidly import active student cohorts using CSV templates.\n• Alumni Database Management: Track graduated student cohorts and log official transcript requests.",
              font: "Calibri",
              size: 22,
            }),
          ],
          spacing: { after: 240 },
        }),
      ],
    }],
  });
}

// main execution
async function main() {
  const targetDir = path.join("c:", "Users", "melka", "OneDrive", "Documents", "esdros", "esdros-sms", "user_guides");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const studentDoc = generateStudentDoc();
  const studentBuffer = await Packer.toBuffer(studentDoc);
  fs.writeFileSync(path.join(targetDir, "Esderos_Student_Portal_User_Guide.docx"), studentBuffer);
  console.log("Generated: Esderos_Student_Portal_User_Guide.docx");

  const facultyDoc = generateFacultyDoc();
  const facultyBuffer = await Packer.toBuffer(facultyDoc);
  fs.writeFileSync(path.join(targetDir, "Esderos_Faculty_Portal_User_Guide.docx"), facultyBuffer);
  console.log("Generated: Esderos_Faculty_Portal_User_Guide.docx");

  const adminDoc = generateAdminDoc();
  const adminBuffer = await Packer.toBuffer(adminDoc);
  fs.writeFileSync(path.join(targetDir, "Esderos_Admin_Portal_User_Guide.docx"), adminBuffer);
  console.log("Generated: Esderos_Admin_Portal_User_Guide.docx");

  console.log("All three guides successfully generated with Login and Settings segments!");
}

main().catch(err => {
  console.error("Failed to generate guides:", err);
  process.exit(1);
});
