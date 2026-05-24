const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } = require("docx");
const PDFDocument = require("pdfkit");

// Human-readable screenshot maps in public/screenshots/
const screenshots = {
  publicLanding: path.resolve("public/screenshots/public_landing.png"),
  publicTheology: path.resolve("public/screenshots/public_theology.png"),
  loginPage: path.resolve("public/screenshots/login_page.png"),
  
  studentDashboard: path.resolve("public/screenshots/student_dashboard.png"),
  studentEnrollment: path.resolve("public/screenshots/student_enrollment.png"),
  studentAcademics: path.resolve("public/screenshots/student_academics.png"),
  studentAttendance: path.resolve("public/screenshots/student_attendance.png"),
  studentFinance: path.resolve("public/screenshots/student_finance.png"),
  studentSettings: path.resolve("public/screenshots/student_settings.png"),
  
  facultyDashboard: path.resolve("public/screenshots/faculty_dashboard.png"),
  facultyAttendance: path.resolve("public/screenshots/faculty_attendance.png"),
  facultyGradebook: path.resolve("public/screenshots/faculty_gradebook.png"),
  facultyProfile: path.resolve("public/screenshots/faculty_profile.png"),
  
  adminDashboard: path.resolve("public/screenshots/admin_dashboard.png"),
  manageAdmins: path.resolve("public/screenshots/manage_admins.png"),
  adminSettings: path.resolve("public/screenshots/admin_settings.png"),
  adminTranscripts: path.resolve("public/screenshots/admin_transcripts.png"),
};

