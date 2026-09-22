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

// New words to add for the story (Lesson 16 - Дополнение)
// All words are set to is_learned: false so they appear in the 4-step learning wizard ("Учить слова")
const newStoryWords = [
  {
    armenian: 'մոխրագույն',
    phonetic: 'mokhraguyn',
    translation: 'серый',
    example_armenian: 'Երկինքը մոխրագույն է:',
    example_translation: 'Небо серое.'
  },
  {
    armenian: 'երկինք',
    phonetic: 'yerkinq',
    translation: 'небо',
    example_armenian: 'Երկնքում ամպեր կան:',
    example_translation: 'На небе облака.'
  },
  {
    armenian: 'թափվել',
    phonetic: 'tapvel (tapvum e)',
    translation: 'литься, проливаться',
    example_armenian: 'Ջուրը թափվում է փողոցներին:',
    example_translation: 'Вода льётся на улицы.'
  },
  {
    armenian: 'պատուհան',
    phonetic: 'patuhan',
    translation: 'окно',
    example_armenian: 'Միան նստած է պատուհանի մոտ:',
    example_translation: 'Миа сидит у окна.'
  },
  {
    armenian: 'դողալ',
    phonetic: 'doghal (doghum e)',
    translation: 'дрожать',
    example_armenian: 'Նրա ձեռքերը դողում են:',
    example_translation: 'Его руки дрожат.'
  },
  {
    armenian: 'եղանակ',
    phonetic: 'yeghanak',
    translation: 'погода',
    example_armenian: 'Այսօր լավ եղանակ է:',
    example_translation: 'Сегодня хорошая погода.'
  },
  {
    armenian: 'գաղտնի',
    phonetic: 'gaghni',
    translation: 'тайный, секретный',
    example_armenian: 'Սա գաղտնի տեղեկություն է:',
    example_translation: 'Это секретная информация.'
  },
  {
    armenian: 'թաքնված',
    phonetic: 'taqnvats',
    translation: 'спрятанный, скрытый',
    example_armenian: 'Արկղիկի մեջ կա թաքնված գրություն:',
    example_translation: 'В шкатулке есть спрятанная записка.'
  },
  {
    armenian: 'նոութբուք',
    phonetic: 'noutbuq',
    translation: 'ноутбук',
    example_armenian: 'Միան բացում է իր նոութբուքը:',
    example_translation: 'Миа открывает свой ноутбук.'
  },
  {
    armenian: 'ոտնահետք',
    phonetic: 'otnahetq',
    translation: 'след (от ноги)',
    example_armenian: 'Հատակին ոտնահետք կա:',
    example_translation: 'На полу есть след ноги.'
  },
  {
    armenian: 'ոտնաձայն',
    phonetic: 'otnadzayn',
    translation: 'звук шагов, шаги',
    example_armenian: 'Աստիճանների վրա արագ ոտնաձայներ են լսվում:',
    example_translation: 'На лестнице слышны быстрые шаги.'
  },
  {
    armenian: 'անցք',
    phonetic: 'antsq',
    translation: 'отверстие, дыра',
    example_armenian: 'Դռան մեջ փոքր անցք կա:',
    example_translation: 'В двери есть маленькое отверстие.'
  },
  {
    armenian: 'անձրևանոց',
    phonetic: 'andzrevanots',
    translation: 'зонт',
    example_armenian: 'Վերցրու քո անձրևանոցը, անձրև է գալիս:',
    example_translation: 'Возьми свой зонт, идёт дождь.'
  },
  {
    armenian: 'փայլուն',
    phonetic: 'paylun',
    translation: 'блестящий',
    example_armenian: 'Նա փայլուն բանալի գտավ:',
    example_translation: 'Он нашёл блестящий ключ.'
  },
  {
    armenian: 'շագանակագույն',
    phonetic: 'shaganakaguyn',
    translation: 'коричневый',
    example_armenian: 'Շագանակագույն շունը վազում է այգում:',
    example_translation: 'Коричневая собака бегает в парке.'
  },
  {
    armenian: 'արկղիկ',
    phonetic: 'arkghik',
    translation: 'коробочка, шкатулка',
    example_armenian: 'Հին երաժշտական արկղիկ:',
    example_translation: 'Старинная музыкальная шкатулка.'
  },
  {
    armenian: 'մութ',
    phonetic: 'mut',
    translation: 'тёмный, темнота',
    example_armenian: 'Փողոցը մութ էր ու դատարկ:',
    example_translation: 'Улица была тёмной и пустой.'
  },
  {
    armenian: 'հատակ',
    phonetic: 'hatak',
    translation: 'пол',
    example_armenian: 'Խանութի հատակը թաց էր:',
    example_translation: 'Пол магазина был влажным.'
  },
  {
    armenian: 'թուղթ',
    phonetic: 'tught',
    translation: 'бумага, документ, лист',
    example_armenian: 'Հատակին կար մի թուղթ:',
    example_translation: 'На полу была бумага.'
  },
  {
    armenian: 'ինչ-որ',
    phonetic: 'inch-vor',
    translation: 'какой-то, некий',
    example_armenian: 'Ինչ-որ մեկը կոտրել է պատուհանը:',
    example_translation: 'Кто-то разбил окно.'
  },
  {
    armenian: 'կոտրել',
    phonetic: 'kotrel',
    translation: 'ломать, разбить',
    example_armenian: 'Նա կոտրել է ապակին:',
    example_translation: 'Он разбил стекло.'
  },
  {
    armenian: 'կոտրված',
    phonetic: 'kotrvats',
    translation: 'сломанный, разбитый',
    example_armenian: 'Կոտրված պատուհանը վտանգավոր է:',
    example_translation: 'Разбитое окно опасно.'
  },
  {
    armenian: 'կորած',
    phonetic: 'korats',
    translation: 'потерянный, пропавший',
    example_armenian: 'Կորած արկղիկը պետք է գտնել:',
    example_translation: 'Пропавшую шкатулку нужно найти.'
  },
  {
    armenian: 'գտնել',
    phonetic: 'gtnel (gtav)',
    translation: 'находить, найти (нашёл)',
    example_armenian: 'Շունը այգում բանալի գտավ:',
    example_translation: 'Собака нашла ключ в саду.'
  },
  {
    armenian: 'գործ',
    phonetic: 'gorts',
    translation: 'дело, работа, расследование',
    example_armenian: 'Մենք ունենք մեր առաջին գործը:',
    example_translation: 'У нас есть наше первое дело.'
  },
  {
    armenian: 'վերցնել',
    phonetic: 'vercnel',
    translation: 'брать, взять',
    example_armenian: 'Միա, վերցրու քո հեռախոսը:',
    example_translation: 'Миа, возьми свой телефон.'
  },
  {
    armenian: 'լճակ',
    phonetic: 'lchak',
    translation: 'пруд, маленькое озеро',
    example_armenian: 'Այգում կա գեղեցիկ լճակ:',
    example_translation: 'В парке есть красивый пруд.'
  },
  {
    armenian: 'շատրվան',
    phonetic: 'shatrvam',
    translation: 'фонтан',
    example_armenian: 'Երեխաները խաղում են շատրվանի մոտ:',
    example_translation: 'Дети играют у фонтана.'
  },
  {
    armenian: 'հաչել',
    phonetic: 'hachel',
    translation: 'лаять',
    example_armenian: 'Շունը ուրախ հաչում է:',
    example_translation: 'Собака радостно лает.'
  },
  {
    armenian: 'սվիտեր',
    phonetic: 'sviter',
    translation: 'свитер',
    example_armenian: 'Լեոն հագել է տաք սվիտեր:',
    example_translation: 'Лео надел тёплый свитер.'
  }
];

