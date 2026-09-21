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

const lesson7Words = [
  // Картинка 1: Слова на букву Ձ [dz] и Ծ [ts]
  { armenian: 'Աստված', phonetic: 'astvats', translation: 'Бог', example_armenian: 'Փառք Աստծո:', example_translation: 'Слава Богу.' },
  { armenian: 'Ձու', phonetic: 'dzu', translation: 'Яйцо', example_armenian: 'Եփած ձու:', example_translation: 'Вареное яйцо.' },
  { armenian: 'Ձուկ', phonetic: 'dzuk', translation: 'Рыба', example_armenian: 'Թարմ ձուկ:', example_translation: 'Свежая рыба.' },
  { armenian: 'Ձայն', phonetic: 'dzayn', translation: 'Голос, звук', example_armenian: 'Գեղեցիկ ձայն:', example_translation: 'Красивый голос.' },
  { armenian: 'Ձեռք', phonetic: 'dzerq', translation: 'Рука', example_armenian: 'Լվա ձեռքերդ:', example_translation: 'Помой руки.' },
  { armenian: 'Ձի', phonetic: 'dzi', translation: 'Лошадь, конь', example_armenian: 'Սպիտակ ձի:', example_translation: 'Белая лошадь.' },
  { armenian: 'Ձմեռ', phonetic: 'dzmer', translation: 'Зима', example_armenian: 'Ցուրտ ձմեռ:', example_translation: 'Холодная зима.' },
  { armenian: 'Ձմռանը', phonetic: 'dzmrane', translation: 'Зимой', example_armenian: 'Ձմռանը ձյուն է գալիս:', example_translation: 'Зимой идет снег.' },
  { armenian: 'Ձյուն', phonetic: 'dzyun', translation: 'Снег', example_armenian: 'Սպիտակ ձյուն:', example_translation: 'Белый снег.' },
  { armenian: 'Ծառ', phonetic: 'tsar', translation: 'Дерево', example_armenian: 'Բարձր ծառ:', example_translation: 'Высокое дерево.' },

  // Картинка 2: Прилагательные, глаголы и предлоги
  { armenian: 'Ծով', phonetic: 'tsov', translation: 'Море', example_armenian: 'Սև ծով:', example_translation: 'Черное море.' },
  { armenian: 'Մեծ', phonetic: 'mets', translation: 'Большой, великий', example_armenian: 'Մեծ տուն:', example_translation: 'Большой дом.' },
  { armenian: 'Խորոված', phonetic: 'khorovats', translation: 'Шашлык, печёный', example_armenian: 'Համով խորոված:', example_translation: 'Вкусный шашлык.' },
  { armenian: 'Բարձր', phonetic: 'bardzr', translation: 'Высокий, громкий', example_armenian: 'Բարձր սար:', example_translation: 'Высокая гора.' },
  { armenian: 'Բարձրանալ', phonetic: 'bardzranal', translation: 'Подниматься', example_armenian: 'Վերև բարձրանալ:', example_translation: 'Подниматься наверх.' },
  { armenian: 'Ցածր', phonetic: 'tsatsr', translation: 'Низкий, невысокий', example_armenian: 'Ցածր գին:', example_translation: 'Низкая цена.' },
  { armenian: 'Իջնել', phonetic: 'izhnel', translation: 'Спускаться, слезать', example_armenian: 'Ներքև իջնել:', example_translation: 'Спускаться вниз.' },
  { armenian: 'Զանգել', phonetic: 'zangel', translation: 'Звонить', example_armenian: 'Զանգիր ինձ:', example_translation: 'Позвони мне.' },
  { armenian: 'Ծնվել', phonetic: 'tsnvel', translation: 'Рождаться, родиться', example_armenian: 'Ես ծնվել եմ Երևանում:', example_translation: 'Я родился в Ереване.' },
  { armenian: 'Մեջ', phonetic: 'mej', translation: 'В, внутри', example_armenian: 'Տան մեջ:', example_translation: 'В доме / Внутри дома.' },

  // Картинка 3: Слова на букву Ճ [ch] и Ջ [j]
  { armenian: 'Աջ', phonetic: 'aj', translation: 'Правый, направо', example_armenian: 'Թեքվիր աջ:', example_translation: 'Поверни направо.' },
  { armenian: 'Առաջ', phonetic: 'araj', translation: 'Прежде, вперед', example_armenian: 'Գնա առաջ:', example_translation: 'Иди вперед.' },
  { armenian: 'Առաջին', phonetic: 'arajin', translation: 'Первый', example_armenian: 'Առաջին դաս:', example_translation: 'Первый урок.' },
  { armenian: 'Ականջ', phonetic: 'akanj', translation: 'Ухо', example_armenian: 'Մեծ ականջներ:', example_translation: 'Большие уши.' },
  { armenian: 'Ճաշ', phonetic: 'chash', translation: 'Обед', example_armenian: 'Համեղ ճաշ:', example_translation: 'Вкусный обед.' },
  { armenian: 'Ճաշել', phonetic: 'chashel', translation: 'Обедать', example_armenian: 'Եկեք ճաշենք:', example_translation: 'Давайте пообедаем.' },
  { armenian: 'Ճանաչել', phonetic: 'chanachel', translation: 'Знать, узнавать', example_armenian: 'Ես ճանաչում եմ նրան:', example_translation: 'Я знаю его.' },
  { armenian: 'Սուրճ', phonetic: 'surch', translation: 'Кофе', example_armenian: 'Մեկ բաժակ սև սուրճ:', example_translation: 'Один стакан/чашка черного кофе.' },
  { armenian: 'Ճիշտ', phonetic: 'chisht', translation: 'Точный, верный, правильный', example_armenian: 'Ճիշտ պատասխան:', example_translation: 'Правильный ответ.' },
  { armenian: 'Մահճակալ', phonetic: 'mahchakal', translation: 'Кровать, койка', example_armenian: 'Հարմարավետ մահճակալ:', example_translation: 'Удобная кровать.' },

  // Картинка 4: Оставшиеся слова (кроме ջուր, которое уже изучено в Уроке 1)
  { armenian: 'Կարճ', phonetic: 'karch', translation: 'Короткий, кратко', example_armenian: 'Կարճ պատմություն:', example_translation: 'Короткая история.' },
  { armenian: 'Ճանապարհ', phonetic: 'chanaparh', translation: 'Дорога, путь', example_armenian: 'Բարի ճանապարհ:', example_translation: 'Счастливого пути.' },
  { armenian: 'Մտածել', phonetic: 'mtatsel', translation: 'Думать, размышлять', example_armenian: 'Ես մտածում եմ քո մասին:', example_translation: 'Я думаю о тебе.' },
  { armenian: 'Ջահ', phonetic: 'jah', translation: 'Люстра, факел', example_armenian: 'Գեղեցիկ ջահ:', example_translation: 'Красивая люстра.' },
  { armenian: 'Վերջ', phonetic: 'verj', translation: 'Конец', example_armenian: 'Վերջ ի վերջո:', example_translation: 'В конце концов.' },
  { armenian: 'Վերջին', phonetic: 'verjin', translation: 'Последний, крайний', example_armenian: 'Վերջին զանգ:', example_translation: 'Последний звонок.' },
  { armenian: 'Վերջանալ', phonetic: 'verjanal', translation: 'Кончаться, заканчиваться', example_armenian: 'Դասը վերջացավ:', example_translation: 'Урок закончился.' },
];

