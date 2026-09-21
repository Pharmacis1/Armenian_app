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

const lesson4Words = [
  // Существительные и время (Image 1)
  { armenian: 'Հարց', phonetic: 'harts', translation: 'Вопрос', example_armenian: 'Ես մի հարց ունեմ:', example_translation: 'У меня есть один вопрос.' },
  { armenian: 'Երաժիշտ', phonetic: 'erazhisht', translation: 'Музыкант', example_armenian: 'Տաղանդավոր երաժիշտ:', example_translation: 'Талантливый музыкант.' },
  { armenian: 'Ժամ', phonetic: 'zham', translation: 'Час', example_armenian: 'Մեկ ժամից կգամ:', example_translation: 'Я приду через час.' },
  { armenian: 'Ժամանակ', phonetic: 'zhamanak', translation: 'Время', example_armenian: 'Ժամանակը արագ է անցնում:', example_translation: 'Время быстро проходит.' },
  { armenian: 'Ժամացույց', phonetic: 'zhamatsuyts', translation: 'Часы', example_armenian: 'Ձեռքի ժամացույց:', example_translation: 'Наручные часы.' },
  { armenian: 'Հեռուստացույց', phonetic: 'herustatsuyts', translation: 'Телевизор', example_armenian: 'Հեռուստացույց դիտել:', example_translation: 'Смотреть телевизор.' },
  { armenian: 'Զրույց', phonetic: 'zruyts', translation: 'Беседа, разговор', example_armenian: 'Հետաքրքիր զրույց:', example_translation: 'Интересная беседа.' },
  { armenian: 'Ցուրտ', phonetic: 'tsurt', translation: 'Холод, холодно', example_armenian: 'Այսօր շատ ցուրտ է:', example_translation: 'Сегодня очень холодно.' },
  { armenian: 'Ցերեկ', phonetic: 'tserek', translation: 'День (светлое время)', example_armenian: 'Բարի ցերեկ:', example_translation: 'Добрый день.' },
  { armenian: 'Առավոտ', phonetic: 'aravot (aravotyan)', translation: 'Утро, утром', example_armenian: 'Բարի առավոտ:', example_translation: 'Доброе утро.' },

  // Качества, частицы и выражения (Image 2)
  { armenian: 'Երեկո', phonetic: 'yereko (yerekoyan)', translation: 'Вечер, вечером', example_armenian: 'Բարի երեկո:', example_translation: 'Добрый вечер.' },
  { armenian: 'Կարելի է', phonetic: 'kareli e', translation: 'Можно', example_armenian: 'Կարելի՞ է ներս մտնել:', example_translation: 'Можно войти?' },
  { armenian: 'Կուշտ', phonetic: 'kusht', translation: 'Сыт', example_armenian: 'Ես արդեն կուշտ եմ:', example_translation: 'Я уже сыт.' },
  { armenian: 'Համով', phonetic: 'hamov', translation: 'Вкусный, вкусно', example_armenian: 'Շատ համով կերակուր:', example_translation: 'Очень вкусная еда.' },
  { armenian: 'Անհամ', phonetic: 'anham', translation: 'Безвкусный, не вкусно', example_armenian: 'Անհամ ապուր:', example_translation: 'Невкусный суп.' },
  { armenian: 'Չէ', phonetic: 'che', translation: 'Нет (разг.)', example_armenian: 'Չէ, ես չեմ գալիս:', example_translation: 'Нет, я не иду.' },
  { armenian: 'Ոչինչ', phonetic: 'vochinch', translation: 'Ничего', example_armenian: 'Ոչինչ, ամեն ինչ կարգին է:', example_translation: 'Ничего, всё в порядке.' },
  { armenian: 'Չոր', phonetic: 'chor', translation: 'Сухой', example_armenian: 'Չոր հաց:', example_translation: 'Сухой хлеб.' },
  { armenian: 'Չիր', phonetic: 'chir', translation: 'Сухофрукт', example_armenian: 'Համեղ ծիրանի չիր:', example_translation: 'Вкусная курага (сушеный абрикос).' },
  { armenian: 'Ահա', phonetic: 'aha', translation: 'Вот', example_armenian: 'Ահա քո գիրքը:', example_translation: 'Вот твоя книга.' },
  { armenian: 'Ներս', phonetic: 'ners', translation: 'Внутрь', example_armenian: 'Գնանք ներս:', example_translation: 'Пойдем внутрь.' },
  { armenian: 'Ներս արի', phonetic: 'ners ari', translation: 'Заходи', example_armenian: 'Բարև, ներս արի, համեցեք:', example_translation: 'Привет, заходи, добро пожаловать!' },
  { armenian: 'Ցույց տուր', phonetic: 'tsuyts tur', translation: 'Покажи', example_armenian: 'Ցույց տուր ինձ նկարը:', example_translation: 'Покажи мне картину.' },

  // Глаголы 1 (Image 3)
  { armenian: 'Ամաչել', phonetic: 'amachel', translation: 'Стесняться', example_armenian: 'Մի՛ ամաչիր, խոսի՛ր:', example_translation: 'Не стесняйся, говори.' },
  { armenian: 'Ապրել', phonetic: 'aprel', translation: 'Жить', example_armenian: 'Ես ապրում եմ Երևանում:', example_translation: 'Я живу в Ереване.' },
  { armenian: 'Զրուցել', phonetic: 'zrutsel', translation: 'Беседовать, общаться', example_armenian: 'Ես սիրում եմ զրուցել քեզ հետ:', example_translation: 'Я люблю беседовать с тобой.' },
  { armenian: 'Լռել', phonetic: 'lrel', translation: 'Молчать', example_armenian: 'Նա լռեց մի պահ:', example_translation: 'Он замолчал на мгновение.' },
  { armenian: 'Լսել', phonetic: 'lsel', translation: 'Слушать, слышать', example_armenian: 'Ուշադիր լսեք ինձ:', example_translation: 'Внимательно слушайте меня.' },
  { armenian: 'Կտրել', phonetic: 'ktrel', translation: 'Отрезать, рубить', example_armenian: 'Հացը կտրել:', example_translation: 'Отрезать хлеб.' },
  { armenian: 'Հավանել', phonetic: 'havanel', translation: 'Нравиться, одобрить', example_armenian: 'Ես շատ հավանեցի այս տունը:', example_translation: 'Мне очень понравился этот дом.' },
  { armenian: 'Նայել', phonetic: 'nayel', translation: 'Смотреть', example_armenian: 'Նայիր այս նկարին:', example_translation: 'Посмотри на эту картину.' },
  { armenian: 'Նկարել', phonetic: 'nkarel', translation: 'Рисовать', example_armenian: 'Երեխաները նկարում են:', example_translation: 'Дети рисуют.' },

  // Глаголы 2 (Image 4)
  { armenian: 'Նստել', phonetic: 'nstel', translation: 'Сидеть, садиться', example_armenian: 'Նստեք, խնդրեմ:', example_translation: 'Садитесь, пожалуйста.' },
  { armenian: 'Պատմել', phonetic: 'patmel', translation: 'Рассказать', example_armenian: 'Պատմիր ինձ քո մասին:', example_translation: 'Расскажи мне о себе.' },
  { armenian: 'Պատրաստել', phonetic: 'patrastel', translation: 'Готовить, подготовить', example_armenian: 'Համեղ ընթրիք պատրաստել:', example_translation: 'Приготовить вкусный ужин.' },
  { armenian: 'Պարապել', phonetic: 'parapel', translation: 'Заниматься', example_armenian: 'Ամեն օր պարապել:', example_translation: 'Заниматься каждый день.' },
  { armenian: 'Սիրել', phonetic: 'sirel', translation: 'Любить', example_armenian: 'Ես սիրում եմ քեզ:', example_translation: 'Я люблю тебя.' },
  { armenian: 'Սպասել', phonetic: 'spasel', translation: 'Ждать', example_armenian: 'Մի րոպե սպասեք:', example_translation: 'Подождите одну минуту.' },
  { armenian: 'Մնալ', phonetic: 'mnal', translation: 'Остаться', example_armenian: 'Մնա մեզ հետ այսօր:', example_translation: 'Останься с нами сегодня.' },
  { armenian: 'Հավատալ', phonetic: 'havatal', translation: 'Верить, поверить', example_armenian: 'Ես հավատում եմ քեզ:', example_translation: 'Я верю тебе.' },
  { armenian: 'Ժպտալ', phonetic: 'zhptal', translation: 'Улыбаться, улыбнуться', example_armenian: 'Միշտ ժպտա:', example_translation: 'Всегда улыбайся.' },
];

