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

const lesson6Words = [
  // Картинка 1: Глаголы движения и действий
  { armenian: 'Գնալ', phonetic: 'gnal', translation: 'Идти, поехать', example_armenian: 'Ո՞ւր ես գնում:', example_translation: 'Куда ты идёшь?' },
  { armenian: 'Գալ', phonetic: 'gal', translation: 'Приходить, приехать', example_armenian: 'Ե՞րբ ես գալիս:', example_translation: 'Когда ты придёшь?' },
  { armenian: 'Ման գալ', phonetic: 'man gal', translation: 'Ходить, гулять', example_armenian: 'Ես սիրում եմ ման գալ:', example_translation: 'Я люблю гулять.' },
  { armenian: 'Ներս գալ', phonetic: 'ners gal', translation: 'Войти, входить', example_armenian: 'Ներս արի, խնդրեմ:', example_translation: 'Заходи, пожалуйста.' },
  { armenian: 'Դուրս գալ', phonetic: 'durs gal', translation: 'Выйти, выходить', example_armenian: 'Դուրս արի բակ:', example_translation: 'Выходи во двор.' },
  { armenian: 'Դուր գալ', phonetic: 'dur gal', translation: 'Нравиться', example_armenian: 'Այս գիրքը ինձ դուր է գալիս:', example_translation: 'Эта книга мне нравится.' },
  { armenian: 'Գրել', phonetic: 'grel', translation: 'Писать', example_armenian: 'Նամակ գրել:', example_translation: 'Писать письмо.' },
  { armenian: 'Հագնել', phonetic: 'hagnel', translation: 'Надевать, одеть', example_armenian: 'Տաք շորեր հագնել:', example_translation: 'Надеть тёплую одежду.' },
  { armenian: 'Հանգստանալ', phonetic: 'hangstanal', translation: 'Отдыхать', example_armenian: 'Մի քիչ հանգստացիր:', example_translation: 'Немного отдохни.' },
  { armenian: 'Հոգնել', phonetic: 'hognel', translation: 'Уставать', example_armenian: 'Ես շատ եմ հոգնել:', example_translation: 'Я очень устал.' },

  // Картинка 2: Глаголы и местоимения
  { armenian: 'Օգնել', phonetic: 'ognel', translation: 'Помогать', example_armenian: 'Կարո՞ղ ես օգնել ինձ:', example_translation: 'Можешь помочь мне?' },
  { armenian: 'Հավաքել', phonetic: 'havaqel', translation: 'Собирать, убирать', example_armenian: 'Սենյակը հավաքել:', example_translation: 'Убрать комнату.' },
  { armenian: 'Քնել', phonetic: 'qnel', translation: 'Спать', example_armenian: 'Երեխան քնած է:', example_translation: 'Ребёнок спит.' },
  { armenian: 'Դնել', phonetic: 'dnel (dir)', translation: 'Ставить, класть', example_armenian: 'Գիրքը դիր սեղանին:', example_translation: 'Положи книгу на стол.' },
  { armenian: 'Կարդալ', phonetic: 'kardal', translation: 'Читать', example_armenian: 'Հետաքրքիր գիրք կարդալ:', example_translation: 'Читать интересную книгу.' },
  { armenian: 'Արդուկել', phonetic: 'ardukel', translation: 'Гладить, утюжить', example_armenian: 'Շապիկը արդուկել:', example_translation: 'Погладить рубашку.' },
  { armenian: 'Զարթնել', phonetic: 'zartnel', translation: 'Просыпаться, пробуждаться', example_armenian: 'Վաղ առավոտյան զարթնել:', example_translation: 'Проснуться ранним утром.' },
  { armenian: 'Դու', phonetic: 'du', translation: 'Ты', example_armenian: 'Դու իմ ընկերն ես:', example_translation: 'Ты мой друг.' },
  { armenian: 'Դուք', phonetic: 'duq', translation: 'Вы', example_armenian: 'Ո՞վ եք դուք:', example_translation: 'Кто вы?' },
  { armenian: 'Քո', phonetic: 'qo', translation: 'Твой, твоя', example_armenian: 'Սա քո գիրքն է:', example_translation: 'Это твоя книга.' },

  // Картинка 3: Местоимения и существительные
  { armenian: 'Ինքը', phonetic: 'inqe', translation: 'Он, она (сам)', example_armenian: 'Ինքը գիտի ամեն ինչ:', example_translation: 'Он сам всё знает.' },
  { armenian: 'Ամեն ինչ', phonetic: 'amen inch', translation: 'Всё', example_armenian: 'Ամեն ինչ լավ է:', example_translation: 'Всё хорошо.' },
  { armenian: 'Այգի', phonetic: 'aygi', translation: 'Сад', example_armenian: 'Գեղեցիկ այգի:', example_translation: 'Красивый сад.' },
  { armenian: 'Աչք', phonetic: 'achq', translation: 'Глаз', example_armenian: 'Կապույտ աչքեր:', example_translation: 'Синие глаза.' },
  { armenian: 'Հոնք', phonetic: 'honq', translation: 'Бровь', example_armenian: 'Սև հոնքեր:', example_translation: 'Чёрные брови.' },
  { armenian: 'Գարուն', phonetic: 'garun', translation: 'Весна', example_armenian: 'Գարունը եկավ:', example_translation: 'Весна пришла.' },
  { armenian: 'Գարնանը', phonetic: 'garnane', translation: 'Весной', example_armenian: 'Գարնանը ծաղիկները բացվում են:', example_translation: 'Весной распускаются цветы.' },
  { armenian: 'Գիշեր', phonetic: 'gisher', translation: 'Ночь', example_armenian: 'Բարի գիշեր:', example_translation: 'Доброй ночи.' },
  { armenian: 'Գրիչ', phonetic: 'grich', translation: 'Ручка', example_armenian: 'Կապույտ գրիչ:', example_translation: 'Синяя ручка.' },

  // Картинка 4: Существительные и люди
  { armenian: 'Կյանք', phonetic: 'kyanq', translation: 'Жизнь', example_armenian: 'Երջանիկ կյանք:', example_translation: 'Счастливая жизнь.' },
  { armenian: 'Մեքենա', phonetic: 'meqena', translation: 'Машина', example_armenian: 'Նոր մեքենա:', example_translation: 'Новая машина.' },
  { armenian: 'Ուսուցիչ', phonetic: 'usutsich', translation: 'Учитель', example_armenian: 'Մեր ուսուցիչը:', example_translation: 'Наш учитель.' },
  { armenian: 'Քույրիկ', phonetic: 'quyrik', translation: 'Сестра, сестрёнка', example_armenian: 'Իմ փոքրիկ քույրիկը:', example_translation: 'Моя маленькая сестричка.' },
  { armenian: 'Դանակ', phonetic: 'danak', translation: 'Нож', example_armenian: 'Սուր դանակ:', example_translation: 'Острый нож.' },
  { armenian: 'Մարդ', phonetic: 'mard', translation: 'Человек', example_armenian: 'Բարի մարդ:', example_translation: 'Добрый человек.' },
  { armenian: 'Մարդիկ', phonetic: 'mardik', translation: 'Люди', example_armenian: 'Շատ մարդիկ կան:', example_translation: 'Здесь много людей.' },
  { armenian: 'Դուռ', phonetic: 'dur (drner)', translation: 'Дверь', example_armenian: 'Դուռը փակիր:', example_translation: 'Закрой дверь.' },
  { armenian: 'Ընտանիք', phonetic: 'entanik', translation: 'Семья', example_armenian: 'Մեծ ու համերաշխ ընտանիք:', example_translation: 'Большая и дружная семья.' },

  // Картинка 5: Предметы, школа и качества
  { armenian: 'Թեյ', phonetic: 'tey', translation: 'Чай', example_armenian: 'Մեկ բաժակ տաք թեյ:', example_translation: 'Один стакан горячего чая.' },
  { armenian: 'Հյութ', phonetic: 'hyut', translation: 'Сок', example_armenian: 'Խնձորի հյութ:', example_translation: 'Яблочный сок.' },
  { armenian: 'Դաս', phonetic: 'das', translation: 'Урок', example_armenian: 'Հայերենի դաս:', example_translation: 'Урок армянского.' },
  { armenian: 'Դասարան', phonetic: 'dasaran', translation: 'Класс', example_armenian: 'Մեր դասարանը մեծ է:', example_translation: 'Наш класс большой.' },
  { armenian: 'Դպրոց', phonetic: 'dprots', translation: 'Школа', example_armenian: 'Գնալ դպրոց:', example_translation: 'Идти в школу.' },
  { armenian: 'Հայրենիք', phonetic: 'hayreniq', translation: 'Родина', example_armenian: 'Մեր հայրենիքը Հայաստանն է:', example_translation: 'Наша родина — Армения.' },
  { armenian: 'Դատարկ', phonetic: 'datark', translation: 'Пустой', example_armenian: 'Դատարկ բաժակ:', example_translation: 'Пустой стакан.' },
  { armenian: 'Տաք', phonetic: 'taq', translation: 'Тёплый, горячий', example_armenian: 'Տաք ջուր:', example_translation: 'Горячая вода.' },
  { armenian: 'Մաքուր', phonetic: 'maqur', translation: 'Чистый', example_armenian: 'Մաքուր օդ:', example_translation: 'Чистый воздух.' },
  { armenian: 'Մի քիչ', phonetic: 'mi qich', translation: 'Немного', example_armenian: 'Մի քիչ սպասիր:', example_translation: 'Немного подожди.' },
];

async function main() {
  console.log(`Starting import of ${lesson6Words.length} words for Lesson 6...`);

  for (const item of lesson6Words) {
    const existing = await pool.query('SELECT id, lesson, is_learned FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}, Lesson ${existing.rows[0].lesson}). Updating...`);
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 6, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 6)`);
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
      COUNT(*) FILTER (WHERE lesson = 6) as lesson_6
    FROM vocabulary;
  `);

  console.log('\n🎉 Lesson 6 setup complete:');
  console.log(`Total words: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 6 words: ${counts.rows[0].lesson_6}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
