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
  console.log("Setting up test database records...");
  
  // Find a student first
  const student = await prisma.student.findFirst();
  if (!student) {
    console.log("No student found in database to link grades. Creating a test student...");
  }
  
  // Create a course
  const course = await prisma.course.create({
    data: {
      code: 'CASCADE-TEST',
      title: 'Cascade Test Course',
      credits: 3,
      track: 'THEOLOGY',
      class: {
        create: {
          name: 'Cascade Test Class',
          code: 'C-CLASS',
          department: {
            connectOrCreate: {
              where: { code: 'THEO' },
              create: { name: 'Theology', code: 'THEO' }
            }
          }
        }
      }
    }
  });
  console.log(`Created course: ${course.id}`);

  // Create an assessment
  const assessment = await prisma.assessment.create({
    data: {
      title: 'Test Exam',
      type: 'FINAL',
      maxPoints: 100,
      courseId: course.id
    }
  });
  console.log(`Created assessment: ${assessment.id}`);

  // If we have a student, create a grade
  if (student) {
    const grade = await prisma.grade.create({
      data: {
        pointsEarned: 85,
        studentId: student.id,
        assessmentId: assessment.id
      }
    });
    console.log(`Created grade: ${grade.id}`);
  }

  // Attempt to delete course
  console.log(`\nAttempting to delete course: ${course.id}...`);
  try {
    const res = await prisma.course.delete({
      where: { id: course.id }
    });
    console.log("SUCCESS! Deletion cascaded correctly.");
  } catch (err) {
    console.error("FAILED to delete course!");
    console.error("Prisma error code:", err.code);
    console.error("Message:", err.message);
  }

  // Cleanup class if course deletion failed
  try {
    await prisma.class.delete({ where: { code: 'C-CLASS' } }).catch(() => {});
  } catch {}
}

main()
  .catch(err => console.error("Unhandled error:", err))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
