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
  const classes = await prisma.class.findMany();
  console.log("Available classes:", classes);

  if (classes.length > 0) {
    const defaultClass = classes[0];
    
    // Restore GZ-101
    await prisma.course.upsert({
      where: { code: 'GZ-101' },
      update: {},
      create: {
        id: 'da9734f4-cf31-40b7-a5b9-342afdc772ec',
        code: 'GZ-101',
        title: "Introduction to Ge'ez Language",
        credits: 3,
        track: 'GEEZ_LANGUAGE',
        classId: defaultClass.id
      }
    });
    console.log("Restored GZ-101");

    // Restore TH-401
    await prisma.course.upsert({
      where: { code: 'TH-401' },
      update: {},
      create: {
        id: 'a8b881dd-6948-4ca4-8d71-5ffe79d0a34c',
        code: 'TH-401',
        title: "Biblical Hebrew II",
        credits: 3,
        track: 'THEOLOGY',
        classId: defaultClass.id
      }
    });
    console.log("Restored TH-401");

    // Restore TH-206
    await prisma.course.upsert({
      where: { code: 'TH-206' },
      update: {},
      create: {
        id: '7ea7ab71-cb33-4c7c-9dae-249399fd82c5',
        code: 'TH-206',
        title: "Biblical Hebrew I",
        credits: 3,
        track: 'THEOLOGY',
        classId: defaultClass.id
      }
    });
    console.log("Restored TH-206");
  }
}

main()
  .catch(err => console.error("Unhandled error:", err))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
