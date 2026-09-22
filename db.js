const { Pool, Client } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'armenian_app',
};

let pool = null;
let isConnected = false;

// In-memory fallback if DB is not reachable
let memoryProgress = {
  skills: {
    drills:    { level: 1, name: 'Drills',    icon: '🎯', desc: 'Grammar & practice' },
    reading:   { level: 1, name: 'Reading',   icon: '📖', desc: 'Texts & stories' },
    listening: { level: 1, name: 'Listening', icon: '🎧', desc: 'Audio comprehension' },
    writing:   { level: 1, name: 'Writing',   icon: '✍️', desc: 'Writing exercises' },
    speaking:  { level: 1, name: 'Speaking',  icon: '🗣️', desc: 'Conversation practice' },
    vocab:     { level: 1, name: 'Vocab',     icon: '📚', desc: 'Vocabulary' },
  }
};

async function ensureDatabaseExists() {
  const rootClient = new Client({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: 'postgres',
  });

  await rootClient.connect();
  const res = await rootClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbConfig.database]
  );

  if (res.rowCount === 0) {
    console.log(`📦 Creating database "${dbConfig.database}"...`);
    await rootClient.query(`CREATE DATABASE "${dbConfig.database}"`);
  }
  await rootClient.end();
}

async function initDb() {
  try {
    // 1. Ensure database exists
    await ensureDatabaseExists();

    // 2. Connect pool to target database
    pool = new Pool(dbConfig);
    await pool.query('SELECT NOW()');
    isConnected = true;
    console.log(`✅ Connected to PostgreSQL database "${dbConfig.database}"!`);

    // 3. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS skills (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        level INT DEFAULT 1 CHECK (level >= 1 AND level <= 30),
        icon VARCHAR(16) NOT NULL,
        description VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vocabulary (
        id SERIAL PRIMARY KEY,
        armenian VARCHAR(128) NOT NULL,
        phonetic VARCHAR(128),
        translation VARCHAR(128) NOT NULL,
        example_armenian TEXT,
        example_translation TEXT,
        level INT DEFAULT 1,
        repetitions INT DEFAULT 0,
        interval_days INT DEFAULT 0,
        ease_factor REAL DEFAULT 2.5,
        next_review TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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

    // 4. Seed initial skills if empty
    const skillsCount = await pool.query('SELECT COUNT(*) FROM skills');
    if (parseInt(skillsCount.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial skills...');
      const defaultSkills = [
        ['drills', 'Drills', 1, '🎯', 'Grammar & practice'],
        ['reading', 'Reading', 1, '📖', 'Texts & stories'],
        ['listening', 'Listening', 1, '🎧', 'Audio comprehension'],
        ['writing', 'Writing', 1, '✍️', 'Writing exercises'],
        ['speaking', 'Speaking', 1, '🗣️', 'Conversation practice'],
        ['vocab', 'Vocab', 1, '📚', 'Vocabulary'],
      ];
      for (const s of defaultSkills) {
        await pool.query(
          'INSERT INTO skills (id, name, level, icon, description) VALUES ($1, $2, $3, $4, $5)',
          s
        );
      }
    }

    // 5. Seed initial vocabulary if empty
    const wordsCount = await pool.query('SELECT COUNT(*) FROM vocabulary');
    if (parseInt(wordsCount.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding starter Armenian vocabulary (A0-A1)...');
      const sampleWords = [
        ['Բարև', 'Barev', 'Здравствуйте / Привет', 1],
        ['Շնորհակալություն', 'Shnorhakalutyun', 'Спасибо', 1],
        ['Խնդրեմ', 'Khndrem', 'Пожалуйста', 1],
        ['Այո', 'Ayo', 'Да', 1],
        ['Ոչ', 'Voch', 'Нет', 1],
        ['Ինչպե՞ս ես', 'Inchpes es', 'Как дела?', 1],
        ['Լավ', 'Lav', 'Хорошо', 1],
        ['Ցտեսություն', 'Tstesutyun', 'До свидания', 1],
        ['Ջուր', 'Jur', 'Вода', 1],
        ['Հաց', 'Hats', 'Хлеб', 1],
      ];
      for (const w of sampleWords) {
        await pool.query(
          'INSERT INTO vocabulary (armenian, phonetic, translation, level) VALUES ($1, $2, $3, $4)',
          w
        );
      }
    }

    console.log('✨ Database schema and seeds ready.');
  } catch (err) {
    console.error('⚠️ PostgreSQL connection waiting:', err.message);
    isConnected = false;
    setTimeout(initDb, 4000);
  }
}

function calculateVocabLevel(masteredCount) {
  let lvl = 1;
  let cum = 0;
  for (let l = 1; l <= 29; l++) {
    const size = l <= 15 ? 17 : 16;
    cum += size;
    if (masteredCount >= cum) {
      lvl = l + 1;
    } else {
      break;
    }
  }
  return Math.min(30, Math.max(1, lvl));
}

// Data access methods
async function getSkills() {
  if (isConnected) {
    // Dynamically calculate and sync vocab level from vocabulary table
    const vocabCountRes = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE interval_days >= 21) as mastered
      FROM vocabulary
    `);
    const mastered = parseInt(vocabCountRes.rows[0].mastered || 0, 10);
    const total = parseInt(vocabCountRes.rows[0].total || 0, 10);
    const calculatedLevel = calculateVocabLevel(mastered);

    await pool.query('UPDATE skills SET level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [calculatedLevel, 'vocab']);

    const res = await pool.query('SELECT id, name, level, icon, description as desc FROM skills ORDER BY id');
    const skillsObj = {};
    for (const row of res.rows) {
      skillsObj[row.id] = {
        name: row.name,
        level: row.level,
        icon: row.icon,
        desc: row.desc,
      };
      if (row.id === 'vocab') {
        skillsObj[row.id].mastered = mastered;
        skillsObj[row.id].total = total;
        skillsObj[row.id].thresholdDays = 21;
      }
    }
    return skillsObj;
  }
  return memoryProgress.skills;
}

async function updateSkillLevel(skillId, level) {
  if (isConnected) {
    const res = await pool.query(
      'UPDATE skills SET level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [level, skillId]
    );
    return res.rowCount > 0;
  }
  if (memoryProgress.skills[skillId]) {
    memoryProgress.skills[skillId].level = level;
    return true;
  }
  return false;
}

async function resetProgress() {
  if (isConnected) {
    await pool.query('UPDATE skills SET level = 1, updated_at = CURRENT_TIMESTAMP');
    return true;
  }
  for (const k of Object.keys(memoryProgress.skills)) {
    memoryProgress.skills[k].level = 1;
  }
  return true;
}

async function getVocabulary(options = {}) {
  if (isConnected) {
    let query = 'SELECT * FROM vocabulary';
    const params = [];
    const whereClauses = [];

    if (options.is_learned !== undefined) {
      params.push(options.is_learned);
      whereClauses.push(`is_learned = $${params.length}`);
    }
    if (options.lesson !== undefined) {
      params.push(options.lesson);
      whereClauses.push(`lesson = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }
    query += ' ORDER BY id ASC';

    const res = await pool.query(query, params);
    return res.rows;
  }
  return [];
}

// Get words due for review (SRS) — only learned words
async function getWordsForReview() {
  if (isConnected) {
    const res = await pool.query(
      'SELECT * FROM vocabulary WHERE is_learned = true AND next_review <= NOW() ORDER BY next_review ASC'
    );
    return res.rows;
  }
  return [];
}

// Get unlearned words for lesson learning
async function getUnlearnedWords(lesson = null) {
  if (isConnected) {
    let query = 'SELECT * FROM vocabulary WHERE is_learned = false';
    const params = [];
    if (lesson !== null) {
      params.push(lesson);
      query += ` AND lesson = $1`;
    }
    query += ' ORDER BY id ASC';
    const res = await pool.query(query, params);
    return res.rows;
  }
  return [];
}

// Mark word as learned after 4-step learning flow
async function markWordLearned(wordId) {
  if (isConnected) {
    const res = await pool.query(
      `UPDATE vocabulary 
       SET is_learned = true, repetitions = 1, interval_days = 1, next_review = NOW() + INTERVAL '1 day'
       WHERE id = $1 RETURNING *`,
      [wordId]
    );
    return res.rows[0];
  }
  return null;
}

// Summary of all lessons
async function getLessonsSummary() {
  if (isConnected) {
    const res = await pool.query(`
      SELECT 
        lesson,
        COUNT(*) as total_words,
        COUNT(*) FILTER (WHERE is_learned = true) as learned_words,
        COUNT(*) FILTER (WHERE is_learned = false) as unlearned_words
      FROM vocabulary
      GROUP BY lesson
      ORDER BY lesson ASC
    `);
    return res.rows;
  }
  return [];
}

// SM-2 Spaced Repetition Algorithm (Optimized Language Ladder: 1d -> 3d -> 7d -> 18d -> 45d)
// quality: 0 = Again (Снова), 1 = Hard (Трудно), 2 = Good (Хорошо), 3 = Easy (Легко)
function calculateNextSRS(word, quality) {
  let repetitions = parseInt(word.repetitions || 0, 10);
  let interval_days = parseInt(word.interval_days || 0, 10);
  let ease_factor = parseFloat(word.ease_factor || 2.5);

  let newIntervalDays = 0;
  const nextReview = new Date();

  if (quality === 0) {
    // Again: lapse / failed recall -> reset to 0, repeat in 10 minutes
    repetitions = 0;
    newIntervalDays = 0;
    ease_factor = Math.max(1.3, ease_factor - 0.20);
    nextReview.setMinutes(nextReview.getMinutes() + 10);
  } else if (quality === 1) {
    // Hard: successful recall with effort -> tight review
    repetitions += 1;
    if (interval_days <= 1) {
      newIntervalDays = 1;
    } else if (interval_days <= 3) {
      newIntervalDays = 2;
    } else {
      newIntervalDays = Math.max(interval_days + 1, Math.round(interval_days * 1.2));
    }
    ease_factor = Math.max(1.3, ease_factor - 0.15);
    nextReview.setDate(nextReview.getDate() + newIntervalDays);
  } else if (quality === 2) {
    // Good: normal recall -> language ladder: 3d -> 7d -> 18d -> 45d
    repetitions += 1;
    if (interval_days < 3) {
      newIntervalDays = 3;
    } else if (interval_days < 7) {
      newIntervalDays = 7;
    } else {
      newIntervalDays = Math.max(interval_days + 1, Math.round(interval_days * ease_factor));
    }
    nextReview.setDate(nextReview.getDate() + newIntervalDays);
  } else if (quality === 3) {
    // Easy: effortless recall -> safe language jump: 6d -> 14d -> 22d -> 56d
    repetitions += 1;
    if (interval_days < 3) {
      newIntervalDays = 6;
    } else if (interval_days < 7) {
      newIntervalDays = 14;
    } else {
      newIntervalDays = Math.max(interval_days + 2, Math.round(interval_days * ease_factor * 1.25));
    }
    ease_factor = Math.min(3.0, ease_factor + 0.15);
    nextReview.setDate(nextReview.getDate() + newIntervalDays);
  }

  return {
    repetitions,
    interval_days: newIntervalDays,
    ease_factor: parseFloat(ease_factor.toFixed(2)),
    next_review: nextReview
  };
}

// Get earliest next review time among learned words
async function getNextReviewTime() {
  if (isConnected) {
    const res = await pool.query(
      'SELECT next_review FROM vocabulary WHERE is_learned = true AND next_review > NOW() ORDER BY next_review ASC LIMIT 1'
    );
    return res.rows[0]?.next_review || null;
  }
  return null;
}

async function reviewWord(wordId, quality) {
  if (!isConnected) return null;

  const wordRes = await pool.query('SELECT * FROM vocabulary WHERE id = $1', [wordId]);
  if (wordRes.rowCount === 0) return null;

  const word = wordRes.rows[0];
  const nextSRS = calculateNextSRS(word, quality);

  await pool.query(
    `UPDATE vocabulary 
     SET repetitions = $1, interval_days = $2, ease_factor = $3, next_review = $4 
     WHERE id = $5`,
    [nextSRS.repetitions, nextSRS.interval_days, nextSRS.ease_factor, nextSRS.next_review, wordId]
  );

  // Recalculate vocab skill level in background
  try {
    const vocabCountRes = await pool.query(`
      SELECT COUNT(*) FILTER (WHERE interval_days >= 21) as mastered
      FROM vocabulary
    `);
    const mastered = parseInt(vocabCountRes.rows[0].mastered || 0, 10);
    const newVocabLevel = calculateVocabLevel(mastered);
    await pool.query('UPDATE skills SET level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newVocabLevel, 'vocab']);
  } catch (syncErr) {
    console.error('Error syncing vocab skill level:', syncErr.message);
  }

  return nextSRS;
}

async function getVocabularyLevelsSummary() {
  if (!isConnected) return { levels: [], totalMastered: 0, totalWords: 0, vocabLevel: 1, thresholdDays: 21 };

  const statsRes = await pool.query(`
    SELECT 
      level,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE interval_days >= 21) as mastered
    FROM vocabulary
    GROUP BY level
    ORDER BY level ASC;
  `);

  const wordsRes = await pool.query(`
    SELECT id, armenian, phonetic, translation, lesson, level, interval_days, repetitions,
           (interval_days >= 21) as is_mastered
    FROM vocabulary
    ORDER BY level ASC, lesson ASC, id ASC;
  `);

  const wordsByLevel = {};
  for (const w of wordsRes.rows) {
    if (!wordsByLevel[w.level]) wordsByLevel[w.level] = [];
    wordsByLevel[w.level].push(w);
  }

  let totalMastered = 0;
  let totalWords = 0;

  const levels = statsRes.rows.map(row => {
    const lvl = parseInt(row.level, 10);
    const total = parseInt(row.total, 10);
    const mastered = parseInt(row.mastered, 10);
    totalMastered += mastered;
    totalWords += total;
    return {
      level: lvl,
      total,
      mastered,
      is_completed: mastered >= total && total > 0,
      percent: total > 0 ? Math.round((mastered / total) * 100) : 0,
      words: wordsByLevel[lvl] || []
    };
  });

  const vocabLevel = calculateVocabLevel(totalMastered);

  return {
    levels,
    totalMastered,
    totalWords,
    vocabLevel,
    thresholdDays: 21
  };
}

async function getDrillSections() {
  if (!isConnected) return [];
  const res = await pool.query(`
    SELECT 
      c.section,
      c.section_title,
      COUNT(c.id) as total_cards,
      COUNT(p.card_id) FILTER (WHERE p.is_mastered = true) as mastered_cards,
      COUNT(c.id) FILTER (WHERE p.is_mastered IS NOT TRUE) as active_cards
    FROM drill_cards c
    LEFT JOIN drill_progress p ON c.id = p.card_id
    GROUP BY c.section, c.section_title
    ORDER BY c.section ASC
  `);
  return res.rows;
}

async function getDrillCards(section = 'lesson_2_3') {
  if (!isConnected) return [];
  // Select active cards (not yet mastered)
  const res = await pool.query(`
    SELECT 
      c.id, c.section, c.section_title, c.category, c.category_title, c.tag,
      c.prompt_armenian, c.prompt_phonetic, c.prompt_translation,
      c.target_armenian, c.target_phonetic, c.target_translation,
      c.options, c.correct_option,
      COALESCE(p.correct_count, 0) as correct_count,
      COALESCE(p.error_count, 0) as error_count,
      COALESCE(p.is_mastered, false) as is_mastered
    FROM drill_cards c
    LEFT JOIN drill_progress p ON c.id = p.card_id
    WHERE c.section = $1 AND COALESCE(p.is_mastered, false) = false
    ORDER BY RANDOM()
  `, [section]);

  // If all cards are mastered (3 correct), allow review of all cards
  if (res.rowCount === 0) {
    const allRes = await pool.query(`
      SELECT 
        c.id, c.section, c.section_title, c.category, c.category_title, c.tag,
        c.prompt_armenian, c.prompt_phonetic, c.prompt_translation,
        c.target_armenian, c.target_phonetic, c.target_translation,
        c.options, c.correct_option,
        COALESCE(p.correct_count, 0) as correct_count,
        COALESCE(p.error_count, 0) as error_count,
        COALESCE(p.is_mastered, false) as is_mastered
      FROM drill_cards c
      LEFT JOIN drill_progress p ON c.id = p.card_id
      WHERE c.section = $1
      ORDER BY RANDOM()
    `, [section]);
    return allRes.rows;
  }

  return res.rows;
}

const DRILL_MASTERY_THRESHOLD = 3;

async function recordDrillResult(cardId, isCorrect) {
  if (!isConnected) return null;
  const existing = await pool.query('SELECT * FROM drill_progress WHERE card_id = $1', [cardId]);
  let correctCount = 0;
  let errorCount = 0;
  if (existing.rowCount > 0) {
    correctCount = existing.rows[0].correct_count || 0;
    errorCount = existing.rows[0].error_count || 0;
  }

  if (isCorrect) {
    correctCount += 1;
  } else {
    errorCount += 1;
  }
  const isMastered = correctCount >= DRILL_MASTERY_THRESHOLD;

  const upsert = await pool.query(`
    INSERT INTO drill_progress (card_id, correct_count, error_count, is_mastered, last_practiced)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    ON CONFLICT (card_id) DO UPDATE
    SET correct_count = $2, error_count = $3, is_mastered = $4, last_practiced = CURRENT_TIMESTAMP
    RETURNING *
  `, [cardId, correctCount, errorCount, isMastered]);

  // Sync 'drills' skill level based on mastered cards
  try {
    const totalMasteredRes = await pool.query('SELECT COUNT(*) FROM drill_progress WHERE is_mastered = true');
    const masteredTotal = parseInt(totalMasteredRes.rows[0].count || 0, 10);
    const drillSkillLevel = Math.min(30, Math.max(1, 1 + masteredTotal));
    await pool.query('UPDATE skills SET level = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [drillSkillLevel, 'drills']);
  } catch (err) {
    console.error('Error updating drills skill level:', err.message);
  }

  return upsert.rows[0];
}

module.exports = {
  initDb,
  getSkills,
  updateSkillLevel,
  resetProgress,
  getVocabulary,
  getWordsForReview,
  getUnlearnedWords,
  markWordLearned,
  getLessonsSummary,
  reviewWord,
  calculateNextSRS,
  getNextReviewTime,
  getVocabularyLevelsSummary,
  calculateVocabLevel,
  getDrillSections,
  getDrillCards,
  recordDrillResult,
  isDbConnected: () => isConnected,
};
