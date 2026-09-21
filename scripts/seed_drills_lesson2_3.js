require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'armenian_app',
});

const cards = [
  // =================================================================
  // КАТЕГОРИЯ 1: ОПРЕДЕЛЁННОСТЬ / НЕОПРЕДЕЛЁННОСТЬ (10 КАРТОЧЕК)
  // =================================================================
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE INDEFINITE',
    prompt_armenian: 'Ամուսինը եկավ:',
    prompt_phonetic: 'Amusine yekav',
    prompt_translation: 'Муж пришел (определенный)',
    target_armenian: 'Մի ամուսին եկավ:',
    target_phonetic: 'Mi amusin yekav',
    target_translation: 'Один какой-то муж пришел',
    options: [
      { key: 'A', text: 'Մի ամուսին եկավ:' },
      { key: 'B', text: 'Ամուսիններ եկան:' },
      { key: 'C', text: 'Ամուսինը չեկավ:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE INDEFINITE',
    prompt_armenian: 'Բժիշկը հիվանդանոցում է:',
    prompt_phonetic: 'Bzhishke hivandanotsum e',
    prompt_translation: 'Врач в больнице',
    target_armenian: 'Մի բժիշկ հիվանդանոցում է:',
    target_phonetic: 'Mi bzhishk hivandanotsum e',
    target_translation: 'Один врач в больнице',
    options: [
      { key: 'A', text: 'Բժիշկները հիվանդանոցում են:' },
      { key: 'B', text: 'Մի բժիշկ հիվանդանոցում է:' },
      { key: 'C', text: 'Այս բժիշկը հիվանդանոցում է:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE INDEFINITE',
    prompt_armenian: 'Կինը խոսում է:',
    prompt_phonetic: 'Kine khosum e',
    prompt_translation: 'Женщина говорит',
    target_armenian: 'Մի կին խոսում է:',
    target_phonetic: 'Mi kin khosum e',
    target_translation: 'Одна женщина говорит',
    options: [
      { key: 'A', text: 'Կանայք խոսում են:' },
      { key: 'B', text: 'Կինը չի խոսում:' },
      { key: 'C', text: 'Մի կին խոսում է:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE INDEFINITE',
    prompt_armenian: 'Տունը մեծ է:',
    prompt_phonetic: 'Tune mets e',
    prompt_translation: 'Дом большой',
    target_armenian: 'Մի տուն մեծ է:',
    target_phonetic: 'Mi tun mets e',
    target_translation: 'Один дом большой',
    options: [
      { key: 'A', text: 'Մի տուն մեծ է:' },
      { key: 'B', text: 'Տները մեծ են:' },
      { key: 'C', text: 'Այս տունը մեծ է:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE INDEFINITE',
    prompt_armenian: 'Աղջիկը երգում է:',
    prompt_phonetic: 'Aghjike yergum e',
    prompt_translation: 'Девочка поет',
    target_armenian: 'Մի աղջիկ երգում է:',
    target_phonetic: 'Mi aghjik yergum e',
    target_translation: 'Одна девочка поет',
    options: [
      { key: 'A', text: 'Աղջիկները երգում են:' },
      { key: 'B', text: 'Մի աղջիկ երգում է:' },
      { key: 'C', text: 'Աղջիկը չի երգում:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE DEFINITE',
    prompt_armenian: 'Մի ուսանող գալիս է:',
    prompt_phonetic: 'Mi usanogh galis e',
    prompt_translation: 'Один студент идет',
    target_armenian: 'Ուսանողը գալիս է:',
    target_phonetic: 'Usanoghe galis e',
    target_translation: 'Студент идет',
    options: [
      { key: 'A', text: 'Ուսանողը գալիս է:' },
      { key: 'B', text: 'Ուսանողներ գալիս են:' },
      { key: 'C', text: 'Մի ուսանող չի գալիս:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE DEFINITE',
    prompt_armenian: 'Մի երեխա լալիս է:',
    prompt_phonetic: 'Mi yerekha lalis e',
    prompt_translation: 'Один ребенок плачет',
    target_armenian: 'Երեխան լալիս է:',
    target_phonetic: 'Yerekhan lalis e',
    target_translation: 'Ребенок плачет',
    options: [
      { key: 'A', text: 'Երեխաները լալիս են:' },
      { key: 'B', text: 'Մի երեխա չի լալիս:' },
      { key: 'C', text: 'Երեխան լալիս է:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE DEFINITE',
    prompt_armenian: 'Մի մեքենա կանգնած է:',
    prompt_phonetic: 'Mi meqena kangnats e',
    prompt_translation: 'Одна машина стоит',
    target_armenian: 'Մեքենան կանգնած է:',
    target_phonetic: 'Meqenan kangnats e',
    target_translation: 'Машина стоит',
    options: [
      { key: 'A', text: 'Մեքենան կանգնած է:' },
      { key: 'B', text: 'Մեքենաները կանգնած են:' },
      { key: 'C', text: 'Այդ մեքենան կանգնած է:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE DEFINITE',
    prompt_armenian: 'Մի տղա կարդում է:',
    prompt_phonetic: 'Mi tgha kardum e',
    prompt_translation: 'Один мальчик читает',
    target_armenian: 'Տղան կարդում է:',
    target_phonetic: 'Tghan kardum e',
    target_translation: 'Мальчик читает',
    options: [
      { key: 'A', text: 'Տղաները կարդում են:' },
      { key: 'B', text: 'Տղան կարդում է:' },
      { key: 'C', text: 'Մի տղա չի կարդում:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'definite_indefinite',
    category_title: 'Определённость / Неопределённость',
    tag: 'MAKE DEFINITE',
    prompt_armenian: 'Մի գիրք սեղանին է:',
    prompt_phonetic: 'Mi girq seghanin e',
    prompt_translation: 'Одна книга на столе',
    target_armenian: 'Գիրքը սեղանին է:',
    target_phonetic: 'Girqe seghanin e',
    target_translation: 'Книга на столе',
    options: [
      { key: 'A', text: 'Գրքերը սեղանին են:' },
      { key: 'B', text: 'Գիրքը չկա:' },
      { key: 'C', text: 'Գիրքը սեղանին է:' }
    ],
    correct_option: 'C'
  },

  // =================================================================
  // КАТЕГОРИЯ 2: СОГЛАСОВАНИЕ ВСПОМОГАТЕЛЬНОГО ГЛАГОЛА (10 КАРТОЧЕК)
  // =================================================================
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Ես աշակերտ եմ:',
    prompt_phonetic: 'Yes ashakert em',
    prompt_translation: 'Я ученик',
    target_armenian: 'Մենք աշակերտներ ենք:',
    target_phonetic: 'Menq ashakertner enq',
    target_translation: 'Мы ученики',
    options: [
      { key: 'A', text: 'Մենք աշակերտ ենք:' },
      { key: 'B', text: 'Մենք աշակերտներ ենք:' },
      { key: 'C', text: 'Դուք աշակերտներ եք:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Դու սիրուն ես:',
    prompt_phonetic: 'Du sirun es',
    prompt_translation: 'Ты красивый',
    target_armenian: 'Դուք սիրուն եք:',
    target_phonetic: 'Duq sirun eq',
    target_translation: 'Вы красивые',
    options: [
      { key: 'A', text: 'Դուք սիրուն եք:' },
      { key: 'B', text: 'Նրանք սիրուն են:' },
      { key: 'C', text: 'Մենք սիրուն ենք:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Նա բժիշկ է:',
    prompt_phonetic: 'Na bzhishk e',
    prompt_translation: 'Он врач',
    target_armenian: 'Նրանք բժիշկներ են:',
    target_phonetic: 'Nranq bzhishkner en',
    target_translation: 'Они врачи',
    options: [
      { key: 'A', text: 'Մենք բժիշկներ ենք:' },
      { key: 'B', text: 'Նրանք բժիշկ են:' },
      { key: 'C', text: 'Նրանք բժիշկներ են:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Ես ուսուցիչ եմ:',
    prompt_phonetic: 'Yes usutsich em',
    prompt_translation: 'Я учитель',
    target_armenian: 'Մենք ուսուցիչներ ենք:',
    target_phonetic: 'Menq usutsichner enq',
    target_translation: 'Мы учителя',
    options: [
      { key: 'A', text: 'Մենք ուսուցիչներ ենք:' },
      { key: 'B', text: 'Դուք ուսուցիչներ եք:' },
      { key: 'C', text: 'Մենք ուսուցիչ ենք:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Դու ուրախ ես:',
    prompt_phonetic: 'Du urakh es',
    prompt_translation: 'Ты радостный',
    target_armenian: 'Դուք ուրախ եք:',
    target_phonetic: 'Duq urakh eq',
    target_translation: 'Вы радостные',
    options: [
      { key: 'A', text: 'Նրանք ուրախ են:' },
      { key: 'B', text: 'Դուք ուրախ եք:' },
      { key: 'C', text: 'Մենք ուրախ ենք:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Նա ուսանող է:',
    prompt_phonetic: 'Na usanogh e',
    prompt_translation: 'Он студент',
    target_armenian: 'Նրանք ուսանողներ են:',
    target_phonetic: 'Nranq usanoghner en',
    target_translation: 'Они студенты',
    options: [
      { key: 'A', text: 'Նրանք ուսանողներ են:' },
      { key: 'B', text: 'Մենք ուսանողներ ենք:' },
      { key: 'C', text: 'Նրանք ուսանող են:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Ես հոգնած եմ:',
    prompt_phonetic: 'Yes hognats em',
    prompt_translation: 'Я уставший',
    target_armenian: 'Մենք հոգնած ենք:',
    target_phonetic: 'Menq hognats enq',
    target_translation: 'Мы уставшие',
    options: [
      { key: 'A', text: 'Դուք հոգնած եք:' },
      { key: 'B', text: 'Մենք հոգնած ենք:' },
      { key: 'C', text: 'Նրանք հոգնած են:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Դու բարի ես:',
    prompt_phonetic: 'Du bari es',
    prompt_translation: 'Ты добрый',
    target_armenian: 'Դուք բարի եք:',
    target_phonetic: 'Duq bari eq',
    target_translation: 'Вы добрые',
    options: [
      { key: 'A', text: 'Դուք բարի եք:' },
      { key: 'B', text: 'Մենք բարի ենք:' },
      { key: 'C', text: 'Դուք բարի ես:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Նա լավ մարդ է:',
    prompt_phonetic: 'Na lav mard e',
    prompt_translation: 'Он хороший человек',
    target_armenian: 'Նրանք լավ մարդիկ են:',
    target_phonetic: 'Nranq lav mardik en',
    target_translation: 'Они хорошие люди',
    options: [
      { key: 'A', text: 'Մենք լավ մարդիկ ենք:' },
      { key: 'B', text: 'Նրանք լավ մարդ են:' },
      { key: 'C', text: 'Նրանք լավ մարդիկ են:' }
    ],
    correct_option: 'C'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'aux_agreement',
    category_title: 'Согласование связки «быть»',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Ես զբաղված եմ:',
    prompt_phonetic: 'Yes zbaghvats em',
    prompt_translation: 'Я занят',
    target_armenian: 'Մենք զբաղված ենք:',
    target_phonetic: 'Menq zbaghvats enq',
    target_translation: 'Мы заняты',
    options: [
      { key: 'A', text: 'Մենք զբաղված ենք:' },
      { key: 'B', text: 'Դուք զբաղված եք:' },
      { key: 'C', text: 'Մենք զբաղված եմ:' }
    ],
    correct_option: 'A'
  },

  // =================================================================
  // КАТЕГОРИЯ 3: УКАЗАТЕЛЬНЫЕ МЕСТОИМЕНИЯ (10 КАРТОЧЕК)
  // =================================================================
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Սա տուն է:',
    prompt_phonetic: 'Sa tun e',
    prompt_translation: 'Это дом',
    target_armenian: 'Սրանք տներ են:',
    target_phonetic: 'Sranq tner en',
    target_translation: 'Это дома',
    options: [
      { key: 'A', text: 'Սրանք տուն են:' },
      { key: 'B', text: 'Սրանք տներ են:' },
      { key: 'C', text: 'Դրանք տներ են:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Սա գիրք է:',
    prompt_phonetic: 'Sa girq e',
    prompt_translation: 'Это книга',
    target_armenian: 'Սրանք գրքեր են:',
    target_phonetic: 'Sranq grqer en',
    target_translation: 'Это книги',
    options: [
      { key: 'A', text: 'Սրանք գրքեր են:' },
      { key: 'B', text: 'Դրանք գրքեր են:' },
      { key: 'C', text: 'Սրանք գիրք են:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Դա աթոռ է:',
    prompt_phonetic: 'Da ator e',
    prompt_translation: 'Это (у тебя) — стул',
    target_armenian: 'Դրանք աթոռներ են:',
    target_phonetic: 'Dranq atorner en',
    target_translation: 'Это (у тебя) — стулья',
    options: [
      { key: 'A', text: 'Սրանք աթոռներ են:' },
      { key: 'B', text: 'Դրանք աթոռներ են:' },
      { key: 'C', text: 'Դրանք աթոռ են:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Սա մեքենա է:',
    prompt_phonetic: 'Sa meqena e',
    prompt_translation: 'Это машина',
    target_armenian: 'Սրանք մեքենաներ են:',
    target_phonetic: 'Sranq meqenaner en',
    target_translation: 'Это машины',
    options: [
      { key: 'A', text: 'Սրանք մեքենաներ են:' },
      { key: 'B', text: 'Սրանք մեքենա են:' },
      { key: 'C', text: 'Նրանք մեքենաներ են:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Այն ծառ է:',
    prompt_phonetic: 'Ayn tsar e',
    prompt_translation: 'Вон то дерево',
    target_armenian: 'Նրանք ծառեր են:',
    target_phonetic: 'Nranq tsarer en',
    target_translation: 'Вон те деревья',
    options: [
      { key: 'A', text: 'Սրանք ծառեր են:' },
      { key: 'B', text: 'Նրանք ծառեր են:' },
      { key: 'C', text: 'Այն ծառեր են:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Սա խնձոր է:',
    prompt_phonetic: 'Sa khndzor e',
    prompt_translation: 'Это яблоко',
    target_armenian: 'Սրանք խնձորներ են:',
    target_phonetic: 'Sranq khndzorner en',
    target_translation: 'Это яблоки',
    options: [
      { key: 'A', text: 'Սրանք խնձորներ են:' },
      { key: 'B', text: 'Դրանք խնձորներ են:' },
      { key: 'C', text: 'Սրանք խնձոր են:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Դա սեղան է:',
    prompt_phonetic: 'Da seghan e',
    prompt_translation: 'Это (у тебя) — стол',
    target_armenian: 'Դրանք սեղաններ են:',
    target_phonetic: 'Dranq seghanner en',
    target_translation: 'Это (у тебя) — столы',
    options: [
      { key: 'A', text: 'Սրանք սեղաններ են:' },
      { key: 'B', text: 'Դրանք սեղաններ են:' },
      { key: 'C', text: 'Դրանք սեղան են:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Սա դուռ է:',
    prompt_phonetic: 'Sa dur e',
    prompt_translation: 'Это дверь',
    target_armenian: 'Սրանք դռներ են:',
    target_phonetic: 'Sranq drner en',
    target_translation: 'Это двери',
    options: [
      { key: 'A', text: 'Սրանք դռներ են:' },
      { key: 'B', text: 'Սրանք դուռներ են:' },
      { key: 'C', text: 'Դրանք դռներ են:' }
    ],
    correct_option: 'A'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Այն շուն է:',
    prompt_phonetic: 'Ayn shun e',
    prompt_translation: 'Вон то собака',
    target_armenian: 'Նրանք շներ են:',
    target_phonetic: 'Nranq shner en',
    target_translation: 'Вон те собаки',
    options: [
      { key: 'A', text: 'Սրանք շներ են:' },
      { key: 'B', text: 'Նրանք շներ են:' },
      { key: 'C', text: 'Նրանք շուն են:' }
    ],
    correct_option: 'B'
  },
  {
    section: 'lesson_2_3',
    section_title: 'Урок 2–3',
    category: 'demonstrative',
    category_title: 'Указательные местоимения',
    tag: 'MAKE IT PLURAL',
    prompt_armenian: 'Սա նամակ է:',
    prompt_phonetic: 'Sa namak e',
    prompt_translation: 'Это письмо',
    target_armenian: 'Սրանք նամակներ են:',
    target_phonetic: 'Sranq namakner en',
    target_translation: 'Это письма',
    options: [
      { key: 'A', text: 'Սրանք նամակներ են:' },
      { key: 'B', text: 'Դրանք նամակներ են:' },
      { key: 'C', text: 'Սրանք նամակ են:' }
    ],
    correct_option: 'A'
  }
];

async function main() {
  console.log('Seeding 30 drill cards for Lesson 2–3...');

  // Ensure table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drill_cards (
      id SERIAL PRIMARY KEY,
      section VARCHAR(64) NOT NULL,
      section_title VARCHAR(128) NOT NULL,
      category VARCHAR(64) NOT NULL,
      category_title VARCHAR(128) NOT NULL,
      tag VARCHAR(64) NOT NULL,
      prompt_armenian TEXT NOT NULL,
      prompt_phonetic TEXT,
      prompt_translation TEXT,
      target_armenian TEXT NOT NULL,
      target_phonetic TEXT,
      target_translation TEXT,
      options JSONB NOT NULL,
      correct_option VARCHAR(4) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drill_progress (
      card_id INT PRIMARY KEY REFERENCES drill_cards(id) ON DELETE CASCADE,
      correct_count INT DEFAULT 0,
      error_count INT DEFAULT 0,
      is_mastered BOOLEAN DEFAULT FALSE,
      last_practiced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Clear existing cards for section lesson_2_3 to keep seed clean
  await pool.query('DELETE FROM drill_cards WHERE section = $1', ['lesson_2_3']);

  for (const c of cards) {
    await pool.query(`
      INSERT INTO drill_cards (
        section, section_title, category, category_title, tag,
        prompt_armenian, prompt_phonetic, prompt_translation,
        target_armenian, target_phonetic, target_translation,
        options, correct_option
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, [
      c.section, c.section_title, c.category, c.category_title, c.tag,
      c.prompt_armenian, c.prompt_phonetic, c.prompt_translation,
      c.target_armenian, c.target_phonetic, c.target_translation,
      JSON.stringify(c.options), c.correct_option
    ]);
  }

  const countRes = await pool.query('SELECT COUNT(*) FROM drill_cards WHERE section = $1', ['lesson_2_3']);
  console.log(`✅ Seeded ${countRes.rows[0].count} drill cards successfully!`);

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error seeding drills:', err);
  process.exit(1);
});
