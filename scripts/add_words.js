require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'armenian_app',
});

const newWords = [
  // Из скриншотов пользователя
  ['Նկար', 'nkar', 'Картина', 1],
  ['Սանր', 'sanr', 'Расчёска', 1],
  ['Նամակ', 'namak', 'Письмо', 1],
  ['Օր', 'or', 'День', 1],
  ['Ոski', 'voski', 'Золото', 1],
  // Семья
  ['Մայր', 'mayr', 'Мама', 1],
  ['Հայր', 'hayr', 'Папа', 1],
  ['Քույր', 'kuyr', 'Сестра', 1],
  ['Եghbayr', 'yeghbayr', 'Брат', 1],
  ['Տուն', 'tun', 'Дом', 1],
  // Числа
  ['Մეկ', 'mek', 'Один', 1],
  ['Երկու', 'yerku', 'Два', 1],
  ['Երeq', 'yerek', 'Три', 1],
  // Цвета
  ['Կարmir', 'karmir', 'Красный', 1],
  ['Սev', 'sev', 'Чёрный', 1],
  // Животные / предметы
  ['Girq', 'girk', 'Книга', 1],
  ['Katu', 'katu', 'Кошка', 1],
  ['Shun', 'shun', 'Собака', 1],
  // Еда
  ['Միrg', 'mirg', 'Фрукт', 1],
  ['Kat', 'kat', 'Молоко', 1],
];

async function main() {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to DB.');

    let added = 0;
    for (const [armenian, phonetic, translation, level] of newWords) {
      // Skip duplicates by phonetic
      const exists = await pool.query('SELECT id FROM vocabulary WHERE phonetic = $1', [phonetic]);
      if (exists.rowCount > 0) {
        console.log(`⏭️  Skipping "${phonetic}" (already exists)`);
        continue;
      }
      await pool.query(
        'INSERT INTO vocabulary (armenian, phonetic, translation, level) VALUES ($1, $2, $3, $4)',
        [armenian, phonetic, translation, level]
      );
      console.log(`✅ Added: ${armenian} [${phonetic}] — ${translation}`);
      added++;
    }
    console.log(`\n🎉 Done! Added ${added} new words.`);

    const total = await pool.query('SELECT COUNT(*) FROM vocabulary');
    console.log(`📚 Total words in vocabulary: ${total.rows[0].count}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
  await pool.end();
}

main();
