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

const practicalA1Words = [
  // 1. Дни недели
  { armenian: 'Երկուշաբթի', phonetic: 'yerkushabti', translation: 'Понедельник', example_armenian: 'Երկուշաբթի կհանդիպենք:', example_translation: 'Встретимся в понедельник.' },
  { armenian: 'Երեքշաբթի', phonetic: 'yereqshabti', translation: 'Вторник', example_armenian: 'Երեքշաբթի ես ազատ եմ:', example_translation: 'Во вторник я свободен.' },
  { armenian: 'Չորեքշաբթի', phonetic: 'choreqshabti', translation: 'Среда', example_armenian: 'Չորեքշաբթի դաս ունեմ:', example_translation: 'В среду у меня урок.' },
  { armenian: 'Հինգշաբթի', phonetic: 'hingshabti', translation: 'Четверг', example_armenian: 'Հինգշաբթի օրը:', example_translation: 'В четверг.' },
  { armenian: 'Ուրբաթ', phonetic: 'urbat', translation: 'Пятница', example_armenian: 'Ուրբաթ երեկոյան:', example_translation: 'В пятницу вечером.' },
  { armenian: 'Շաբաթ', phonetic: 'shabat', translation: 'Суббота, неделя', example_armenian: 'Շաբաթ օրը հանգստանում ենք:', example_translation: 'В субботу мы отдыхаем.' },
  { armenian: 'Կիրակի', phonetic: 'kiraki', translation: 'Воскресенье', example_armenian: 'Կիրակի լավ օր է:', example_translation: 'Воскресенье — хороший день.' },

  // 2. Главные глаголы общения и действия
  { armenian: 'Խոսել', phonetic: 'khosel', translation: 'Говорить', example_armenian: 'Ես մի քիչ հայերեն եմ խոսում:', example_translation: 'Я немного говорю по-армянски.' },
  { armenian: 'Իմանալ', phonetic: 'imanal', translation: 'Знать, узнавать', example_armenian: 'Ես չգիտեմ, պետք է իմանալ:', example_translation: 'Я не знаю, нужно узнать.' },
  { armenian: 'Անել', phonetic: 'anel', translation: 'Делать', example_armenian: 'Ի՞նչ ես անում:', example_translation: 'Что ты делаешь?' },
  { armenian: 'Տեսնել', phonetic: 'tesnel', translation: 'Видеть', example_armenian: 'Ես տեսնում եմ քեզ:', example_translation: 'Я вижу тебя.' },
  { armenian: 'Խմել', phonetic: 'khmel', translation: 'Пить', example_armenian: 'Ջուր կամ սուրճ խմել:', example_translation: 'Пить воду или кофе.' },
  { armenian: 'Աշխատել', phonetic: 'ashkhatel', translation: 'Работать', example_armenian: 'Ես ամեն օր աշխատում եմ:', example_translation: 'Я работаю каждый день.' },
  { armenian: 'Կարողանալ', phonetic: 'karoghanal', translation: 'Мочь, уметь', example_armenian: 'Ես կարող եմ օգնել:', example_translation: 'Я могу помочь.' },
  { armenian: 'Գնել', phonetic: 'gnel', translation: 'Покупать', example_armenian: 'Ուզում եմ հաց գնել:', example_translation: 'Хочу купить хлеб.' },
  { armenian: 'Վճարել', phonetic: 'vcharel', translation: 'Платить', example_armenian: 'Որտե՞ղ կարող եմ վճարել:', example_translation: 'Где я могу заплатить?' },
  { armenian: 'Հարցնել', phonetic: 'hartsnel', translation: 'Спрашивать', example_armenian: 'Կարո՞ղ եմ մի բան հարցնել:', example_translation: 'Могу я кое-что спросить?' },

  // 3. Город, покупки, ориентирование и транспорт
  { armenian: 'Խանութ', phonetic: 'khanut', translation: 'Магазин', example_armenian: 'Գնում եմ խանութ:', example_translation: 'Иду в магазин.' },
  { armenian: 'Դեղատուն', phonetic: 'deghatun', translation: 'Аптека', example_armenian: 'Մոտակա դեղատունը որտե՞ղ է:', example_translation: 'Где ближайшая аптека?' },
  { armenian: 'Փողոց', phonetic: 'poghots', translation: 'Улица', example_armenian: 'Այս փողոցում շատ ծառեր կան:', example_translation: 'На этой улице много деревьев.' },
  { armenian: 'Դրամ', phonetic: 'dram', translation: 'Деньги, драм', example_armenian: 'Կանխիկ դրամ:', example_translation: 'Наличные деньги.' },
  { armenian: 'Արժե', phonetic: 'arzhe', translation: 'Стоит (цена)', example_armenian: 'Ի՞նչ արժե սա:', example_translation: 'Сколько это стоит?' },
  { armenian: 'Հաշիվ', phonetic: 'hashiv', translation: 'Счёт (в кафе)', example_armenian: 'Հաշիվը, խնդրեմ:', example_translation: 'Счёт, пожалуйста.' },
  { armenian: 'Ուղիղ', phonetic: 'ughigh', translation: 'Прямо', example_armenian: 'Գնացեք ուղիղ:', example_translation: 'Идите прямо.' },
  { armenian: 'Ձախ', phonetic: 'dzakh', translation: 'Левый, налево', example_armenian: 'Թեքվեք ձախ:', example_translation: 'Поверните налево.' },
  { armenian: 'Կանգառ', phonetic: 'kangar', translation: 'Остановка', example_armenian: 'Ավտոբուսի կանգառ:', example_translation: 'Автобусная остановка.' },
  { armenian: 'Ավտոբուս', phonetic: 'avtobus', translation: 'Автобус', example_armenian: 'Ավտոբուսը շուտով կգա:', example_translation: 'Автобус скоро приедет.' },

  // 4. Цвета
  { armenian: 'Կապույտ', phonetic: 'kapuyt', translation: 'Синий, голубой', example_armenian: 'Կապույտ երկինք:', example_translation: 'Синее небо.' },
  { armenian: 'Կանաչ', phonetic: 'kanach', translation: 'Зелёный', example_armenian: 'Կանաչ թեյ:', example_translation: 'Зелёный чай.' },
  { armenian: 'Դեղին', phonetic: 'deghin', translation: 'Жёлтый', example_armenian: 'Դեղին տերևներ:', example_translation: 'Жёлтые листья.' },

  // 5. Быт, кафе и предметы вокруг
  { armenian: 'Սեղան', phonetic: 'seghan', translation: 'Стол', example_armenian: 'Նստել սեղանի շուրջ:', example_translation: 'Сесть за стол.' },
  { armenian: 'Աթոռ', phonetic: 'ator', translation: 'Стул', example_armenian: 'Ազատ աթոռ:', example_translation: 'Свободный стул.' },
  { armenian: 'Հեռախոս', phonetic: 'herakhos', translation: 'Телефон', example_armenian: 'Իմ հեռախոսը:', example_translation: 'Мой телефон.' },
  { armenian: 'Բանալի', phonetic: 'banali', translation: 'Ключ', example_armenian: 'Տան բանալին:', example_translation: 'Ключ от дома.' },
  { armenian: 'Համեղ', phonetic: 'hamegh', translation: 'Вкусный, вкусно', example_armenian: 'Շատ համեղ է:', example_translation: 'Очень вкусно.' },
  { armenian: 'Շաքար', phonetic: 'shaqar', translation: 'Сахар', example_armenian: 'Սուրճ՝ առանց շաքարի:', example_translation: 'Кофе без сахара.' },
  { armenian: 'Աղ', phonetic: 'agh', translation: 'Соль', example_armenian: 'Մի քիչ աղ:', example_translation: 'Немного соли.' },
];

async function main() {
  console.log(`Starting import of ${practicalA1Words.length} words for Practical A1 (Lesson 16)...`);

  for (const item of practicalA1Words) {
    const existing = await pool.query('SELECT id, lesson, is_learned FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}, Lesson ${existing.rows[0].lesson}). Skipping insertion...`);
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 16, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 16)`);
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
      COUNT(*) FILTER (WHERE lesson = 16) as lesson_16
    FROM vocabulary;
  `);

  console.log('\n🎉 Practical A1 (Lesson 16) Complete:');
  console.log(`Total words in DB: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 16 total words: ${counts.rows[0].lesson_16}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
