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

// Target class filters (matching user codes and names)
const targetCodes = [
  'TH-BY2', 'TH-BAY2',
  'TH-BY3', 'TH-BAY3',
  'TH-BY4', 'TH-BAY4',
  'TH-ADY1', 'TH-AY1',
  'TH-ADY2', 'TH-AY2',
  'GZ-101', 'GZ-1',
  'TH-Y1',
  'TH-Y2',
  'GZ-Y1', 'GZ-BY1', 'GZ-AY1'
];

const targetNameSubstrings = [
  'Bachelor Year 2',
  'Bachelor Year 3',
  'Bachelor Year 4',
  'Associate Degree Year 1',
  'Geez Bachelor Year 1',
  'Geez 1st Year',
  'Theology Cohort Year 1',
  'Theology Cohort Year 2',
  'Geez Language Year 1'
];

async function main() {
  console.log("Fetching all classes in the database...");
  const classes = await prisma.class.findMany({
    include: {
      students: true,
      subjects: true
    }
  });

  // Filter matching classes
  const classesToDelete = classes.filter(c => {
    const code = c.code.trim().toUpperCase();
    const name = c.name.toLowerCase();

    // Check code matches
    const codeMatch = targetCodes.some(tc => code === tc.toUpperCase());
    
    // Check name substring matches
    const nameMatch = targetNameSubstrings.some(sub => name.includes(sub.toLowerCase()));

    return codeMatch || nameMatch;
  });

  console.log(`\nFound ${classesToDelete.length} matching classes to delete:`);
  classesToDelete.forEach(c => {
    console.log(`• Name: "${c.name}" | Code: "${c.code}" | Students: ${c.students.length} | Courses: ${c.subjects.length}`);
  });

  if (classesToDelete.length === 0) {
    console.log("No matching classes found. Cleanup is complete.");
    return;
  }

  console.log("\nStarting transaction purge...");

  for (const c of classesToDelete) {
    console.log(`\nPurging Class: ${c.name} (${c.code})...`);

    // 1. Delete associated students
    if (c.students.length > 0) {
      console.log(`  Deleting ${c.students.length} associated student(s)...`);
      for (const student of c.students) {
        // Deleting the parent User will cascade delete the Student record, enrollments, grades, etc.
        await prisma.user.delete({
          where: { id: student.userId }
        });
        console.log(`    Deleted User/Student Profile ID: ${student.id}`);
      }
    }

    // 2. Delete the Class itself (this will cascade delete all linked Courses/Subjects!)
    const deletedClass = await prisma.class.delete({
      where: { id: c.id }
    });
    console.log(`  Successfully deleted class: "${deletedClass.name}" (${deletedClass.code})`);
  }

  console.log("\n=== BULK CLEANUP COMPLETED SUCCESSFULLY ===");
}

main()
  .catch(err => {
    console.error("Critical error during purge migration:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
