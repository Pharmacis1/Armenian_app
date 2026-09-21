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

const lesson5Words = [
  // Картинка 1: Существительные и прилагательные
  { armenian: 'Բան', phonetic: 'ban', translation: 'Что-то, что-нибудь', example_armenian: 'Մի բան ասա:', example_translation: 'Скажи что-нибудь.' },
  { armenian: 'Բառ', phonetic: 'bar', translation: 'Слово', example_armenian: 'Նոր բառ սովորել:', example_translation: 'Учить новое слово.' },
  { armenian: 'Բակ', phonetic: 'bak', translation: 'Двор', example_armenian: 'Երեխաները բակում են:', example_translation: 'Дети во дворе.' },
  { armenian: 'Բաժակ', phonetic: 'bazhak', translation: 'Стакан', example_armenian: 'Մեկ բաժակ ջուր:', example_translation: 'Один стакан воды.' },
  { armenian: 'Բարի', phonetic: 'bari', translation: 'Добрый', example_armenian: 'Բարի մարդ:', example_translation: 'Добрый человек.' },
  { armenian: 'Բժիշկ', phonetic: 'bzhishk', translation: 'Врач', example_armenian: 'Նա լավ բժիշկ է:', example_translation: 'Он хороший врач.' },
  { armenian: 'Աշխարհ', phonetic: 'ashkharh', translation: 'Мир', example_armenian: 'Մեծ աշխարհ:', example_translation: 'Большой мир.' },
  { armenian: 'Մանուկ', phonetic: 'manuk', translation: 'Ребёнок, дитя', example_armenian: 'Փոքրիկ մանուկ:', example_translation: 'Маленький ребёнок.' },
  { armenian: 'Նիհար', phonetic: 'nihar', translation: 'Худой', example_armenian: 'Նիհար տղա:', example_translation: 'Худой мальчик.' },
  { armenian: 'Տարբեր', phonetic: 'tarber', translation: 'Разные', example_armenian: 'Տարբեր գրքեր:', example_translation: 'Разные книги.' },
  { armenian: 'Փակ', phonetic: 'pak', translation: 'Закрытый', example_armenian: 'Դուռը փակ է:', example_translation: 'Дверь закрыта.' },

  // Картинка 2: Прилагательные, глаголы и местоимение
  { armenian: 'Փափուկ', phonetic: 'papuk', translation: 'Мягкий', example_armenian: 'Փափուկ հաց:', example_translation: 'Мягкий хлеб.' },
  { armenian: 'Նուրբ', phonetic: 'nurb', translation: 'Нежный', example_armenian: 'Նուրբ ծաղիկ:', example_translation: 'Нежный цветок.' },
  { armenian: 'Սուրբ', phonetic: 'surb', translation: 'Святой', example_armenian: 'Սուրբ Սարգիս:', example_translation: 'Святой Саркис.' },
  { armenian: 'Բուժել', phonetic: 'buzhel', translation: 'Лечить', example_armenian: 'Բժիշկը բուժում է:', example_translation: 'Врач лечит.' },
  { armenian: 'Բացել', phonetic: 'batsel', translation: 'Открыть, открывать', example_armenian: 'Դուռը բացել:', example_translation: 'Открыть дверь.' },
  { armenian: 'Փակել', phonetic: 'pakel', translation: 'Закрыть', example_armenian: 'Պատուհանը փակել:', example_translation: 'Закрыть окно.' },
  { armenian: 'Բերել', phonetic: 'berel', translation: 'Приносить, принести', example_armenian: 'Ջուր բեր:', example_translation: 'Принеси воду.' },
  { armenian: 'Եփել', phonetic: 'epel', translation: 'Варить', example_armenian: 'Ապուր եփել:', example_translation: 'Варить суп.' },
  { armenian: 'Հիանալ', phonetic: 'hianal', translation: 'Восхищаться', example_armenian: 'Ես հիանում եմ քեզանով:', example_translation: 'Я восхищаюсь тобой.' },
  { armenian: 'Բոլորը', phonetic: 'bolore', translation: 'Все', example_armenian: 'Բոլորը այստեղ են:', example_translation: 'Все здесь.' },

  // Картинка 3: Вопросительные слова
  { armenian: 'Ո՞վ', phonetic: 'ov', translation: 'Кто?', example_armenian: 'Ո՞վ է նա:', example_translation: 'Кто он?' },
  { armenian: 'Ի՞նչ', phonetic: 'inch', translation: 'Что?', example_armenian: 'Ի՞նչ կա:', example_translation: 'Что есть? / Что нового?' },
  { armenian: 'Ու՞մ', phonetic: 'um', translation: 'Кому? Кого?', example_armenian: 'Ու՞մ գիրքն է:', example_translation: 'Чья это книга?' },
  { armenian: 'Ինչո՞ւ', phonetic: 'inchu', translation: 'Почему?', example_armenian: 'Ինչո՞ւ ոչ:', example_translation: 'Почему нет?' },
  { armenian: 'Ինչպե՞ս', phonetic: 'inchpes', translation: 'Как?', example_armenian: 'Ինչպե՞ս անել:', example_translation: 'Как сделать?' },
  { armenian: 'Ինչպիսի՞', phonetic: 'inchpisi', translation: 'Какой?', example_armenian: 'Ինչպիսի՞ եղանակ է:', example_translation: 'Какая погода?' },
  { armenian: 'Ե՞րբ', phonetic: 'yerb', translation: 'Когда?', example_armenian: 'Ե՞րբ կգաս:', example_translation: 'Когда ты придёшь?' },
];

async function main() {
  console.log(`Starting import of ${lesson5Words.length} words for Lesson 5...`);

  for (const item of lesson5Words) {
    // Check if word already exists in vocabulary
    const existing = await pool.query('SELECT id FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}). Setting to Lesson 5...`);
      await pool.query(
        `UPDATE vocabulary 
         SET lesson = 5, is_learned = false, phonetic = $1, translation = $2, example_armenian = $3, example_translation = $4 
         WHERE id = $5`,
        [item.phonetic, item.translation, item.example_armenian, item.example_translation, wordId]
      );
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 5, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 5)`);
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
      COUNT(*) FILTER (WHERE lesson = 5) as lesson_5
    FROM vocabulary;
  `);

  console.log('\n🎉 Lesson 5 setup complete:');
  console.log(`Total words: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 5 words: ${counts.rows[0].lesson_5}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
