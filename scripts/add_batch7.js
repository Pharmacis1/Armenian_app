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
  // Существительные (Image 1)
  { armenian: 'Զինվոր', phonetic: 'zinvor', translation: 'Солдат', example_armenian: 'Խիզախ զինվոր:', example_translation: 'Храбрый солдат.' },
  { armenian: 'Համ', phonetic: 'ham', translation: 'Вкус', example_armenian: 'Շատ լավ համ ունի:', example_translation: 'Очень хороший вкус.' },
  { armenian: 'Հոտ', phonetic: 'hot', translation: 'Запах', example_armenian: 'Ծաղիկների անուշ հոտ:', example_translation: 'Приятный запах цветов.' },
  { armenian: 'Տոն', phonetic: 'ton', translation: 'Праздник', example_armenian: 'Շնորհավոր տոնդ:', example_translation: 'С праздником тебя!' },
  { armenian: 'Տառ', phonetic: 'tar', translation: 'Буква', example_armenian: 'Հայերեն այբուբենի տառերը:', example_translation: 'Буквы армянского алфавита.' },
  { armenian: 'Շոր', phonetic: 'shor', translation: 'Одежда, платье', example_armenian: 'Գեղեցիկ շոր:', example_translation: 'Красивое платье.' },
  { armenian: 'Վերարկու', phonetic: 'verarku', translation: 'Пальто', example_armenian: 'Տաք վերարկու:', example_translation: 'Тёплое пальто.' },
  { armenian: 'Վերելակ', phonetic: 'verelak', translation: 'Лифт', example_armenian: 'Վերելակով բարձրանալ:', example_translation: 'Подниматься на лифте.' },
  { armenian: 'Նվեր', phonetic: 'nver', translation: 'Подарок', example_armenian: 'Շնորհակալություն նվերի համար:', example_translation: 'Спасибо за подарок!' },
  { armenian: 'Մազեր', phonetic: 'mazer', translation: 'Волосы', example_armenian: 'Երկար մազեր:', example_translation: 'Длинные волосы.' },
  { armenian: 'Րոպե', phonetic: 'rope', translation: 'Минута', example_armenian: 'Մեկ րոպե սպասեք, խնդրեմ:', example_translation: 'Подождите одну минуту, пожалуйста.' },
  { armenian: 'Շուկա', phonetic: 'shuka', translation: 'Рынок', example_armenian: 'Գնալ շուկա:', example_translation: 'Пойти на рынок.' },

  // Прилагательные и наречия времени (Image 2)
  { armenian: 'Վատ', phonetic: 'vat', translation: 'Плохо, плохой', example_armenian: 'Վատ լուր:', example_translation: 'Плохая весть.' },
  { armenian: 'Հարմար', phonetic: 'harmar', translation: 'Удобный', example_armenian: 'Շատ հարմար աթոռ:', example_translation: 'Очень удобный стул.' },
  { armenian: 'Անուշ', phonetic: 'anush', translation: 'Сладкий, приятный', example_armenian: 'Անուշ լինի:', example_translation: 'Приятного аппетита! (На здоровье)' },
  { armenian: 'Աշուն', phonetic: 'ashun', translation: 'Осень', example_armenian: 'Ոսկե աշուն:', example_translation: 'Золотая осень.' },
  { armenian: 'Աշնանը', phonetic: 'ashnany', translation: 'Осенью', example_armenian: 'Աշնանը տերևները թափվում են:', example_translation: 'Осенью опадают листья.' },
  { armenian: 'Ամառ', phonetic: 'amar', translation: 'Лето', example_armenian: 'Շոգ ամառ:', example_translation: 'Жаркое лето.' },
  { armenian: 'Ամռանը', phonetic: 'amrany', translation: 'Летом', example_armenian: 'Ամռանը մենք գնում ենք Սևան:', example_translation: 'Летом мы едем на Севан.' },
  { armenian: 'Ուշ', phonetic: 'ush', translation: 'Поздно', example_armenian: 'Արդեն ուշ է:', example_translation: 'Уже поздно.' },
  { armenian: 'Ուշ-ուշ', phonetic: 'ush-ush', translation: 'Редко', example_armenian: 'Մենք ուշ-ուշ ենք հանդիպում:', example_translation: 'Мы редко встречаемся.' },
  { armenian: 'Շուտ', phonetic: 'shut', translation: 'Быстро, рано', example_armenian: 'Շուտ արի տուն:', example_translation: 'Приходи поскорее домой.' },

  // Наречия и выражения (Image 3)
  { armenian: 'Շուտ-շուտ', phonetic: 'shut-shut', translation: 'Часто', example_armenian: 'Շուտ-շուտ զանգիր ինձ:', example_translation: 'Звони мне почаще.' },
  { armenian: 'Հին', phonetic: 'hin', translation: 'Старый, древний', example_armenian: 'Հին քաղաք:', example_translation: 'Древний город.' },
  { armenian: 'Հիմա', phonetic: 'hima', translation: 'Сейчас, теперь', example_armenian: 'Հիմա ես զբաղված եմ:', example_translation: 'Сейчас я занят.' },
  { armenian: 'Հետո', phonetic: 'heto', translation: 'Потом, затем, дальше', example_armenian: 'Հետո կխոսենք:', example_translation: 'Потом поговорим.' },
  { armenian: 'Հեռու', phonetic: 'heru', translation: 'Далеко, далёкий', example_armenian: 'Տունը հեռու չէ:', example_translation: 'Дом недалеко.' },
  { armenian: 'Միշտ', phonetic: 'misht', translation: 'Всегда', example_armenian: 'Ես միշտ քեզ հետ եմ:', example_translation: 'Я всегда с тобой.' },
  { armenian: 'Մյուս', phonetic: 'myus', translation: 'Следующий', example_armenian: 'Մյուս շաբաթ:', example_translation: 'На следующей неделе.' },
  { armenian: 'Ուրիշ', phonetic: 'urish', translation: 'Другой, иной', example_armenian: 'Ուրիշ հարց ունե՞ք:', example_translation: 'У вас есть другой вопрос?' },
  { armenian: 'Պարզ', phonetic: 'parz', translation: 'Ясный, простой', example_armenian: 'Պարզ երկինք:', example_translation: 'Ясное небо.' },
  { armenian: 'Իզուր', phonetic: 'izur', translation: 'Зря', example_armenian: 'Իզուր մի՛ անհանգստացիր:', example_translation: 'Зря не беспокойся.' },
  { armenian: 'Շնորհակալ եմ', phonetic: 'shnorhakal em', translation: 'Благодарю', example_armenian: 'Շատ շնորհակալ եմ ձեզ:', example_translation: 'Я очень благодарен вам.' },
  { armenian: 'Սովորել', phonetic: 'sovorel', translation: 'Учиться', example_armenian: 'Ես սովորում եմ հայերեն խոսել:', example_translation: 'Я учусь говорить по-армянски.' },

  // Глаголы 1 (Image 4)
  { armenian: 'Նվիրել', phonetic: 'nvirel', translation: 'Дарить', example_armenian: 'Ծաղիկներ նվիրել:', example_translation: 'Дарить цветы.' },
  { armenian: 'Հանել', phonetic: 'hanel', translation: 'Снимать, доставать', example_armenian: 'Վերարկուն հանել:', example_translation: 'Снять пальто.' },
  { armenian: 'Հասկանալ', phonetic: 'haskanal', translation: 'Понимать, понять', example_armenian: 'Ես հասկանում եմ ձեզ:', example_translation: 'Я понимаю вас.' },
  { armenian: 'Հաշվել', phonetic: 'hashvel', translation: 'Считать', example_armenian: 'Հաշվել մեկից տասը:', example_translation: 'Считать от одного до десяти.' },
  { armenian: 'Հիշել', phonetic: 'hishel', translation: 'Помнить, вспомнить', example_armenian: 'Ես հիշում եմ այդ օրը:', example_translation: 'Я помню тот день.' },
  { armenian: 'Հասնել', phonetic: 'hasnel', translation: 'Дойти, достигать', example_armenian: 'Հասնել տուն:', example_translation: 'Добраться до дома.' },
  { armenian: 'Հրավիրել', phonetic: 'hravirel', translation: 'Пригласить, приглашать', example_armenian: 'Հյուր հրավիրել:', example_translation: 'Пригласить гостей.' },
  { armenian: 'Շտապել', phonetic: 'shtapel', translation: 'Спешить, торопиться', example_armenian: 'Ես շտապում եմ:', example_translation: 'Я тороплюсь.' },
  { armenian: 'Ուշանալ', phonetic: 'ushanal', translation: 'Опоздать, задержаться', example_armenian: 'Մի՛ ուշացիր դասից:', example_translation: 'Не опаздывай на урок.' },
  { armenian: 'Շարունակել', phonetic: 'sharunakel', translation: 'Продолжать', example_armenian: 'Շարունակեք կարդալ:', example_translation: 'Продолжайте читать.' },
  { armenian: 'Շնորհավորել', phonetic: 'shnorhavorel', translation: 'Поздравлять', example_armenian: 'Շնորհավորում եմ ծննդյանդ օրը:', example_translation: 'Поздравляю с днем рождения!' },
  { armenian: 'Պահել', phonetic: 'pahel', translation: 'Беречь, хранить', example_armenian: 'Գաղտնիք պահել:', example_translation: 'Хранить секрет.' },

  // Глаголы 2 (Image 5)
  { armenian: 'Կարոտել', phonetic: 'karotel', translation: 'Скучать, тосковать', example_armenian: 'Ես քեզ շատ եմ կարոտել:', example_translation: 'Я по тебе очень соскучился.' },
  { armenian: 'Մոռանալ', phonetic: 'moranal', translation: 'Забыть, забывать', example_armenian: 'Երբեք չեմ մոռանա:', example_translation: 'Никогда не забуду.' },
  { armenian: 'Ստանալ', phonetic: 'stanal', translation: 'Получить, получать', example_armenian: 'Նամակ ստանալ:', example_translation: 'Получить письмо.' },
  { armenian: 'Պառկել', phonetic: 'parkel', translation: 'Лежать, ложиться', example_armenian: 'Պառկել հանգստանալու:', example_translation: 'Прилечь отдохнуть.' },
  { armenian: 'Ուզել', phonetic: 'uzel', translation: 'Хотеть, захотеть', example_armenian: 'Ես ուզում եմ ջուր խմել:', example_translation: 'Я хочу выпить воды.' },
  { armenian: 'Կրկնել', phonetic: 'krknel', translation: 'Повторить, повторять', example_armenian: 'Կրկնեք ինձ հետևից:', example_translation: 'Повторите за мной.' },
  { armenian: 'Երազել', phonetic: 'erazel', translation: 'Мечтать, размечтаться', example_armenian: 'Երազել ապագայի մասին:', example_translation: 'Мечтать о будущем.' },
];

async function main() {
  console.log(`Starting insertion of ${newWords.length} words and generating audio...`);

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
