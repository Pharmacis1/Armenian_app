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

const lesson12Words = [
  // Картинка 1: Наречия времени
  { armenian: 'Առայժմ', phonetic: 'arayzhm', translation: 'Пока что', example_armenian: 'Առայժմ այսքանը:', example_translation: 'Пока что на этом всё.' },
  { armenian: 'Առավոտյան', phonetic: 'aravotyan', translation: 'Утром', example_armenian: 'Առավոտյան ես սուրճ եմ խմում:', example_translation: 'Утром я пью кофе.' },
  { armenian: 'Վաղը', phonetic: 'vaghe', translation: 'Завтра', example_armenian: 'Վաղը կհանդիպենք:', example_translation: 'Завтра встретимся.' },
  { armenian: 'Վաղուց', phonetic: 'vaghuts', translation: 'Давно', example_armenian: 'Ես վաղուց չեմ տեսել քեզ:', example_translation: 'Я давно тебя не видел.' },
  { armenian: 'Գիշերը', phonetic: 'gishere', translation: 'Ночью', example_armenian: 'Գիշերը լուսինը փայլում է:', example_translation: 'Ночью светит луна.' },
  { armenian: 'Արդեն', phonetic: 'arden', translation: 'Уже', example_armenian: 'Ես արդեն պատրաստ եմ:', example_translation: 'Я уже готов.' },
  { armenian: 'Նախ', phonetic: 'nakh', translation: 'Сначала, во-первых', example_armenian: 'Նախ պետք է լսել:', example_translation: 'Сначала нужно послушать.' },
  { armenian: 'Երեկոյան', phonetic: 'yerekoyan', translation: 'Вечером', example_armenian: 'Երեկոյան ես տանն եմ:', example_translation: 'Вечером я дома.' },
  { armenian: 'Շուտով', phonetic: 'shutov', translation: 'Скоро', example_armenian: 'Շուտով գարուն կգա:', example_translation: 'Скоро придет весна.' },
  { armenian: 'Վերջապես', phonetic: 'verjapes', translation: 'Наконец', example_armenian: 'Վերջապես դու եկար:', example_translation: 'Наконец-то ты пришел.' },
  { armenian: 'Ցերեկը', phonetic: 'tsereke', translation: 'Днем', example_armenian: 'Ցերեկը շատ տաք է:', example_translation: 'Днем очень тепло.' },

  // Картинка 2: Наречия образа действия и места
  { armenian: 'Հաճախ', phonetic: 'hachakh', translation: 'Часто', example_armenian: 'Ես հաճախ եմ գալիս այստեղ:', example_translation: 'Я часто прихожу сюда.' },
  { armenian: 'Անընդհատ', phonetic: 'anendhat', translation: 'Беспрерывно', example_armenian: 'Անընդհատ անձրև է գալիս:', example_translation: 'Беспрерывно идет дождь.' },
  { armenian: 'Դանդաղ', phonetic: 'dandagh', translation: 'Медленно', example_armenian: 'Դանդաղ քայլել:', example_translation: 'Медленно идти.' },
  { armenian: 'Կամաց', phonetic: 'kamats', translation: 'Тихо, не спеша', example_armenian: 'Կամաց խոսիր:', example_translation: 'Говори тихо.' },
  { armenian: 'Հանկարծ', phonetic: 'hankarts', translation: 'Вдруг', example_armenian: 'Հանկարծ քամի սկսվեց:', example_translation: 'Вдруг начался ветер.' },
  { armenian: 'Միանգամից', phonetic: 'miangamits', translation: 'Сразу', example_armenian: 'Միանգամից հասկացա:', example_translation: 'Сразу понял.' },
  { armenian: 'Սիրով', phonetic: 'sirov', translation: 'С любовью', example_armenian: 'Սիրով պատրաստված:', example_translation: 'Приготовлено с любовью.' },
  { armenian: 'Անկեղծ', phonetic: 'ankeghts', translation: 'Честно, искренне', example_armenian: 'Անկեղծ ասած:', example_translation: 'Честно говоря.' },
  { armenian: 'Վերև', phonetic: 'verev', translation: 'Наверх, вверху', example_armenian: 'Նայիր վերև:', example_translation: 'Посмотри наверх.' },
  { armenian: 'Դեմ դիմաց', phonetic: 'dem dimats', translation: 'Напротив', example_armenian: 'Նստել դեմ դիմաց:', example_translation: 'Сидеть друг напротив друга.' },
  { armenian: 'Տեղ-տեղ', phonetic: 'tegh-tegh', translation: 'Местами', example_armenian: 'Տեղ-տեղ ձյուն կա:', example_translation: 'Местами есть снег.' },
  { armenian: 'Հազվադեպ', phonetic: 'hazvadep', translation: 'Редко', example_armenian: 'Ես հազվադեպ եմ ուշանում:', example_translation: 'Я редко опаздываю.' },
  { armenian: 'Շտապ', phonetic: 'shtap', translation: 'Срочно', example_armenian: 'Շտապ օգնություն:', example_translation: 'Скорая помощь.' },
  { armenian: 'Արագ', phonetic: 'arag', translation: 'Быстро', example_armenian: 'Արագ վազել:', example_translation: 'Быстро бежать.' },
  { armenian: 'Ակամա', phonetic: 'akama', translation: 'Невольно, нехотя', example_armenian: 'Ակամա ժպտացի:', example_translation: 'Невольно улыбнулся.' },
  { armenian: 'Անմիջապես', phonetic: 'anmijapes', translation: 'Сразу, немедленно', example_armenian: 'Անմիջապես զանգիր:', example_translation: 'Сразу позвони.' },
  { armenian: 'Շարունակ', phonetic: 'sharunak', translation: 'Непрерывно, постоянно', example_armenian: 'Շարունակ աշխատել:', example_translation: 'Постоянно работать.' },
  { armenian: 'Հաճույքով', phonetic: 'hachuyqov', translation: 'С удовольствием', example_armenian: 'Մեծ հաճույքով:', example_translation: 'С большим удовольствием.' },
  { armenian: 'Մոտիկ', phonetic: 'motik', translation: 'Близко', example_armenian: 'Մեր տունը մոտիկ է:', example_translation: 'Наш дом близко.' },
  { armenian: 'Ներքև', phonetic: 'nerqev', translation: 'Вниз, внизу', example_armenian: 'Իջիր ներքև:', example_translation: 'Спустись вниз.' },
  { armenian: 'Ամենուր', phonetic: 'amenur', translation: 'Везде, повсюду', example_armenian: 'Ամենուր ծաղիկներ են:', example_translation: 'Повсюду цветы.' },
  { armenian: 'Դուրս', phonetic: 'durs', translation: 'На улицу, наружу', example_armenian: 'Դուրս նայիր:', example_translation: 'Посмотри на улицу.' },
  { armenian: 'Ցած', phonetic: 'tsats', translation: 'Низ, вниз', example_armenian: 'Ցած իջնել:', example_translation: 'Спуститься вниз.' },

  // Картинка 3: Степени, повторения и чувства
  { armenian: 'Շատ', phonetic: 'shat', translation: 'Много, очень', example_armenian: 'Շատ շնորհակալ եմ:', example_translation: 'Большое спасибо.' },
  { armenian: 'Կրկին', phonetic: 'krkin', translation: 'Повторно, снова', example_armenian: 'Կրկին բարև:', example_translation: 'Снова привет.' },
  { armenian: 'Հազիվ', phonetic: 'haziv', translation: 'Еле-еле, едва', example_armenian: 'Հազիվ հասցրի:', example_translation: 'Едва успел.' },
  { armenian: 'Բոլորովին', phonetic: 'bolorovin', translation: 'Абсолютно, совсем', example_armenian: 'Բոլորովին նոր:', example_translation: 'Совершенно новый.' },
  { armenian: 'Չափազանց', phonetic: 'chapazants', translation: 'Слишком, чересчур', example_armenian: 'Չափազանց համեղ:', example_translation: 'Чрезвычайно вкусно.' },
  { armenian: 'Բավականին', phonetic: 'bavakanin', translation: 'Довольно, достаточно', example_armenian: 'Բավականին լավ:', example_translation: 'Довольно хорошо.' },
  { armenian: 'Քիչ', phonetic: 'qich', translation: 'Мало', example_armenian: 'Շատ թե քիչ:', example_translation: 'Много или мало.' },
  { armenian: 'Նորից', phonetic: 'norits', translation: 'Снова, заново', example_armenian: 'Նորից ասա, խնդրեմ:', example_translation: 'Скажи снова, пожалуйста.' },
  { armenian: 'Համարյա', phonetic: 'hamarya', translation: 'Почти, примерно', example_armenian: 'Համարյա պատրաստ է:', example_translation: 'Почти готово.' },
  { armenian: 'Մեկ-մեկ', phonetic: 'mek-mek', translation: 'Иногда, порой', example_armenian: 'Մեկ-մեկ մտածում եմ:', example_translation: 'Иногда я думаю.' },
  { armenian: 'Երբեք', phonetic: 'erbeq', translation: 'Никогда', example_armenian: 'Երբեք մի հանձնվիր:', example_translation: 'Никогда не сдавайся.' },
  { armenian: 'Սրտանց', phonetic: 'srtants', translation: 'От души, сердечно', example_armenian: 'Սրտանց շնորհավորում եմ:', example_translation: 'От души поздравляю.' },
];

async function main() {
  console.log(`Starting import of ${lesson12Words.length} words for Lesson 12...`);

  for (const item of lesson12Words) {
    const existing = await pool.query('SELECT id, lesson, is_learned FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}, Lesson ${existing.rows[0].lesson}). Updating...`);
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 12, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 12)`);
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
      COUNT(*) FILTER (WHERE lesson = 12) as lesson_12
    FROM vocabulary;
  `);

  console.log('\n🎉 Lesson 12 Complete:');
  console.log(`Total words in DB: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 12 total words: ${counts.rows[0].lesson_12}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
