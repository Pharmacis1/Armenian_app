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
  // Качества и состояния
  { armenian: 'Ընտիր', phonetic: 'yntir', translation: 'Отборный, качественный', example_armenian: 'Ընտիր խաղող:', example_translation: 'Отборный виноград.' },
  { armenian: 'Մենակ', phonetic: 'menak', translation: 'Один, без кого-либо', example_armenian: 'Ես մենակ եմ տանը:', example_translation: 'Я один дома.' },
  { armenian: 'Միասին', phonetic: 'miasin', translation: 'Вместе', example_armenian: 'Եկեք միասին գնանք:', example_translation: 'Пойдёмте вместе.' },
  { armenian: 'Սպիտակ', phonetic: 'spitak', translation: 'Белый', example_armenian: 'Սպիտակ ձյուն:', example_translation: 'Белый снег.' },
  { armenian: 'Նոր', phonetic: 'nor', translation: 'Новый', example_armenian: 'Շնորհավոր Նոր Տարի:', example_translation: 'С Новым Годом!' },
  { armenian: 'Էլեկտրական', phonetic: 'elektrakan', translation: 'Электрический', example_armenian: 'Էլեկտրական լամպ:', example_translation: 'Электрическая лампа.' },
  { armenian: 'Եկ', phonetic: 'yek', translation: 'Иди, приходи', example_armenian: 'Եկ ինձ մոտ:', example_translation: 'Приходи ко мне.' },

  // Глаголы бытия и действия
  { armenian: 'Կա', phonetic: 'ka', translation: 'Есть, имеется', example_armenian: 'Այստեղ ջուր կա՞:', example_translation: 'Здесь есть вода?' },
  { armenian: 'Կան', phonetic: 'kan', translation: 'Есть (мн. число)', example_armenian: 'Սեղանին գրքեր կան:', example_translation: 'На столе есть книги.' },
  { armenian: 'Կար', phonetic: 'kar', translation: 'Был, имелся', example_armenian: 'Երեկ շատ մարդ կար:', example_translation: 'Вчера было много людей.' },
  { armenian: 'Տանել', phonetic: 'tanel (tar)', translation: 'Отнести (отнеси: տար)', example_armenian: 'Տար այս նամակը:', example_translation: 'Отнеси это письмо.' },
  { armenian: 'Տալ', phonetic: 'tal (tur)', translation: 'Давать (дай: տուր)', example_armenian: 'Տուր ինձ գիրքը, խնդրեմ:', example_translation: 'Дай мне книгу, пожалуйста.' },
  { armenian: 'Ուտել', phonetic: 'utel (ker)', translation: 'Кушать (ешь: կեր)', example_armenian: 'Կեր այս խնձորը:', example_translation: 'Съешь это яблоко.' },

  // Местоимения и частицы
  { armenian: 'Այս', phonetic: 'ays', translation: 'Этот', example_armenian: 'Այս տունը մեծ է:', example_translation: 'Этот дом большой.' },
  { armenian: 'Այն', phonetic: 'ayn', translation: 'Тот', example_armenian: 'Այն տունը փոքր է:', example_translation: 'Тот дом маленький.' },
  { armenian: 'Ես', phonetic: 'yes', translation: 'Я', example_armenian: 'Ես հայերեն եմ սովորում:', example_translation: 'Я учу армянский.' },
  { armenian: 'Մեր', phonetic: 'mer', translation: 'Наш', example_armenian: 'Սա մեր տունն է:', example_translation: 'Это наш дом.' },
  { armenian: 'Էլ', phonetic: 'el', translation: 'Тоже, также, больше', example_armenian: 'Ես էլ եմ գալիս:', example_translation: 'Я тоже иду.' },
  { armenian: 'Էլի', phonetic: 'eli', translation: 'Ещё', example_armenian: 'Էլի ջուր կուզե՞ս:', example_translation: 'Хочешь ещё воды?' },

  // Время и предлоги
  { armenian: 'Այսօր', phonetic: 'aysor', translation: 'Сегодня', example_armenian: 'Այսօր հիանալի եղանակ է:', example_translation: 'Сегодня прекрасная погода.' },
  { armenian: 'Կեսօր', phonetic: 'kesor', translation: 'Полдень', example_armenian: 'Հանդիպենք կեսօրին:', example_translation: 'Встретимся в полдень.' },
  { armenian: 'Երեկ', phonetic: 'yerek', translation: 'Вчера', example_armenian: 'Երեկ ես տանն էի:', example_translation: 'Вчера я был дома.' },
  { armenian: 'Տակ', phonetic: 'tak', translation: 'Под', example_armenian: 'Սեղանի տակ:', example_translation: 'Под столом.' },
  { armenian: 'Մասին', phonetic: 'masin', translation: 'О, об', example_armenian: 'Ինչի՞ մասին ես մտածում:', example_translation: 'О чём ты думаешь?' },
  { armenian: 'Մոտ', phonetic: 'mot', translation: 'Близко, рядом, у', example_armenian: 'Մոտ արի:', example_translation: 'Подойди ближе.' },
  { armenian: 'Որ', phonetic: 'vor', translation: 'Что, чтобы; который', example_armenian: 'Ես գիտեմ, որ դու լավ ես:', example_translation: 'Я знаю, что ты в порядке.' },

  // Страны, языки и профессии
  { armenian: 'Հայ', phonetic: 'hay', translation: 'Армянин', example_armenian: 'Նա հայ է:', example_translation: 'Он армянин.' },
  { armenian: 'Հայերեն', phonetic: 'hayeren', translation: 'Армянский язык, по-армянски', example_armenian: 'Ես խոսում եմ հայերեն:', example_translation: 'Я говорю по-армянски.' },
  { armenian: 'Հայաստան', phonetic: 'Hayastan', translation: 'Армения', example_armenian: 'Հայաստանը գեղեցիկ երկիր է:', example_translation: 'Армения — красивая страна.' },
  { armenian: 'Ռուս', phonetic: 'rus', translation: 'Русский', example_armenian: 'Ռուս գրող:', example_translation: 'Русский писатель.' },
  { armenian: 'Ռուսերեն', phonetic: 'ruseren', translation: 'Русский язык, по-русски', example_armenian: 'Նա հասկանում է ռուսերեն:', example_translation: 'Он понимает по-русски.' },
  { armenian: 'Ռուսաստան', phonetic: 'Rusastan', translation: 'Россия', example_armenian: 'Ռուսաստանը մեծ երկիր է:', example_translation: 'Россия — большая страна.' },
  { armenian: 'Հայրիկ', phonetic: 'hayrik', translation: 'Папа', example_armenian: 'Իմ հայրիկը աշխատում է:', example_translation: 'Мой папа работает.' },
  { armenian: 'Պարոն', phonetic: 'paron', translation: 'Господин', example_armenian: 'Բարև ձեզ, պարոն Սարգսյան:', example_translation: 'Здравствуйте, господин Саргсян.' },
  { armenian: 'Վարպետ', phonetic: 'varpet', translation: 'Мастер', example_armenian: 'Նա իր գործի վարպետն է:', example_translation: 'Он мастер своего дела.' },
  { armenian: 'Ոստիկան', phonetic: 'vostikan', translation: 'Полицейский', example_armenian: 'Ոստիկանը օգնեց մեզ:', example_translation: 'Полицейский помог нам.' },
  { armenian: 'Վարսավիր', phonetic: 'varsavir', translation: 'Парикмахер', example_armenian: 'Լավ վարսավիր:', example_translation: 'Хороший парикмахер.' },
];

async function main() {
  console.log(`Adding ${newWords.length} new words and synthesizing audio...`);

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
  console.log(`\n🎉 Done! Total vocabulary words: ${total.rows[0].count}`);
  await pool.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