async function run() {
  console.log(`Checking and adding ${newStoryWords.length} words into Lesson 16...`);
  
  const insertedWords = [];

  for (const item of newStoryWords) {
    // Check if word exists (case insensitive match on armenian)
    const existing = await pool.query(
      'SELECT id, armenian, phonetic, translation, lesson, is_learned FROM vocabulary WHERE LOWER(armenian) = LOWER($1)',
      [item.armenian]
    );

    let wordId;
    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`ℹ️ Word "${item.armenian}" already in DB (ID ${wordId}, Lesson ${existing.rows[0].lesson}, is_learned: ${existing.rows[0].is_learned})`);
      insertedWords.push({ ...existing.rows[0], status: 'already_existed' });
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 16, false, 1, 2.5, 0, 0, NOW())
         RETURNING id, armenian, phonetic, translation, lesson, is_learned`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ [NEW] Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 16)`);
      insertedWords.push({ ...res.rows[0], status: 'added' });
    }

    // Generate Liam TTS audio
    try {
      const audioRes = await getOrGenerateAudio(wordId, item.armenian, process.env.ELEVENLABS_VOICE_ID, false);
      const status = audioRes.cached ? '⚡ cached' : '✨ synthesized';
      console.log(`   Audio [ID ${wordId}]: ${audioRes.url} [${status}]`);
    } catch (err) {
      console.error(`   ❌ Audio error for [ID ${wordId}] ${item.armenian}:`, err.message);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  const counts = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_learned = true) as learned,
      COUNT(*) FILTER (WHERE is_learned = false) as to_learn,
      COUNT(*) FILTER (WHERE lesson = 16) as lesson_16
    FROM vocabulary;
  `);

  console.log('\n======================================');
  console.log('🎉 Vocabulary Update Complete:');
  console.log(`Total words in DB: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn (in 'Учить слова'): ${counts.rows[0].to_learn}`);
  console.log(`Lesson 16 words: ${counts.rows[0].lesson_16}`);
  console.log('======================================\n');

  await pool.end();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
