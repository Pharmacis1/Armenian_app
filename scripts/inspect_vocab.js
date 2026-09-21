require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'armenian_app',
});

async function main() {
  const res = await pool.query('SELECT id, armenian, phonetic, translation, example_armenian, example_translation FROM vocabulary ORDER BY id ASC LIMIT 4');
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}

main();
