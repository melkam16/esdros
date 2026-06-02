const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');

function parseAndLoadFile(filePath) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1].trim();
        let value = (match[2] || '').replace(/\r/g, '').trim();
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    }
  }
}

function loadEnv() {
  parseAndLoadFile('.env');
  parseAndLoadFile('.env.local');
}

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing in environment");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find test student "student@esdros.org"
  const studentUser = await prisma.user.findUnique({
    where: { email: 'student@esdros.org' },
    include: { studentProfile: { include: { class: true } } }
  });

  if (!studentUser || !studentUser.studentProfile) {
    console.error("Test student student@esdros.org not found.");
    process.exit(1);
  }

  const student = studentUser.studentProfile;
  const originalClassId = student.classId;
  const originalClassName = student.class ? student.class.name : 'None';

  console.log(`\nFound Student: ${studentUser.firstName} ${studentUser.lastName}`);
  console.log(`Original Cohort: ${originalClassName} (ID: ${originalClassId})`);

  // 1. Test UNASSIGNMENT (set classId to null)
  console.log("\n--- TEST UNASSIGNMENT ---");
  console.log("Setting classId to null...");
  const unassigned = await prisma.student.update({
    where: { id: student.id },
    data: { classId: null },
    include: { class: true }
  });

  console.log(`Unassignment result Class: ${unassigned.class ? unassigned.class.name : 'Unassigned (Null)'}`);

  // 2. Test REASSIGNMENT (set classId back to original)
  console.log("\n--- TEST REASSIGNMENT ---");
  console.log(`Restoring classId back to ${originalClassId}...`);
  const reassigned = await prisma.student.update({
    where: { id: student.id },
    data: { classId: originalClassId },
    include: { class: true }
  });

  console.log(`Reassignment result Class: ${reassigned.class ? reassigned.class.name : 'Unassigned (Null)'}`);
  
  console.log("\n=== DATABASE TEST PASSED SUCCESSFULLY ===");
}

main()
  .catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
