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
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    console.log("=== ADMIN USERS ===");
    console.log(JSON.stringify(admins.map(u => ({ email: u.email, isSuperAdmin: u.isSuperAdmin, firstName: u.firstName, lastName: u.lastName })), null, 2));

  } catch (error) {
    console.error("Error performing query:", error);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

main();
