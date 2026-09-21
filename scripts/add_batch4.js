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

const newWords = [
  {
    armenian: 'Նրա',
    phonetic: 'nra',
    translation: 'Его / её',
    example_armenian: 'Նրա անունը Արամ է:',
    example_translation: 'Его имя — Арам.',
  },
  {
    armenian: 'Իր',
    phonetic: 'ir',
    translation: 'Его / её / свой',
    example_armenian: 'Նա սիրում է իր տունը:',
    example_translation: 'Он любит свой дом.',
  },
  {
    armenian: 'Իրար',
    phonetic: 'irar',
    translation: 'Друг друга',
    example_armenian: 'Մենք սիրում ենք իրար:',
    example_translation: 'Мы любим друг друга.',
  },
  {
    armenian: 'Սիրուն',
    phonetic: 'sirun',
    translation: 'Красивый',
    example_armenian: 'Շատ սիրուն ծաղիկ է:',
    example_translation: 'Очень красивый цветок.',
  },
  {
    armenian: 'Կարմիր',
    phonetic: 'karmir',
    translation: 'Красный',
    example_armenian: 'Կարմիր խնձոր:',
    example_translation: 'Красное яблоко.',
  },
];

async function main() {
  console.log('Adding batch 4 words to database...');

  for (const item of newWords) {
    const exists = await pool.query('SELECT id FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;
    if (exists.rowCount > 0) {
      wordId = exists.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}). Updating details...`);
      await pool.query(
        `UPDATE vocabulary 
         SET phonetic = $1, translation = $2, example_armenian = $3, example_translation = $4 
         WHERE id = $5`,
        [item.phonetic, item.translation, item.example_armenian, item.example_translation, wordId]
      );
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId})`);
    }

    // Generate Liam + Eleven v3 audio if not already generated
    console.log(`🎙️ Generating audio for [${wordId}] ${item.armenian}...`);
    try {
      const audioRes = await getOrGenerateAudio(wordId, item.armenian, process.env.ELEVENLABS_VOICE_ID, false);
      console.log(`   Audio: ${audioRes.url} (${audioRes.cached ? 'cached' : 'newly synthesized'})`);
    } catch (err) {
      console.error(`   Audio generation error:`, err.message);
    }
    await new Promise(r => setTimeout(r, 400));
  }

  const total = await pool.query('SELECT COUNT(*) FROM vocabulary');
  console.log(`\n🎉 Done! Total vocabulary words: ${total.rows[0].count}`);
  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
