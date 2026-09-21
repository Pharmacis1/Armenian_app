require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'armenian_app',
});

// Full clean vocabulary for Level A0-A1
const vocabularyList = [
  // Базовые приветствия и фразы
  { armenian: 'Բարև', phonetic: 'barev', translation: 'Здравствуйте / Привет' },
  { armenian: 'Շնորհակալություն', phonetic: 'shnorhakalutyun', translation: 'Спасибо' },
  { armenian: 'Խնդրեմ', phonetic: 'khndrem', translation: 'Пожалуйста' },
  { armenian: 'Այո', phonetic: 'ayo', translation: 'Да' },
  { armenian: 'Ոչ', phonetic: 'voch', translation: 'Нет' },
  { armenian: 'Ինչպե՞ս ես', phonetic: 'inchpes es', translation: 'Как дела?' },
  { armenian: 'Լավ', phonetic: 'lav', translation: 'Хорошо' },
  { armenian: 'Ցտեսություն', phonetic: 'tstesutyun', translation: 'До свидания' },
  { armenian: 'Ջուր', phonetic: 'jur', translation: 'Вода' },
  { armenian: 'Հաց', phonetic: 'hats', translation: 'Хлеб' },

  // Из карточек курса (партия 1)
  { armenian: 'Նկար', phonetic: 'nkar', translation: 'Картина' },
  { armenian: 'Սանր', phonetic: 'sanr', translation: 'Расчёска' },
  { armenian: 'Նամակ', phonetic: 'namak', translation: 'Письмо' },
  { armenian: 'Օր', phonetic: 'or', translation: 'День' },
  { armenian: 'Ոսկի', phonetic: 'voski', translation: 'Золото' },

  // Из карточек курса (партия 2)
  { armenian: 'Անուն', phonetic: 'anun', translation: 'Имя' },
  { armenian: 'Կին', phonetic: 'kin', translation: 'Жена / женщина' },
  { armenian: 'Ամուսին', phonetic: 'amusin', translation: 'Муж' },
  { armenian: 'Ասա', phonetic: 'asa', translation: 'Скажи' },

  // Семья
  { armenian: 'Մայր', phonetic: 'mayr', translation: 'Мама' },
  { armenian: 'Հայր', phonetic: 'hayr', translation: 'Папа' },
  { armenian: 'Քույր', phonetic: 'kuyr', translation: 'Сестра' },
  { armenian: 'Եղբայր', phonetic: 'yeghbayr', translation: 'Брат' },
  { armenian: 'Տուն', phonetic: 'tun', translation: 'Дом' },

  // Числа
  { armenian: 'Մեկ', phonetic: 'mek', translation: 'Один' },
  { armenian: 'Երկու', phonetic: 'yerku', translation: 'Два' },
  { armenian: 'Երեք', phonetic: 'yerek', translation: 'Три' },

  // Цвета
  { armenian: 'Կարմիր', phonetic: 'karmir', translation: 'Красный' },
  { armenian: 'Սև', phonetic: 'sev', translation: 'Чёрный' },

  // Предметы и животные
  { armenian: 'Գիրք', phonetic: 'girk', translation: 'Книга' },
  { armenian: 'Կատու', phonetic: 'katu', translation: 'Кошка' },
  { armenian: 'Շուն', phonetic: 'shun', translation: 'Собака' },
  { armenian: 'Միրգ', phonetic: 'mirg', translation: 'Фрукт' },
  { armenian: 'Կաթ', phonetic: 'kat', translation: 'Молоко' },
];

async function sync() {
  console.log('🔄 Syncing vocabulary in PostgreSQL...');
  
  // Truncate and re-seed cleanly to ensure exact IDs and correct Armenian letters
  await pool.query('TRUNCATE TABLE vocabulary RESTART IDENTITY');

  for (const item of vocabularyList) {
    await pool.query(
      `INSERT INTO vocabulary (armenian, phonetic, translation, level, ease_factor, interval_days, repetitions, next_review)
       VALUES ($1, $2, $3, 1, 2.5, 0, 0, NOW())`,
      [item.armenian, item.phonetic, item.translation]
    );
    console.log(`✅ [${item.armenian}] [${item.phonetic}] — ${item.translation}`);
  }

  const count = await pool.query('SELECT COUNT(*) FROM vocabulary');
  console.log(`\n🎉 Vocabulary synced! Total words: ${count.rows[0].count}`);
  await pool.end();
}

sync().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
