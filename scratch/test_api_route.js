const fs = require('fs');
const { SignJWT } = require('jose');

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

async function main() {
  const { PrismaClient } = require('@prisma/client');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Get admin user from DB
  const dbUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!dbUser) {
    console.error("No ADMIN users found in the database.");
    await prisma.$disconnect();
    pool.end();
    return;
  }

  console.log("Using Database Admin ID:", dbUser.id, "email:", dbUser.email);

  const SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'
  );

  // Generate Admin Token
  const token = await new SignJWT({
    id: dbUser.id,
    email: dbUser.email,
    role: 'ADMIN',
    isSuperAdmin: dbUser.isSuperAdmin
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(SECRET);

  console.log("Generated Admin Token successfully.");

  // Get a class ID
  const classes = await prisma.class.findMany();
  if (classes.length === 0) {
    console.error("No classes found in DB");
    await prisma.$disconnect();
    pool.end();
    return;
  }
  const classId = classes[0].id;
  console.log("Using Class ID:", classId);

  // Clean test user if exists
  await prisma.user.delete({ where: { email: 'melkam.api.test@esderos.org' } }).catch(() => {});
  await prisma.$disconnect();
  pool.end();

  const payload = {
    firstName: 'MelkamApi',
    lastName: 'Test',
    email: 'melkam.api.test@esderos.org',
    track: 'THEOLOGY',
    classId: classId,
    password: 'apiTempPassword123!'
  };

  console.log("Sending POST request to /api/admin/students/add...");

  try {
    const res = await fetch('http://localhost:3000/api/admin/students/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      },
      body: JSON.stringify(payload)
    });

    const status = res.status;
    console.log("Response status:", status);
    
    const data = await res.json();
    console.log("Response payload:", JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("Fetch request failed:", error);
  }
}

main();
