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

const lesson15Words = [
  // Картинка 1: Союзы и связки
  { armenian: 'Ու', phonetic: 'u', translation: 'И', example_armenian: 'Ես ու դու:', example_translation: 'Я и ты.' },
  { armenian: 'Եվ', phonetic: 'yev', translation: 'И', example_armenian: 'Արև և լուսին:', example_translation: 'Солнце и луна.' },
  { armenian: 'Բայց', phonetic: 'bayts', translation: 'Но', example_armenian: 'Ուզում եմ, բայց չեմ կարող:', example_translation: 'Хочу, но не могу.' },
  { armenian: 'Նաև', phonetic: 'nayev', translation: 'Также', example_armenian: 'Նաև սա է պետք:', example_translation: 'Также это нужно.' },
  { armenian: 'Իսկ', phonetic: 'isk', translation: 'А', example_armenian: 'Իսկ դո՞ւ ինչ ես անում:', example_translation: 'А ты что делаешь?' },
  { armenian: 'Թեև', phonetic: 'teev', translation: 'Хотя', example_armenian: 'Թեև դժվար է, բայց հնարավոր է:', example_translation: 'Хотя трудно, но возможно.' },
  { armenian: 'Քան', phonetic: 'qan', translation: 'Чем', example_armenian: 'Ավելի լավ, քան երեկ:', example_translation: 'Лучше, чем вчера.' },
  { armenian: 'Թե', phonetic: 'te', translation: 'Что, или', example_armenian: 'Թեյ, թե՞ սուրճ:', example_translation: 'Чай или кофе?' },
  { armenian: 'Ոչ միայն', phonetic: 'voch miayn', translation: 'Не только', example_armenian: 'Ոչ միայն այսօր, այլև վաղը:', example_translation: 'Не только сегодня, но и завтра.' },

  { armenian: 'Ուրեմն', phonetic: 'uremn', translation: 'Значит', example_armenian: 'Ուրեմն՝ պայմանավորվեցինք:', example_translation: 'Значит, договорились.' },
  { armenian: 'Սակայն', phonetic: 'sakayn', translation: 'Однако', example_armenian: 'Սակայն ոչինչ չստացվեց:', example_translation: 'Однако ничего не получилось.' },
  { armenian: 'Այլև', phonetic: 'aylev', translation: 'Но и', example_armenian: 'Ոչ միայն նա, այլև մենք:', example_translation: 'Не только он, но и мы.' },
  { armenian: 'Երբ', phonetic: 'yerb', translation: 'Когда', example_armenian: 'Երբ կգաս:', example_translation: 'Когда ты придешь?' },
  { armenian: 'Կամ', phonetic: 'kam', translation: 'Или', example_armenian: 'Այո կամ ոչ:', example_translation: 'Да или нет.' },
  { armenian: 'Մինչև', phonetic: 'minchev', translation: 'Пока, до', example_armenian: 'Մինչև վաղը:', example_translation: 'До завтра.' },
  { armenian: 'Քանի որ', phonetic: 'qani vor', translation: 'Так как', example_armenian: 'Քանի որ ուշ է, գնանք:', example_translation: 'Так как поздно, пойдем.' },
  { armenian: 'Չնայած', phonetic: 'chnayats', translation: 'Несмотря на, хотя', example_armenian: 'Չնայած անձրևին, մենք գնացինք:', example_translation: 'Несмотря на дождь, мы пошли.' },
  { armenian: 'Այնինչ', phonetic: 'ayninch', translation: 'Тогда как', example_armenian: 'Այնինչ ամեն ինչ պարզ էր:', example_translation: 'Тогда как всё было ясно.' },

  { armenian: 'Այլ', phonetic: 'ayl', translation: 'Но, а', example_armenian: 'Ոչ թե ես, այլ դու:', example_translation: 'Не я, а ты.' },
  { armenian: 'Ապա', phonetic: 'apa', translation: 'Затем, следовательно', example_armenian: 'Եթե այո, ապա լավ:', example_translation: 'Если да, тогда хорошо.' },
  { armenian: 'Այսինքն', phonetic: 'aysinqn', translation: 'То есть', example_armenian: 'Այսինքն՝ ամեն ինչ կարգին է:', example_translation: 'То есть всё в порядке.' },
  { armenian: 'Եթե', phonetic: 'yete', translation: 'Если', example_armenian: 'Եթե ուզում ես, արի:', example_translation: 'Если хочешь, приходи.' },
  { armenian: 'Այլապես', phonetic: 'aylapes', translation: 'Иначе, а то', example_armenian: 'Շտապիր, այլապես կուշանաս:', example_translation: 'Поторопись, иначе опоздаешь.' },
  { armenian: 'Մինչդեռ', phonetic: 'minchder', translation: 'Между тем как', example_armenian: 'Մինչդեռ նա սպասում էր:', example_translation: 'Между тем как он ждал.' },
  { armenian: 'Որպեսզի', phonetic: 'vorpeszi', translation: 'Чтобы', example_armenian: 'Որպեսզի հասկանաս:', example_translation: 'Чтобы ты понял.' },
  { armenian: 'Նույնիսկ', phonetic: 'nuynisk', translation: 'Даже', example_armenian: 'Նույնիսկ նա գիտի:', example_translation: 'Даже он знает.' },
  { armenian: 'Անգամ', phonetic: 'angam', translation: 'Даже', example_armenian: 'Անգամ նա չհասկացավ:', example_translation: 'Даже он не понял.' },

  // Картинка 2: Модальные и вводные слова
  { armenian: 'Իհարկե', phonetic: 'iharke', translation: 'Конечно', example_armenian: 'Իհարկե, կօգնեմ քեզ:', example_translation: 'Конечно, помогу тебе.' },
  { armenian: 'Հազիվ թե', phonetic: 'haziv te', translation: 'Вряд ли', example_armenian: 'Հազիվ թե հասցնենք:', example_translation: 'Вряд ли успеем.' },
  { armenian: 'Ի դեպ', phonetic: 'i dep', translation: 'Кстати', example_armenian: 'Ի դեպ, ես տեսա նրան:', example_translation: 'Кстати, я видел его.' },
  { armenian: 'Իրոք', phonetic: 'iroq', translation: 'На самом деле', example_armenian: 'Իրոք շատ լավ է:', example_translation: 'На самом деле очень хорошо.' },
  { armenian: 'Իսկապես', phonetic: 'iskapes', translation: 'Действительно', example_armenian: 'Իսկապես հրաշալի օր է:', example_translation: 'Действительно чудесный день.' },
  { armenian: 'Ափսոս', phonetic: 'apsos', translation: 'Жаль', example_armenian: 'Շատ ափսոս, որ չեկար:', example_translation: 'Очень жаль, что ты не пришел.' },
  { armenian: 'Անկասկած', phonetic: 'ankaskats', translation: 'Несомненно', example_armenian: 'Անկասկած, դու ճիշտ ես:', example_translation: 'Несомненно, ты прав.' },
  { armenian: 'Այնուամենայնիվ', phonetic: 'aynuamenayniv', translation: 'Тем не менее', example_armenian: 'Այնուամենայնիվ, նա եկավ:', example_translation: 'Тем не менее, он пришел.' },

  { armenian: 'Հավանաբար', phonetic: 'havanabar', translation: 'Наверное', example_armenian: 'Հավանաբար վաղը կգա:', example_translation: 'Наверное, завтра придет.' },
  { armenian: 'Իմիջիայլոց', phonetic: 'imijiaylots', translation: 'Между прочим', example_armenian: 'Իմիջիայլոց, նա էլ գիտի:', example_translation: 'Между прочим, он тоже знает.' },
  { armenian: 'Անպայման', phonetic: 'anpayman', translation: 'Обязательно, безусловно', example_armenian: 'Անպայման զանգիր ինձ:', example_translation: 'Обязательно позвони мне.' },
  { armenian: 'Հաստատ', phonetic: 'hastat', translation: 'Точно', example_armenian: 'Հաստատ գիտեմ:', example_translation: 'Точно знаю.' },
  { armenian: 'Ցավոք', phonetic: 'tsavoq', translation: 'К сожалению', example_armenian: 'Ցավոք, չեմ կարող:', example_translation: 'К сожалению, не могу.' },
  { armenian: 'Երանի', phonetic: 'yerani', translation: 'Хоть бы', example_armenian: 'Երանի թե գարուն լիներ:', example_translation: 'Вот бы была весна.' },
  { armenian: 'Համենայն դեպս', phonetic: 'hamenayn deps', translation: 'Во всяком случае', example_armenian: 'Համենայն դեպս զգույշ եղիր:', example_translation: 'Во всяком случае будь осторожен.' },
  { armenian: 'Ինչ էլ լինի', phonetic: 'inch el lini', translation: 'Что бы ни было', example_armenian: 'Ինչ էլ լինի, ես կգամ:', example_translation: 'Что бы ни было, я приду.' },
];

async function main() {
  console.log(`Starting import of ${lesson15Words.length} words for Lesson 15...`);

  for (const item of lesson15Words) {
    const existing = await pool.query('SELECT id, lesson, is_learned FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}, Lesson ${existing.rows[0].lesson}). Skipping insertion...`);
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 15, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 15)`);
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
      COUNT(*) FILTER (WHERE lesson = 15) as lesson_15
    FROM vocabulary;
  `);

  console.log('\n🎉 Lesson 15 Complete:');
  console.log(`Total words in DB: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 15 total words: ${counts.rows[0].lesson_15}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
