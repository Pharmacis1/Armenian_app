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
  console.log('🔄 Distributing 495 vocabulary words across 30 levels...');

  // 1. Fetch all words ordered pedagogically by lesson, then id
  const res = await pool.query('SELECT id, armenian, translation, lesson FROM vocabulary ORDER BY lesson ASC, id ASC');
  const words = res.rows;
  const totalWords = words.length;
  console.log(`Found ${totalWords} words in database.`);

  if (totalWords !== 495) {
    console.warn(`Note: expected 495 words, found ${totalWords}.`);
  }

  // Calculate level sizes:
  // 30 levels total.
  // 495 / 30 = 16.5
  // First 15 levels get 17 words (15 * 17 = 255)
  // Next 15 levels get 16 words (15 * 16 = 240)
  // 255 + 240 = 495.
  const levelAssignments = [];
  let currentIndex = 0;

  for (let lvl = 1; lvl <= 30; lvl++) {
    const size = lvl <= 15 ? 17 : 16;
    const levelWords = words.slice(currentIndex, currentIndex + size);
    currentIndex += size;

    for (const w of levelWords) {
      levelAssignments.push({ id: w.id, level: lvl });
    }
  }

  console.log(`Updating level column for ${levelAssignments.length} words...`);

  // Update in batch transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of levelAssignments) {
      await client.query('UPDATE vocabulary SET level = $1 WHERE id = $2', [item.level, item.id]);
    }

    await client.query('COMMIT');
    console.log('✅ Successfully assigned levels 1 to 30 to all words.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating levels:', err);
    throw err;
  } finally {
    client.release();
  }

  // Verification breakdown
  const stats = await pool.query(`
    SELECT level, COUNT(*) as word_count, MIN(lesson) as min_lesson, MAX(lesson) as max_lesson
    FROM vocabulary
    GROUP BY level
    ORDER BY level ASC;
  `);

  console.log('\n📊 Levels Breakdown (Levels 1 to 30):');
  console.table(stats.rows);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
