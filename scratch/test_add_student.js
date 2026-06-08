const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const { hash } = require('crypto');

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
          if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
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
console.log("Using DATABASE_URL:", connectionString ? "Loaded successfully" : "FAILED TO LOAD");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("Fetching classes...");
    const classes = await prisma.class.findMany({
      include: { department: true }
    });
    console.log("Available classes:", classes.map(c => ({ id: c.id, name: c.name, code: c.code, dept: c.department?.code })));

    if (classes.length === 0) {
      console.log("No classes available! Please create a class first.");
      return;
    }

    const testClass = classes[0];
    const email = 'melkam.test@esderos.org';
    const password = 'melkamtemp123';
    const firstName = 'Melkam';
    const lastName = 'Seminary';
    const track = 'THEOLOGY';

    // Delete if already exists to ensure repeatable runs
    await prisma.user.delete({ where: { email } }).catch(() => {});

    console.log(`Attempting transaction to add student in cohort ${testClass.name}...`);
    
    // Hash password
    const passwordHash = hash('sha256', password);

    // Resolve department code
    const deptCode = testClass.department?.code || 'THEO';

    const result = await prisma.$transaction(async (tx) => {
      // Generate ID
      const count = await tx.student.count({
        where: { id: { startsWith: `${deptCode}-` } }
      });
      
      let sequentialNumber = String(count + 1).padStart(4, '0');
      let studentId = `${deptCode}-${sequentialNumber}`;
      let isUnique = false;
      let attempt = 0;
      
      while (!isUnique) {
        const existing = await tx.student.findUnique({ where: { id: studentId } });
        if (!existing) {
          isUnique = true;
        } else {
          attempt++;
          const newNum = String(count + 1 + attempt).padStart(4, '0');
          studentId = `${deptCode}-${newNum}`;
        }
      }

      console.log(`Generated Student ID: ${studentId}`);

      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash,
          role: 'STUDENT',
          mustChangePassword: true,
        }
      });

      const student = await tx.student.create({
        data: {
          id: studentId,
          userId: user.id,
          status: 'ACTIVE',
          track: track,
          classId: testClass.id,
        }
      });

      return { user, student };
    });

    console.log("Transaction succeeded!", result);

  } catch (error) {
    console.error("Error executing transaction:", error);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}

main();
