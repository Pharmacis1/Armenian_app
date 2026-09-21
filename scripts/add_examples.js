require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'armenian_app',
});

// Examples for all 34 words
const examples = {
  1: { ex_arm: 'Բարև, ինչպե՞ս ես:', ex_tr: 'Привет, как твои дела?' },
  2: { ex_arm: 'Շատ շնորհակալություն օգնության համար:', ex_tr: 'Большое спасибо за помощь!' },
  3: { ex_arm: 'Խնդրեմ, համեցեք:', ex_tr: 'Пожалуйста, проходите.' },
  4: { ex_arm: 'Այո, ես համաձայն եմ:', ex_tr: 'Да, я согласен.' },
  5: { ex_arm: 'Ոչ, շնորհակալություն:', ex_tr: 'Нет, спасибо.' },
  6: { ex_arm: 'Բարև, ինչպե՞ս ես այսօր:', ex_tr: 'Привет, как дела сегодня?' },
  7: { ex_arm: 'Ամեն ինչ շատ լավ է:', ex_tr: 'Всё очень хорошо!' },
  8: { ex_arm: 'Ցտեսություն, մինչ վաղը:', ex_tr: 'До свидания, до завтра!' },
  9: { ex_arm: 'Սառը ջուր խմել:', ex_tr: 'Пить холодную воду.' },
  10: { ex_arm: 'Թարմ հաց ու պանիր:', ex_tr: 'Свежий хлеб и сыр.' },
  11: { ex_arm: 'Պատին գեղեցիկ նկար կա:', ex_tr: 'На стене висит красивая картина.' },
  12: { ex_arm: 'Որտե՞ղ է իմ սանրը:', ex_tr: 'Где моя расчёска?' },
  13: { ex_arm: 'Ես երկար նամակ գրեցի:', ex_tr: 'Я написал длинное письмо.' },
  14: { ex_arm: 'Այսօր հիանալի օր է:', ex_tr: 'Сегодня прекрасный день.' },
  15: { ex_arm: 'Ոսկի մատանի:', ex_tr: 'Золотое кольцо.' },
  16: { ex_arm: 'Ի՞նչ է քո անունը:', ex_tr: 'Как твоё имя?' },
  17: { ex_arm: 'Իմ կինը բժիշկ է:', ex_tr: 'Моя жена — врач.' },
  18: { ex_arm: 'Իմ ամուսինը աշխատում է:', ex_tr: 'Мой муж работает.' },
  19: { ex_arm: 'Խնդրում եմ, ասա ինձ:', ex_tr: 'Пожалуйста, скажи мне.' },
  20: { ex_arm: 'Իմ մայրը շատ բարի է:', ex_tr: 'Моя мама очень добрая.' },
  21: { ex_arm: 'Հայրս տանն է:', ex_tr: 'Мой папа дома.' },
  22: { ex_arm: 'Իմ քույրը ուսանող է:', ex_tr: 'Моя сестра — студентка.' },
  23: { ex_arm: 'Եղբայրս ֆուտբոլ է խաղում:', ex_tr: 'Мой брат играет в футбол.' },
  24: { ex_arm: 'Մենք գնում ենք տուն:', ex_tr: 'Мы идём домой.' },
  25: { ex_arm: 'Մեկ բաժակ սուրճ, խնդրեմ:', ex_tr: 'Один стаканчик кофе, пожалуйста.' },
  26: { ex_arm: 'Երկու տոմս, խնդրեմ:', ex_tr: 'Два билета, пожалуйста.' },
  27: { ex_arm: 'Երեք օր հետո:', ex_tr: 'Через три дня.' },
  28: { ex_arm: 'Կարմիր խնձոր:', ex_tr: 'Красное яблоко.' },
  29: { ex_arm: 'Սև սուրճ առանց շաքարի:', ex_tr: 'Чёрный кофе без сахара.' },
  30: { ex_arm: 'Ես նոր գիրք եմ կարդում:', ex_tr: 'Я читаю новую книгу.' },
  31: { ex_arm: 'Սպիտակ կատուն քնած է:', ex_tr: 'Белая кошка спит.' },
  32: { ex_arm: 'Հավատարիմ շուն:', ex_tr: 'Верная собака.' },
  33: { ex_arm: 'Համեղ միրգ:', ex_tr: 'Вкусный фрукт.' },
  34: { ex_arm: 'Տաք կաթ մեղրով:', ex_tr: 'Горячее молоко с мёдом.' },
};

async function main() {
  console.log('Adding example columns to vocabulary table...');
  await pool.query(`
    ALTER TABLE vocabulary 
    ADD COLUMN IF NOT EXISTS example_armenian TEXT,
    ADD COLUMN IF NOT EXISTS example_translation TEXT;
  `);

  console.log('Updating words with examples...');
  for (const [id, data] of Object.entries(examples)) {
    await pool.query(
      `UPDATE vocabulary 
       SET example_armenian = $1, example_translation = $2 
       WHERE id = $3`,
      [data.ex_arm, data.ex_tr, parseInt(id, 10)]
    );
  }

  console.log('✅ Added examples for all 34 words successfully!');
  await pool.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
