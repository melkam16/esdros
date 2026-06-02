const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is missing from environment.");
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT u.id, u.email, u."passwordHash", u.role 
      FROM "User" u
      WHERE u.role = 'STUDENT'
      LIMIT 5
    `);
    
    console.log("=== Student Credentials ===");
    res.rows.forEach(r => {
      console.log(`ID: ${r.id} | Email: ${r.email} | Hash: ${r.passwordHash}`);
    });
  } finally {
    client.release();
  }
}

main().catch(console.error).finally(() => pool.end());
