const { Pool } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const hash = (algo, data) => {
  return crypto.createHash(algo).update(data).digest('hex');
};

async function main() {
  const client = await pool.connect();
  try {
    const email = 'kmeaza@yahoo.com';
    const plainPassword = 'SecurePass!123';
    const passwordHash = hash('sha256', plainPassword);

    await client.query(
      `UPDATE "User" SET "passwordHash" = $1 WHERE email = $2`,
      [passwordHash, email]
    );

    console.log(`Successfully updated password for ${email} to "${plainPassword}" (hash: ${passwordHash})`);
  } finally {
    client.release();
    pool.end();
  }
}

main().catch(console.error);