async function main() {
  console.log('1. Updating schema with lesson & is_learned columns...');
  await pool.query(`
    ALTER TABLE vocabulary 
    ADD COLUMN IF NOT EXISTS lesson INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS is_learned BOOLEAN DEFAULT TRUE;
  `);

  console.log('2. Ensuring existing 166 words have is_learned = true...');
  await pool.query(`
    UPDATE vocabulary 
    SET is_learned = TRUE 
    WHERE is_learned IS NULL OR is_learned = FALSE;
  `);

  console.log(`3. Inserting ${lesson4Words.length} words for Lesson 4 (is_learned = false)...`);

  for (const item of lesson4Words) {
    const exists = await pool.query('SELECT id FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (exists.rowCount > 0) {
      wordId = exists.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}). Setting to Lesson 4...`);
      await pool.query(
        `UPDATE vocabulary 
         SET lesson = 4, is_learned = false, phonetic = $1, translation = $2, example_armenian = $3, example_translation = $4 
         WHERE id = $5`,
        [item.phonetic, item.translation, item.example_armenian, item.example_translation, wordId]
      );
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 4, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 4)`);
    }

    // Synthesize audio with Liam + Eleven v3
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
      COUNT(*) FILTER (WHERE lesson = 4) as lesson_4
    FROM vocabulary;
  `);

  console.log('\n🎉 Lesson 4 setup complete:');
  console.log(`Total words: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 4 words: ${counts.rows[0].lesson_4}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
