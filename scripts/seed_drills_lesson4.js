require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'armenian_app',
});

const cards = [
  // =================================================================
  // УПРАЖНЕНИЕ 1: ПОВЕЛИТЕЛЬНОЕ НАКЛОНЕНИЕ (КОМАНДЫ) - 10 КАРТОЧЕК
  // =================================================================
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու կարդում ես:',
    prompt_phonetic: 'Du kardum es',
    prompt_translation: 'Ты читаешь',
    target_armenian: 'Կարդա՛:',
    target_phonetic: 'Karda!',
    target_translation: 'Читай!',
    options: [
      { key: 'A', text: 'Կարդա՛:' },
      { key: 'B', text: 'Կարդացեք:' },
      { key: 'C', text: 'Կարդում ես:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու գրում ես:',
    prompt_phonetic: 'Du grum es',
    prompt_translation: 'Ты пишешь',
    target_armenian: 'Գրի՛ր:',
    target_phonetic: 'Grir!',
    target_translation: 'Пиши!',
    options: [
      { key: 'A', text: 'Գրում ես:' },
      { key: 'B', text: 'Գրի՛ր:' },
      { key: 'C', text: 'Գրեք:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու լսում ես:',
    prompt_phonetic: 'Du lsum es',
    prompt_translation: 'Ты слушаешь',
    target_armenian: 'Լսի՛ր:',
    target_phonetic: 'Lsir!',
    target_translation: 'Слушай!',
    options: [
      { key: 'A', text: 'Լսի՛ր:' },
      { key: 'B', text: 'Լսում ես:' },
      { key: 'C', text: 'Լսեք:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու նայում ես:',
    prompt_phonetic: 'Du nayum es',
    prompt_translation: 'Ты смотришь',
    target_armenian: 'Նայի՛ր:',
    target_phonetic: 'Nayir!',
    target_translation: 'Смотри!',
    options: [
      { key: 'A', text: 'Նայեք:' },
      { key: 'B', text: 'Նայում ես:' },
      { key: 'C', text: 'Նայի՛ր:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու նստում ես:',
    prompt_phonetic: 'Du nstum es',
    prompt_translation: 'Ты садишься',
    target_armenian: 'Նստի՛ր:',
    target_phonetic: 'Nstir!',
    target_translation: 'Садись!',
    options: [
      { key: 'A', text: 'Նստի՛ր:' },
      { key: 'B', text: 'Նստում ես:' },
      { key: 'C', text: 'Նստեք:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու պատմում ես:',
    prompt_phonetic: 'Du patmum es',
    prompt_translation: 'Ты рассказываешь',
    target_armenian: 'Պատմի՛ր:',
    target_phonetic: 'Patmir!',
    target_translation: 'Рассказывай!',
    options: [
      { key: 'A', text: 'Պատմում ես:' },
      { key: 'B', text: 'Պատմի՛ր:' },
      { key: 'C', text: 'Պատմեք:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու սպասում ես:',
    prompt_phonetic: 'Du spasum es',
    prompt_translation: 'Ты ждешь',
    target_armenian: 'Սպասի՛ր:',
    target_phonetic: 'Spasir!',
    target_translation: 'Жди!',
    options: [
      { key: 'A', text: 'Սպասում ես:' },
      { key: 'B', text: 'Սպասեք:' },
      { key: 'C', text: 'Սպասի՛ր:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու ապրում ես:',
    prompt_phonetic: 'Du aprum es',
    prompt_translation: 'Ты живешь',
    target_armenian: 'Ապրի՛ր:',
    target_phonetic: 'Aprir!',
    target_translation: 'Живи!',
    options: [
      { key: 'A', text: 'Ապրի՛ր:' },
      { key: 'B', text: 'Ապրում ես:' },
      { key: 'C', text: 'Ապրեք:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու մնում ես:',
    prompt_phonetic: 'Du mnum es',
    prompt_translation: 'Ты остаешься',
    target_armenian: 'Մնա՛:',
    target_phonetic: 'Mna!',
    target_translation: 'Оставайся!',
    options: [
      { key: 'A', text: 'Մնում ես:' },
      { key: 'B', text: 'Մնա՛:' },
      { key: 'C', text: 'Մնացեք:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'imperative_command',
    category_title: 'Повелительное наклонение',
    tag: 'COMMAND',
    prompt_armenian: 'Դու ժպտում ես:',
    prompt_phonetic: 'Du zhptum es',
    prompt_translation: 'Ты улыбаешься',
    target_armenian: 'Ժպտա՛:',
    target_phonetic: 'Zhpta!',
    target_translation: 'Улыбайся!',
    options: [
      { key: 'A', text: 'Ժպտացեք:' },
      { key: 'B', text: 'Ժպտում ես:' },
      { key: 'C', text: 'Ժպտա՛:' }
    ],
    correct_option: 'C'
  },

  // =================================================================
  // УПРАЖНЕНИЕ 2: ОТРИЦАТЕЛЬНАЯ ЧАСТИЦА (10 КАРТОЧЕК)
  // =================================================================
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Ես ապրում եմ:',
    prompt_phonetic: 'Yes aprum em',
    prompt_translation: 'Я живу',
    target_armenian: 'Ես չեմ ապրում:',
    target_phonetic: 'Yes chem aprum',
    target_translation: 'Я не живу',
    options: [
      { key: 'A', text: 'Ես չեմ ապրում:' },
      { key: 'B', text: 'Ես ապրում չեմ:' },
      { key: 'C', text: 'Ես չի ապրում:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Նա աշխատում է:',
    prompt_phonetic: 'Na ashxatum e',
    prompt_translation: 'Он работает',
    target_armenian: 'Նա չի աշխատում:',
    target_phonetic: 'Na chi ashxatum',
    target_translation: 'Он не работает',
    options: [
      { key: 'A', text: 'Նա չեմ աշխատում:' },
      { key: 'B', text: 'Նա չի աշխատում:' },
      { key: 'C', text: 'Նա աշխատում չէ:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Դու գրում ես:',
    prompt_phonetic: 'Du grum es',
    prompt_translation: 'Ты пишешь',
    target_armenian: 'Դու չես գրում:',
    target_phonetic: 'Du ches grum',
    target_translation: 'Ты не пишешь',
    options: [
      { key: 'A', text: 'Դու չի գրում:' },
      { key: 'B', text: 'Դու գրում չես:' },
      { key: 'C', text: 'Դու չես գրում:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Մենք սպասում ենք:',
    prompt_phonetic: 'Menq spasum enk',
    prompt_translation: 'Мы ждем',
    target_armenian: 'Մենք չենք սպասում:',
    target_phonetic: 'Menq chenq spasum',
    target_translation: 'Мы не ждем',
    options: [
      { key: 'A', text: 'Մենք չենք սպասում:' },
      { key: 'B', text: 'Մենք չեք սպասում:' },
      { key: 'C', text: 'Մենք սպասում չենք:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Դուք նստում եք:',
    prompt_phonetic: 'Duq nstum eq',
    prompt_translation: 'Вы садитесь',
    target_armenian: 'Դուք չեք նստում:',
    target_phonetic: 'Duq cheq nstum',
    target_translation: 'Вы не садитесь',
    options: [
      { key: 'A', text: 'Դուք չենք նստում:' },
      { key: 'B', text: 'Դուք չեք նստում:' },
      { key: 'C', text: 'Դուք նստում չեք:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Նրանք կարդում են:',
    prompt_phonetic: 'Nranq kardum en',
    prompt_translation: 'Они читают',
    target_armenian: 'Նրանք չեն կարդում:',
    target_phonetic: 'Nranq chen kardum',
    target_translation: 'Они не читают',
    options: [
      { key: 'A', text: 'Նրանք չի կարդում:' },
      { key: 'B', text: 'Նրանք կարդում չեն:' },
      { key: 'C', text: 'Նրանք չեն կարդում:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Ես սիրում եմ:',
    prompt_phonetic: 'Yes sirum em',
    prompt_translation: 'Я люблю',
    target_armenian: 'Ես չեմ սիրում:',
    target_phonetic: 'Yes chem sirum',
    target_translation: 'Я не люблю',
    options: [
      { key: 'A', text: 'Ես չեմ սիրում:' },
      { key: 'B', text: 'Ես չես սիրում:' },
      { key: 'C', text: 'Ես չի սիրում:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Նա լսում է:',
    prompt_phonetic: 'Na lsum e',
    prompt_translation: 'Он слушает',
    target_armenian: 'Նա չի լսում:',
    target_phonetic: 'Na chi lsum',
    target_translation: 'Он не слушает',
    options: [
      { key: 'A', text: 'Նա չեմ լսում:' },
      { key: 'B', text: 'Նա չի լսում:' },
      { key: 'C', text: 'Նա չես լսում:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Մենք զրուցում ենք:',
    prompt_phonetic: 'Menq zrutsum enk',
    prompt_translation: 'Мы беседуем',
    target_armenian: 'Մենք չենք զրուցում:',
    target_phonetic: 'Menq chenq zrutsum',
    target_translation: 'Мы не беседуем',
    options: [
      { key: 'A', text: 'Մենք չեք զրուցում:' },
      { key: 'B', text: 'Մենք զրուցում չենք:' },
      { key: 'C', text: 'Մենք չենք զրուցում:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'negative_particle',
    category_title: 'Отрицание',
    tag: 'NEGATIVE',
    prompt_armenian: 'Դու պատրաստում ես:',
    prompt_phonetic: 'Du patrastum es',
    prompt_translation: 'Ты готовишь',
    target_armenian: 'Դու չես պատրաստում:',
    target_phonetic: 'Du ches patrastum',
    target_translation: 'Ты не готовишь',
    options: [
      { key: 'A', text: 'Դու չես պատրաստում:' },
      { key: 'B', text: 'Դու չի պատրաստում:' },
      { key: 'C', text: 'Դու պատրաստում չես:' }
    ],
    correct_option: 'A'
  },

  // =================================================================
  // УПРАЖНЕНИЕ 3: СПРЯЖЕНИЕ ГЛАГОЛОВ / СДЕЛАЙ МНОЖЕСТВЕННЫМ - 10 КАРТОЧЕК
  // =================================================================
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Ես գնում եմ:',
    prompt_phonetic: 'Yes gnum em',
    prompt_translation: 'Я иду',
    target_armenian: 'Մենք գնում ենք:',
    target_phonetic: 'Menq gnum enk',
    target_translation: 'Мы идем',
    options: [
      { key: 'A', text: 'Մենք գնում ենք:' },
      { key: 'B', text: 'Դուք գնում եք:' },
      { key: 'C', text: 'Նրանք գնում են:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Դու նստում ես:',
    prompt_phonetic: 'Du nstum es',
    prompt_translation: 'Ты садишься',
    target_armenian: 'Դուք նստում եք:',
    target_phonetic: 'Duq nstum eq',
    target_translation: 'Вы садитесь',
    options: [
      { key: 'A', text: 'Մենք նստում ենք:' },
      { key: 'B', text: 'Դուք նստում եք:' },
      { key: 'C', text: 'Նրանք նստում են:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Նա կարդում է:',
    prompt_phonetic: 'Na kardum e',
    prompt_translation: 'Он читает',
    target_armenian: 'Նրանք կարդում են:',
    target_phonetic: 'Nranq kardum en',
    target_translation: 'Они читают',
    options: [
      { key: 'A', text: 'Մենք կարդում ենք:' },
      { key: 'B', text: 'Դուք կարդում եք:' },
      { key: 'C', text: 'Նրանք կարդում են:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Ես աշխատում եմ:',
    prompt_phonetic: 'Yes ashxatum em',
    prompt_translation: 'Я работаю',
    target_armenian: 'Մենք աշխատում ենք:',
    target_phonetic: 'Menq ashxatum enk',
    target_translation: 'Мы работаем',
    options: [
      { key: 'A', text: 'Մենք աշխատում ենք:' },
      { key: 'B', text: 'Մենք աշխատում եք:' },
      { key: 'C', text: 'Նրանք աշխատում են:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Դու գրում ես:',
    prompt_phonetic: 'Du grum es',
    prompt_translation: 'Ты пишешь',
    target_armenian: 'Դուք գրում եք:',
    target_phonetic: 'Duq grum eq',
    target_translation: 'Вы пишете',
    options: [
      { key: 'A', text: 'Մենք գրում ենք:' },
      { key: 'B', text: 'Դուք գրում եք:' },
      { key: 'C', text: 'Դուք գրում են:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Նա ապրում է:',
    prompt_phonetic: 'Na aprum e',
    prompt_translation: 'Он живет',
    target_armenian: 'Նրանք ապրում են:',
    target_phonetic: 'Nranq aprum en',
    target_translation: 'Они живут',
    options: [
      { key: 'A', text: 'Մենք ապրում ենք:' },
      { key: 'B', text: 'Դուք ապրում եք:' },
      { key: 'C', text: 'Նրանք ապրում են:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Ես լսում եմ:',
    prompt_phonetic: 'Yes lsum em',
    prompt_translation: 'Я слушаю',
    target_armenian: 'Մենք լսում ենք:',
    target_phonetic: 'Menq lsum enk',
    target_translation: 'Мы слушаем',
    options: [
      { key: 'A', text: 'Մենք լսում ենք:' },
      { key: 'B', text: 'Մենք լսում է:' },
      { key: 'C', text: 'Նրանք լսում են:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Դու սպասում ես:',
    prompt_phonetic: 'Du spasum es',
    prompt_translation: 'Ты ждешь',
    target_armenian: 'Դուք սպասում եք:',
    target_phonetic: 'Duq spasum eq',
    target_translation: 'Вы ждете',
    options: [
      { key: 'A', text: 'Մենք սպասում ենք:' },
      { key: 'B', text: 'Դուք սպասում եք:' },
      { key: 'C', text: 'Դուք սպասում ես:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Նա նկարում է:',
    prompt_phonetic: 'Na nkarum e',
    prompt_translation: 'Он рисует',
    target_armenian: 'Նրանք նկարում են:',
    target_phonetic: 'Nranq nkarum en',
    target_translation: 'Они рисуют',
    options: [
      { key: 'A', text: 'Մենք նկարում ենք:' },
      { key: 'B', text: 'Դուք նկարում եք:' },
      { key: 'C', text: 'Նրանք նկարում են:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_4',
    section_title: 'Урок 4',
    category: 'plural_conjugation',
    category_title: 'Спряжение глаголов',
    tag: 'CHANGE TO PLURAL',
    prompt_armenian: 'Ես սիրում եմ:',
    prompt_phonetic: 'Yes sirum em',
    prompt_translation: 'Я люблю',
    target_armenian: 'Մենք սիրում ենք:',
    target_phonetic: 'Menq sirum enk',
    target_translation: 'Мы любим',
    options: [
      { key: 'A', text: 'Մենք սիրում ենք:' },
      { key: 'B', text: 'Մենք սիրում եք:' },
      { key: 'C', text: 'Նրանք սիրում են:' }
    ],
    correct_option: 'A'
  }
];

async function seedLesson4Drills() {
  console.log(`Seeding ${cards.length} drill cards for Lesson 4...`);

  // Delete existing lesson_4 cards if any to allow clean re-seed
  await pool.query("DELETE FROM drill_cards WHERE section = 'lesson_4'");

  for (const c of cards) {
    await pool.query(
      `INSERT INTO drill_cards (
        section, section_title, category, category_title, tag,
        prompt_armenian, prompt_phonetic, prompt_translation,
        target_armenian, target_phonetic, target_translation,
        options, correct_option
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        c.section,
        c.section_title,
        c.category,
        c.category_title,
        c.tag,
        c.prompt_armenian,
        c.prompt_phonetic,
        c.prompt_translation,
        c.target_armenian,
        c.target_phonetic,
        c.target_translation,
        JSON.stringify(c.options),
        c.correct_option
      ]
    );
  }

  const countRes = await pool.query("SELECT COUNT(*) FROM drill_cards WHERE section = 'lesson_4'");
  console.log(`✅ Successfully seeded ${countRes.rows[0].count} drill cards for Lesson 4!`);
  await pool.end();
}

seedLesson4Drills().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
