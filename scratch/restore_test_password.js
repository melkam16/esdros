const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    const email = 'kmeaza@yahoo.com';
    const originalHash = '4b99fcb46606bb503ade5592b16f7368ff4be0a203d49e56a2143544e80d6caf';

    await client.query(
      `UPDATE "User" SET "passwordHash" = $1 WHERE email = $2`,
      [originalHash, email]
    );

    console.log(`Successfully restored original password hash for ${email}`);
  } finally {
    client.release();
    pool.end();
  }
}

main().catch(console.error);
