const { SignJWT } = require('jose');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    // 1. Get student user
    const res = await client.query(`
      SELECT u.id, u.email, u."passwordHash" 
      FROM "User" u
      WHERE u.email = 'kmeaza@yahoo.com'
    `);
    
    if (res.rows.length === 0) {
      console.error("kmeaza@yahoo.com not found");
      return;
    }
    
    const user = res.rows[0];
    console.log(`Testing HTTP settings on email: ${user.email} (User ID: ${user.id})`);

    // 2. Generate token
    const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '4f7c9c0b1c3e9a8d5f1a7b2c6d9e4f8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6');
    const token = await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      role: 'STUDENT', 
      isSuperAdmin: false,
      isStandardAdmin: false 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(SECRET);

    console.log("Mock Token Generated.");

    // 3. Make HTTP request using native fetch
    console.log("Sending POST /api/student/settings...");
    const response = await fetch('http://localhost:3000/api/student/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      },
      body: JSON.stringify({
        firstName: "Meaza",
        lastName: "Worku",
        phone: "+251-999-9999",
        bio: "Updated student settings via test",
        pictureUrl: "https://example.com/pic.jpg",
        password: "NewSecurePassword!123"
      })
    });

    console.log("Response Status:", response.status);
    const body = await response.json();
    console.log("Response Body:", body);

    // 4. Verify DB
    const dbRes = await client.query(`SELECT "passwordHash" FROM "User" WHERE id = $1`, [user.id]);
    console.log("Current Hash in DB:", dbRes.rows[0].passwordHash);
  } catch (err) {
    console.error("HTTP settings test failed:", err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
