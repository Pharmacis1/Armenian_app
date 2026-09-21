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

const newWords = [
  // Image 1
  {
    armenian: 'Նման',
    phonetic: 'nman',
    translation: 'Похож',
    example_armenian: 'Նա շատ նման է իր մորը:',
    example_translation: 'Он очень похож на свою маму.',
  },
  // Image 2
  {
    armenian: 'Մայրիկ',
    phonetic: 'mayrik',
    translation: 'Мама',
    example_armenian: 'Իմ սիրելի մայրիկը:',
    example_translation: 'Моя любимая мама.',
  },
  {
    armenian: 'Տատիկ',
    phonetic: 'tatik',
    translation: 'Бабушка',
    example_armenian: 'Տատիկը համեղ կարկանդակ է թխում:',
    example_translation: 'Бабушка печёт вкусный пирог.',
  },
  {
    armenian: 'Պապիկ',
    phonetic: 'papik',
    translation: 'Дедушка',
    example_armenian: 'Պապիկը թերթ է կարդում:',
    example_translation: 'Дедушка читает газету.',
  },
  {
    armenian: 'Ընկեր',
    phonetic: 'ynker',
    translation: 'Друг, приятель',
    example_armenian: 'Նա իմ լավագույն ընկերն է:',
    example_translation: 'Он мой лучший друг.',
  },
  {
    armenian: 'Պատ',
    phonetic: 'pat',
    translation: 'Стена',
    example_armenian: 'Սպիտակ պատ:',
    example_translation: 'Белая стена.',
  },
  {
    armenian: 'Լուր',
    phonetic: 'lur',
    translation: 'Весть, новость',
    example_armenian: 'Լավ լուր ունեմ ձեզ համար:',
    example_translation: 'У меня для вас хорошая весть.',
  },
  // Image 3
  {
    armenian: 'Լուռ',
    phonetic: 'lur',
    translation: 'Молча, тихо',
    example_armenian: 'Նա լուռ նստած էր:',
    example_translation: 'Он сидел молча.',
  },
  {
    armenian: 'Լույս',
    phonetic: 'luys',
    translation: 'Свет',
    example_armenian: 'Սենյակում պայծառ լույս կա:',
    example_translation: 'В комнате яркий свет.',
  },
  {
    armenian: 'Լուսանկար',
    phonetic: 'lusankar',
    translation: 'Фотография',
    example_armenian: 'Հին ընտանեկան լուսանկար:',
    example_translation: 'Старая семейная фотография.',
  },
  {
    armenian: 'Սենյակ',
    phonetic: 'senyak',
    translation: 'Комната',
    example_armenian: 'Մեծ ու լուսավոր սենյակ:',
    example_translation: 'Большая и светлая комната.',
  },
  {
    armenian: 'Ատամ',
    phonetic: 'atam',
    translation: 'Зуб',
    example_armenian: 'Սպիտակ ատամներ:',
    example_translation: 'Белые зубы.',
  },
  {
    armenian: 'Երես',
    phonetic: 'yeres',
    translation: 'Лицо',
    example_armenian: 'Ժպտացող երես:',
    example_translation: 'Улыбающееся лицо.',
  },
  {
    armenian: 'Մատ',
    phonetic: 'mat',
    translation: 'Палец',
    example_armenian: 'Ձեռքի մատ:',
    example_translation: 'Палец руки.',
  },
  // Image 4
  {
    armenian: 'Մատանի',
    phonetic: 'matani',
    translation: 'Кольцо',
    example_armenian: 'Ոսկե մատանի:',
    example_translation: 'Золотое кольцо.',
  },
  {
    armenian: 'Մատիտ',
    phonetic: 'matit',
    translation: 'Карандаш',
    example_armenian: 'Գունավոր մատիտներ:',
    example_translation: 'Цветные карандаши.',
  },
  {
    armenian: 'Աման',
    phonetic: 'aman',
    translation: 'Тарелка, посуда',
    example_armenian: 'Մաքուր ամաններ:',
    example_translation: 'Чистая посуда.',
  },
  {
    armenian: 'Պանիր',
    phonetic: 'panir',
    translation: 'Сыр',
    example_armenian: 'Հայկական պանիր:',
    example_translation: 'Армянский сыр.',
  },
  {
    armenian: 'Միս',
    phonetic: 'mis',
    translation: 'Мясо',
    example_armenian: 'Թարմ միս:',
    example_translation: 'Свежее мясо.',
  },
  {
    armenian: 'Ապուր',
    phonetic: 'apur',
    translation: 'Суп',
    example_armenian: 'Տաք ապուր:',
    example_translation: 'Горячий суп.',
  },
  {
    armenian: 'Մկրատ',
    phonetic: 'mkrat',
    translation: 'Ножницы',
    example_armenian: 'Սուր մկրատ:',
    example_translation: 'Острые ножницы.',
  },
  // Image 5
  {
    armenian: 'Պայուսակ',
    phonetic: 'payusak',
    translation: 'Сумка',
    example_armenian: 'Կաշվե պայուսակ:',
    example_translation: 'Кожаная сумка.',
  },
  {
    armenian: 'Տարի',
    phonetic: 'tari',
    translation: 'Год',
    example_armenian: 'Նոր տարի:',
    example_translation: 'Новый год.',
  },
  {
    armenian: 'Սեր',
    phonetic: 'ser',
    translation: 'Любовь',
    example_armenian: 'Մեծ սեր:',
    example_translation: 'Большая любовь.',
  },
  {
    armenian: 'Որոտ',
    phonetic: 'vorot',
    translation: 'Гром',
    example_armenian: 'Ուժեղ որոտ և կայծակ:',
    example_translation: 'Сильный гром и молния.',
  },
  {
    armenian: 'Էակ',
    phonetic: 'eak',
    translation: 'Существо, создание',
    example_armenian: 'Կենդանի էակ:',
    example_translation: 'Живое существо.',
  },
  {
    armenian: 'Էական',
    phonetic: 'eakan',
    translation: 'Существенный',
    example_armenian: 'Էական տարբերություն:',
    example_translation: 'Существенная разница.',
  },
  {
    armenian: 'Անէական',
    phonetic: 'aneakan',
    translation: 'Несущественный',
    example_armenian: 'Դա անէական հարց է:',
    example_translation: 'Это несущественный вопрос.',
  },
];

async function main() {
  console.log(`Adding ${newWords.length} words to database and synthesizing speech...`);

  for (const item of newWords) {
    const exists = await pool.query('SELECT id FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;
    if (exists.rowCount > 0) {
      wordId = exists.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}). Updating details...`);
      await pool.query(
        `UPDATE vocabulary 
         SET phonetic = $1, translation = $2, example_armenian = $3, example_translation = $4 
         WHERE id = $5`,
        [item.phonetic, item.translation, item.example_armenian, item.example_translation, wordId]
      );
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId})`);
    }

    // Generate Liam + Eleven v3 audio
    try {
      const audioRes = await getOrGenerateAudio(wordId, item.armenian, process.env.ELEVENLABS_VOICE_ID, false);
      const status = audioRes.cached ? '⚡ cached' : '✨ synthesized';
      console.log(`   [${wordId}] Audio: ${audioRes.url} [${status}]`);
    } catch (err) {
      console.error(`   ❌ Audio failed for [${wordId}] ${item.armenian}:`, err.message);
    }
    await new Promise(r => setTimeout(r, 350));
  }

  const total = await pool.query('SELECT COUNT(*) FROM vocabulary');
  console.log(`\n🎉 Done! Total vocabulary words in DB: ${total.rows[0].count}`);
  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
