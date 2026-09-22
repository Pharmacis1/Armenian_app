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

const newMiniStoryWords = [
  { armenian: 'արև', phonetic: 'arev', translation: 'солнце', example_armenian: 'Արևը շողում է:', example_translation: 'Солнце светит.' },
  { armenian: 'շողալ', phonetic: 'shoghal (shoghum e)', translation: 'светить, сиять', example_armenian: 'Առավոտյան արևը շողում է:', example_translation: 'Утром солнце светит.' },
  { armenian: 'խոհանոց', phonetic: 'khohanots', translation: 'кухня', example_armenian: 'Նա գնում է խոհանոց:', example_translation: 'Она идёт на кухню.' },
  { armenian: 'թարմ', phonetic: 'tarm', translation: 'свежий', example_armenian: 'Սեղանին կա թարմ հաց:', example_translation: 'На столе есть свежий хлеб.' },
  { armenian: 'խնձոր', phonetic: 'khndzor', translation: 'яблоко', example_armenian: 'Կարմիր և համեղ խնձոր:', example_translation: 'Красное и вкусное яблоко.' },
  { armenian: 'հետաքրքիր', phonetic: 'hetaqrqir', translation: 'интересный', example_armenian: 'Հետաքրքիր գիրք կարդալ:', example_translation: 'Читать интересную книгу.' },
  { armenian: 'փոքրիկ', phonetic: 'poqrik', translation: 'маленький', example_armenian: 'Փոքրիկ սպիտակ կատու:', example_translation: 'Маленькая белая кошка.' },
  { armenian: 'ցատկել', phonetic: 'tsatkel (tsatkum e)', translation: 'прыгать, прыгнуть', example_armenian: 'Կատուն ցատկում է աթոռին:', example_translation: 'Кот прыгает на стул.' },
  { armenian: 'գիրկ', phonetic: 'girk', translation: 'колени, объятия', example_armenian: 'Կատուն նստած է գիրկը:', example_translation: 'Кот сидит на коленях.' },
  { armenian: 'ուրախ', phonetic: 'urakh', translation: 'радостный, рад', example_armenian: 'Ես շատ ուրախ եմ:', example_translation: 'Я очень рад.' },
  { armenian: 'սկսվել', phonetic: 'sksvel (sksvum e)', translation: 'начинаться', example_armenian: 'Լավ օր է սկսվում:', example_translation: 'Начинается хороший день.' },
];

async function addWords() {
  console.log(`Adding ${newMiniStoryWords.length} words for mini-story to Lesson 16...`);
  for (const item of newMiniStoryWords) {
    const existing = await pool.query('SELECT id FROM vocabulary WHERE LOWER(armenian) = LOWER($1)', [item.armenian]);
    let wordId;
    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`ℹ️ Word "${item.armenian}" already in DB (ID ${wordId})`);
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 16, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ [NEW] Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId})`);
    }

    try {
      const audioRes = await getOrGenerateAudio(wordId, item.armenian, process.env.ELEVENLABS_VOICE_ID, false);
      console.log(`   Audio [ID ${wordId}]: ${audioRes.url} [${audioRes.cached ? 'cached' : 'synthesized'}]`);
    } catch (e) {
      console.error(`   ❌ Audio error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 250));
  }
  await pool.end();
  console.log('Done adding words!');
}

addWords().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
