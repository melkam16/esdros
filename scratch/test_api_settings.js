const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { hash } = require('crypto');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Let's get the first student
  const student = await prisma.student.findFirst({
    include: { user: true }
  });

  if (!student) {
    console.error("No student found");
    return;
  }

  console.log(`Testing API Prisma settings logic on User ID: ${student.userId} (${student.user.email})`);
  console.log("Original Hash:", student.user.passwordHash);

  const password = "NewSecurePassword!123";
  const userUpdateData = {};
  userUpdateData.passwordHash = hash('sha256', password.trim());

  console.log("Hashing 'NewSecurePassword!123' with crypto.hash...");
  console.log("Calculated hash:", userUpdateData.passwordHash);

  try {
    await prisma.user.update({
      where: { id: student.userId },
      data: userUpdateData
    });
    
    // Fetch again to verify
    const updatedUser = await prisma.user.findUnique({
      where: { id: student.userId }
    });

    console.log("Updated Hash in DB:", updatedUser.passwordHash);
    if (updatedUser.passwordHash === userUpdateData.passwordHash) {
      console.log("✓ API PRISMA Settings logic works perfectly and changes the password in the database!");
    } else {
      console.error("✗ Database mismatch: hash did not change!");
    }

    // Restore original hash
    await prisma.user.update({
      where: { id: student.userId },
      data: { passwordHash: student.user.passwordHash }
    });
    console.log("Original hash safely restored.");
  } catch (err) {
    console.error("API Prisma execution failed with error:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect().then(() => pool.end()));