// Target directory
const publicDir = path.join(process.cwd(), "public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ----------------------------------------------------
// Helper to Safe Read Image Dimensions or Return Null
// ----------------------------------------------------
function getImageData(imagePath) {
  if (fs.existsSync(imagePath)) {
    try {
      return fs.readFileSync(imagePath);
    } catch (e) {
      console.error(`Failed to read image at ${imagePath}:`, e);
    }
  }
  return null;
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
          text: "COMPREHENSIVE MULTI-PORTAL USER MANUAL & WORKFLOW GUIDE",
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
          text: "Version 1.1 • Published May 2026",
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

    // SECTION 1: PLATFORM OVERVIEW
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "1. Platform Overview & Unified Architecture", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "Esdros Theological Seminary features a highly premium, unified Student Information System (SIS) and Learning Management System (LMS) that coordinates enrollment lifecycle, CRM admissions scoring, class scheduling, attendance tracking, numerical grading, and official PDF transcript distribution. All operations are strictly divided across three secure portals—Student, Faculty, and Admin—integrated dynamically under centralized ACID database transaction rules.",
          font: "Arial",
          size: 22,
        }),
      ],
    }),

    // SECTION 2: PUBLIC WEBSITE
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "2. Public Marketing Website & Portal Navigations", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "The institutional front page offers direct links to seminary portals, contact details, curriculum calendars, and academic tracks. Sub-pages detail structured programs:\n" +
                "• Theology Track (/programs/theology): Covers Orthodox dogmatic theological curriculums.\n" +
                "• Geez Language Track (/programs/geez): Details classical Geez language grammar and syntactic studies.",
          font: "Arial",
          size: 22,
        }),
      ],
    }),
  ];

  // Embed Public Landing Image
  const landingData = getImageData(screenshots.publicLanding);
  if (landingData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: landingData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 2.1: Esdros Seminary Public Landing Website", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Embed Public Theology Image
  const theologyData = getImageData(screenshots.publicTheology);
  if (theologyData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: theologyData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 2.2: Orthodox Theology Program Curriculum Page", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // SECTION 3: AUTHENTICATION
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "3. Gateway Authentication & Security Control", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "The portal entry (/login) maintains strict user security rules:\n" +
                "1. Enforce Password Policy: Passwords must be greater than seven characters and must contain an uppercase letter, lowercase letter, number, and special character.\n" +
                "2. Two-Factor Authentication (MFA): Implements secure time-based authenticator apps (Google Authenticator, Microsoft Authenticator) using TOTP protocols. During signup, users scan a QR code and must enter their 6-digit verification pin to register. Subsequent logins automatically require their username, password, and active 6-digit TOTP pin.",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Login Page Image
  const loginData = getImageData(screenshots.loginPage);
  if (loginData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: loginData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 3.1: SIS-LMS Secure Multi-Factor Gateway Login Console", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // SECTION 4: STUDENT PORTAL
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "4. Student Dashboard & Portal Operations", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "Enrolled students access tools to register in cohort groups, review semester progress reports, make payments, and manage profile security settings.",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Student Dashboard Image
  const studDashData = getImageData(screenshots.studentDashboard);
  if (studDashData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: studDashData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 4.1: Student Portal Overview Console Home", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Subpage details
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({ text: "4.1 Course Registration & Academics subpages", color: "009fe5", bold: true, size: 24, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "• Course Registration (/dashboard/student/enrollment): Displays sections active during the semester term. Students select subjects, view remaining spots, and request enrollments.\n" +
                "• Academics Progress (/dashboard/student/academics): Provides an unofficial transcript view listing completed classes, active credits, and overall cumulative GPA score matrices.",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Student Enrollment Image
  const studEnrollData = getImageData(screenshots.studentEnrollment);
  if (studEnrollData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: studEnrollData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 4.2: Course Section Registration Panel", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Embed Student Academics Image
  const studAcadData = getImageData(screenshots.studentAcademics);
  if (studAcadData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: studAcadData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 4.3: Unofficial Transcript and Cumulative GPA Display", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Student Attendance, Finance, and Settings Subpages
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({ text: "4.2 Attendance, Ledger Financials, and Security Settings", color: "009fe5", bold: true, size: 24, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "• Attendance Monitor (/dashboard/student/attendance): Real-time attendance logs showing present/absent classes and attendance percentages.\n" +
                "• Ledger Finance (/dashboard/student/finance): Direct look at tuition fee balances, active scholarship grants, and structural seminary invoice registries.\n" +
                "• Security / Profile Settings (/dashboard/student/settings): Reset passwords matching complexity parameters, toggle two-factor auth (MFA), and request programmatic student withdrawals (which puts the account in a read-only state upon registrar confirmation).",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Student Attendance Image
  const studAttendData = getImageData(screenshots.studentAttendance);
  if (studAttendData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: studAttendData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 4.4: Real-Time Classroom Attendance Tracker Dashboard", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Embed Student Finance Image
  const studFinData = getImageData(screenshots.studentFinance);
  if (studFinData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: studFinData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 4.5: Student Tuition Balance Ledgers & Invoice Center", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Embed Student Settings Image
  const studSettingsData = getImageData(screenshots.studentSettings);
  if (studSettingsData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: studSettingsData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 4.6: Security settings, password resets, and withdrawal portal page", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // SECTION 5: FACULTY PORTAL
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "5. Faculty Portal Operations & Academic Tools", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "Instructors coordinate student section attendance, register grades out of 100, and coordinate schedule calendars directly with seminary chairs.",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Faculty Dashboard Image
  const facDashData = getImageData(screenshots.facultyDashboard);
  if (facDashData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: facDashData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 5.1: Faculty Portal Home & Active Classroom Telemetry Overview", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Subpages
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({ text: "5.1 Attendance rosters & Grade submissions", color: "009fe5", bold: true, size: 24, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "• Classroom Attendance (/dashboard/faculty/attendance): Allows logging student attendance logs. Important: Students who are graduated, dismissed, or withdrawn are automatically excluded from the roster list.\n" +
                "• Gradebook Submissions (/dashboard/faculty/gradebook): Instructors enter numerical score values out of 100. The system automatically converts numbers into letter grades (A, B, C) in the backend tables, preventing arbitrary grade entry errors.",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Faculty Attendance Image
  const facAttendData = getImageData(screenshots.facultyAttendance);
  if (facAttendData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: facAttendData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 5.2: Faculty Student Classroom Daily Attendance Log", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Embed Faculty Gradebook Image
  const facGradebookData = getImageData(screenshots.facultyGradebook);
  if (facGradebookData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: facGradebookData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 5.3: Faculty Student Grade Entry Dashboard Console", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Embed Faculty Profile Image
  const facProfileData = getImageData(screenshots.facultyProfile);
  if (facProfileData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: facProfileData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 5.4: Faculty Profile Configuration Dashboard Panel", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // SECTION 6: ADMINISTRATOR PORTAL
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: "6. Administrator Portal & Telemetry Console", color: "0e2a47", bold: true, size: 28, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "The administrator panel coordinates system settings, admissions CRM review pipelines, dynamic official transcripts delivery, and structural academic bulk Excel imports.",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Admin Dashboard Image
  const adminDashData = getImageData(screenshots.adminDashboard);
  if (adminDashData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: adminDashData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 6.1: Administrative Main Console Overview", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Subpages
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({ text: "6.1 Access Control, Settings, and Official Transcripts subpages", color: "009fe5", bold: true, size: 24, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "• Access Control Tiers (/dashboard/admin/manage-admins): Super Admins promote/demote Standard and Restricted Admins dynamically without code edits.\n" +
                "• Integrations Settings (/dashboard/admin/settings): Define SMTP outbound mail gateways and synchronizations for external accountants like Aplos. Note: Restricted admins cannot access or edit this page.\n" +
                "• Records & Transcripts (/dashboard/admin/transcripts): Review student withdrawal requests and process official, printable academic transcripts directly to dynamic distribution lists.",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  // Embed Manage Admins Image
  const manageAdData = getImageData(screenshots.manageAdmins);
  if (manageAdData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: manageAdData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 6.2: Access Tiers Directory Console for Clearance Promotion & Demotion", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Embed Admin Settings Image
  const adminSetData = getImageData(screenshots.adminSettings);
  if (adminSetData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: adminSetData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 6.3: Integrations outbound SMTP & accounting system configurations console", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Embed Admin Transcripts Image
  const adminTrData = getImageData(screenshots.adminTranscripts);
  if (adminTrData) {
    docxChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 100 },
        children: [
          new ImageRun({
            data: adminTrData,
            transformation: { width: 500, height: 281 },
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 50, after: 300 },
        children: [
          new TextRun({ text: "Figure 6.4: Official Transcripts Management and Withdrawal process console", italic: true, size: 10, font: "Arial" }),
        ],
      })
    );
  }

  // Step-by-Step for Excel Importer Page
  docxChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({ text: "6.2 Bulk Academic Structure Excel Import System", color: "009fe5", bold: true, size: 24, font: "Arial" }),
      ],
    }),
    new Paragraph({
      spacing: { before: 100, after: 120 },
      children: [
        new TextRun({
          text: "Located at the top of Setup Academics page (/dashboard/admin/academics), this system enables bulk creation of Departments, Class Cohorts, and Courses via standardized Excel uploads.\n" +
                "Step-by-step instructions to use:\n" +
                "1. Download Template: Click \"Download Excel Template\" to generate a compiled workbook containing three structured sheets (Departments, Classes, and Courses) pre-populated with examples.\n" +
                "2. Populate Excel: Enter your institutional structures. Keep exact values for 'DepartmentCode' in the Classes sheet and 'ClassCode' in the Courses sheet to match links properly.\n" +
                "3. Upload Spreadsheet: Click or drag your completed academic structure Excel file into the Dashed Upload Zone. The system processes rows using transactional ACID integrity, rolling back all changes if any single record fails validation.",
          font: "Arial",
          size: 22,
        }),
      ],
    })
  );

  const doc = new Document({
    creator: "Esdros Seminary Information Systems Division",
    title: "Esdros Theological Seminary - Comprehensive User Manual & Portal Guide",
    description: "Detailed step-by-step manuals, visual tour guides, and operational guidelines for students, faculty, and administrators.",
    sections: [{
      properties: {},
      children: docxChildren,
    }],
  });

  Packer.toBuffer(doc).then((buffer) => {
    const destPath = path.join(publicDir, "Esdros_Theological_Seminary_User_Manual.docx");
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
  const destPath = path.join(publicDir, "Esdros_Theological_Seminary_User_Manual.pdf");
  
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
  doc.fontSize(11).fillColor("#64748b").text("Version 1.1 • Published May 2026", { align: "center" });
  doc.text("Prepared for: Administrators, Registrar, Faculty Instructors, and Enrolled Students", { align: "center" });
  doc.addPage();

  // Section 1: Platform Overview
  doc.fontSize(18).fillColor("#0e2a47").text("1. Platform Overview & Unified Architecture");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "Esdros Theological Seminary features a highly premium, unified Student Information System (SIS) and Learning Management System (LMS) that coordinates enrollment lifecycle, CRM admissions scoring, class scheduling, attendance tracking, numerical grading, and official PDF transcript distribution. All operations are strictly divided across three secure portals—Student, Faculty, and Admin—integrated dynamically under centralized ACID database transaction rules.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Section 2: Public Website
  doc.fontSize(18).fillColor("#0e2a47").text("2. Public Marketing Website & Portal Navigations");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "The institutional front page offers direct links to seminary portals, contact details, curriculum calendars, and academic tracks. Sub-pages detail structured programs:\n" +
    "• Theology Track (/programs/theology): Covers Orthodox dogmatic theological curriculums.\n" +
    "• Geez Language Track (/programs/geez): Details classical Geez language grammar and syntactic studies.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Public Landing Image
  if (fs.existsSync(screenshots.publicLanding)) {
    doc.image(screenshots.publicLanding, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 2.1: Esdros Seminary Public Landing Website", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Embed Public Theology Image
  if (fs.existsSync(screenshots.publicTheology)) {
    doc.image(screenshots.publicTheology, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 2.2: Orthodox Theology Program Curriculum Page", { align: "center" });
    doc.moveDown(1.5);
  }

  // Section 3: Authentication Gateways
  doc.fontSize(18).fillColor("#0e2a47").text("3. Gateway Authentication & Security Control");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "The portal entry (/login) maintains strict user security rules:\n" +
    "1. Enforce Password Policy: Passwords must be greater than seven characters and must contain an uppercase letter, lowercase letter, number, and special character.\n" +
    "2. Two-Factor Authentication (MFA): Implements secure time-based authenticator apps (Google Authenticator, Microsoft Authenticator) using TOTP protocols. During signup, users scan a QR code and must enter their 6-digit verification pin to register. Subsequent logins automatically require their username, password, and active 6-digit TOTP pin.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Login Page Image
  if (fs.existsSync(screenshots.loginPage)) {
    doc.image(screenshots.loginPage, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 3.1: SIS-LMS Secure Multi-Factor Gateway Login Console", { align: "center" });
  }
  doc.addPage();

  // Section 4: Student Portal
  doc.fontSize(18).fillColor("#0e2a47").text("4. Student Dashboard & Portal Operations");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "Enrolled students access tools to register in cohort groups, review semester progress reports, make payments, and manage profile security settings.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Student Dashboard Image
  if (fs.existsSync(screenshots.studentDashboard)) {
    doc.image(screenshots.studentDashboard, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 4.1: Student Portal Overview Console Home", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Subsection 4.1: Course registration
  doc.fontSize(14).fillColor("#009fe5").text("4.1 Course Registration & Academics subpages");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "• Course Registration (/dashboard/student/enrollment): Displays sections active during the semester term. Students select subjects, view remaining spots, and request enrollments.\n" +
    "• Academics Progress (/dashboard/student/academics): Provides an unofficial transcript view listing completed classes, active credits, and overall cumulative GPA score matrices.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Student Enrollment Image
  if (fs.existsSync(screenshots.studentEnrollment)) {
    doc.image(screenshots.studentEnrollment, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 4.2: Course Section Registration Panel", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Embed Student Academics Image
  if (fs.existsSync(screenshots.studentAcademics)) {
    doc.image(screenshots.studentAcademics, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 4.3: Unofficial Transcript and Cumulative GPA Display", { align: "center" });
  }
  doc.addPage();

  // Subsection 4.2: Attendance, Ledgers, Settings
  doc.fontSize(14).fillColor("#009fe5").text("4.2 Attendance, Ledger Financials, and Security Settings");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "• Attendance Monitor (/dashboard/student/attendance): Real-time attendance logs showing present/absent classes and attendance percentages.\n" +
    "• Ledger Finance (/dashboard/student/finance): Direct look at tuition fee balances, active scholarship grants, and structural seminary invoice registries.\n" +
    "• Security / Profile Settings (/dashboard/student/settings): Reset passwords matching complexity parameters, toggle two-factor auth (MFA), and request programmatic student withdrawals (which puts the account in a read-only state upon registrar confirmation).",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Student Attendance Image
  if (fs.existsSync(screenshots.studentAttendance)) {
    doc.image(screenshots.studentAttendance, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 4.4: Real-Time Classroom Attendance Tracker Dashboard", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Embed Student Finance Image
  if (fs.existsSync(screenshots.studentFinance)) {
    doc.image(screenshots.studentFinance, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 4.5: Student Tuition Balance Ledgers & Invoice Center", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Embed Student Settings Image
  if (fs.existsSync(screenshots.studentSettings)) {
    doc.image(screenshots.studentSettings, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 4.6: Security settings, password resets, and withdrawal portal page", { align: "center" });
  }
  doc.addPage();

  // Section 5: Faculty Portal
  doc.fontSize(18).fillColor("#0e2a47").text("5. Faculty Portal Operations & Academic Tools");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "Instructors coordinate student section attendance, register grades out of 100, and coordinate schedule calendars directly with seminary chairs.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Faculty Dashboard Image
  if (fs.existsSync(screenshots.facultyDashboard)) {
    doc.image(screenshots.facultyDashboard, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 5.1: Faculty Portal Home & Active Classroom Telemetry Overview", { align: "center" });
  }
  doc.addPage();

  // Subsection 5.1
  doc.fontSize(14).fillColor("#009fe5").text("5.1 Attendance rosters & Grade submissions");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "• Classroom Attendance (/dashboard/faculty/attendance): Allows logging student attendance logs. Important: Students who are graduated, dismissed, or withdrawn are automatically excluded from the roster list.\n" +
    "• Gradebook Submissions (/dashboard/faculty/gradebook): Instructors enter numerical score values out of 100. The system automatically converts numbers into letter grades (A, B, C) in the backend tables, preventing arbitrary grade entry errors.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Faculty Attendance Image
  if (fs.existsSync(screenshots.facultyAttendance)) {
    doc.image(screenshots.facultyAttendance, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 5.2: Faculty Student Classroom Daily Attendance Log", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Embed Faculty Gradebook Image
  if (fs.existsSync(screenshots.facultyGradebook)) {
    doc.image(screenshots.facultyGradebook, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 5.3: Faculty Student Grade Entry Dashboard Console", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Embed Faculty Profile Image
  if (fs.existsSync(screenshots.facultyProfile)) {
    doc.image(screenshots.facultyProfile, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 5.4: Faculty Profile Configuration Dashboard Panel", { align: "center" });
  }
  doc.addPage();

  // Section 6: Admin Portal
  doc.fontSize(18).fillColor("#0e2a47").text("6. Administrator Portal & Telemetry Console");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "The administrator panel coordinates system settings, admissions CRM review pipelines, dynamic official transcripts delivery, and structural academic bulk Excel imports.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Admin Dashboard Image
  if (fs.existsSync(screenshots.adminDashboard)) {
    doc.image(screenshots.adminDashboard, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 6.1: Administrative Main Console Overview", { align: "center" });
  }
  doc.addPage();

  // Subsection 6.1
  doc.fontSize(14).fillColor("#009fe5").text("6.1 Access Control, Settings, and Official Transcripts subpages");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "• Access Control Tiers (/dashboard/admin/manage-admins): Super Admins promote/demote Standard and Restricted Admins dynamically without code edits.\n" +
    "• Integrations Settings (/dashboard/admin/settings): Define SMTP outbound mail gateways and synchronizations for external accountants like Aplos. Note: Restricted admins cannot access or edit this page.\n" +
    "• Records & Transcripts (/dashboard/admin/transcripts): Review student withdrawal requests and process official, printable academic transcripts directly to dynamic distribution lists.",
    { lineGap: 4 }
  );
  doc.moveDown(1.5);

  // Embed Manage Admins Image
  if (fs.existsSync(screenshots.manageAdmins)) {
    doc.image(screenshots.manageAdmins, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 6.2: Access Tiers Directory Console for Clearance Promotion & Demotion", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Embed Admin Settings Image
  if (fs.existsSync(screenshots.adminSettings)) {
    doc.image(screenshots.adminSettings, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 6.3: Integrations outbound SMTP & accounting system configurations console", { align: "center" });
    doc.moveDown(1.5);
  }
  doc.addPage();

  // Embed Admin Transcripts Image
  if (fs.existsSync(screenshots.adminTranscripts)) {
    doc.image(screenshots.adminTranscripts, { width: 500 });
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor("#64748b").text("Figure 6.4: Official Transcripts Management and Withdrawal process console", { align: "center" });
  }
  doc.addPage();

  // Subsection 6.2: Excel Importer
  doc.fontSize(14).fillColor("#009fe5").text("6.2 Bulk Academic Structure Excel Import System");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#1e293b").text(
    "Located at the top of Setup Academics page (/dashboard/admin/academics), this system enables bulk creation of Departments, Class Cohorts, and Courses via standardized Excel uploads.\n" +
    "Step-by-step instructions to use:\n" +
    "1. Download Template: Click \"Download Excel Template\" to generate a compiled workbook containing three structured sheets (Departments, Classes, and Courses) pre-populated with examples.\n" +
    "2. Populate Excel: Enter your institutional structures. Keep exact values for 'DepartmentCode' in the Classes sheet and 'ClassCode' in the Courses sheet to match links properly.\n" +
    "3. Upload Spreadsheet: Click or drag your completed academic structure Excel file into the Dashed Upload Zone. The system processes rows using transactional ACID integrity, rolling back all changes if any single record fails validation.",
    { lineGap: 4 }
  );

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
