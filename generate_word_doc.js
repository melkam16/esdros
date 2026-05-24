const { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  HeadingLevel, 
  AlignmentType, 
  WidthType, 
  BorderStyle, 
  Header, 
  Footer 
} = require("docx");
const fs = require("fs");
const path = require("path");

console.log("Generating Esderos Seminary System Test Plan Word Document...");

// Utility to create styled header cells
function createHeaderCell(text, widthPercent) {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: true,
            color: "FFFFFF",
            size: 20,
          }),
        ],
        alignment: AlignmentType.LEFT,
      }),
    ],
    shading: {
      fill: "0F172A", // Slate 900
    },
    width: {
      size: widthPercent,
      type: WidthType.PERCENTAGE,
    },
    margins: {
      top: 120,
      bottom: 120,
      left: 120,
      right: 120,
    }
  });
}

// Utility to create regular cells
function createCell(text, bold = false, italic = false, color = "1E293B", bg = null) {
  const options = {
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: bold,
            italic: italic,
            color: color,
            size: 18,
          }),
        ],
        margins: {
          top: 100,
          bottom: 100,
          left: 100,
          right: 100,
        }
      }),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    }
  };
  
  if (bg) {
    options.shading = { fill: bg };
  }
  
  return new TableCell(options);
}

// Custom Horizontal Line
function createDivider() {
  return new Paragraph({
    children: [
      new TextRun({
        text: "_________________________________________________________________________________",
        color: "E2E8F0",
        bold: true,
      })
    ],
    spacing: {
      before: 120,
      after: 240,
    }
  });
}

// Custom Spacing Paragraph
function space(after = 120) {
  return new Paragraph({
    spacing: { after: after }
  });
}

// List item bullet helper
function bullet(text, boldPrefix = "", italic = false) {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + " ", bold: true, color: "0F172A", size: 18 }));
  }
  children.push(new TextRun({ text: text, italic: italic, color: "334155", size: 18 }));
  
  return new Paragraph({
    children: children,
    bullet: {
      level: 0
    },
    spacing: {
      after: 60
    }
  });
}

// Section Header Banner Helper
function createSectionHeader(title, subtitle) {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          color: "009FE5", // Seminary Blue
          size: 32,
        }),
      ],
      spacing: { before: 240, after: 60 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: subtitle,
          italic: true,
          color: "64748B",
          size: 20,
        }),
      ],
      spacing: { after: 180 }
    }),
  ];
}

// Test Case Table Generator
function buildTestCaseRow(id, obj, steps, expected) {
  return new TableRow({
    children: [
      createCell(id, true, false, "009FE5", "F8FAFC"),
      createCell(obj, false, false, "0F172A"),
      createCell(steps, false, false, "334155"),
      createCell(expected, false, true, "0F766E"),
      createCell("[ ] Pass\n[ ] Fail", false, false, "64748B", "F8FAFC")
    ]
  });
}

// --------------------------------------------------
// DOCUMENT CONSTRUCT
// --------------------------------------------------