async function main() {
  console.log(`Starting import of ${lesson7Words.length} words for Lesson 7...`);

  for (const item of lesson7Words) {
    const existing = await pool.query('SELECT id, lesson, is_learned FROM vocabulary WHERE armenian = $1', [item.armenian]);
    let wordId;

    if (existing.rowCount > 0) {
      wordId = existing.rows[0].id;
      console.log(`Word "${item.armenian}" already in DB (ID ${wordId}, Lesson ${existing.rows[0].lesson}). Updating...`);
    } else {
      const res = await pool.query(
        `INSERT INTO vocabulary (armenian, phonetic, translation, example_armenian, example_translation, lesson, is_learned, level, ease_factor, interval_days, repetitions, next_review)
         VALUES ($1, $2, $3, $4, $5, 7, false, 1, 2.5, 0, 0, NOW())
         RETURNING id`,
        [item.armenian, item.phonetic, item.translation, item.example_armenian, item.example_translation]
      );
      wordId = res.rows[0].id;
      console.log(`✅ Added "${item.armenian}" [${item.phonetic}] — ${item.translation} (ID ${wordId}, Lesson 7)`);
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
      COUNT(*) FILTER (WHERE lesson = 7) as lesson_7
    FROM vocabulary;
  `);

  console.log('\n🎉 Lesson 7 setup complete:');
  console.log(`Total words: ${counts.rows[0].total}`);
  console.log(`Learned (in Review SRS): ${counts.rows[0].learned}`);
  console.log(`To learn in Learn Words: ${counts.rows[0].to_learn}`);
  console.log(`Lesson 7 words: ${counts.rows[0].lesson_7}`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
