const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'armenian_app',
});

async function checkSpecific() {
  const terms = ['փոքր', 'արև', 'խնձոր', 'ուրախ', 'սկս', 'հետաքրքիր', 'արթն', 'խոհանոց', 'թարմ'];
  for (const t of terms) {
    const res = await pool.query('SELECT id, armenian, translation, lesson FROM vocabulary WHERE armenian ILIKE $1', ['%' + t + '%']);
    console.log(`Term: "${t}" -> found ${res.rowCount}:`, res.rows.map(r => `${r.armenian} [${r.translation}]`));
  }
  await pool.end();
}

checkSpecific();