const doc = new Document({
  sections: [
    {
      properties: {},
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Esderos EOTC Theological Seminary  |  Comprehensive System Test Plan",
                  bold: true,
                  size: 16,
                  color: "009FE5",
                }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { after: 120 }
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "CONFIDENTIAL — PLATFORM OPERATIONAL TRANSITION & STABILIZATION PLAN",
                  size: 14,
                  color: "64748B",
                }),
              ],
              alignment: AlignmentType.LEFT,
            }),
          ],
        }),
      },
      children: [
        // TITLE BANNERS
        new Paragraph({
          children: [
            new TextRun({
              text: "ESDEROS EOTC THEOLOGICAL SEMINARY",
              bold: true,
              color: "0F172A",
              size: 40,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 360, after: 120 }
        }),
        
        new Paragraph({
          children: [
            new TextRun({
              text: "COMPREHENSIVE SYSTEM TEST PLAN",
              bold: true,
              color: "009FE5",
              size: 28,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 }
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "Standard Operating Procedure & Verification Protocols for Quality Assurance Testers",
              italic: true,
              color: "64748B",
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 360 }
        }),

        createDivider(),

        // OVERVIEW CONTEXT CARD
        new Paragraph({
          children: [
            new TextRun({
              text: "1. Document Control & Metadata",
              bold: true,
              color: "0F172A",
              size: 24,
            }),
          ],
          spacing: { before: 240, after: 120 }
        }),

        bullet("Version: 1.2.0 (Stabilized)", "•"),
        bullet("Authors: Google Deepmind Agentic Architecture & Seminary DevOps Team", "•"),
        bullet("Institution: Esderos EOTC Theological Seminary", "•"),
        bullet("Target Environments: Local Staging & Production Cluster", "•"),
        bullet("Required Database Engine: Neon Postgres Server Pool Instance", "•"),

        createDivider(),

        // PUBLIC SITE TEST CASE SECTION
        ...createSectionHeader("2. Public Website Platform Verification", "Verification of admissions, alumni records, verified searches, requests, and library catalogs"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("ID", 10),
                createHeaderCell("Objective / Feature", 20),
                createHeaderCell("Execution Test Steps", 35),
                createHeaderCell("Expected Validation Outcome", 25),
                createHeaderCell("Status", 10)
              ]
            }),
            buildTestCaseRow(
              "PUB-001",
              "Alumni Search & Verification Console",
              "1. Navigate to '/alumni'\n2. Input first/last names of known graduates (e.g. Melkam)\n3. Verify year of graduation and track match matching historical files.",
              "Matching database records load immediately displaying a verified check badge. Queries with no exact match fail gracefully."
            ),
            buildTestCaseRow(
              "PUB-002",
              "Official Transcript Form Request Modal",
              "1. Open Request Transcript Modal from Alumni Services.\n2. Submit full name, track, graduation year, and email address.\n3. Complete form submission.",
              "Success alert notifies submitter. Transaction is recorded securely inside Neon database with PENDING review status."
            ),
            buildTestCaseRow(
              "PUB-003",
              "Continuing Education Application Audit",
              "1. Click the audit request link under Alumni Services.\n2. Input requested program details, address, and submission payloads.\n3. Send registration trigger.",
              "The request generates a database logger event. Logs are instantly queryable in the admin Requests page."
            ),
            buildTestCaseRow(
              "PUB-004",
              "MK Publications Catalog Search",
              "1. Navigate to '/alumni/mk-library'.\n2. Filter patristic Geez texts by category and search keyword 'Geez'.\n3. Verify catalog load speeds.",
              "Responsive grid shows matching commentary books. Typography reflects native Geez font families beautifully."
            )
          ]
        }),

        space(240),
        createDivider(),

        // ADMIN PORTAL TEST CASES
        ...createSectionHeader("3. Administration Control Console", "Verification of CRM admissions pipelines, curriculum imports, role restrictions, and notification systems"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("ID", 10),
                createHeaderCell("Objective / Feature", 20),
                createHeaderCell("Execution Test Steps", 35),
                createHeaderCell("Expected Validation Outcome", 25),
                createHeaderCell("Status", 10)
              ]
            }),
            buildTestCaseRow(
              "ADM-001",
              "Admissions CRM Lead Pipelines",
              "1. Log in as Super Admin.\n2. Navigate to CRM/Admissions.\n3. Select a pending application, audit credentials, and click Approve.",
              "The prospect moves to active student table. A student profile is automatically provisioned inside the system."
            ),
            buildTestCaseRow(
              "ADM-002",
              "Excel Academic Roster Roster Import",
              "1. Open Academic Structure.\n2. Download Excel blueprint template file.\n3. Populate data and import Excel file.\n4. Run validation checks.",
              "Roster classes, courses, tracks, and departments populate Prisma database structures perfectly with no orphan constraints."
            ),
            buildTestCaseRow(
              "ADM-003",
              "Faculty Assignment & Legacy Exclusion",
              "1. Assign a course to an instructor.\n2. Verify legacy semester headers are excluded from standard assignments dropdown.",
              "Standard and Super Admin assignment consoles load active terms only. No legacy-labeled courses pollute active listings."
            ),
            buildTestCaseRow(
              "ADM-004",
              "Standard/Restricted Admin Role Security",
              "1. Log in with Standard Admin credentials.\n2. Verify Settings has hidden SMTP and Aplos card credentials.\n3. Verify Restricted Admin is blocked fromSettings altogether.",
              "Standard admin sees only notification publisher, term controls, and date ranges. Restricted admins get /unauthorized redirects."
            ),
            buildTestCaseRow(
              "ADM-005",
              "Announcements SMTP Broadcast",
              "1. Draft an announcement in Settings.\n2. Set scope to custom class cohort or all students.\n3. Broadcast.",
              "An announcement notification populates user portal feeds immediately and fires an SMTP server email."
            )
          ]
        }),

        space(240),
        createDivider(),

        // STUDENT PORTAL TEST CASES
        ...createSectionHeader("4. Student Portal Console", "Verification of course registration safeguards, payment logs, and transcript histories"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("ID", 10),
                createHeaderCell("Objective / Feature", 20),
                createHeaderCell("Execution Test Steps", 35),
                createHeaderCell("Expected Validation Outcome", 25),
                createHeaderCell("Status", 10)
              ]
            }),
            buildTestCaseRow(
              "STU-001",
              "Registration Administrative Lock",
              "1. In Admin Settings, set Student Lock to 'LOCKED'.\n2. Log in as Student and try to add/drop a course.\n3. Unlock registration in Admin Settings and re-attempt.",
              "When locked, student registration yields a warning: 'Registration Locked'. Unlocking restores immediate course select access."
            ),
            buildTestCaseRow(
              "STU-002",
              "Academic Roster & Grade Histories",
              "1. Open Student Academic Record.\n2. Check term grades, GPA math, and completed courses.",
              "Renders transcripts, GPA averages, and lists approved course enrollment histories."
            ),
            buildTestCaseRow(
              "STU-003",
              "Financial Accounting Records",
              "1. Navigate to Student Finance & Payments.\n2. Review invoice records, outstanding balances, and receipt downloads.",
              "Accurate payment history ledger items load from database records showing payment date, invoice, and total fees."
            )
          ]
        }),

        space(240),
        createDivider(),

        // FACULTY PORTAL TEST CASES
        ...createSectionHeader("5. Faculty Portal Console", "Verification of active semesters teaching lists, attendance tracking, and gradebooks"),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("ID", 10),
                createHeaderCell("Objective / Feature", 20),
                createHeaderCell("Execution Test Steps", 35),
                createHeaderCell("Expected Validation Outcome", 25),
                createHeaderCell("Status", 10)
              ]
            }),
            buildTestCaseRow(
              "FAC-001",
              "Archive Semester Course Separation",
              "1. Log in as Faculty.\n2. Navigate to 'My Courses'.\n3. Verify past/legacy semesters are hidden.",
              "Only course sections matching the current semester are displayed in active listings. Legacy datasets are completely omitted."
            ),
            buildTestCaseRow(
              "FAC-002",
              "Roster Attendance Tracker",
              "1. Open Attendance Tracker for an active class section.\n2. Change student attendance codes (Present, Absent, Excused) and save.",
              "Student attendance rates recalculate automatically, saving transaction logs to the database."
            ),
            buildTestCaseRow(
              "FAC-003",
              "Gradebook Final Submissions",
              "1. Open Course Gradebook.\n2. Input letter grades for approved students and submit.",
              "Grades save immediately. Transcripts update instantly for all approved students in active cohorts."
            )
          ]
        }),

        space(240),
        createDivider(),

        // SIGN-OFF SHEET
        new Paragraph({
          children: [
            new TextRun({
              text: "6. QA Verification & Executive Sign-off",
              bold: true,
              color: "0F172A",
              size: 24,
            }),
          ],
          spacing: { before: 240, after: 120 }
        }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                createHeaderCell("Role / Department", 30),
                createHeaderCell("Verified Sign-off Signature", 50),
                createHeaderCell("Date Checked", 20)
              ]
            }),
            new TableRow({
              children: [
                createCell("Lead QA Engineer", true),
                createCell("____________________________________"),
                createCell("____ / ____ / 2026")
              ]
            }),
            new TableRow({
              children: [
                createCell("Supervising Registrar", true),
                createCell("____________________________________"),
                createCell("____ / ____ / 2026")
              ]
            }),
            new TableRow({
              children: [
                createCell("Seminary Dean & Chancellor", true),
                createCell("____________________________________"),
                createCell("____ / ____ / 2026")
              ]
            })
          ]
        })
      ]
    }
  ]
});

// Write .docx file
const docxPath = path.join(__dirname, "public", "Esderos_Seminary_System_Test_Plan.docx");
const rootDocxPath = path.join(__dirname, "Esderos_Seminary_System_Test_Plan.docx");

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(docxPath, buffer);
  fs.writeFileSync(rootDocxPath, buffer);
  console.log(`\nSuccess: Word document generated at ${docxPath}`);
  console.log(`Success: Word document generated at ${rootDocxPath}\n`);
}).catch(err => {
  console.error("Error generating document:", err);
});
