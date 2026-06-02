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
  const targetId = 'bdf74389-ade0-4958-8fe3-50db724fa210';
  
  console.log(`Starting deletion check for Class ID: ${targetId}`);
  
  // Pre-validate relations exactly like our API endpoint
  const studentsCount = await prisma.student.count({ where: { classId: targetId } });
  if (studentsCount > 0) {
    console.error(`Cannot delete: Class contains ${studentsCount} students.`);
    process.exit(1);
  }

  const coursesCount = await prisma.course.count({ where: { classId: targetId } });
  if (coursesCount > 0) {
    console.error(`Cannot delete: Class has ${coursesCount} courses linked.`);
    process.exit(1);
  }

  // Safe to delete!
  const deleted = await prisma.class.delete({
    where: { id: targetId }
  });

  console.log("=== DELETION SUCCESS ===");
  console.log(`Deleted Class: ${deleted.name} (${deleted.code})`);
}

main()
  .catch(err => {
    console.error("Error during deletion:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
