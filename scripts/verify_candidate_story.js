const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'armenian_app',
});

// Candidate story using strictly existing database words
const candidateText = `
Այսօր կիրակի է: Առավոտյան լավ եղանակ է: Երկինքը կապույտ է ու պարզ:
Աննան զարթնում է և ժպտում:
Նա գնում է սենյակ և նստում է սեղանի մոտ:
Սեղանին կա հաց, պանիր և տաք կաթ:
Աննան եփում է համեղ սուրճ:
Նա դանդաղ խմում է տաք սուրճը և ուտում է հաց ու պանիր:
Նա վերցնում է մեծ գիրք և կարդում է:
Սենյակ է գալիս սպիտակ կատուն: Կատվի անունը Միկի է:
Կատուն նստում է աթոռին և քնում:
Աննան հանգստանում է: Լավ օր է:
`;

async function verifyAllWords() {
  const dbWords = (await pool.query('SELECT armenian, translation, lesson FROM vocabulary')).rows;
  const dbArmenian = new Set(dbWords.map(w => w.armenian.trim().toLowerCase()));

  // Lemmas map for grammatical inflections in this text:
  const wordMap = {
    'այսօր': 'այսօր',
    'կիրակի': 'կիրակի',
    'է': 'grammar particle',
    'առավոտյան': 'առավոտյան',
    'լավ': 'լավ',
    'եղանակ': 'եղանակ',
    'երկինքը': 'երկինք',
    'կապույտ': 'կապույտ',
    'ու': 'ու',
    'պարզ': 'պարզ',
    'աննան': 'name',
    'զարթնում': 'զարթնել',
    'և': 'և',
    'ժպտում': 'ժպտալ',
    'նա': 'նա',
    'գնում': 'գնալ',
    'սենյակ': 'սենյակ',
    'նստում': 'նստել',
    'սեղանի': 'սեղան',
    'մոտ': 'մոտ',
    'սեղանին': 'սեղան',
    'կա': 'կա',
    'հաց': 'հաց',
    'պանիր': 'պանիր',
    'տաք': 'տաք',
    'կաթ': 'կաթ',
    'եփում': 'եփել',
    'համեղ': 'համեղ',
    'սուրճ': 'սուրճ',
    'դանդաղ': 'դանդաղ',
    'խմում': 'խմել',
    'սուրճը': 'սուրճ',
    'ուտում': 'ուտել',
    'վերցնում': 'վերցնել',
    'մեծ': 'մեծ',
    'գիրք': 'գիրք',
    'կարդում': 'կարդալ',
    'գալիս': 'գալ',
    'սպիտակ': 'սպիտակ',
    'կատուն': 'կատու',
    'կատվի': 'կատու',
    'անունը': 'անուն',
    'միկի': 'name',
    'աթոռին': 'աթոռ',
    'քնում': 'քնել',
    'հանգստանում': 'հանգստանալ',
    'օր': 'օր'
  };

  const rawTokens = candidateText
    .split(/\s+/)
    .map(w => w.replace(/[.,:;«»!?՝—]/g, '').trim().toLowerCase())
    .filter(Boolean);

  console.log(`Candidate story token count: ${rawTokens.length}`);

  let missing = [];
  for (const token of rawTokens) {
    const lemma = wordMap[token];
    if (lemma === 'name' || lemma === 'grammar particle') continue;
    if (!lemma || !dbArmenian.has(lemma)) {
      missing.push({ token, lemma });
    }
  }

  if (missing.length === 0) {
    console.log('🎉 SUCCESS: 100% OF THE WORDS ARE ALREADY IN THE DATABASE!');
  } else {
    console.log('Missing:', missing);
  }

  await pool.end();
}

verifyAllWords();
