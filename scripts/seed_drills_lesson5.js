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
  // ПАДЕЖ 1: ИМЕНИТЕЛЬНЫЙ (ՈՒՂՂԱԿԱՆ) - 10 КАРТОЧЕК
  // =================================================================
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... կարդում է:',
    prompt_phonetic: '... kardum e',
    prompt_translation: '[Студент] читает.',
    target_armenian: 'Ուսանողը կարդում է:',
    target_phonetic: 'Usanoghe kardum e',
    target_translation: 'Студент читает.',
    options: [
      { key: 'A', text: 'Ուսանողը կարդում է:' },
      { key: 'B', text: 'Ուսանողից կարդում է:' },
      { key: 'C', text: 'Ուսանողով կարդում է:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... ծագում է:',
    prompt_phonetic: '... tsagum e',
    prompt_translation: '[Солнце] восходит.',
    target_armenian: 'Արևը ծագում է:',
    target_phonetic: 'Areve tsagum e',
    target_translation: 'Солнце восходит.',
    options: [
      { key: 'A', text: 'Արևում ծագում է:' },
      { key: 'B', text: 'Արևը ծագում է:' },
      { key: 'C', text: 'Արևից ծագում է:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... ժպտում է:',
    prompt_phonetic: '... zhptum e',
    prompt_translation: '[Девушка] улыбается.',
    target_armenian: 'Աղջիկը ժպտում է:',
    target_phonetic: 'Aghjike zhptum e',
    target_translation: 'Девушка улыбается.',
    options: [
      { key: 'A', text: 'Աղջիկով ժպտում է:' },
      { key: 'B', text: 'Աղջիկին ժպտում է:' },
      { key: 'C', text: 'Աղջիկը ժպտում է:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... խոսում է:',
    prompt_phonetic: '... khosum e',
    prompt_translation: '[Врач] говорит.',
    target_armenian: 'Բժիշկը խոսում է:',
    target_phonetic: 'Bzhishke khosum e',
    target_translation: 'Врач говорит.',
    options: [
      { key: 'A', text: 'Բժիշկը խոսում է:' },
      { key: 'B', text: 'Բժշկից խոսում է:' },
      { key: 'C', text: 'Բժշկով խոսում է:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... խաղում է:',
    prompt_phonetic: '... khaghum e',
    prompt_translation: '[Ребёнок] играет.',
    target_armenian: 'Երեխան խաղում է:',
    target_phonetic: 'Yerekhan khaghum e',
    target_translation: 'Ребёнок играет.',
    options: [
      { key: 'A', text: 'Երեխայից խաղում է:' },
      { key: 'B', text: 'Երեխան խաղում է:' },
      { key: 'C', text: 'Երեխայում խաղում է:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... սառն է:',
    prompt_phonetic: '... sarn e',
    prompt_translation: '[Вода] холодная.',
    target_armenian: 'Ջուրը սառն է:',
    target_phonetic: 'Jure sarn e',
    target_translation: 'Вода холодная.',
    options: [
      { key: 'A', text: 'Ջրով սառն է:' },
      { key: 'B', text: 'Ջրից սառն է:' },
      { key: 'C', text: 'Ջուրը սառն է:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... բացատրում է:',
    prompt_phonetic: '... batsatrum e',
    prompt_translation: '[Учитель] объясняет.',
    target_armenian: 'Ուսուցիչը բացատրում է:',
    target_phonetic: 'Usutsiche batsatrum e',
    target_translation: 'Учитель объясняет.',
    options: [
      { key: 'A', text: 'Ուսուցիչը բացատրում է:' },
      { key: 'B', text: 'Ուսուցչին բացատրում է:' },
      { key: 'C', text: 'Ուսուցչից բացատրում է:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... գեղեցիկ է:',
    prompt_phonetic: '... geghetsik e',
    prompt_translation: '[Цветок] красивый.',
    target_armenian: 'Ծաղիկը գեղեցիկ է:',
    target_phonetic: 'Tsaghike geghetsik e',
    target_translation: 'Цветок красивый.',
    options: [
      { key: 'A', text: 'Ծաղիկից գեղեցիկ է:' },
      { key: 'B', text: 'Ծաղիկը գեղեցիկ է:' },
      { key: 'C', text: 'Ծաղիկով գեղեցիկ է:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... սեղանին է:',
    prompt_phonetic: '... seghanin e',
    prompt_translation: '[Книга] на столе.',
    target_armenian: 'Գիրքը սեղանին է:',
    target_phonetic: 'Girqe seghanin e',
    target_translation: 'Книга на столе.',
    options: [
      { key: 'A', text: 'Գրքով սեղանին է:' },
      { key: 'B', text: 'Գրքում սեղանին է:' },
      { key: 'C', text: 'Գիրքը սեղանին է:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'nominative_case',
    category_title: 'Именительный падеж (Кто? Что?)',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    prompt_armenian: '... հաչում է:',
    prompt_phonetic: '... hachum e',
    prompt_translation: '[Собака] лает.',
    target_armenian: 'Շունը հաչում է:',
    target_phonetic: 'Shune hachum e',
    target_translation: 'Собака лает.',
    options: [
      { key: 'A', text: 'Շունը հաչում է:' },
      { key: 'B', text: 'Շնից հաչում է:' },
      { key: 'C', text: 'Շնով հաչում է:' }
    ],
    correct_option: 'A'
  },

  // =================================================================
  // ПАДЕЖ 2: ВИНИТЕЛЬНЫЙ (ՀԱՅՑԱԿԱՆ) - 10 КАРТОЧЕК
  // =================================================================
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Ես տեսնում եմ [Արամ]:',
    prompt_phonetic: 'Yes tesnum em [Aram]',
    prompt_translation: 'Я вижу Арама (одушевленное).',
    target_armenian: 'Ես տեսնում եմ Արամին:',
    target_phonetic: 'Yes tesnum em Aramin',
    target_translation: 'Я вижу Арама.',
    options: [
      { key: 'A', text: 'Ես տեսնում եմ Արամ:' },
      { key: 'B', text: 'Ես տեսնում եմ Արամին:' },
      { key: 'C', text: 'Ես տեսնում եմ Արամից:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Ես կարդում եմ [գիրք]:',
    prompt_phonetic: 'Yes kardum em [girq]',
    prompt_translation: 'Я читаю книгу (неодушевленное).',
    target_armenian: 'Ես գիրք եմ կարդում:',
    target_phonetic: 'Yes girq em kardum',
    target_translation: 'Я читаю книгу.',
    options: [
      { key: 'A', text: 'Ես գիրք եմ կարդում:' },
      { key: 'B', text: 'Ես գրքին եմ կարդում:' },
      { key: 'C', text: 'Ես գրքով եմ կարդում:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Նա սիրում է [մայր]:',
    prompt_phonetic: 'Na sirum e [mayr]',
    prompt_translation: 'Он любит маму (одушевленное).',
    target_armenian: 'Նա սիրում է մորը:',
    target_phonetic: 'Na sirum e more',
    target_translation: 'Он любит маму.',
    options: [
      { key: 'A', text: 'Նա սիրում է մայր:' },
      { key: 'B', text: 'Նա սիրում է մորից:' },
      { key: 'C', text: 'Նա սիրում է մորը:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Մենք խմում ենք [ջուր]:',
    prompt_phonetic: 'Menq khmum enk [jur]',
    prompt_translation: 'Мы пьем воду (неодушевленное).',
    target_armenian: 'Մենք ջուր ենք խմում:',
    target_phonetic: 'Menq jur enk khmum',
    target_translation: 'Мы пьем воду.',
    options: [
      { key: 'A', text: 'Մենք ջուր ենք խմում:' },
      { key: 'B', text: 'Մենք ջրին ենք խմում:' },
      { key: 'C', text: 'Մենք ջրից ենք խմում:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Դուք սպասում եք [բժիշկ]:',
    prompt_phonetic: 'Duk spasum ek [bzhishk]',
    prompt_translation: 'Вы ждете врача (одушевленное).',
    target_armenian: 'Դուք սպասում եք բժշկին:',
    target_phonetic: 'Duk spasum ek bzhshkin',
    target_translation: 'Вы ждете врача.',
    options: [
      { key: 'A', text: 'Դուք սպասում եք բժիշկ:' },
      { key: 'B', text: 'Դուք սպասում եք բժշկին:' },
      { key: 'C', text: 'Դուք սպասում եք բժշկով:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Ես բացում եմ [դուռ]:',
    prompt_phonetic: 'Yes batsum em [dur]',
    prompt_translation: 'Я открываю дверь (неодушевленное).',
    target_armenian: 'Ես բացում եմ դուռը:',
    target_phonetic: 'Yes batsum em dure',
    target_translation: 'Я открываю дверь.',
    options: [
      { key: 'A', text: 'Ես բացում եմ դռնից:' },
      { key: 'B', text: 'Ես բացում եմ դռնով:' },
      { key: 'C', text: 'Ես բացում եմ դուռը:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Նրանք ճանաչում են [ուսուցիչ]:',
    prompt_phonetic: 'Nranq chanachum en [usutsich]',
    prompt_translation: 'Они знают учителя (одушевленное).',
    target_armenian: 'Նրանք ճանաչում են ուսուցչին:',
    target_phonetic: 'Nranq chanachum en usutschin',
    target_translation: 'Они знают учителя.',
    options: [
      { key: 'A', text: 'Նրանք ճանաչում են ուսուցչին:' },
      { key: 'B', text: 'Նրանք ճանաչում են ուսուցիչ:' },
      { key: 'C', text: 'Նրանք ճանաչում են ուսուցչից:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Նա գրում է [նամակ]:',
    prompt_phonetic: 'Na grum e [namak]',
    prompt_translation: 'Он пишет письмо (неодушевленное).',
    target_armenian: 'Նա նամակ է գրում:',
    target_phonetic: 'Na namak e grum',
    target_translation: 'Он пишет письмо.',
    options: [
      { key: 'A', text: 'Նա նամակին է գրում:' },
      { key: 'B', text: 'Նա նամակ է գրում:' },
      { key: 'C', text: 'Նա նամակից է գրում:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Մենք լսում ենք [երգիչ]:',
    prompt_phonetic: 'Menq lsum enk [yergich]',
    prompt_translation: 'Мы слушаем певца (одушевленное).',
    target_armenian: 'Մենք լսում ենք երգչին:',
    target_phonetic: 'Menq lsum enk yergchin',
    target_translation: 'Мы слушаем певца.',
    options: [
      { key: 'A', text: 'Մենք լսում ենք երգիչ:' },
      { key: 'B', text: 'Մենք լսում ենք երգչից:' },
      { key: 'C', text: 'Մենք լսում ենք երգչին:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'accusative_case',
    category_title: 'Винительный падеж (Кого? Что?)',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    prompt_armenian: 'Ես գնում եմ [հաց]:',
    prompt_phonetic: 'Yes gnum em [hats]',
    prompt_translation: 'Я покупаю хлеб (неодушевленное).',
    target_armenian: 'Ես հաց եմ գնում:',
    target_phonetic: 'Yes hats em gnum',
    target_translation: 'Я покупаю хлеб.',
    options: [
      { key: 'A', text: 'Ես հաց եմ գնում:' },
      { key: 'B', text: 'Ես հացին եմ գնում:' },
      { key: 'C', text: 'Ես հացով եմ գնում:' }
    ],
    correct_option: 'A'
  },

  // =================================================================
  // ПАДЕЖ 3: РОДИТЕЛЬНЫЙ (ՍԵՌԱԿԱՆ) - 10 КАРТОЧЕК
  // =================================================================
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [Արամ] գիրքն է:',
    prompt_phonetic: 'Sa [Aram] girqn e',
    prompt_translation: 'Это книга Арама.',
    target_armenian: 'Սա Արամի գիրքն է:',
    target_phonetic: 'Sa Arami girqn e',
    target_translation: 'Это книга Арама.',
    options: [
      { key: 'A', text: 'Սա Արամ գիրքն է:' },
      { key: 'B', text: 'Սա Արամի գիրքն է:' },
      { key: 'C', text: 'Սա Արամից գիրքն է:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [քաղաք] կենտրոնն է:',
    prompt_phonetic: 'Sa [qaghaq] kentronn e',
    prompt_translation: 'Это центр города.',
    target_armenian: 'Սա քաղաքի կենտրոնն է:',
    target_phonetic: 'Sa qaghaqi kentronn e',
    target_translation: 'Это центр города.',
    options: [
      { key: 'A', text: 'Սա քաղաքի կենտրոնն է:' },
      { key: 'B', text: 'Սա քաղաքով կենտրոնն է:' },
      { key: 'C', text: 'Սա քաղաքում կենտրոնն է:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [բժիշկ] սենյակն է:',
    prompt_phonetic: 'Sa [bzhishk] senyakn e',
    prompt_translation: 'Это кабинет врача.',
    target_armenian: 'Սա բժշկի սենյակն է:',
    target_phonetic: 'Sa bzhshki senyakn e',
    target_translation: 'Это кабинет врача.',
    options: [
      { key: 'A', text: 'Սա բժիշկ սենյակն է:' },
      { key: 'B', text: 'Սա բժշկից սենյակն է:' },
      { key: 'C', text: 'Սա բժշկի սենյակն է:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [դպրոց] տնօրենն է:',
    prompt_phonetic: 'Sa [dprots] tnorenn e',
    prompt_translation: 'Это директор школы.',
    target_armenian: 'Սա դպրոցի տնօրենն է:',
    target_phonetic: 'Sa dprotsi tnorenn e',
    target_translation: 'Это директор школы.',
    options: [
      { key: 'A', text: 'Սա դպրոցի տնօրենն է:' },
      { key: 'B', text: 'Սա դպրոցում տնօրենն է:' },
      { key: 'C', text: 'Սա դպրոցով տնօրենն է:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [ընկեր] մեքենան է:',
    prompt_phonetic: 'Sa [enker] meqenan e',
    prompt_translation: 'Это машина друга.',
    target_armenian: 'Սա ընկերոջ մեքենան է:',
    target_phonetic: 'Sa enkeroj meqenan e',
    target_translation: 'Это машина друга.',
    options: [
      { key: 'A', text: 'Սա ընկեր մեքենան է:' },
      { key: 'B', text: 'Սա ընկերոջ մեքենան է:' },
      { key: 'C', text: 'Սա ընկերով մեքենան է:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [գիրք] առաջին էջն է:',
    prompt_phonetic: 'Sa [girq] arajin ejn e',
    prompt_translation: 'Это первая страница книги.',
    target_armenian: 'Սա գրքի առաջին էջն է:',
    target_phonetic: 'Sa grqi arajin ejn e',
    target_translation: 'Это первая страница книги.',
    options: [
      { key: 'A', text: 'Սա գրքից առաջին էջն է:' },
      { key: 'B', text: 'Սա գրքում առաջին էջն է:' },
      { key: 'C', text: 'Սա գրքի առաջին էջն է:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [տուն] բակն է:',
    prompt_phonetic: 'Sa [tun] bakn e',
    prompt_translation: 'Это двор дома.',
    target_armenian: 'Սա տան բակն է:',
    target_phonetic: 'Sa tan bakn e',
    target_translation: 'Это двор дома.',
    options: [
      { key: 'A', text: 'Սա տան բակն է:' },
      { key: 'B', text: 'Սա տուն բակն է:' },
      { key: 'C', text: 'Սա տնով բակն է:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [ուսանող] տետրն է:',
    prompt_phonetic: 'Sa [usanogh] tetrn e',
    prompt_translation: 'Это тетрадь студента.',
    target_armenian: 'Սա ուսանողի տետրն է:',
    target_phonetic: 'Sa usanoghi tetrn e',
    target_translation: 'Это тетрадь студента.',
    options: [
      { key: 'A', text: 'Սա ուսանող տետրն է:' },
      { key: 'B', text: 'Սա ուսանողի տետրն է:' },
      { key: 'C', text: 'Սա ուսանողից տետրն է:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [հիվանդանոց] դուռն է:',
    prompt_phonetic: 'Sa [hivandanots] durn e',
    prompt_translation: 'Это дверь больницы.',
    target_armenian: 'Սա հիվանդանոցի դուռն է:',
    target_phonetic: 'Sa hivandanotsi durn e',
    target_translation: 'Это дверь больницы.',
    options: [
      { key: 'A', text: 'Սա հիվանդանոցով դուռն է:' },
      { key: 'B', text: 'Սա հիվանդանոցից դուռն է:' },
      { key: 'C', text: 'Սա հիվանդանոցի դուռն է:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'genitive_case',
    category_title: 'Родительный падеж (Чей? Кого? Чего?)',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    prompt_armenian: 'Սա [քույր] պայուսակն է:',
    prompt_phonetic: 'Sa [quyr] payusakn e',
    prompt_translation: 'Это сумка сестры.',
    target_armenian: 'Սա քրոջ պայուսակն է:',
    target_phonetic: 'Sa qroj payusakn e',
    target_translation: 'Это сумка сестры.',
    options: [
      { key: 'A', text: 'Սա քրոջ պայուսակն է:' },
      { key: 'B', text: 'Սա քույր պայուսակն է:' },
      { key: 'C', text: 'Սա քրոջից պայուսակն է:' }
    ],
    correct_option: 'A'
  },

  // =================================================================
  // ПАДЕЖ 4: ДАТЕЛЬНЫЙ (ՏՐԱԿԱՆ) - 10 КАРТОЧЕК
  // =================================================================
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Ես նամակ եմ գրում [ընկեր]:',
    prompt_phonetic: 'Yes namak em grum [enker]',
    prompt_translation: 'Я пишу письмо другу.',
    target_armenian: 'Ես նամակ եմ գրում ընկերոջը:',
    target_phonetic: 'Yes namak em grum enkeroje',
    target_translation: 'Я пишу письмо другу.',
    options: [
      { key: 'A', text: 'Ես նամակ եմ գրում ընկեր:' },
      { key: 'B', text: 'Ես նամակ եմ գրում ընկերոջը:' },
      { key: 'C', text: 'Ես նամակ եմ գրում ընկերոջից:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Նա օգնում է [մայր]:',
    prompt_phonetic: 'Na ognum e [mayr]',
    prompt_translation: 'Он помогает маме.',
    target_armenian: 'Նա օգնում է մորը:',
    target_phonetic: 'Na ognum e more',
    target_translation: 'Он помогает маме.',
    options: [
      { key: 'A', text: 'Նա օգնում է մորը:' },
      { key: 'B', text: 'Նա օգնում է մայր:' },
      { key: 'C', text: 'Նա օգնում է մորով:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Մենք ծաղիկներ ենք նվիրում [ուսուցիչ]:',
    prompt_phonetic: 'Menq tsaghikner enk nvirum [usutsich]',
    prompt_translation: 'Мы дарим цветы учительнице.',
    target_armenian: 'Մենք ծաղիկներ ենք նվիրում ուսուցչին:',
    target_phonetic: 'Menq tsaghikner enk nvirum usutschin',
    target_translation: 'Мы дарим цветы учительнице.',
    options: [
      { key: 'A', text: 'Մենք ծաղիկներ ենք նվիրում ուսուցիչ:' },
      { key: 'B', text: 'Մենք ծաղիկներ ենք նվիրում ուսուցչից:' },
      { key: 'C', text: 'Մենք ծաղիկներ ենք նվիրում ուսուցչին:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Բժիշկը դեղ է տալիս [հիվանդ]:',
    prompt_phonetic: 'Bzhishke degh e talis [hivand]',
    prompt_translation: 'Врач дает лекарство больному.',
    target_armenian: 'Բժիշկը դեղ է տալիս հիվանդին:',
    target_phonetic: 'Bzhishke degh e talis hivandin',
    target_translation: 'Врач дает лекарство больному.',
    options: [
      { key: 'A', text: 'Բժիշկը դեղ է տալիս հիվանդին:' },
      { key: 'B', text: 'Բժիշկը դեղ է տալիս հիվանդ:' },
      { key: 'C', text: 'Բժիշկը դեղ է տալիս հիվանդից:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Ես հարց եմ տալիս [Արամ]:',
    prompt_phonetic: 'Yes harts em talis [Aram]',
    prompt_translation: 'Я задаю вопрос Араму.',
    target_armenian: 'Ես հարց եմ տալիս Արամին:',
    target_phonetic: 'Yes harts em talis Aramin',
    target_translation: 'Я задаю вопрос Араму.',
    options: [
      { key: 'A', text: 'Ես հարց եմ տալիս Արամ:' },
      { key: 'B', text: 'Ես հարց եմ տալիս Արամին:' },
      { key: 'C', text: 'Ես հարց եմ տալիս Արամով:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Նա պատասխանում է [եղբայր]:',
    prompt_phonetic: 'Na pataskhanum e [yeghbayr]',
    prompt_translation: 'Он отвечает брату.',
    target_armenian: 'Նա պատասխանում է եղբորը:',
    target_phonetic: 'Na pataskhanum e yeghbore',
    target_translation: 'Он отвечает брату.',
    options: [
      { key: 'A', text: 'Նա պատասխանում է եղբայր:' },
      { key: 'B', text: 'Նա պատասխանում է եղբորից:' },
      { key: 'C', text: 'Նա պատասխանում է եղբորը:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Մենք ջուր ենք տալիս [ծաղիկներ]:',
    prompt_phonetic: 'Menq jur enk talis [tsaghikner]',
    prompt_translation: 'Мы даем воду цветам.',
    target_armenian: 'Մենք ջուր ենք տալիս ծաղիկներին:',
    target_phonetic: 'Menq jur enk talis tsaghiknerin',
    target_translation: 'Мы даем воду цветам.',
    options: [
      { key: 'A', text: 'Մենք ջուր ենք տալիս ծաղիկներին:' },
      { key: 'B', text: 'Մենք ջուր ենք տալիս ծաղիկներ:' },
      { key: 'C', text: 'Մենք ջուր ենք տալիս ծաղիկներից:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Նա զանգահարում է [քույր]:',
    prompt_phonetic: 'Na zangaharum e [quyr]',
    prompt_translation: 'Она звонит сестре.',
    target_armenian: 'Նա զանգահարում է քրոջը:',
    target_phonetic: 'Na zangaharum e qroje',
    target_translation: 'Она звонит сестре.',
    options: [
      { key: 'A', text: 'Նա զանգահարում է քույր:' },
      { key: 'B', text: 'Նա զանգահարում է քրոջը:' },
      { key: 'C', text: 'Նա զանգահարում է քրոջով:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Ուսուցիչը գիրք է տալիս [ուսանող]:',
    prompt_phonetic: 'Usutsiche girq e talis [usanogh]',
    prompt_translation: 'Учитель дает книгу студенту.',
    target_armenian: 'Ուսուցիչը գիրք է տալիս ուսանողին:',
    target_phonetic: 'Usutsiche girq e talis usanoghin',
    target_translation: 'Учитель дает книгу студенту.',
    options: [
      { key: 'A', text: 'Ուսուցիչը գիրք է տալիս ուսանողից:' },
      { key: 'B', text: 'Ուսուցիչը գիրք է տալիս ուսանող:' },
      { key: 'C', text: 'Ուսուցիչը գիրք է տալիս ուսանողին:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'dative_case',
    category_title: 'Дательный падеж (Кому? Чему?)',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    prompt_armenian: 'Ես ժպտում եմ [երեխա]:',
    prompt_phonetic: 'Yes zhptum em [yerekha]',
    prompt_translation: 'Я улыбаюсь ребёнку.',
    target_armenian: 'Ես ժպտում եմ երեխային:',
    target_phonetic: 'Yes zhptum em yerekhayin',
    target_translation: 'Я улыбаюсь ребёнку.',
    options: [
      { key: 'A', text: 'Ես ժպտում եմ երեխային:' },
      { key: 'B', text: 'Ես ժպտում եմ երեխա:' },
      { key: 'C', text: 'Ես ժպտում եմ երեխայից:' }
    ],
    correct_option: 'A'
  },

  // =================================================================
  // ПАДЕЖ 5: ИСХОДНЫЙ (ԲԱՑԱՌԱԿԱՆ) - 10 КАРТОЧЕК
  // =================================================================
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Ես գալիս եմ [Երևան]:',
    prompt_phonetic: 'Yes galis em [Yerevan]',
    prompt_translation: 'Я еду из Еревана.',
    target_armenian: 'Ես գալիս եմ Երևանից:',
    target_phonetic: 'Yes galis em Yerevanits',
    target_translation: 'Я еду из Еревана.',
    options: [
      { key: 'A', text: 'Ես գալիս եմ Երևանում:' },
      { key: 'B', text: 'Ես գալիս եմ Երևանից:' },
      { key: 'C', text: 'Ես գալիս եմ Երևանով:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Նա դուրս եկավ [տուն]:',
    prompt_phonetic: 'Na durs yekav [tun]',
    prompt_translation: 'Он вышел из дома.',
    target_armenian: 'Նա դուրս եկավ տնից:',
    target_phonetic: 'Na durs yekav tnits',
    target_translation: 'Он вышел из дома.',
    options: [
      { key: 'A', text: 'Նա դուրս եկավ տնից:' },
      { key: 'B', text: 'Նա դուրս եկավ տանը:' },
      { key: 'C', text: 'Նա դուրս եկավ տնով:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Մենք վերադառնում ենք [աշխատանք]:',
    prompt_phonetic: 'Menq veradarnum enk [ashkhatanq]',
    prompt_translation: 'Мы возвращаемся с работы.',
    target_armenian: 'Մենք վերադառնում ենք աշխատանքից:',
    target_phonetic: 'Menq veradarnum enk ashkhatanqits',
    target_translation: 'Мы возвращаемся с работы.',
    options: [
      { key: 'A', text: 'Մենք վերադառնում ենք աշխատանքում:' },
      { key: 'B', text: 'Մենք վերադառնում ենք աշխատանքով:' },
      { key: 'C', text: 'Մենք վերադառնում ենք աշխատանքից:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Ես նվեր ստացա [ընկեր]:',
    prompt_phonetic: 'Yes nver statsа [enker]',
    prompt_translation: 'Я получил подарок от друга.',
    target_armenian: 'Ես նվեր ստացա ընկերոջից:',
    target_phonetic: 'Yes nver statsа enkerojits',
    target_translation: 'Я получил подарок от друга.',
    options: [
      { key: 'A', text: 'Ես նվեր ստացա ընկերոջից:' },
      { key: 'B', text: 'Ես նվեր ստացա ընկերոջը:' },
      { key: 'C', text: 'Ես նվեր ստացա ընկերով:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Նա գալիս է [խանութ]:',
    prompt_phonetic: 'Na galis e [khanut]',
    prompt_translation: 'Он идёт из магазина.',
    target_armenian: 'Նա գալիս է խանութից:',
    target_phonetic: 'Na galis e khanutits',
    target_translation: 'Он идёт из магазина.',
    options: [
      { key: 'A', text: 'Նա գալիս է խանութում:' },
      { key: 'B', text: 'Նա գալիս է խանութից:' },
      { key: 'C', text: 'Նա գալիս է խանութով:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Ջուրը ծորում է [ծորակ]:',
    prompt_phonetic: 'Jure tsorum e [tsorak]',
    prompt_translation: 'Вода течёт из крана.',
    target_armenian: 'Ջուրը ծորում է ծորակից:',
    target_phonetic: 'Jure tsorum e tsorakits',
    target_translation: 'Вода течёт из крана.',
    options: [
      { key: 'A', text: 'Ջուրը ծորում է ծորակով:' },
      { key: 'B', text: 'Ջուրը ծորում է ծորակում:' },
      { key: 'C', text: 'Ջուրը ծորում է ծորակից:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Մենք դուրս ենք գալիս [դպրոց]:',
    prompt_phonetic: 'Menq durs enk galis [dprots]',
    prompt_translation: 'Мы выходим из школы.',
    target_armenian: 'Մենք դուրս ենք գալիս դպրոցից:',
    target_phonetic: 'Menq durs enk galis dprotsits',
    target_translation: 'Мы выходим из школы.',
    options: [
      { key: 'A', text: 'Մենք դուրս ենք գալիս դպրոցից:' },
      { key: 'B', text: 'Մենք դուրս ենք գալիս դպրոցում:' },
      { key: 'C', text: 'Մենք դուրս ենք գալիս դպրոցով:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Նա իջավ [ավտոբուս]:',
    prompt_phonetic: 'Na ijav [avtobus]',
    prompt_translation: 'Он сошёл с автобуса.',
    target_armenian: 'Նա իջավ ավտոբուսից:',
    target_phonetic: 'Na ijav avtobusits',
    target_translation: 'Он сошёл с автобуса.',
    options: [
      { key: 'A', text: 'Նա իջավ ավտոբուսով:' },
      { key: 'B', text: 'Նա իջավ ավտոբուսից:' },
      { key: 'C', text: 'Նա իջավ ավտոբուսում:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Ես լուրեր իմացա [բժիշկ]:',
    prompt_phonetic: 'Yes lurer imatsa [bzhishk]',
    prompt_translation: 'Я узнал новости от врача.',
    target_armenian: 'Ես լուրեր իմացա բժշկից:',
    target_phonetic: 'Yes lurer imatsa bzhshkits',
    target_translation: 'Я узнал новости от врача.',
    options: [
      { key: 'A', text: 'Ես լուրեր իմացա բժշկով:' },
      { key: 'B', text: 'Ես լուրեր իմացա բժիշկ:' },
      { key: 'C', text: 'Ես լուրեր իմացա բժշկից:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'ablative_case',
    category_title: 'Исходный падеж (Откуда? От кого?)',
    tag: 'ABLATIVE (-ից)',
    prompt_armenian: 'Նամակը եկավ [Մոսկվա]:',
    prompt_phonetic: 'Namake yekav [Moskva]',
    prompt_translation: 'Письмо пришло из Москвы.',
    target_armenian: 'Նամակը եկավ Մոսկվայից:',
    target_phonetic: 'Namake yekav Moskvayits',
    target_translation: 'Письмо пришло из Москвы.',
    options: [
      { key: 'A', text: 'Նամակը եկավ Մոսկվայից:' },
      { key: 'B', text: 'Նամակը եկավ Մոսկվայում:' },
      { key: 'C', text: 'Նամակը եկավ Մոսկվայով:' }
    ],
    correct_option: 'A'
  },

  // =================================================================
  // ПАДЕЖ 6: ТВОРИТЕЛЬНЫЙ (ԳՈՐԾԻԱԿԱՆ) - 10 КАРТОЧЕК
  // =================================================================
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Ես գնում եմ [մեքենա]:',
    prompt_phonetic: 'Yes gnum em [meqena]',
    prompt_translation: 'Я еду на машине.',
    target_armenian: 'Ես գնում եմ մեքենայով:',
    target_phonetic: 'Yes gnum em meqenayov',
    target_translation: 'Я еду на машине.',
    options: [
      { key: 'A', text: 'Ես գնում եմ մեքենայում:' },
      { key: 'B', text: 'Ես գնում եմ մեքենայով:' },
      { key: 'C', text: 'Ես գնում եմ մեքենայից:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Նա գրում է [գրիչ]:',
    prompt_phonetic: 'Na grum e [grich]',
    prompt_translation: 'Он пишет ручкой.',
    target_armenian: 'Նա գրում է գրիչով:',
    target_phonetic: 'Na grum e grichov',
    target_translation: 'Он пишет ручкой.',
    options: [
      { key: 'A', text: 'Նա գրում է գրիչով:' },
      { key: 'B', text: 'Նա գրում է գրիչից:' },
      { key: 'C', text: 'Նա գրում է գրիչում:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Մենք ճանապարհորդում ենք [ինքնաթիռ]:',
    prompt_phonetic: 'Menq chanaparhordum enk [inqnatir]',
    prompt_translation: 'Мы путешествуем на самолёте.',
    target_armenian: 'Մենք ճանապարհորդում ենք ինքնաթիռով:',
    target_phonetic: 'Menq chanaparhordum enk inqnatirov',
    target_translation: 'Мы путешествуем на самолёте.',
    options: [
      { key: 'A', text: 'Մենք ճանապարհորդում ենք ինքնաթիռից:' },
      { key: 'B', text: 'Մենք ճանապարհորդում ենք ինքնաթիռում:' },
      { key: 'C', text: 'Մենք ճանապարհորդում ենք ինքնաթիռով:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Նա հացը կտրում է [դանակ]:',
    prompt_phonetic: 'Na hatse ktrum e [danak]',
    prompt_translation: 'Он режет хлеб ножом.',
    target_armenian: 'Նա հացը կտրում է դանակով:',
    target_phonetic: 'Na hatse ktrum e danakov',
    target_translation: 'Он режет хлеб ножом.',
    options: [
      { key: 'A', text: 'Նա հացը կտրում է դանակով:' },
      { key: 'B', text: 'Նա հացը կտրում է դանակից:' },
      { key: 'C', text: 'Նա հացը կտրում է դանակում:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Ես անում եմ [սեր]:',
    prompt_phonetic: 'Yes anum em [ser]',
    prompt_translation: 'Я делаю с любовью (с удовольствием).',
    target_armenian: 'Ես սիրով եմ անում:',
    target_phonetic: 'Yes sirov em anum',
    target_translation: 'Я делаю с любовью / удовольствием.',
    options: [
      { key: 'A', text: 'Ես սիրուց եմ անում:' },
      { key: 'B', text: 'Ես սիրով եմ անում:' },
      { key: 'C', text: 'Ես սերով եմ անում:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Նրանք գալիս են [ավտոբուս]:',
    prompt_phonetic: 'Nranq galis en [avtobus]',
    prompt_translation: 'Они едут на автобусе.',
    target_armenian: 'Նրանք գալիս են ավտոբուսով:',
    target_phonetic: 'Nranq galis en avtobusov',
    target_translation: 'Они едут на автобусе.',
    options: [
      { key: 'A', text: 'Նրանք գալիս են ավտոբուսից:' },
      { key: 'B', text: 'Նրանք գալիս են ավտոբուսում:' },
      { key: 'C', text: 'Նրանք գալիս են ավտոբուսով:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Ես խոսում եմ [հեռախոս]:',
    prompt_phonetic: 'Yes khosum em [herakhos]',
    prompt_translation: 'Я говорю по телефону.',
    target_armenian: 'Ես խոսում եմ հեռախոսով:',
    target_phonetic: 'Yes khosum em herakhosov',
    target_translation: 'Я говорю по телефону.',
    options: [
      { key: 'A', text: 'Ես խոսում եմ հեռախոսով:' },
      { key: 'B', text: 'Ես խոսում եմ հեռախոսից:' },
      { key: 'C', text: 'Ես խոսում եմ հեռախոսում:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Նա նկարում է [մատիտ]:',
    prompt_phonetic: 'Na nkarum e [matit]',
    prompt_translation: 'Он рисует карандашом.',
    target_armenian: 'Նա նկարում է մատիտով:',
    target_phonetic: 'Na nkarum e matitov',
    target_translation: 'Он рисует карандашом.',
    options: [
      { key: 'A', text: 'Նա նկարում է մատիտից:' },
      { key: 'B', text: 'Նա նկարում է մատիտով:' },
      { key: 'C', text: 'Նա նկարում է մատիտում:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Մենք ապուրն ուտում ենք [գդալ]:',
    prompt_phonetic: 'Menq apurn utum enk [gdal]',
    prompt_translation: 'Мы едим суп ложкой.',
    target_armenian: 'Մենք ապուրն ուտում ենք գդալով:',
    target_phonetic: 'Menq apurn utum enk gdalov',
    target_translation: 'Мы едим суп ложкой.',
    options: [
      { key: 'A', text: 'Մենք ապուրն ուտում ենք գդալից:' },
      { key: 'B', text: 'Մենք ապուրն ուտում ենք գդալում:' },
      { key: 'C', text: 'Մենք ապուրն ուտում ենք գդալով:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'instrumental_case',
    category_title: 'Творительный падеж (Чем? На чём?)',
    tag: 'INSTRUMENTAL (-ով)',
    prompt_armenian: 'Նա ասաց [ժպիտ]:',
    prompt_phonetic: 'Na asats [zhpit]',
    prompt_translation: 'Она сказала с улыбкой.',
    target_armenian: 'Նա ժպիտով ասաց:',
    target_phonetic: 'Na zhpitov asats',
    target_translation: 'Она сказала с улыбкой.',
    options: [
      { key: 'A', text: 'Նա ժպիտով ասաց:' },
      { key: 'B', text: 'Նա ժպիտից ասաց:' },
      { key: 'C', text: 'Նա ժպիտում ասաց:' }
    ],
    correct_option: 'A'
  },

  // =================================================================
  // ПАДЕЖ 7: МЕСТНЫЙ (ՆԵՐԳՈՅԱԿԱՆ) - 10 КАРТОЧЕК
  // =================================================================
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Ես ապրում եմ [Երևան]:',
    prompt_phonetic: 'Yes aprum em [Yerevan]',
    prompt_translation: 'Я живу в Ереване.',
    target_armenian: 'Ես ապրում եմ Երևանում:',
    target_phonetic: 'Yes aprum em Yerevanum',
    target_translation: 'Я живу в Ереване.',
    options: [
      { key: 'A', text: 'Ես ապրում եմ Երևանից:' },
      { key: 'B', text: 'Ես ապրում եմ Երևանում:' },
      { key: 'C', text: 'Ես ապրում եմ Երևանով:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Գիրքը [պայուսակ] է:',
    prompt_phonetic: 'Girqe [payusak] e',
    prompt_translation: 'Книга в сумке.',
    target_armenian: 'Գիրքը պայուսակում է:',
    target_phonetic: 'Girqe payusakum e',
    target_translation: 'Книга в сумке.',
    options: [
      { key: 'A', text: 'Գիրքը պայուսակից է:' },
      { key: 'B', text: 'Գիրքը պայուսակով է:' },
      { key: 'C', text: 'Գիրքը պայուսակում է:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Երեխաները խաղում են [բակ]:',
    prompt_phonetic: 'Yerekhanere khaghum en [bak]',
    prompt_translation: 'Дети играют во дворе.',
    target_armenian: 'Երեխաները խաղում են բակում:',
    target_phonetic: 'Yerekhanere khaghum en bakum',
    target_translation: 'Дети играют во дворе.',
    options: [
      { key: 'A', text: 'Երեխաները խաղում են բակում:' },
      { key: 'B', text: 'Երեխաները խաղում են բակից:' },
      { key: 'C', text: 'Երեխաները խաղում են բակով:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Բժիշկը [հիվանդանոց] է:',
    prompt_phonetic: 'Bzhishke [hivandanots] e',
    prompt_translation: 'Врач в больнице.',
    target_armenian: 'Բժիշկը հիվանդանոցում է:',
    target_phonetic: 'Bzhishke hivandanotsum e',
    target_translation: 'Врач в больнице.',
    options: [
      { key: 'A', text: 'Բժիշկը հիվանդանոցից է:' },
      { key: 'B', text: 'Բժիշկը հիվանդանոցում է:' },
      { key: 'C', text: 'Բժիշկը հիվանդանոցով է:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Մենք սովորում ենք [դպրոց]:',
    prompt_phonetic: 'Menq sovorum enk [dprots]',
    prompt_translation: 'Мы учимся в школе.',
    target_armenian: 'Մենք սովորում ենք դպրոցում:',
    target_phonetic: 'Menq sovorum enk dprotsum',
    target_translation: 'Мы учимся в школе.',
    options: [
      { key: 'A', text: 'Մենք սովորում ենք դպրոցից:' },
      { key: 'B', text: 'Մենք սովորում ենք դպրոցով:' },
      { key: 'C', text: 'Մենք սովորում ենք դպրոցում:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Հայրիկը նստած է [սենյակ]:',
    prompt_phonetic: 'Hayrike nstats e [senyak]',
    prompt_translation: 'Папа сидит в комнате.',
    target_armenian: 'Հայրիկը նստած է սենյակում:',
    target_phonetic: 'Hayrike nstats e senyakum',
    target_translation: 'Папа сидит в комнате.',
    options: [
      { key: 'A', text: 'Հայրիկը նստած է սենյակում:' },
      { key: 'B', text: 'Հայրիկը նստած է սենյակից:' },
      { key: 'C', text: 'Հայրիկը նստած է սենյակով:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Ջուրը [բաժակ] է:',
    prompt_phonetic: 'Jure [bazhak] e',
    prompt_translation: 'Вода в стакане.',
    target_armenian: 'Ջուրը բաժակում է:',
    target_phonetic: 'Jure bazhakum e',
    target_translation: 'Вода в стакане.',
    options: [
      { key: 'A', text: 'Ջուրը բաժակից է:' },
      { key: 'B', text: 'Ջուրը բաժակում է:' },
      { key: 'C', text: 'Ջուրը բաժակով է:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Աշակերտները [դասարան] են:',
    prompt_phonetic: 'Ashakertnere [dasaran] en',
    prompt_translation: 'Ученики в классе.',
    target_armenian: 'Աշակերտները դասարանում են:',
    target_phonetic: 'Ashakertnere dasaranum en',
    target_translation: 'Ученики в классе.',
    options: [
      { key: 'A', text: 'Աշակերտները դասարանից են:' },
      { key: 'B', text: 'Աշակերտները դասարանով են:' },
      { key: 'C', text: 'Աշակերտները դասարանում են:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Մեքենան [ավտոտնակ] է:',
    prompt_phonetic: 'Meqenan [avtotnak] e',
    prompt_translation: 'Машина в гараже.',
    target_armenian: 'Մեքենան ավտոտնակում է:',
    target_phonetic: 'Meqenan avtotnakum e',
    target_translation: 'Машина в гараже.',
    options: [
      { key: 'A', text: 'Մեքենան ավտոտնակում է:' },
      { key: 'B', text: 'Մեքենան ավտոտնակից է:' },
      { key: 'C', text: 'Մեքենան ավտոտնակով է:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_5',
    section_title: 'Урок 5',
    category: 'locative_case',
    category_title: 'Местный падеж (Где? В чём?)',
    tag: 'LOCATIVE (-ում)',
    prompt_armenian: 'Մենք հանգստանում ենք [այգի]:',
    prompt_phonetic: 'Menq hangstanum enk [aygi]',
    prompt_translation: 'Мы отдыхаем в саду.',
    target_armenian: 'Մենք հանգստանում ենք այգում:',
    target_phonetic: 'Menq hangstanum enk aygum',
    target_translation: 'Мы отдыхаем в саду.',
    options: [
      { key: 'A', text: 'Մենք հանգստանում ենք այգուց:' },
      { key: 'B', text: 'Մենք հանգստանում ենք այգում:' },
      { key: 'C', text: 'Մենք հանգստանում ենք այգով:' }
    ],
    correct_option: 'B'
  }
];

async function seed() {
  console.log(`Clearing existing lesson_5 drill cards...`);
  await pool.query("DELETE FROM drill_cards WHERE section = 'lesson_5'");

  console.log(`Inserting ${cards.length} drill cards for Lesson 5 (7 cases x 10 cards)...`);

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

  const countRes = await pool.query("SELECT COUNT(*) FROM drill_cards WHERE section = 'lesson_5'");
  console.log(`Successfully seeded! Total lesson_5 cards in DB: ${countRes.rows[0].count}`);
  await pool.end();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
