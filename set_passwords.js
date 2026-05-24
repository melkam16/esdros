const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');

function loadEnv() {
  const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
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

loadEnv();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await prisma.user.update({
      where: { email: 'it@esdros.org' },
      data: { passwordHash: 'student123', mfaEnabled: false }
    });
    console.log("Successfully set student it@esdros.org password to student123");
  } catch (error) {
    console.error("Error setting password:", error);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

main();
