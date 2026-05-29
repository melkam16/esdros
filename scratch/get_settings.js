const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');

function loadEnv() {
  const paths = ['.env', '.env.local'];
  for (const envPath of paths) {
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
          process.env[key] = value;
        }
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
    const settings = await prisma.systemSetting.findMany();
    console.log("=== SYSTEM SETTINGS ===");
    console.log(JSON.stringify(settings, null, 2));

  } catch (error) {
    console.error("Error fetching settings:", error);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

main();
