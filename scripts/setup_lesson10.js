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

const lesson10Words = [
  // Картинка 1: Профессии и транспорт
  { armenian: 'Սրճարան', phonetic: 'srcharan', translation: 'Кафе', example_armenian: 'Գնանք սրճարան:', example_translation: 'Пойдём в кафе.' },
  { armenian: 'Մասնագիտություն', phonetic: 'masnagitutyun', translation: 'Профессия', example_armenian: 'Ի՞նչ է քո մասնագիտությունը:', example_translation: 'Какая у тебя профессия?' },
  { armenian: 'Դասախոս', phonetic: 'dasakhos', translation: 'Преподаватель', example_armenian: 'Համալսարանի դասախոս:', example_translation: 'Преподаватель университета.' },
  { armenian: 'Փաստաբան', phonetic: 'pastaban', translation: 'Адвокат', example_armenian: 'Լավ փաստաբան:', example_translation: 'Хороший адвокат.' },
  { armenian: 'Դասավանդել', phonetic: 'dasavandel', translation: 'Преподавать', example_armenian: 'Նա հայերեն է դասավանդում:', example_translation: 'Он преподаёт армянский.' },
  { armenian: 'Հասցնել', phonetic: 'hascnel', translation: 'Успеть, успевать', example_armenian: 'Ես հասցրի գնացքին:', example_translation: 'Я успел на поезд.' },
  { armenian: 'Վարել', phonetic: 'varel', translation: 'Водить (машину)', example_armenian: 'Մեքենա վարել:', example_translation: 'Водить машину.' },
  { armenian: 'Ավտոմեքենա', phonetic: 'avtomeqena', translation: 'Автомобиль, машина', example_armenian: 'Նոր ավտոմեքենա:', example_translation: 'Новый автомобиль.' },

  // Картинка 2: Город, транспорт и общение
  { armenian: 'Երթուղային', phonetic: 'ertughayin', translation: 'Маршрутное такси', example_armenian: 'Երթուղային նստել:', example_translation: 'Сесть в маршрутку.' },
  { armenian: 'Մանկապարտեզ', phonetic: 'mankapartez', translation: 'Детский сад', example_armenian: 'Երեխան մանկապարտեզում է:', example_translation: 'Ребёнок в детском саду.' },
  { armenian: 'Թաղամաս', phonetic: 'taghamas', translation: 'Район, квартал', example_armenian: 'Մեր թաղամասը գեղեցիկ է:', example_translation: 'Наш район красивый.' },
  { armenian: 'Երևի', phonetic: 'erevi', translation: 'Наверное, скорее всего', example_armenian: 'Երևի նա կգա:', example_translation: 'Наверное, он придёт.' },
  { armenian: 'Ընդմիջում', phonetic: 'endmijum', translation: 'Перерыв', example_armenian: 'Ճաշի ընդմիջում:', example_translation: 'Обеденный перерыв.' },
  { armenian: 'Հանդիպում', phonetic: 'handipum', translation: 'Встреча', example_armenian: 'Կարևոր հանդիպում:', example_translation: 'Важная встреча.' },
  { armenian: 'Համերաշխ', phonetic: 'hamerashkh', translation: 'Дружно, дружный', example_armenian: 'Համերաշխ ընտանիք:', example_translation: 'Дружная семья.' },

  // Картинка 3: Качества и наречия времени
  { armenian: 'Աշխույժ', phonetic: 'ashkhuyzh', translation: 'Весёлый, оживлённый', example_armenian: 'Աշխույժ երեխա:', example_translation: 'Оживлённый ребёнок.' },
  { armenian: 'Դեռ', phonetic: 'der (derlevs)', translation: 'Пока ещё', example_armenian: 'Ես դեռ չեմ կերել:', example_translation: 'Я пока ещё не ел.' },
  { armenian: 'Միջնեկ', phonetic: 'mijnek', translation: 'Средний (ребёнок)', example_armenian: 'Միջնեկ տղա:', example_translation: 'Средний сын.' },
  { armenian: 'Սովորաբար', phonetic: 'sovorabar', translation: 'Обычно', example_armenian: 'Ես սովորաբար վաղ եմ արթնանում:', example_translation: 'Я обычно рано просыпаюсь.' },
  { armenian: 'Երբեմն', phonetic: 'erbemn', translation: 'Иногда', example_armenian: 'Երբեմն ես գիրք եմ կարդում:', example_translation: 'Иногда я читаю книгу.' },
];

async function main() {
  console.log(`Starting import of ${lesson10Words.length} words for Lesson 10...`);

  for (const item of lesson10Words) {
    const existing = await pool.query('SELECT id, lesson, is_learned FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}, Lesson ${existing.rows[0].lesson}). Updating...`);
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 10, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 10)`);
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
      COUNT(*) FILTER (WHERE lesson = 10) as lesson_10
    FROM vocabulary;
  `);

  console.log('\n🎉 Lesson 10 setup complete:');
  console.log(`Total words: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 10 words: ${counts.rows[0].lesson_10}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
