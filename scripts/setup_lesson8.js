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

const lesson8Words = [
  // Картинка 1: Новые вопросительные слова
  { armenian: 'Ովքե՞ր', phonetic: 'ovqer', translation: 'Кто? (мн. число)', example_armenian: 'Ովքե՞ր են նրանք:', example_translation: 'Кто они?' },
  { armenian: 'Ինչե՞ր', phonetic: 'incher', translation: 'Что? (мн. число)', example_armenian: 'Ինչե՞ր ես գնել:', example_translation: 'Что ты купил?' },
  { armenian: 'Ինչքա՞ն', phonetic: 'inchqan', translation: 'Сколько?', example_armenian: 'Ինչքա՞ն արժե:', example_translation: 'Сколько это стоит?' },
  { armenian: 'Քանի՞', phonetic: 'qani', translation: 'Сколько штук?', example_armenian: 'Քանի՞ գիրք ունես:', example_translation: 'Сколько у тебя книг?' },
  { armenian: 'Ո՞ւր', phonetic: 'ur', translation: 'Куда?', example_armenian: 'Ո՞ւր ես գնում:', example_translation: 'Куда ты идёшь?' },
  { armenian: 'Ո՞ր', phonetic: 'or', translation: 'Какой? Который?', example_armenian: 'Ո՞ր գիրքն ես ուզում:', example_translation: 'Какую книгу ты хочешь?' },
  { armenian: 'Որտե՞ղ', phonetic: 'vortegh', translation: 'Где?', example_armenian: 'Որտե՞ղ ես ապրում:', example_translation: 'Где ты живёшь?' },

  // Картинка 2: Новые существительные и глаголы
  { armenian: 'Անտառ', phonetic: 'antar', translation: 'Лес', example_armenian: 'Խիտ անտառ:', example_translation: 'Густой лес.' },
  { armenian: 'Արձակուրդ', phonetic: 'ardzakurd', translation: 'Отпуск, каникулы', example_armenian: 'Ես արձակուրդում եմ:', example_translation: 'Я в отпуске.' },
  { armenian: 'Ծափ տալ', phonetic: 'tsap tal', translation: 'Аплодировать, хлопать', example_armenian: 'Երեխաները ծափ են տալիս:', example_translation: 'Дети аплодируют.' },
  { armenian: 'Քաղել', phonetic: 'qaqhel', translation: 'Срывать, собирать (цветы/плоды)', example_armenian: 'Ծաղիկներ քաղել:', example_translation: 'Собирать/рвать цветы.' },
  { armenian: 'Բռնել', phonetic: 'brnel', translation: 'Держать, поймать', example_armenian: 'Ձեռքս բռնիր:', example_translation: 'Держи мою руку.' },
];

async function main() {
  console.log(`Starting import of ${lesson8Words.length} words for Lesson 8...`);

  for (const item of lesson8Words) {
    const existing = await pool.query('SELECT id, lesson, is_learned FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}, Lesson ${existing.rows[0].lesson}). Updating...`);
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 8, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 8)`);
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
      COUNT(*) FILTER (WHERE lesson = 8) as lesson_8
    FROM vocabulary;
  `);

  console.log('\n🎉 Lesson 8 setup complete:');
  console.log(`Total words: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 8 words: ${counts.rows[0].lesson_8}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
