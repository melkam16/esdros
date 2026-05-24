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
  try {
    const result = await prisma.user.update({
      where: { email: 'it@esdros.org' },
      data: { passwordHash: 'student123', mfaEnabled: false }
    });
    console.log("=== UPDATE SUCCESS ===");
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error("Error performing update:", error);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

main();
