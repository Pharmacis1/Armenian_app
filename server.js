require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API: get user progress
app.get('/api/progress', async (req, res) => {
  try {
    const skills = await db.getSkills();
    const maxLevel = 30;
    const skillKeys = Object.keys(skills);
    const totalSkills = skillKeys.length;
    const totalLevels = totalSkills * maxLevel;
    const currentLevels = skillKeys.reduce((sum, k) => sum + (skills[k].level - 1), 0);
    const maxProgressPossible = totalLevels - totalSkills;
    const overallPercent = maxProgressPossible > 0
      ? Math.round((currentLevels / maxProgressPossible) * 100)
      : 0;

    res.json({
      skills,
      overallPercent: Math.min(overallPercent, 100),
      currentLevel: overallPercent < 100 ? 'A0' : 'A1',
      targetLevel: 'A1',
      dbConnected: db.isDbConnected(),
    });
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: reset all skills progress to level 1
app.post('/api/progress/reset', async (req, res) => {
  try {
    await db.resetProgress();
    res.json({ ok: true, message: 'Progress reset to level 1' });
  } catch (err) {
    console.error('Error resetting progress:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: update skill level
app.post('/api/progress/:skill', async (req, res) => {
  try {
    const { skill } = req.params;
    const { level } = req.body;
    const lvl = parseInt(level, 10);

    if (isNaN(lvl) || lvl < 1 || lvl > 30) {
      return res.status(400).json({ error: 'Level must be between 1 and 30' });
    }

    const updated = await db.updateSkillLevel(skill, lvl);
    if (updated) {
      res.json({ ok: true });
    } else {
      res.status(404).json({ error: 'Skill not found' });
    }
  } catch (err) {
    console.error('Error updating progress:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: get vocabulary words for learning & spaced repetition (only learned words by default)
app.get('/api/vocabulary', async (req, res) => {
  try {
    let options = { is_learned: true };
    if (req.query.all === 'true') {
      options = {};
    } else if (req.query.is_learned !== undefined) {
      options = { is_learned: req.query.is_learned === 'true' };
    }
    const words = await db.getVocabulary(options);
    res.json({ words, dbConnected: db.isDbConnected() });
  } catch (err) {
    console.error('Error fetching vocabulary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: get vocabulary levels (1 to 30) breakdown and 21-day mastery stats
app.get('/api/vocabulary/levels', async (req, res) => {
  try {
    const summary = await db.getVocabularyLevelsSummary();
    res.json(summary);
  } catch (err) {
    console.error('Error fetching vocabulary levels:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const stt = require('./services/stt');

// API: Groq Speech-to-Text for Armenian speech
app.post('/api/stt/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType, prompt } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64 in request body' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const transcription = await stt.transcribeArmenianAudio(audioBuffer, mimeType || 'audio/webm', prompt || '');
    res.json({ ok: true, text: transcription.text });
  } catch (err) {
    console.error('STT transcription error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Get drill sections
app.get('/api/drills/sections', async (req, res) => {
  try {
    const sections = await db.getDrillSections();
    res.json({ sections });
  } catch (err) {
    console.error('Error fetching drill sections:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get cards for a drill section
app.get('/api/drills/cards', async (req, res) => {
  try {
    const section = req.query.section || 'lesson_2_3';
    const cards = await db.getDrillCards(section);
    res.json({ cards, count: cards.length });
  } catch (err) {
    console.error('Error fetching drill cards:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Submit card drill practice result
app.post('/api/drills/:cardId/result', async (req, res) => {
  try {
    const cardId = parseInt(req.params.cardId, 10);
    const { isCorrect } = req.body;
    const updated = await db.recordDrillResult(cardId, !!isCorrect);
    res.json({ ok: true, progress: updated });
  } catch (err) {
    console.error('Error submitting drill result:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Synthesize TTS audio for a drill sentence
app.post('/api/drills/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text parameter' });
    const tts = require('./services/tts');
    const audioInfo = await tts.getOrGenerateSentenceAudio(text);
    res.json({ ok: true, url: audioInfo.url, cached: audioInfo.cached });
  } catch (err) {
    console.error('Drill TTS error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: play/synthesize audio for a word
app.get('/api/audio/:wordId', async (req, res) => {
  try {
    const { wordId } = req.params;
    const words = await db.getVocabulary();
    const word = words.find(w => w.id === parseInt(wordId, 10));

    if (!word) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const tts = require('./services/tts');
    const voice = req.query.voice || process.env.AZURE_SPEECH_VOICE || 'hy-AM-AnahitNeural';
    const audioInfo = await tts.getOrGenerateAudio(word.id, word.armenian, voice);
    res.json({ ok: true, url: audioInfo.url, cached: audioInfo.cached });
  } catch (err) {
    console.error('Error playing audio:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: get words due for review (SRS)
app.get('/api/vocabulary/review', async (req, res) => {
  try {
    const words = await db.getWordsForReview();
    const nextDue = await db.getNextReviewTime();
    res.json({ words, count: words.length, nextDue });
  } catch (err) {
    console.error('Error fetching review words:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: submit SRS review rating for a word
// quality: 0 = Again, 1 = Hard, 2 = Good, 3 = Easy
app.post('/api/vocabulary/:id/review', async (req, res) => {
  try {
    const wordId = parseInt(req.params.id, 10);
    const { quality } = req.body;

    if (quality === undefined || quality < 0 || quality > 3) {
      return res.status(400).json({ error: 'Quality must be 0-3' });
    }

    const result = await db.reviewWord(wordId, quality);
    if (result) {
      res.json({ ok: true, ...result });
    } else {
      res.status(404).json({ error: 'Word not found' });
    }
  } catch (err) {
    console.error('Error reviewing word:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: get lessons summary
app.get('/api/lessons', async (req, res) => {
  try {
    const lessons = await db.getLessonsSummary();
    res.json({ lessons });
  } catch (err) {
    console.error('Error fetching lessons:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: get unlearned words for study in "Learn Words"
app.get('/api/vocabulary/learn', async (req, res) => {
  try {
    const lesson = req.query.lesson ? parseInt(req.query.lesson, 10) : null;
    const words = await db.getUnlearnedWords(lesson);
    res.json({ words, count: words.length });
  } catch (err) {
    console.error('Error fetching unlearned words:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: mark word as learned after 4-step flow
app.post('/api/vocabulary/:id/learned', async (req, res) => {
  try {
    const wordId = parseInt(req.params.id, 10);
    const updated = await db.markWordLearned(wordId);
    if (updated) {
      res.json({ ok: true, word: updated });
    } else {
      res.status(404).json({ error: 'Word not found' });
    }
  } catch (err) {
    console.error('Error marking word learned:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Ensure reports directory exists
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// API: submit bug/suggestion report with screenshot and diagnostics
app.post('/api/reports', async (req, res) => {
  try {
    const { type, comment, screenshot, diagnostics } = req.body;
    const now = new Date();
    const timestampStr = now.toISOString().replace(/[:.]/g, '-');
    const reportType = type === 'suggestion' ? 'suggestion' : 'bug';
    const reportId = `report_${timestampStr}_${reportType}`;

    let screenshotFilename = null;
    if (screenshot && screenshot.startsWith('data:image/')) {
      const matches = screenshot.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        screenshotFilename = `${reportId}.${ext}`;
        const screenshotPath = path.join(reportsDir, screenshotFilename);
        await fs.promises.writeFile(screenshotPath, Buffer.from(base64Data, 'base64'));
      }
    }

    // Save JSON data
    const reportData = {
      id: reportId,
      createdAt: now.toISOString(),
      type: reportType,
      comment: comment || '',
      screenshot: screenshotFilename,
      diagnostics: diagnostics || {}
    };

    const jsonPath = path.join(reportsDir, `${reportId}.json`);
    await fs.promises.writeFile(jsonPath, JSON.stringify(reportData, null, 2), 'utf8');

    // Also write human-readable Markdown summary
    const mdContent = `# 🐞 Отчет: ${reportType.toUpperCase()} (${reportId})

- **Дата:** ${now.toLocaleString('ru-RU')}
- **Тип:** ${reportType === 'bug' ? '🐛 Баг / Ошибка' : '💡 Предложение / Идея'}
- **Комментарий пользователя:**
> ${comment || '(без комментария)'}

${screenshotFilename ? `### 📸 Скриншот экрана:\n![Скриншот](./${screenshotFilename})\n` : ''}

### 💻 Устройство и окружение:
- **Устройство:** \`${diagnostics?.device || 'Не определено'}\`
- **User-Agent:** \`${diagnostics?.userAgent || ''}\`
- **Разрешение экрана / Окна:** \`${diagnostics?.viewport?.width}x${diagnostics?.viewport?.height} (DPR: ${diagnostics?.viewport?.dpr})\`
- **URL страницы:** \`${diagnostics?.url || ''}\`

### 📱 Состояние приложения в момент отправки:
\`\`\`json
${JSON.stringify(diagnostics?.appState || {}, null, 2)}
\`\`\`

### ⚠️ Ошибки JavaScript (${diagnostics?.recentErrors?.length || 0}):
\`\`\`json
${JSON.stringify(diagnostics?.recentErrors || [], null, 2)}
\`\`\`
`;
    const mdPath = path.join(reportsDir, `${reportId}.md`);
    await fs.promises.writeFile(mdPath, mdContent, 'utf8');

    console.log(`[Reports] New ${reportType} report saved: ${reportId}`);
    res.json({ ok: true, reportId, message: 'Отчет успешно сохранен' });
  } catch (err) {
    console.error('Error saving report:', err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// Start server and initialize PostgreSQL
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🇦🇲 Armenian App running at http://localhost:${PORT}`);
  await db.initDb();
});
