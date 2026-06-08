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
  const courses = await prisma.course.findMany({
    include: {
      sections: true,
      assessments: true
    }
  });

  for (const c of courses) {
    console.log(`\n--- Testing Deletion for Course: "${c.title}" (Code: ${c.code}) ---`);
    console.log(`ID: ${c.id}`);
    console.log(`Sections count: ${c.sections.length}`);
    console.log(`Assessments count: ${c.assessments.length}`);
    
    // Check if there are other records referencing this course directly or indirectly
    const sections = await prisma.courseSection.findMany({ where: { courseId: c.id } });
    for (const s of sections) {
      const enrollments = await prisma.enrollment.findMany({ where: { courseSectionId: s.id } });
      const attendances = await prisma.attendance.findMany({ where: { courseSectionId: s.id } });
      console.log(`  - Section ID: ${s.id} | Semester: ${s.semester} | Enrollments: ${enrollments.length} | Attendances: ${attendances.length}`);
    }

    const assessments = await prisma.assessment.findMany({ where: { courseId: c.id } });
    for (const a of assessments) {
      const grades = await prisma.grade.findMany({ where: { assessmentId: a.id } });
      console.log(`  - Assessment ID: ${a.id} | Title: "${a.title}" | Grades count: ${grades.length}`);
    }

    try {
      // We will perform a dry-run inside a transaction that we roll back, 
      // or we can just try to delete it. If it succeeds, we print success (and since it's a test db we don't mind).
      // To see the exact database error, let's run the delete command!
      const res = await prisma.course.delete({
        where: { id: c.id }
      });
      console.log(`SUCCESSFULLY DELETED course: "${c.title}"`);
    } catch (err) {
      console.error("FAILED to delete course!");
      console.error("Prisma error code:", err.code);
      console.error("Message:", err.message);
      console.error("Meta:", err.meta);
    }
  }
}

main()
  .catch(err => console.error("Unhandled error:", err))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
