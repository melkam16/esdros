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
  const classes = await prisma.class.findMany({
    include: {
      students: {
        include: {
          user: true
        }
      },
      subjects: true,
      department: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log("=== CLASS DETAILS ===");
  classes.forEach(c => {
    console.log(`\n========================================`);
    console.log(`CLASS: ${c.name} (${c.code})`);
    console.log(`Department: ${c.department.name} (${c.department.code})`);
    console.log(`========================================`);
    
    console.log(`\n📚 COURSES/SUBJECTS (${c.subjects.length}):`);
    if (c.subjects.length === 0) {
      console.log("  (No courses linked)");
    } else {
      c.subjects.forEach((sub, idx) => {
        console.log(`  ${idx + 1}. [${sub.code}] ${sub.title} (${sub.credits} Credits, Track: ${sub.track})`);
      });
    }

    console.log(`\n🎓 ASSIGNED STUDENTS (${c.students.length}):`);
    if (c.students.length === 0) {
      console.log("  (No students assigned)");
    } else {
      c.students.forEach((student, idx) => {
        const u = student.user;
        console.log(`  ${idx + 1}. Student ID: ${student.id}`);
        console.log(`     Name: ${u.firstName} ${u.lastName}`);
        console.log(`     Email: ${u.email}`);
        console.log(`     Status: ${student.status}`);
      });
    }
  });
}

main()
  .catch(err => {
    console.error("Error during listing:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
