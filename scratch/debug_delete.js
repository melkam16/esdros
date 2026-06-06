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
  console.log("Fetching courses...");
  const courses = await prisma.course.findMany({
    include: {
      sections: true,
      assessments: true
    }
  });

  console.log(`Found ${courses.length} courses:`);
  for (const c of courses) {
    console.log(`- ID: ${c.id} | Code: ${c.code} | Title: "${c.title}" | Sections count: ${c.sections.length} | Assessments count: ${c.assessments.length}`);
  }

  if (courses.length === 0) {
    console.log("No courses found. Creating a test course to attempt deletion...");
    const testCourse = await prisma.course.create({
      data: {
        code: 'TEST-101',
        title: 'Test Course',
        credits: 3,
        track: 'THEOLOGY',
        class: {
          create: {
            name: 'Test Class for Delete Debug',
            code: 'TEST-CLASS',
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
    console.log(`Created test course with ID: ${testCourse.id}`);
    courses.push(testCourse);
  }

  const target = courses[0];
  console.log(`\nAttempting to delete course: "${target.title}" (ID: ${target.id})...`);
  try {
    const res = await prisma.course.delete({
      where: { id: target.id }
    });
    console.log("Deletion successful! Result:", res);
  } catch (err) {
    console.error("DELETION FAILED!");
    console.error("Prisma error code:", err.code);
    console.error("Full error details:", err);
  }
}

main()
  .catch(err => console.error("Unhandled error:", err))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
