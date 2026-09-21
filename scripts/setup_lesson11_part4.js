require('dotenv').config();
const { Pool } = require('pg');
const { getOrGenerateAudio } = require('../services/tts');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'armenian_app',
});

const lesson11Part4Words = [
  { armenian: 'Փրկվել', phonetic: 'prkvel', translation: 'Спасаться, спастись', example_armenian: 'Մարդիկ փրկվեցին:', example_translation: 'Люди спаслись.' },
  { armenian: 'Ուղարկել', phonetic: 'ugharkel', translation: 'Послать, отправлять', example_armenian: 'Նամակ ուղարկել:', example_translation: 'Отправить письмо.' },
  { armenian: 'Օրհնել', phonetic: 'orhnel', translation: 'Благословить', example_armenian: 'Աստված օրհնի քեզ:', example_translation: 'Да благословит тебя Бог.' },
];

async function main() {
  console.log(`Starting import of ${lesson11Part4Words.length} words for Lesson 11 (Final Part)...`);

  for (const item of lesson11Part4Words) {
    const existing = await pool.query('SELECT id, lesson, is_learned FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}, Lesson ${existing.rows[0].lesson}). Updating...`);
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 11, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 11)`);
    }

    // Synthesize audio with Liam (ElevenLabs)
    try {
      const audioRes = await getOrGenerateAudio(wordId, item.armenian, process.env.ELEVENLABS_VOICE_ID, false);
      const status = audioRes.cached ? '⚡ cached' : '✨ synthesized';
      console.log(`   [${wordId}] Audio: ${audioRes.url} [${status}]`);
    } catch (err) {
      console.error(`   ❌ Audio failed for [${wordId}] ${item.armenian}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 350));
  }

  const counts = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_learned = true) as learned,
      COUNT(*) FILTER (WHERE is_learned = false) as to_learn,
      COUNT(*) FILTER (WHERE lesson = 11) as lesson_11
    FROM vocabulary;
  `);

  console.log('\n🎉 Lesson 11 Complete:');
  console.log(`Total words in DB: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 11 total words: ${counts.rows[0].lesson_11}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
