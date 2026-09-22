// === Global Error Logger for Bug Reports ===
const clientErrorsLog = [];
window.addEventListener('error', (event) => {
  clientErrorsLog.push({
    time: new Date().toLocaleTimeString(),
    message: event.message,
    source: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : 'unknown',
    error: event.error ? (event.error.stack || event.error.toString()) : null
  });
  if (clientErrorsLog.length > 20) clientErrorsLog.shift();
});
window.addEventListener('unhandledrejection', (event) => {
  clientErrorsLog.push({
    time: new Date().toLocaleTimeString(),
    message: 'Unhandled Promise Rejection: ' + (event.reason ? (event.reason.message || event.reason.toString()) : 'unknown'),
    stack: event.reason && event.reason.stack ? event.reason.stack : null
  });
  if (clientErrorsLog.length > 20) clientErrorsLog.shift();
});

// === App State & Vocabulary ===

const actions = [
  { id: 'learn',    icon: '✨', cls: 'learn',    title: 'Learn Words',   desc: 'Изучение новых слов' },
  { id: 'review',   icon: '🔁', cls: 'review',   title: 'Review',        desc: 'Ранее изученные слова (Урок 1)', badgeId: 'reviewBadge' },
  { id: 'listen',   icon: '🎧', cls: 'listen',   title: 'Listening',     desc: 'Тренировка на слух (Урок 1)' },
  { id: 'drills',   icon: '🎯', cls: 'drills',   title: 'Pattern Drills', desc: 'Уроки 2–4 (Грамматика и говорение)' },
  { id: 'grammar',  icon: '📚', cls: 'reading',  title: 'Грамматика',    desc: 'Правила дриллов по урокам 2–4' },
  { id: 'reading',  icon: '📖', cls: 'reading',  title: 'Reading',       desc: 'Texts & stories' },
  { id: 'writing',  icon: '✍️', cls: 'writing',  title: 'Writing',       desc: 'Writing exercises' },
  { id: 'speaking', icon: '🗣️', cls: 'speaking', title: 'Speaking',      desc: 'Conversation practice' },
];

let vocabulary = [];
let reviewDueWords = [];
let reviewNextDue = null;
let activeDeck = [];
let currentIndex = 0;
let currentAudio = null;
let isListeningMode = false;
let isFlipped = false;
let isWordRevealedOnFront = false;

// === Progress & Skills ===

async function loadProgress() {
  try {
    const res = await fetch('/api/progress');
    const data = await res.json();
    renderProgress(data);
    renderSkills(data.skills);
  } catch (e) {
    console.error('Failed to load progress', e);
  }
}

function renderProgress(data) {
  const pctEl = document.getElementById('overallPercent');
  const fillEl = document.getElementById('overallFill');

  animateNumber(pctEl, data.overallPercent);
  requestAnimationFrame(() => {
    fillEl.style.width = data.overallPercent + '%';
  });
}

function animateNumber(el, target) {
  const duration = 600;
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(start + diff * eased) + '%';
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderSkills(skills) {
  const grid = document.getElementById('skillsGrid');
  grid.innerHTML = '';

  for (const [key, skill] of Object.entries(skills)) {
    const pct = ((skill.level - 1) / 29 * 100).toFixed(0);
    
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.dataset.skill = key;

    let levelText = `Lv. ${skill.level} / 30`;
    if (key === 'vocab' && skill.total) {
      levelText = `Lv. ${skill.level} / 30 · ${skill.mastered || 0}/${skill.total} (≥21 дн.)`;
    }

    card.innerHTML = `
      <span class="skill-icon">${skill.icon}</span>
      <div class="skill-name">${skill.name}</div>
      <div class="skill-level-bar">
        <div class="skill-level-fill" style="width: ${pct}%"></div>
      </div>
      <div class="skill-level-text">${levelText}</div>
    `;

    if (key === 'vocab') {
      card.style.cursor = 'pointer';
      card.title = 'Нажмите, чтобы посмотреть все 30 уровней и слова';
      card.addEventListener('click', openVocabLevelsModal);
    }

    grid.appendChild(card);
  }
}

// === Vocabulary & SRS ===

async function loadVocabulary() {
  try {
    const [resAll, resRev, resLessons] = await Promise.all([
      fetch('/api/vocabulary'),
      fetch('/api/vocabulary/review'),
      fetch('/api/lessons')
    ]);
    const dataAll = await resAll.json();
    const dataRev = await resRev.json();
    const dataLessons = await resLessons.json();
    vocabulary = dataAll.words || [];
    reviewDueWords = dataRev.words || [];
    reviewNextDue = dataRev.nextDue || null;
    learnLessons = dataLessons.lessons || [];

    const totalUnlearned = learnLessons.reduce((acc, l) => acc + parseInt(l.unlearned_words || 0, 10), 0);
    const activeLessons = learnLessons.filter(l => parseInt(l.unlearned_words || 0, 10) > 0).map(l => l.lesson);
    const numLessons = activeLessons.filter(num => num !== 16);
    const hasSupplement = activeLessons.includes(16);
    let lessonsText = '';
    if (numLessons.length > 0 && hasSupplement) {
      lessonsText = ` (Уроки ${numLessons.join(', ')} + Дополнение)`;
    } else if (hasSupplement) {
      lessonsText = ' (Дополнение)';
    } else if (numLessons.length > 0) {
      lessonsText = ` (Урок ${numLessons.join(', ')})`;
    }
    const learnAction = actions.find(a => a.id === 'learn');
    if (learnAction) {
      learnAction.desc = totalUnlearned > 0 ? `${totalUnlearned} новых слов${lessonsText}` : 'Все слова выучены!';
    }
    const reviewAction = actions.find(a => a.id === 'review');
    if (reviewAction) {
      reviewAction.desc = 'Ранее изученные слова (Урок 1)';
    }
    renderActions();
    updateReviewBadge();
  } catch (e) {
    console.error('Failed to load vocabulary', e);
  }
}

function updateReviewBadge() {
  const badge = document.getElementById('reviewBadge');
  if (badge) {
    if (reviewDueWords.length > 0) {
      badge.textContent = `${reviewDueWords.length} due`;
      badge.style.display = 'inline-block';
      badge.style.background = '#e85d3a';
    } else {
      badge.textContent = '✓ 0 due';
      badge.style.display = 'inline-block';
      badge.style.background = '#10b981';
    }
  }
}

// === Modal & Flipping Cards ===

function openWordModal(mode = 'review', startIndex = 0) {
  if (!vocabulary.length) {
    showToast('Загрузка словаря...');
    return;
  }

  const learnedPool = vocabulary.filter(w => w.is_learned !== false);

  if (mode === 'review') {
    if (reviewDueWords.length === 0) {
      let nextMsg = '🎉 Все карточки на сегодня повторены!';
      if (reviewNextDue) {
        const d = new Date(reviewNextDue);
        const diffMs = d - new Date();
        const diffMin = Math.max(1, Math.round(diffMs / 60000));
        if (diffMin < 60) {
          nextMsg += `\nБлижайшее повторение через ~${diffMin} мин.`;
        } else if (diffMin < 1440) {
          const diffHrs = Math.round(diffMin / 60);
          nextMsg += `\nБлижайшее повторение через ~${diffHrs} ч.`;
        } else {
          const diffDays = Math.round(diffMin / 1440);
          nextMsg += `\nБлижайшее повторение через ~${diffDays} д.`;
        }
      }
      const doEarly = confirm(`${nextMsg}\n\nХотите повторить выученные слова досрочно для закрепления?`);
      if (!doEarly) return;
      activeDeck = learnedPool.length > 0 ? [...learnedPool] : [...vocabulary];
    } else {
      activeDeck = [...reviewDueWords];
    }
    isListeningMode = false;
  } else if (mode === 'listen') {
    activeDeck = learnedPool.length > 0 ? [...learnedPool] : [...vocabulary];
    isListeningMode = true;
  } else {
    activeDeck = learnedPool.length > 0 ? [...learnedPool] : [...vocabulary];
    isListeningMode = false;
  }

  currentIndex = Math.min(startIndex, Math.max(0, activeDeck.length - 1));
  updateModeToggleUI();
  unflipCard(false);
  renderModalCard();
  document.getElementById('wordModal').classList.add('active');
  playCurrentAudio();
}

function closeWordModal() {
  document.getElementById('wordModal').classList.remove('active');
  if (currentAudio) {
    currentAudio.pause();
  }
}

function toggleListeningMode() {
  isListeningMode = !isListeningMode;
  updateModeToggleUI();
  isWordRevealedOnFront = false;
  renderModalCard();
  if (navigator.vibrate) navigator.vibrate(10);
  playCurrentAudio();
}

function updateModeToggleUI() {
  const btn = document.getElementById('modeToggle');
  const icon = document.getElementById('modeIcon');
  if (isListeningMode) {
    btn.classList.add('listening-active');
    icon.textContent = '🎧';
  } else {
    btn.classList.remove('listening-active');
    icon.textContent = '👁️';
  }
}

function flipCard() {
  const inner = document.getElementById('flipCardInner');
  isFlipped = !isFlipped;
  if (isFlipped) {
    inner.classList.add('is-flipped');
  } else {
    inner.classList.remove('is-flipped');
  }
  if (navigator.vibrate) navigator.vibrate(10);
}

function unflipCard(animate = true) {
  const inner = document.getElementById('flipCardInner');
  isFlipped = false;
  if (!animate) {
    inner.style.transition = 'none';
    inner.classList.remove('is-flipped');
    // Force reflow
    void inner.offsetHeight;
    inner.style.transition = '';
  } else {
    inner.classList.remove('is-flipped');
  }
}

function renderModalCard() {
  const word = activeDeck[currentIndex];
  if (!word) return;

  // Counter
  document.getElementById('cardCounter').textContent = `${currentIndex + 1} / ${activeDeck.length}`;

  const frontTag = document.getElementById('frontFaceTag');
  const backTag = document.getElementById('backFaceTag');
  const lessonNum = word.lesson || 1;
  const lessonLabel = lessonNum === 16 ? 'ДОПОЛНЕНИЕ' : `УРОК ${lessonNum}`;
  if (frontTag) frontTag.textContent = `${lessonLabel} · КАРТОЧКА`;
  if (backTag) backTag.textContent = `${lessonLabel} · ПЕРЕВОД И ПРИМЕР`;

  // Front face elements
  const cardArmEl = document.getElementById('cardArmenian');
  cardArmEl.textContent = word.armenian;
  if (word.armenian.length > 12) {
    cardArmEl.style.fontSize = '26px';
  } else if (word.armenian.length > 8) {
    cardArmEl.style.fontSize = '32px';
  } else {
    cardArmEl.style.fontSize = '';
  }

  const listeningCover = document.getElementById('listeningCover');
  const frontWordBox = document.getElementById('frontWordBox');

  if (isListeningMode && !isWordRevealedOnFront) {
    listeningCover.style.display = 'flex';
    frontWordBox.style.display = 'none';
  } else {
    listeningCover.style.display = 'none';
    frontWordBox.style.display = 'flex';
  }

  // Back face elements
  document.getElementById('cardTranslation').textContent = word.translation;
  document.getElementById('cardPhonetic').textContent = word.phonetic ? `[${word.phonetic}]` : '';

  // Examples
  const exArm = document.getElementById('exampleArmenian');
  const exTr = document.getElementById('exampleTranslation');
  const exBox = document.getElementById('exampleBox');

  if (word.example_armenian) {
    exArm.textContent = word.example_armenian;
    exTr.textContent = word.example_translation || '';
    exBox.style.display = 'block';
  } else {
    exBox.style.display = 'none';
  }

  // Dynamic SRS button intervals based on this card's SM-2 state
  const srsPreview = getSRSPreviewIntervals(word);
  const againInterval = document.querySelector('.srs-again .srs-interval');
  const hardInterval = document.querySelector('.srs-hard .srs-interval');
  const goodInterval = document.querySelector('.srs-good .srs-interval');
  const easyInterval = document.querySelector('.srs-easy .srs-interval');
  if (againInterval) againInterval.textContent = srsPreview.again;
  if (hardInterval) hardInterval.textContent = srsPreview.hard;
  if (goodInterval) goodInterval.textContent = srsPreview.good;
  if (easyInterval) easyInterval.textContent = srsPreview.easy;

  // Nav buttons
  document.getElementById('prevCardBtn').style.opacity = currentIndex === 0 ? '0.4' : '1';
  document.getElementById('nextCardBtn').textContent = currentIndex === activeDeck.length - 1 ? 'Завершить' : 'Далее →';
}

function getSRSPreviewIntervals(word) {
  if (!word) return { again: '<10м', hard: '1д', good: '3д', easy: '6д' };

  const reps = parseInt(word.repetitions || 0, 10);
  const interval = parseInt(word.interval_days || 0, 10);
  const ef = parseFloat(word.ease_factor || 2.5);

  function fmtDays(days) {
    if (days === 0) return '<10м';
    if (days === 1) return '1д';
    if (days >= 365) return `${(days / 365).toFixed(1).replace('.0', '')}г`;
    if (days >= 30) return `${Math.round(days / 30)}мес`;
    return `${days}д`;
  }

  // 0: Again — lapse
  const again = '<10м';

  // 1: Hard — tighter reinforcement
  let hardDays = 1;
  if (interval <= 1) {
    hardDays = 1;
  } else if (interval <= 3) {
    hardDays = 2;
  } else {
    hardDays = Math.max(interval + 1, Math.round(interval * 1.2));
  }
  const hard = fmtDays(hardDays);

  // 2: Good — language ladder: 3d -> 7d -> 18d -> 45d
  let goodDays = 3;
  if (interval < 3) {
    goodDays = 3;
  } else if (interval < 7) {
    goodDays = 7;
  } else {
    goodDays = Math.max(interval + 1, Math.round(interval * ef));
  }
  const good = fmtDays(goodDays);

  // 3: Easy — safe language jump: 6d -> 14d -> 22d -> 56d
  let easyDays = 6;
  if (interval < 3) {
    easyDays = 6;
  } else if (interval < 7) {
    easyDays = 14;
  } else {
    easyDays = Math.max(interval + 2, Math.round(interval * ef * 1.25));
  }
  const easy = fmtDays(easyDays);

  return { again, hard, good, easy };
}

function revealWordOnFront() {
  isWordRevealedOnFront = true;
  document.getElementById('listeningCover').style.display = 'none';
  document.getElementById('frontWordBox').style.display = 'flex';
  if (navigator.vibrate) navigator.vibrate(12);
}

async function submitRating(quality) {
  const word = activeDeck[currentIndex];
  if (!word) return;

  if (navigator.vibrate) navigator.vibrate(15);

  const preview = getSRSPreviewIntervals(word);
  const qualityMap = {
    0: { label: 'Снова', interval: preview.again },
    1: { label: 'Трудно', interval: preview.hard },
    2: { label: 'Хорошо', interval: preview.good },
    3: { label: 'Легко', interval: preview.easy },
  };
  const selected = qualityMap[quality] || { label: '', interval: '' };
  showToast(`Оценка: ${selected.label} (${selected.interval})`);

  try {
    const res = await fetch(`/api/vocabulary/${word.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quality }),
    });
    const data = await res.json();
    if (data && data.repetitions !== undefined) {
      word.repetitions = data.repetitions;
      word.interval_days = data.interval_days;
      word.ease_factor = data.ease_factor;
      word.next_review = data.next_review;
    }
  } catch (e) {
    console.error('Error submitting review', e);
  }

  // If "Again" (quality === 0), re-queue card to end of activeDeck so user reinforces it in this session!
  if (quality === 0) {
    activeDeck.push({ ...word });
    showToast('🔁 Слово повторится в конце сессии');
  }

  goToNextCard();
}

function goToNextCard() {
  if (currentIndex < activeDeck.length - 1) {
    currentIndex++;
    isWordRevealedOnFront = false;
    unflipCard(true);
    setTimeout(() => {
      renderModalCard();
      playCurrentAudio();
    }, 200);
  } else {
    closeWordModal();
    showToast('🎉 Тренировка завершена!');
    loadProgress();
    loadVocabulary();
  }
}

function goToPrevCard() {
  if (currentIndex > 0) {
    if (navigator.vibrate) navigator.vibrate(10);
    currentIndex--;
    isWordRevealedOnFront = false;
    unflipCard(true);
    setTimeout(() => {
      renderModalCard();
      playCurrentAudio();
    }, 200);
  }
}

function playCurrentAudio() {
  const word = activeDeck[currentIndex];
  if (!word) return;

  if (currentAudio) {
    currentAudio.pause();
  }

  const btnFront = document.getElementById('audioBtnFront');
  const btnBack = document.getElementById('audioBtnBack');
  const labelFront = document.getElementById('audioLabelFront');
  const labelBack = document.getElementById('audioLabelBack');

  if (btnFront) btnFront.classList.add('playing');
  if (btnBack) btnBack.classList.add('playing');
  if (labelFront) labelFront.textContent = 'Воспроизведение...';
  if (labelBack) labelBack.textContent = 'Воспроизведение...';

  currentAudio = new Audio(`/audio/${word.id}.mp3?v=${Date.now()}`);
  currentAudio.play().then(() => {
    // Playing
  }).catch((err) => {
    console.log('Audio playback info:', err.message);
  });

  currentAudio.onended = () => {
    if (btnFront) btnFront.classList.remove('playing');
    if (btnBack) btnBack.classList.remove('playing');
    if (labelFront) labelFront.textContent = 'Слушать';
    if (labelBack) labelBack.textContent = 'Послушать снова';
  };
}

// === Event Listeners ===

function initModalEvents() {
  document.getElementById('modalClose').addEventListener('click', closeWordModal);
  document.getElementById('wordModal').addEventListener('click', (e) => {
    if (e.target.id === 'wordModal') closeWordModal();
  });

  document.getElementById('modeToggle').addEventListener('click', toggleListeningMode);

  // Flip buttons and card face tap
  document.getElementById('flipToBackBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    flipCard();
  });

  document.getElementById('cardFront').addEventListener('click', (e) => {
    // Don't flip if clicking interactive children
    if (e.target.closest('#audioBtnFront') || e.target.closest('#listeningCover') || e.target.closest('#flipToBackBtn')) {
      return;
    }
    flipCard();
  });

  document.getElementById('flipToFrontBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    flipCard();
  });

  document.getElementById('cardBack').addEventListener('click', (e) => {
    // Don't flip if clicking buttons or SRS
    if (e.target.closest('#audioBtnBack') || e.target.closest('.srs-btn') || e.target.closest('#flipToFrontBtn')) {
      return;
    }
    flipCard();
  });

  // Tapping the listening cover opens the word
  document.getElementById('listeningCover').addEventListener('click', (e) => {
    e.stopPropagation();
    revealWordOnFront();
  });
  document.getElementById('revealWordBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    revealWordOnFront();
  });

  // Audio buttons
  document.getElementById('audioBtnFront').addEventListener('click', (e) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(10);
    playCurrentAudio();
  });

  document.getElementById('audioBtnBack').addEventListener('click', (e) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(10);
    playCurrentAudio();
  });

  // SRS Rating buttons
  document.querySelectorAll('.srs-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = parseInt(btn.dataset.quality, 10);
      submitRating(q);
    });
  });

  // Nav buttons
  document.getElementById('prevCardBtn').addEventListener('click', goToPrevCard);
  document.getElementById('nextCardBtn').addEventListener('click', goToNextCard);
}

function renderActions() {
  const list = document.getElementById('actionsList');
  list.innerHTML = '';

  for (const action of actions) {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    
    let badgeHtml = '';
    if (action.badgeId) {
      badgeHtml = `<span class="review-badge" id="${action.badgeId}" style="display:none;"></span>`;
    }

    btn.innerHTML = `
      <div class="action-icon ${action.cls}">${action.icon}</div>
      <div class="action-text">
        <div class="action-title">${action.title}${badgeHtml}</div>
        <div class="action-desc">${action.desc}</div>
      </div>
      <div class="action-arrow">›</div>
    `;

    btn.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(10);
      if (action.id === 'learn') {
        openLearnModal();
      } else if (action.id === 'review') {
        openWordModal('review', 0);
      } else if (action.id === 'listen') {
        openWordModal('listen', 0);
      } else if (action.id === 'drills') {
        openDrillsModal();
      } else if (action.id === 'grammar') {
        openGrammarModal();
      } else if (action.id === 'reading') {
        openReadingModal();
      } else {
        showToast(`${action.title} — coming soon!`);
      }
    });
    list.appendChild(btn);
  }
}

// =================================================================
// === LEARN WORDS (STAGE-BY-STAGE FLOW ACROSS ALL 5 WORDS)      ===
// =================================================================

const BATCH_SIZE = 5;
let learnLessons = [];
let currentLearnLesson = null;
let currentLessonAllWords = [];
let currentBatchWords = [];

let currentStage = 1; // 1: Знакомство, 2: Выбор, 3: На слух, 4: Буквы
let stageQueue = [];  // active queue of cards for current stage
let stageIndex = 0;   // for stage 1 sequential browsing (0..4)
let currentCard = null;
let currentLearnAudio = null;

// Step 4 (Letter builder) state
let builderTargetLetters = [];
let builderTiles = []; // { id, char, used }
let builderPlaced = []; // { tileId, char }
let lastAssemblySuccess = false;

async function openLearnModal() {
  try {
    const res = await fetch('/api/lessons');
    const data = await res.json();
    learnLessons = data.lessons || [];
    renderLessonsList();
    
    document.getElementById('lessonsScreen').style.display = 'block';
    document.getElementById('studyScreen').style.display = 'none';
    document.getElementById('batchFinishedScreen').style.display = 'none';
    document.getElementById('lessonFinishedScreen').style.display = 'none';
    document.getElementById('learnModal').classList.add('active');
  } catch (err) {
    console.error('Error opening learn modal:', err);
    showToast('Ошибка загрузки уроков');
  }
}

function closeLearnModal() {
  document.getElementById('learnModal').classList.remove('active');
  if (currentLearnAudio) {
    currentLearnAudio.pause();
  }
  loadProgress();
  loadVocabulary();
}

function renderLessonsList() {
  const listEl = document.getElementById('lessonsList');
  listEl.innerHTML = '';

  if (!learnLessons.length) {
    listEl.innerHTML = '<div style="text-align:center; color:var(--text-dim); padding:20px;">Нет доступных уроков</div>';
    return;
  }

  for (const lesson of learnLessons) {
    const card = document.createElement('div');
    card.className = 'lesson-card';
    const total = parseInt(lesson.total_words, 10);
    const learned = parseInt(lesson.learned_words, 10);
    const unlearned = parseInt(lesson.unlearned_words, 10);
    const isCompleted = unlearned === 0;

    card.innerHTML = `
      <div class="lesson-card-info">
        <div class="lesson-card-title">
          <span>${lesson.lesson === 16 ? 'Дополнение' : `Урок ${lesson.lesson}`}</span>
          ${isCompleted 
            ? '<span class="lesson-badge lesson-badge-done">✓ Пройден</span>' 
            : `<span class="lesson-badge lesson-badge-active">${unlearned} новых слов</span>`}
        </div>
        <div class="lesson-card-meta">
          ${learned} / ${total} слов изучено · порции по 5 слов
        </div>
      </div>
      <div class="lesson-card-action">›</div>
    `;

    card.addEventListener('click', () => {
      startLesson(lesson.lesson);
    });

    listEl.appendChild(card);
  }
}

async function startLesson(lessonNum) {
  try {
    const res = await fetch(`/api/vocabulary/learn?lesson=${lessonNum}`);
    const data = await res.json();
    currentLessonAllWords = data.words || [];

    if (currentLessonAllWords.length === 0) {
      showToast('Все слова этого урока уже выучены!');
      return;
    }

    currentLearnLesson = lessonNum;
    startNextBatch();
  } catch (err) {
    console.error('Error starting lesson:', err);
    showToast('Ошибка запуска урока');
  }
}

function startNextBatch() {
  if (currentLessonAllWords.length === 0) {
    showLessonFinishedScreen();
    return;
  }

  currentBatchWords = currentLessonAllWords.slice(0, BATCH_SIZE);

  document.getElementById('lessonsScreen').style.display = 'none';
  document.getElementById('batchFinishedScreen').style.display = 'none';
  document.getElementById('lessonFinishedScreen').style.display = 'none';
  document.getElementById('studyScreen').style.display = 'block';

  startStage(1);
}

function startStage(stage) {
  currentStage = stage;

  // Update pills: active stage is highlighted, previous stages are done
  for (let s = 1; s <= 4; s++) {
    const pill = document.getElementById(`pillStep${s}`);
    if (!pill) continue;
    pill.classList.remove('active', 'done');
    if (s < stage) {
      pill.classList.add('done');
    } else if (s === stage) {
      pill.classList.add('active');
    }
  }

  // Toggle content screens
  for (let s = 1; s <= 4; s++) {
    const content = document.getElementById(`step${s}Content`);
    if (content) {
      content.style.display = (s === stage) ? 'block' : 'none';
    }
  }

  if (stage === 1) {
    stageIndex = 0;
    renderStage1Word();
  } else if (stage === 2) {
    stageQueue = currentBatchWords.map(w => ({ word: w, hasError: false }));
    processStage2Card();
  } else if (stage === 3) {
    stageQueue = currentBatchWords.map(w => ({ word: w, hasError: false }));
    processStage3Card();
  } else if (stage === 4) {
    stageQueue = currentBatchWords.map(w => ({ word: w, hasError: false, hintUsed: false }));
    processStage4Card();
  }
}

function playLearnAudio(wordId) {
  if (currentLearnAudio) {
    currentLearnAudio.pause();
  }
  currentLearnAudio = new Audio(`/audio/${wordId}.mp3?v=${Date.now()}`);
  currentLearnAudio.play().catch(e => console.log('Audio playback info:', e.message));
}

// =================================================================
// === STAGE 1: Знакомство (Все 5 слов подряд)                   ===
// =================================================================

function renderStage1Word() {
  const word = currentBatchWords[stageIndex];
  if (!word) return;

  const counterEl = document.getElementById('studyWordCounter');
  counterEl.textContent = `1. Знакомство · Слово ${stageIndex + 1} / ${currentBatchWords.length}`;

  document.getElementById('step1Armenian').textContent = word.armenian;
  document.getElementById('step1Phonetic').textContent = word.phonetic ? `[${word.phonetic}]` : '';
  document.getElementById('step1Translation').textContent = word.translation;

  const exBox = document.getElementById('step1ExampleBox');
  if (word.example_armenian) {
    document.getElementById('step1ExampleArmenian').textContent = word.example_armenian;
    document.getElementById('step1ExampleTranslation').textContent = word.example_translation || '';
    exBox.style.display = 'block';
  } else {
    exBox.style.display = 'none';
  }

  const nextBtn = document.getElementById('step1NextBtn');
  if (stageIndex < currentBatchWords.length - 1) {
    nextBtn.textContent = `Следующее слово (${stageIndex + 2} / ${currentBatchWords.length}) →`;
  } else {
    nextBtn.textContent = 'Перейти к этапу 2: «Выбор 1 из 4» →';
  }

  playLearnAudio(word.id);
}

function onStep1Next() {
  if (stageIndex < currentBatchWords.length - 1) {
    stageIndex++;
    renderStage1Word();
  } else {
    startStage(2);
  }
}

// =================================================================
// === STAGE 2: Выбор 1 из 4 (Все 5 слов, ошибки в конец)        ===
// =================================================================

function processStage2Card() {
  if (stageQueue.length === 0) {
    showToast('Этап «Выбор 1 из 4» пройден! 🎧');
    setTimeout(() => startStage(3), 600);
    return;
  }

  currentCard = stageQueue[0];
  const word = currentCard.word;

  const counterEl = document.getElementById('studyWordCounter');
  counterEl.textContent = `2. Выбор · Осталось: ${stageQueue.length} из ${currentBatchWords.length}`;

  document.getElementById('step2Armenian').textContent = word.armenian;

  const options = generateQuizOptions(word);
  const grid = document.getElementById('step2OptionsGrid');
  grid.innerHTML = '';

  for (const opt of options) {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      disableGridOptions(grid);
      if (opt === word.translation) {
        btn.classList.add('correct');
        if (navigator.vibrate) navigator.vibrate(12);
        stageQueue.shift();
        setTimeout(() => processStage2Card(), 500);
      } else {
        btn.classList.add('wrong');
        Array.from(grid.querySelectorAll('.quiz-option-btn')).forEach(b => {
          if (b.textContent === word.translation) b.classList.add('correct');
        });
        if (navigator.vibrate) navigator.vibrate(30);
        currentCard.hasError = true;
        showToast('Ошибка! Слово повторится в конце этапа');
        setTimeout(() => {
          stageQueue.shift();
          stageQueue.push(currentCard);
          processStage2Card();
        }, 1200);
      }
    });
    grid.appendChild(btn);
  }
}

// =================================================================
// === STAGE 3: На слух (Все 5 слов, ошибки в конец)             ===
// =================================================================

function processStage3Card() {
  if (stageQueue.length === 0) {
    showToast('Этап «На слух» пройден! ✍️');
    setTimeout(() => startStage(4), 600);
    return;
  }

  currentCard = stageQueue[0];
  const word = currentCard.word;

  const counterEl = document.getElementById('studyWordCounter');
  counterEl.textContent = `3. На слух · Осталось: ${stageQueue.length} из ${currentBatchWords.length}`;

  playLearnAudio(word.id);

  const options = generateQuizOptions(word);
  const grid = document.getElementById('step3OptionsGrid');
  grid.innerHTML = '';

  for (const opt of options) {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      disableGridOptions(grid);
      if (opt === word.translation) {
        btn.classList.add('correct');
        if (navigator.vibrate) navigator.vibrate(12);
        stageQueue.shift();
        setTimeout(() => processStage3Card(), 500);
      } else {
        btn.classList.add('wrong');
        Array.from(grid.querySelectorAll('.quiz-option-btn')).forEach(b => {
          if (b.textContent === word.translation) b.classList.add('correct');
        });
        if (navigator.vibrate) navigator.vibrate(30);
        currentCard.hasError = true;
        showToast('Ошибка! Слово повторится в конце этапа');
        setTimeout(() => {
          stageQueue.shift();
          stageQueue.push(currentCard);
          processStage3Card();
        }, 1200);
      }
    });
    grid.appendChild(btn);
  }
}

function generateQuizOptions(correctWord) {
  const allPool = vocabulary.length > 0 ? vocabulary : currentBatchWords;
  const distractors = allPool
    .filter(w => w.id !== correctWord.id && w.translation !== correctWord.translation)
    .map(w => w.translation);

  const uniqueDistractors = Array.from(new Set(distractors)).sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [correctWord.translation, ...uniqueDistractors];
  return options.sort(() => Math.random() - 0.5);
}

function disableGridOptions(grid) {
  const btns = grid.querySelectorAll('.quiz-option-btn');
  btns.forEach(b => b.disabled = true);
}

// =================================================================
// === STAGE 4: Буквы («Буквособиралка» для всех 5 слов)         ===
// =================================================================

function processStage4Card() {
  if (stageQueue.length === 0) {
    // All 5 words finished stage 4! Batch completely finished!
    currentLessonAllWords = currentLessonAllWords.filter(w => !currentBatchWords.some(bw => bw.id === w.id));
    if (currentLessonAllWords.length === 0) {
      showLessonFinishedScreen();
    } else {
      showBatchFinishedScreen();
    }
    return;
  }

  currentCard = stageQueue[0];
  const word = currentCard.word;

  const counterEl = document.getElementById('studyWordCounter');
  counterEl.textContent = `4. Буквы · Осталось собрать: ${stageQueue.length} из ${currentBatchWords.length}`;

  document.getElementById('step4Translation').textContent = word.translation;

  // IMPORTANT: Hide transcription and audio button initially!
  const phoneticEl = document.getElementById('step4Phonetic');
  const audioBtnEl = document.getElementById('step4AudioBtn');
  phoneticEl.style.display = 'none';
  phoneticEl.textContent = word.phonetic ? `[${word.phonetic}]` : '';
  audioBtnEl.style.display = 'none';

  // Do NOT auto-play audio on step 4
  if (currentLearnAudio) {
    currentLearnAudio.pause();
  }

  document.getElementById('builderRepeatNotice').style.display = 'none';
  document.getElementById('builderSuccessBanner').style.display = 'none';

  // Group Armenian punctuation/intonation marks (՞, ՛, ՜) with the preceding vowel/letter
  // Use lowercase for all tiles so letters don't differ in casing (e.g. Ե vs ե)
  const rawTokens = [];
  const normalizedArmenian = (word.armenian || '').toLowerCase();
  for (let i = 0; i < normalizedArmenian.length; i++) {
    const ch = normalizedArmenian[i];
    if ((ch === '՞' || ch === '՛' || ch === '՜') && rawTokens.length > 0) {
      rawTokens[rawTokens.length - 1] += ch;
    } else {
      rawTokens.push(ch);
    }
  }
  builderTargetLetters = rawTokens;
  builderPlaced = [];

  const nonSpaceLetters = [];
  builderTargetLetters.forEach((char, idx) => {
    if (char !== ' ') {
      nonSpaceLetters.push({ id: idx, char, used: false });
    }
  });

  builderTiles = [...nonSpaceLetters].sort(() => Math.random() - 0.5);

  renderBuilderSlots();
  renderBuilderTiles();
}

function renderBuilderSlots() {
  const container = document.getElementById('letterSlotsContainer');
  container.innerHTML = '';

  let placedIdx = 0;
  builderTargetLetters.forEach((expectedChar) => {
    const slot = document.createElement('div');
    if (expectedChar === ' ') {
      slot.className = 'letter-slot slot-space';
      slot.innerHTML = '&nbsp;';
    } else {
      slot.className = 'letter-slot';
      if (placedIdx < builderPlaced.length) {
        slot.textContent = builderPlaced[placedIdx].char;
        slot.classList.add('filled');
        placedIdx++;
      } else {
        slot.textContent = '';
      }
    }
    container.appendChild(slot);
  });
}

function renderBuilderTiles() {
  const container = document.getElementById('letterTilesContainer');
  container.innerHTML = '';

  builderTiles.forEach((tile) => {
    const tileEl = document.createElement('div');
    tileEl.className = 'letter-tile' + (tile.used ? ' used' : '');
    tileEl.textContent = tile.char;

    tileEl.addEventListener('click', () => {
      if (tile.used) return;
      onTileClick(tile);
    });

    container.appendChild(tileEl);
  });
}

function onTileClick(tile) {
  const requiredCount = builderTargetLetters.filter(c => c !== ' ').length;
  if (builderPlaced.length >= requiredCount) return;

  tile.used = true;
  builderPlaced.push({ tileId: tile.id, char: tile.char });
  if (navigator.vibrate) navigator.vibrate(10);

  renderBuilderSlots();
  renderBuilderTiles();

  if (builderPlaced.length === requiredCount) {
    checkBuilderAssembly();
  }
}

function builderBackspace() {
  if (builderPlaced.length === 0) return;
  const removed = builderPlaced.pop();
  const tile = builderTiles.find(t => t.id === removed.tileId);
  if (tile) tile.used = false;

  renderBuilderSlots();
  renderBuilderTiles();
}

function builderReset() {
  builderPlaced = [];
  builderTiles.forEach(t => t.used = false);
  renderBuilderSlots();
  renderBuilderTiles();
}

function useHintAudio() {
  if (!currentCard) return;
  playLearnAudio(currentCard.word.id);
  currentCard.hintUsed = true;
  currentCard.hasError = true;
  document.getElementById('builderRepeatNotice').style.display = 'block';
  if (navigator.vibrate) navigator.vibrate(15);
}

function useHintLetter() {
  if (!currentCard) return;
  const placedCount = builderPlaced.length;
  let nonSpaceIdx = 0;
  let nextExpectedChar = null;

  for (const c of builderTargetLetters) {
    if (c !== ' ') {
      if (nonSpaceIdx === placedCount) {
        nextExpectedChar = c;
        break;
      }
      nonSpaceIdx++;
    }
  }

  if (!nextExpectedChar) return;

  const tile = builderTiles.find(t => !t.used && t.char.toLowerCase() === nextExpectedChar.toLowerCase());
  if (tile) {
    onTileClick(tile);
    currentCard.hintUsed = true;
    currentCard.hasError = true;
    document.getElementById('builderRepeatNotice').style.display = 'block';
  }
}

async function checkBuilderAssembly() {
  const word = currentCard.word;

  let placedIdx = 0;
  let assembled = '';
  for (const c of builderTargetLetters) {
    if (c === ' ') {
      assembled += ' ';
    } else {
      assembled += builderPlaced[placedIdx].char;
      placedIdx++;
    }
  }

  if (assembled.toLowerCase() === (word.armenian || '').toLowerCase()) {
    // Reveal transcription and audio button
    const phoneticEl = document.getElementById('step4Phonetic');
    const audioBtnEl = document.getElementById('step4AudioBtn');
    phoneticEl.style.display = 'inline-block';
    audioBtnEl.style.display = 'inline-flex';

    // Auto-play audio on correct solution
    playLearnAudio(word.id);

    const iconEl = document.getElementById('builderBannerIcon');
    const titleEl = document.getElementById('builderBannerTitle');
    const descEl = document.getElementById('builderBannerDesc');

    if (currentCard.hasError || currentCard.hintUsed) {
      lastAssemblySuccess = false;
      if (navigator.vibrate) navigator.vibrate([15, 40]);
      iconEl.textContent = '🔁';
      titleEl.textContent = 'Слово собрано!';
      descEl.textContent = 'Были подсказки или ошибки — повторим в конце этапа';
    } else {
      lastAssemblySuccess = true;
      if (navigator.vibrate) navigator.vibrate([15, 60, 20]);
      iconEl.textContent = '🎉';
      titleEl.textContent = 'Отлично! Слово выучено!';
      descEl.textContent = 'Слово добавлено в интервальное повторение';

      try {
        await fetch(`/api/vocabulary/${word.id}/learned`, { method: 'POST' });
        word.is_learned = true;
      } catch (e) {
        console.error('Error marking word learned:', e);
      }
    }

    document.getElementById('builderSuccessBanner').style.display = 'block';
  } else {
    if (navigator.vibrate) navigator.vibrate(30);
    currentCard.hasError = true;
    document.getElementById('builderRepeatNotice').style.display = 'block';
    const slots = document.querySelectorAll('#letterSlotsContainer .letter-slot:not(.slot-space)');
    slots.forEach(s => s.classList.add('wrong'));
    setTimeout(() => {
      slots.forEach(s => s.classList.remove('wrong'));
      builderReset();
    }, 650);
  }
}

function onStep4NextClick() {
  if (lastAssemblySuccess) {
    stageQueue.shift();
  } else {
    currentCard.hasError = false;
    currentCard.hintUsed = false;
    stageQueue.shift();
    stageQueue.push(currentCard);
  }

  processStage4Card();
}

function showBatchFinishedScreen() {
  document.getElementById('studyScreen').style.display = 'none';
  document.getElementById('batchFinishedScreen').style.display = 'block';
  document.getElementById('batchStatsBadge').textContent = `Осталось в уроке: ${currentLessonAllWords.length} слов`;

  loadProgress();
  loadVocabulary();
}

function showLessonFinishedScreen() {
  document.getElementById('studyScreen').style.display = 'none';
  document.getElementById('batchFinishedScreen').style.display = 'none';
  document.getElementById('lessonFinishedScreen').style.display = 'block';
  const lessonName = currentLearnLesson === 16 ? 'блока «Дополнение»' : `урока ${currentLearnLesson}`;
  document.getElementById('celebrationDesc').textContent = 
    `Поздравляем! Все слова ${lessonName} пройдены и добавлены в интервальное повторение!`;

  loadProgress();
  loadVocabulary();
}

function initLearnModalEvents() {
  const modalClose = document.getElementById('learnModalClose');
  const learnModal = document.getElementById('learnModal');
  const backBtn = document.getElementById('backToLessonsBtn');
  const step1NextBtn = document.getElementById('step1NextBtn');
  const step1AudioBtn = document.getElementById('step1AudioBtn');
  const step2AudioBtn = document.getElementById('step2AudioBtn');
  const step3AudioBtn = document.getElementById('step3AudioBtn');
  const step4AudioBtn = document.getElementById('step4AudioBtn');
  const hintAudioBtn = document.getElementById('hintAudioBtn');
  const hintLetterBtn = document.getElementById('hintLetterBtn');
  const backspaceBtn = document.getElementById('builderBackspaceBtn');
  const resetBtn = document.getElementById('builderResetBtn');
  const nextWordBtn = document.getElementById('step4NextWordBtn');
  const nextBatchBtn = document.getElementById('nextBatchBtn');
  const batchBackBtn = document.getElementById('batchBackToLessonsBtn');
  const finishBtn = document.getElementById('finishLessonBtn');

  if (modalClose) modalClose.addEventListener('click', closeLearnModal);
  if (learnModal) {
    learnModal.addEventListener('click', (e) => {
      if (e.target.id === 'learnModal') closeLearnModal();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (currentLearnAudio) currentLearnAudio.pause();
      openLearnModal();
    });
  }

  if (step1NextBtn) {
    step1NextBtn.addEventListener('click', onStep1Next);
  }

  if (step1AudioBtn) {
    step1AudioBtn.addEventListener('click', () => {
      const word = currentBatchWords[stageIndex];
      if (word) playLearnAudio(word.id);
    });
  }

  if (step2AudioBtn) {
    step2AudioBtn.addEventListener('click', () => {
      if (currentCard) playLearnAudio(currentCard.word.id);
    });
  }

  if (step3AudioBtn) {
    step3AudioBtn.addEventListener('click', () => {
      if (currentCard) playLearnAudio(currentCard.word.id);
    });
  }

  if (step4AudioBtn) {
    step4AudioBtn.addEventListener('click', () => {
      if (currentCard) playLearnAudio(currentCard.word.id);
    });
  }

  if (hintAudioBtn) hintAudioBtn.addEventListener('click', useHintAudio);
  if (hintLetterBtn) hintLetterBtn.addEventListener('click', useHintLetter);
  if (backspaceBtn) backspaceBtn.addEventListener('click', builderBackspace);
  if (resetBtn) resetBtn.addEventListener('click', builderReset);
  if (nextWordBtn) nextWordBtn.addEventListener('click', onStep4NextClick);

  if (nextBatchBtn) {
    nextBatchBtn.addEventListener('click', () => {
      startNextBatch();
    });
  }

  if (batchBackBtn) {
    batchBackBtn.addEventListener('click', () => {
      openLearnModal();
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      openLearnModal();
    });
  }
}

// === Toast ===

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #22223a;
      color: #f3f0ea;
      padding: 11px 22px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      opacity: 0;
      transition: all 0.28s ease;
      z-index: 3000;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 1700);
}

// =================================================================
// === BUG REPORT & USER FEEDBACK MODULE                         ===
// =================================================================

let currentFeedbackType = 'bug';
let currentScreenshotBase64 = null;
let currentDiagnosticsData = null;

function collectDiagnostics() {
  const ua = navigator.userAgent;
  let device = 'Desktop';
  if (/Android/i.test(ua)) device = 'Android';
  else if (/iPhone/i.test(ua)) device = 'iPhone';
  else if (/iPad/i.test(ua)) device = 'iPad';
  else if (/Mobile/i.test(ua)) device = 'Mobile';

  // Active view / modal
  let activeModal = 'Main Screen';
  const learnModal = document.getElementById('learnModal');
  const studyModal = document.getElementById('studyModal');
  if (learnModal && learnModal.classList.contains('active')) {
    const studyScreen = document.getElementById('studyScreen');
    const lessonsScreen = document.getElementById('lessonsScreen');
    const batchScreen = document.getElementById('batchFinishedScreen');
    const finishScreen = document.getElementById('lessonFinishedScreen');

    let screenName = 'unknown';
    if (studyScreen && studyScreen.style.display !== 'none') screenName = 'Study Stage ' + (typeof currentStage !== 'undefined' ? currentStage : '?');
    else if (lessonsScreen && lessonsScreen.style.display !== 'none') screenName = 'Lessons List';
    else if (batchScreen && batchScreen.style.display !== 'none') screenName = 'Batch Finished';
    else if (finishScreen && finishScreen.style.display !== 'none') screenName = 'Lesson Finished';

    activeModal = `Learn Words Modal (${screenName})`;
  } else if (studyModal && studyModal.classList.contains('active')) {
    activeModal = `Review/Study Modal (${isListeningMode ? 'Listening Mode' : 'SRS Review'})`;
  }

  // Active card
  const currentCardReview = activeDeck && activeDeck[currentIndex] ? activeDeck[currentIndex] : null;
  const currentCardLearn = typeof currentCard !== 'undefined' ? currentCard : null;

  return {
    device,
    userAgent: ua,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio || 1
    },
    url: window.location.href,
    appState: {
      activeModal,
      isListeningMode,
      isFlipped,
      reviewDeckSize: activeDeck ? activeDeck.length : 0,
      reviewCurrentIndex: currentIndex,
      currentReviewCard: currentCardReview ? {
        id: currentCardReview.id,
        armenian: currentCardReview.armenian,
        translation: currentCardReview.translation,
        stage: currentCardReview.stage
      } : null,
      learnLesson: typeof currentLearnLesson !== 'undefined' && currentLearnLesson ? {
        lesson: currentLearnLesson.lesson,
        total: currentLearnLesson.total_words
      } : null,
      learnStage: typeof currentStage !== 'undefined' ? currentStage : null,
      learnQueueLength: typeof stageQueue !== 'undefined' && stageQueue ? stageQueue.length : 0,
      currentLearnCard: currentCardLearn ? {
        id: currentCardLearn.id,
        armenian: currentCardLearn.armenian,
        translation: currentCardLearn.translation
      } : null
    },
    recentErrors: clientErrorsLog
  };
}

async function captureScreenshotAndOpenFeedback() {
  const bugBtn = document.getElementById('bugFloatBtn');
  const feedbackModal = document.getElementById('feedbackModal');
  const screenshotImg = document.getElementById('feedbackScreenshotImg');
  const commentInput = document.getElementById('feedbackComment');
  const diagnosticsPre = document.getElementById('diagnosticsPre');

  // Temporarily hide bug button so it doesn't cover anything in screenshot
  if (bugBtn) bugBtn.style.visibility = 'hidden';

  try {
    if (typeof html2canvas === 'undefined') {
      showToast('Библиотека скриншотов еще загружается...');
      if (bugBtn) bugBtn.style.visibility = 'visible';
      return;
    }

    // Prevent html2canvas from rendering hidden 3D backface over front face
    const frontFace = document.querySelector('.flip-card-front');
    const backFace = document.querySelector('.flip-card-back');
    const prevFrontDisplay = frontFace ? frontFace.style.display : '';
    const prevBackDisplay = backFace ? backFace.style.display : '';

    if (frontFace && backFace) {
      if (!isFlipped) {
        backFace.style.display = 'none';
      } else {
        frontFace.style.display = 'none';
      }
    }

    // Capture screen
    const canvas = await html2canvas(document.body, {
      scale: Math.min(window.devicePixelRatio || 1, 2),
      useCORS: true,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      backgroundColor: '#0a0a14'
    });

    if (frontFace && backFace) {
      frontFace.style.display = prevFrontDisplay;
      backFace.style.display = prevBackDisplay;
    }

    // Resize canvas if too large to optimize payload size
    const MAX_DIM = 1200;
    let targetW = canvas.width;
    let targetH = canvas.height;
    if (targetW > MAX_DIM || targetH > MAX_DIM) {
      if (targetW > targetH) {
        targetH = Math.round((targetH * MAX_DIM) / targetW);
        targetW = MAX_DIM;
      } else {
        targetW = Math.round((targetW * MAX_DIM) / targetH);
        targetH = MAX_DIM;
      }
    }

    const compressedCanvas = document.createElement('canvas');
    compressedCanvas.width = targetW;
    compressedCanvas.height = targetH;
    const ctx = compressedCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, targetW, targetH);

    // High quality/compressed JPEG (0.65)
    currentScreenshotBase64 = compressedCanvas.toDataURL('image/jpeg', 0.65);

    // Collect diagnostics
    currentDiagnosticsData = collectDiagnostics();

    // Populate modal
    screenshotImg.src = currentScreenshotBase64;
    diagnosticsPre.textContent = JSON.stringify(currentDiagnosticsData, null, 2);
    commentInput.value = '';

    // Default to bug
    setFeedbackType('bug');

    // Show modal
    feedbackModal.classList.add('active');
  } catch (err) {
    console.error('Screenshot capture failed:', err);
    showToast('Не удалось сделать скриншот');
  } finally {
    if (bugBtn) bugBtn.style.visibility = 'visible';
  }
}

function setFeedbackType(type) {
  currentFeedbackType = type;
  const bugTab = document.getElementById('feedbackTypeBug');
  const suggTab = document.getElementById('feedbackTypeSuggestion');
  const titleEl = document.querySelector('.feedback-title');
  const commentLabel = document.querySelector('.feedback-label');

  if (type === 'bug') {
    if (bugTab) bugTab.classList.add('active');
    if (suggTab) suggTab.classList.remove('active');
    if (titleEl) titleEl.textContent = 'Сообщить об ошибке';
    if (commentLabel) commentLabel.textContent = 'Что пошло не так? Опишите проблему:';
  } else {
    if (suggTab) suggTab.classList.add('active');
    if (bugTab) bugTab.classList.remove('active');
    if (titleEl) titleEl.textContent = 'Предложить улучшение';
    if (commentLabel) commentLabel.textContent = 'Ваша идея или пожелание:';
  }
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) modal.classList.remove('active');
}

async function submitFeedbackReport() {
  const submitBtn = document.getElementById('feedbackSubmitBtn');
  const commentInput = document.getElementById('feedbackComment');
  const comment = commentInput ? commentInput.value.trim() : '';

  if (!currentScreenshotBase64 && !comment) {
    showToast('Пожалуйста, добавьте комментарий или сделайте скриншот');
    return;
  }

  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Отправка...';

  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: currentFeedbackType,
        comment: comment,
        screenshot: currentScreenshotBase64,
        diagnostics: currentDiagnosticsData
      })
    });

    const data = await res.json();
    if (res.ok && data.ok) {
      closeFeedbackModal();
      showToast(currentFeedbackType === 'bug' ? '🐞 Отчет об ошибке отправлен! Спасибо!' : '💡 Предложение сохранено! Спасибо!');
    } else {
      showToast('Ошибка при отправке: ' + (data.error || 'попробуйте позже'));
    }
  } catch (err) {
    console.error('Error submitting feedback:', err);
    showToast('Ошибка сети при отправке отчета');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

function initFeedbackEvents() {
  const bugBtn = document.getElementById('bugFloatBtn');
  const closeBtn = document.getElementById('feedbackModalClose');
  const cancelBtn = document.getElementById('feedbackCancelBtn');
  const submitBtn = document.getElementById('feedbackSubmitBtn');
  const bugTab = document.getElementById('feedbackTypeBug');
  const suggTab = document.getElementById('feedbackTypeSuggestion');
  const modal = document.getElementById('feedbackModal');

  if (bugBtn) {
    bugBtn.addEventListener('click', () => {
      captureScreenshotAndOpenFeedback();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeFeedbackModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeFeedbackModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeFeedbackModal();
    });
  }

  if (bugTab) {
    bugTab.addEventListener('click', () => setFeedbackType('bug'));
  }

  if (suggTab) {
    suggTab.addEventListener('click', () => setFeedbackType('suggestion'));
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', submitFeedbackReport);
  }
}

// =================================================================
// === VOCAB LEVELS MODAL (30 УРОВНЕЙ, ПРАВИЛО 21 ДЕНЬ)          ===
// =================================================================

async function openVocabLevelsModal() {
  const modal = document.getElementById('vocabModal');
  if (!modal) return;

  modal.classList.add('active');
  const listEl = document.getElementById('vocabLevelsList');
  if (listEl) {
    listEl.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--text-dim);">Загрузка уровней 1–30...</div>';
  }

  try {
    const res = await fetch('/api/vocabulary/levels');
    const data = await res.json();

    const currentLvlEl = document.getElementById('vocabCurrentLevelText');
    const countEl = document.getElementById('vocabMasteredCountText');
    if (currentLvlEl) currentLvlEl.textContent = `Lv. ${data.vocabLevel || 1} / 30`;
    if (countEl) countEl.textContent = `${data.totalMastered || 0} / ${data.totalWords || 495}`;

    renderVocabLevelsList(data);
  } catch (err) {
    console.error('Error loading vocab levels:', err);
    if (listEl) {
      listEl.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;">Ошибка загрузки уровней.</div>';
    }
  }
}

function closeVocabLevelsModal() {
  const modal = document.getElementById('vocabModal');
  if (modal) modal.classList.remove('active');
}

function renderVocabLevelsList(data) {
  const listEl = document.getElementById('vocabLevelsList');
  if (!listEl) return;
  listEl.innerHTML = '';

  const currentLvl = data.vocabLevel || 1;

  for (const lvl of data.levels) {
    const card = document.createElement('div');
    card.className = 'vocab-level-card';
    if (lvl.is_completed) {
      card.classList.add('completed');
    } else if (lvl.level === currentLvl) {
      card.classList.add('active-user-level');
    }

    let badgeHtml = '';
    if (lvl.is_completed) {
      badgeHtml = '<span class="vocab-level-badge badge-done">✓ Закреплён</span>';
    } else if (lvl.level === currentLvl) {
      badgeHtml = `<span class="vocab-level-badge badge-active">Текущий · ${lvl.mastered}/${lvl.total} слов</span>`;
    } else {
      badgeHtml = `<span class="vocab-level-badge badge-locked">${lvl.mastered}/${lvl.total}</span>`;
    }

    const wordsHtml = (lvl.words || []).map(w => {
      const isMastered = (w.interval_days || 0) >= 21;
      const statusClass = isMastered ? 'mastered' : 'pending';
      const statusLabel = isMastered 
        ? `✓ ${w.interval_days} дн.` 
        : (w.interval_days > 0 ? `${w.interval_days} дн.` : '0 дн.');

      return `
        <div class="vocab-word-row">
          <div class="vocab-word-left">
            <span class="vocab-word-armenian">${w.armenian}</span>
            <span class="vocab-word-phonetic">${w.phonetic ? `[${w.phonetic}]` : ''}</span>
            <span class="vocab-word-translation">— ${w.translation}</span>
          </div>
          <span class="vocab-word-status ${statusClass}" title="Интервал в повторении SRS: ${w.interval_days || 0} дней">${statusLabel}</span>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="vocab-level-header">
        <div class="vocab-level-title-wrap">
          <span class="vocab-level-title">Уровень ${lvl.level}</span>
          ${badgeHtml}
        </div>
        <div class="vocab-level-meta">
          <div class="vocab-level-bar-mini">
            <div class="vocab-level-bar-mini-fill" style="width: ${lvl.percent}%"></div>
          </div>
          <span class="vocab-level-arrow">›</span>
        </div>
      </div>
      <div class="vocab-words-drawer">
        <div style="font-size: 11px; color: var(--text-dim); margin-bottom: 8px;">
          Слова уровня ${lvl.level} (${lvl.total} слов):
        </div>
        ${wordsHtml}
      </div>
    `;

    // Toggle drawer on header click
    const headerEl = card.querySelector('.vocab-level-header');
    headerEl.addEventListener('click', () => {
      card.classList.toggle('open');
    });

    listEl.appendChild(card);
  }
}

function initVocabModalEvents() {
  const closeBtn = document.getElementById('vocabModalClose');
  const modal = document.getElementById('vocabModal');

  if (closeBtn) closeBtn.addEventListener('click', closeVocabLevelsModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeVocabLevelsModal();
    });
  }
}

// =================================================================
// === PATTERN DRILLS MODULE (VOICE RECOGNITION + RE-QUEUE)      ===
// =================================================================

let drillSections = [];
let currentDrillSection = 'lesson_2_3';
let drillQueue = [];
let drillOriginalCount = 0;
let drillTotalAnswered = 0;
let drillCombo = 0;
let drillMaxCombo = 0;
let drillTimerSeconds = 7;
let drillTimerInterval = null;
let drillTimerEndTime = 0;
let drillIsAnswered = false;
let currentDrillAudio = null;

let drillMediaRecorder = null;
let drillAudioChunks = [];
let drillIsRecording = false;

function getDrillStorageKey(sectionId) {
  return `drill_saved_session_${sectionId}`;
}

function saveDrillSessionState() {
  if (!currentDrillSection || !drillQueue || drillQueue.length === 0) return;
  try {
    const state = {
      section: currentDrillSection,
      queue: drillQueue,
      originalCount: drillOriginalCount,
      totalAnswered: drillTotalAnswered,
      combo: drillCombo,
      maxCombo: drillMaxCombo,
      updatedAt: Date.now()
    };
    localStorage.setItem(getDrillStorageKey(currentDrillSection), JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save drill session state:', e);
  }
}

function getSavedDrillSessionState(sectionId) {
  if (!sectionId) return null;
  try {
    const item = localStorage.getItem(getDrillStorageKey(sectionId));
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (parsed && Array.isArray(parsed.queue) && parsed.queue.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse saved drill session state:', e);
  }
  return null;
}

function clearDrillSessionState(sectionId) {
  if (!sectionId) return;
  try {
    localStorage.removeItem(getDrillStorageKey(sectionId));
  } catch (e) {
    console.warn('Failed to clear drill session state:', e);
  }
}

function openDrillsModal() {
  const modal = document.getElementById('drillsModal');
  if (!modal) return;
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
  modal.classList.add('active');
  showDrillView('sections');
  loadDrillSections();
}

function closeDrillsModal() {
  saveDrillSessionState();
  const modal = document.getElementById('drillsModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  stopDrillTimer();
  stopDrillVoiceRecording();
  if (currentDrillAudio) currentDrillAudio.pause();
  loadProgress();
}

function showDrillView(viewName) {
  const secView = document.getElementById('drillsSectionsView');
  const sesView = document.getElementById('drillsSessionView');
  const finView = document.getElementById('drillsFinishedView');

  if (secView) secView.style.display = viewName === 'sections' ? 'block' : 'none';
  if (sesView) sesView.style.display = viewName === 'session' ? 'block' : 'none';
  if (finView) finView.style.display = viewName === 'finished' ? 'block' : 'none';
}

async function loadDrillSections() {
  const listEl = document.getElementById('drillsSectionsList');
  if (!listEl) return;
  listEl.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-dim);">Загрузка разделов...</div>';

  try {
    const res = await fetch('/api/drills/sections');
    const data = await res.json();
    drillSections = data.sections || [];
    renderDrillSectionsList();
  } catch (err) {
    console.error('Error loading drill sections:', err);
    listEl.innerHTML = '<div style="color: #ef4444; padding: 20px;">Ошибка загрузки разделов</div>';
  }
}

function renderDrillSectionsList() {
  const listEl = document.getElementById('drillsSectionsList');
  if (!listEl) return;
  listEl.innerHTML = '';

  if (drillSections.length === 0) {
    listEl.innerHTML = '<div style="color: var(--text-dim); padding: 20px;">Нет доступных разделов.</div>';
    return;
  }

  const sectionDescriptions = {
    lesson_2_3: 'Связка «быть», артикли, местоимения',
    lesson_4: 'Команды, отрицание, спряжение глаголов',
    lesson_5: 'Все 7 падежей армянского языка (70 карточек)'
  };

  for (const sec of drillSections) {
    const subDesc = sectionDescriptions[sec.section] || 'Грамматические шаблоны и говорение';
    const saved = getSavedDrillSessionState(sec.section);

    const card = document.createElement('div');
    card.className = 'drill-section-card';
    card.innerHTML = `
      <div class="drill-section-head-row">
        <div class="drill-section-title">${sec.section_title}</div>
        <span class="drill-section-arrow">›</span>
      </div>
      <div class="drill-section-sub">${subDesc}</div>
      <div class="drill-section-meta">
        ${saved ? `<span class="drill-section-badge resume">▶ Продолжить (${saved.totalAnswered + 1}/${saved.originalCount})</span>` : ''}
        <span class="drill-section-badge">${sec.active_cards} активных · ${sec.mastered_cards} закреплено</span>
      </div>
    `;

    card.addEventListener('click', () => {
      startDrillSession(sec.section);
    });

    listEl.appendChild(card);
  }
}

async function startDrillSession(sectionId = 'lesson_2_3') {
  currentDrillSection = sectionId;

  // 1. Resume saved session if available
  const saved = getSavedDrillSessionState(sectionId);
  if (saved && saved.queue && saved.queue.length > 0) {
    drillQueue = [...saved.queue];
    drillOriginalCount = saved.originalCount || (drillQueue.length + (saved.totalAnswered || 0));
    drillTotalAnswered = saved.totalAnswered || 0;
    drillCombo = saved.combo || 0;
    drillMaxCombo = saved.maxCombo || 0;

    updateDrillComboUI();
    showDrillView('session');
    renderCurrentDrillCard();
    showToast(`Продолжаем с карточки ${drillTotalAnswered + 1} из ${drillOriginalCount}`);
    return;
  }

  // 2. Otherwise load fresh cards from server
  showToast('Загрузка карточек дрилла...');

  try {
    const res = await fetch(`/api/drills/cards?section=${sectionId}`);
    const data = await res.json();
    const rawCards = data.cards || [];

    if (rawCards.length === 0) {
      clearDrillSessionState(sectionId);
      showToast('Все карточки этого раздела уже закреплены (3/3)!');
      return;
    }

    drillQueue = [...rawCards];
    drillOriginalCount = drillQueue.length;
    drillTotalAnswered = 0;
    drillCombo = 0;
    drillMaxCombo = 0;

    saveDrillSessionState();
    updateDrillComboUI();
    showDrillView('session');
    renderCurrentDrillCard();
  } catch (err) {
    console.error('Error starting drill session:', err);
    showToast('Ошибка запуска дрилла');
  }
}

function renderCurrentDrillCard() {
  stopDrillTimer();
  stopDrillVoiceRecording();

  if (drillQueue.length === 0) {
    showDrillFinishedScreen();
    return;
  }

  drillIsAnswered = false;
  const card = drillQueue[0];

  // Header progress
  const pillEl = document.getElementById('drillHeaderPill');
  const counterEl = document.getElementById('drillCardCounter');
  if (pillEl) pillEl.textContent = `${drillTotalAnswered + 1} / ${drillOriginalCount}`;
  if (counterEl) counterEl.textContent = `КАРТОЧКА ${drillTotalAnswered + 1} / ${drillOriginalCount}`;

  // Tag
  const tagEl = document.getElementById('drillQuestionTag');
  if (tagEl) tagEl.textContent = `? ${card.tag}`;

  // Prompt sentence
  const promptTextEl = document.getElementById('drillPromptText');
  const promptTransEl = document.getElementById('drillPromptTrans');
  if (promptTextEl) promptTextEl.textContent = card.prompt_armenian;
  if (promptTransEl) promptTransEl.textContent = `${card.prompt_translation} ${card.prompt_phonetic ? `[${card.prompt_phonetic}]` : ''}`;

  // Audio button for prompt
  const audioBtn = document.getElementById('drillPromptAudioBtn');
  if (audioBtn) {
    audioBtn.onclick = () => playDrillSentence(card.prompt_armenian);
  }

  // Hide feedback, recognition, requeue, rule explanation banners
  const feedbackEl = document.getElementById('drillFeedbackBanner');
  const recognizedEl = document.getElementById('drillRecognizedBox');
  const requeueEl = document.getElementById('drillRequeueHint');
  const ruleExpBanner = document.getElementById('drillRuleExplanationBanner');
  if (feedbackEl) feedbackEl.style.display = 'none';
  if (recognizedEl) recognizedEl.style.display = 'none';
  if (requeueEl) requeueEl.style.display = 'none';
  if (ruleExpBanner) ruleExpBanner.style.display = 'none';

  // Render options A, B, C
  const gridEl = document.getElementById('drillOptionsGrid');
  if (gridEl) {
    gridEl.innerHTML = '';
    const opts = Array.isArray(card.options) ? card.options : [];
    for (const opt of opts) {
      const btn = document.createElement('button');
      btn.className = 'drill-option';
      btn.dataset.key = opt.key;
      btn.innerHTML = `
        <span class="drill-option-badge">${opt.key}</span>
        <span class="drill-option-text">${opt.text}</span>
      `;

      btn.addEventListener('click', () => {
        if (drillIsAnswered) return;
        const isCorrect = opt.key === card.correct_option;
        handleDrillAnswer(opt.key, isCorrect);
      });

      gridEl.appendChild(btn);
    }
  }

  // Next button state
  const nextBtn = document.getElementById('drillNextBtn');
  if (nextBtn) {
    nextBtn.classList.remove('highlight');
  }

  // Reset card scroll
  const cardBox = document.querySelector('.drill-card-box');
  if (cardBox) cardBox.scrollTop = 0;

  // Reset mic button
  resetDrillMicBtn();

  // Start countdown timer
  startDrillCountdown();
}

function startDrillCountdown() {
  const bar = document.getElementById('drillTimerBar');
  if (!bar) return;

  if (drillTimerSeconds === 0) {
    bar.style.width = '100%';
    bar.style.background = '#3b82f6';
    return;
  }

  const durationMs = drillTimerSeconds * 1000;
  drillTimerEndTime = Date.now() + durationMs;
  bar.style.transition = 'none';
  bar.style.width = '100%';
  bar.style.background = '#ef4444';

  requestAnimationFrame(() => {
    bar.style.transition = `width ${drillTimerSeconds}s linear`;
    bar.style.width = '0%';
  });

  drillTimerInterval = setTimeout(() => {
    if (!drillIsAnswered) {
      if (drillIsRecording) stopDrillVoiceRecording();
      handleDrillAnswer(null, false, 'Время вышло!');
    }
  }, durationMs);
}

function stopDrillTimer() {
  if (drillTimerInterval) {
    clearTimeout(drillTimerInterval);
    drillTimerInterval = null;
  }
  const bar = document.getElementById('drillTimerBar');
  if (bar) {
    const computed = window.getComputedStyle(bar).width;
    bar.style.transition = 'none';
    bar.style.width = computed;
  }
}

function updateDrillComboUI() {
  const badge = document.getElementById('drillComboBadge');
  const textEl = document.getElementById('drillComboText');
  if (textEl) textEl.textContent = `${drillCombo}`;
  if (badge) {
    if (drillCombo > 1) {
      badge.style.transform = 'scale(1.1)';
      setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
    }
  }
}

async function handleDrillAnswer(selectedKey, isCorrect, reason = '') {
  if (drillIsAnswered) return;
  drillIsAnswered = true;
  stopDrillTimer();

  const card = drillQueue[0];
  if (!card) return;

  // Highlight options in UI and attach audio button directly to correct option
  const optionBtns = document.querySelectorAll('#drillOptionsGrid .drill-option');
  optionBtns.forEach(btn => {
    btn.classList.add('disabled');
    if (btn.dataset.key === card.correct_option) {
      btn.classList.add('correct');

      // Add audio playback button directly inside the highlighted correct option
      if (!btn.querySelector('.drill-option-audio-btn')) {
        const audioBtn = document.createElement('button');
        audioBtn.type = 'button';
        audioBtn.className = 'drill-option-audio-btn';
        audioBtn.title = 'Послушать правильный ответ';
        audioBtn.innerHTML = '🔊';
        audioBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          playDrillSentence(card.target_armenian);
        });
        btn.appendChild(audioBtn);
      }
      btn.addEventListener('click', () => {
        playDrillSentence(card.target_armenian);
      });
    }
    if (selectedKey && btn.dataset.key === selectedKey && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  // Do NOT duplicate answer at the bottom: keep feedback banner hidden
  const feedbackBanner = document.getElementById('drillFeedbackBanner');
  if (feedbackBanner) feedbackBanner.style.display = 'none';

  const requeueHint = document.getElementById('drillRequeueHint');
  const nextBtn = document.getElementById('drillNextBtn');

  if (isCorrect) {
    if (navigator.vibrate) navigator.vibrate([15, 60, 20]);
    drillCombo++;
    if (drillCombo > drillMaxCombo) drillMaxCombo = drillCombo;
    updateDrillComboUI();

    if (requeueHint) requeueHint.style.display = 'none';
    const ruleExpBanner = document.getElementById('drillRuleExplanationBanner');
    if (ruleExpBanner) ruleExpBanner.style.display = 'none';

    // Remove from queue
    drillQueue.shift();

    // Submit correct result to server
    fetch(`/api/drills/${card.id}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCorrect: true })
    }).catch(console.error);

  } else {
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    drillCombo = 0;
    updateDrillComboUI();

    // Show requeue notice above "Далее"
    if (requeueHint) {
      requeueHint.style.display = 'block';
      requeueHint.textContent = '🔁 Ошибка · повторится через 2 хода';
    }

    // Show Grammar Rule Explanation Banner
    const ruleExpBanner = document.getElementById('drillRuleExplanationBanner');
    const ruleExpTitle = document.getElementById('drillRuleExpTitle');
    const ruleExpBody = document.getElementById('drillRuleExpBody');
    const ruleExpFormula = document.getElementById('drillRuleExpFormula');
    const ruleExpMoreBtn = document.getElementById('drillRuleExpMoreBtn');

    const matchRule = grammarRules.find(r => r.category === card.category || (card.tag && card.tag.includes(r.tag))) ||
                      grammarRules.find(r => r.lesson === card.section);

    if (ruleExpBanner && matchRule) {
      if (ruleExpTitle) ruleExpTitle.textContent = matchRule.title;
      if (ruleExpBody) {
        ruleExpBody.innerHTML = matchRule.shortExplanation || matchRule.desc;
      }
      if (ruleExpFormula && matchRule.formula) {
        ruleExpFormula.style.display = 'block';
        ruleExpFormula.innerHTML = matchRule.formula;
      } else if (ruleExpFormula) {
        ruleExpFormula.style.display = 'none';
      }
      if (ruleExpMoreBtn) {
        ruleExpMoreBtn.onclick = (e) => {
          e.stopPropagation();
          openGrammarModal(matchRule.lesson, matchRule.id);
        };
      }
      ruleExpBanner.style.display = 'flex';

      // Auto-scroll inside card box so user immediately sees explanation
      setTimeout(() => {
        const cardBox = document.querySelector('.drill-card-box');
        if (cardBox) {
          cardBox.scrollTo({ top: cardBox.scrollHeight, behavior: 'smooth' });
        }
      }, 100);
    }

    // Submit error result to server
    fetch(`/api/drills/${card.id}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCorrect: false })
    }).catch(console.error);

    // RE-QUEUE RULE: shift front and insert 2 positions ahead
    const failedCard = drillQueue.shift();
    if (drillQueue.length >= 2) {
      drillQueue.splice(2, 0, failedCard);
    } else {
      drillQueue.push(failedCard);
    }
  }

  // Save current drill state
  saveDrillSessionState();

  // Highlight next button
  if (nextBtn) nextBtn.classList.add('highlight');
}

// === Speech Recognition Input (MediaRecorder -> Groq STT) ===

async function toggleDrillVoiceRecording() {
  if (drillIsAnswered) return;

  if (drillIsRecording) {
    stopDrillVoiceRecording();
  } else {
    startDrillVoiceRecording();
  }
}

async function startDrillVoiceRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    drillAudioChunks = [];
    drillMediaRecorder = new MediaRecorder(stream);

    drillMediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) drillAudioChunks.push(e.data);
    };

    drillMediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      const audioBlob = new Blob(drillAudioChunks, { type: drillMediaRecorder.mimeType || 'audio/webm' });
      await processDrillAudio(audioBlob);
    };

    drillMediaRecorder.start();
    drillIsRecording = true;

    const micBtn = document.getElementById('drillMicBtn');
    const micLabel = document.getElementById('drillMicLabel');
    if (micBtn) micBtn.classList.add('recording');
    if (micLabel) micLabel.textContent = '🔴 Слушаю... говорите';

  } catch (err) {
    console.error('Microphone access error:', err);
    showToast('Нет доступа к микрофону. Разрешите микрофон в браузере.');
  }
}

function stopDrillVoiceRecording() {
  if (drillMediaRecorder && drillMediaRecorder.state !== 'inactive') {
    drillMediaRecorder.stop();
  }
  drillIsRecording = false;
  const micBtn = document.getElementById('drillMicBtn');
  const micLabel = document.getElementById('drillMicLabel');
  if (micBtn) micBtn.classList.remove('recording');
  if (micLabel) micLabel.textContent = '⏳ Распознаю...';
}

function resetDrillMicBtn() {
  drillIsRecording = false;
  const micBtn = document.getElementById('drillMicBtn');
  const micLabel = document.getElementById('drillMicLabel');
  if (micBtn) micBtn.classList.remove('recording');
  if (micLabel) micLabel.textContent = 'Ответить голосом';
}

async function processDrillAudio(audioBlob) {
  const card = drillQueue[0];
  if (!card) {
    resetDrillMicBtn();
    return;
  }

  const recognizedBox = document.getElementById('drillRecognizedBox');
  const recognizedTextEl = document.getElementById('drillRecognizedText');

  try {
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Data = reader.result.split(',')[1];
      const res = await fetch('/api/stt/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Data,
          mimeType: audioBlob.type || 'audio/webm',
          prompt: card.target_armenian
        })
      });

      const data = await res.json();
      resetDrillMicBtn();

      if (!data.ok || !data.text) {
        showToast('Речь не распознана. Попробуйте еще раз или выберите вариант.');
        return;
      }

      const spokenText = data.text.trim();

      // Compare spoken text with target sentence strictly (grammar endings must match)
      const cleanSpoken = normalizeArmenian(spokenText);
      const cleanTarget = normalizeArmenian(card.target_armenian);

      const isMatch = cleanSpoken === cleanTarget;

      if (recognizedBox) {
        recognizedBox.style.display = 'block';
        recognizedBox.className = `drill-recognized-box ${isMatch ? 'success' : 'error'}`;
        recognizedBox.textContent = (isMatch ? '✓ Распознано: ' : '✕ Распознано: ') + `"${spokenText}"`;
      }

      handleDrillAnswer(isMatch ? card.correct_option : null, isMatch);
    };
  } catch (err) {
    console.error('Error sending audio to STT:', err);
    resetDrillMicBtn();
    showToast('Ошибка распознавания речи.');
  }
}

function normalizeArmenian(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/և/g, 'եւ')
    .replace(/[\s\.,:;\?\!\-—«»֊՝՜՛՞]/g, '')
    .trim();
}

function levenshtein(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

async function playDrillSentence(text) {
  if (!text) return;
  try {
    const res = await fetch('/api/drills/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    if (data.url) {
      if (currentDrillAudio) currentDrillAudio.pause();
      currentDrillAudio = new Audio(data.url + '?v=' + Date.now());
      currentDrillAudio.play().catch(e => console.log('Audio playback info:', e.message));
    }
  } catch (err) {
    console.error('Error playing drill TTS:', err);
  }
}

function onDrillNextCard() {
  if (!drillIsAnswered) {
    showToast('Сначала ответьте голосом или выберите вариант');
    return;
  }
  drillTotalAnswered++;
  saveDrillSessionState();
  renderCurrentDrillCard();
}

async function showDrillFinishedScreen() {
  clearDrillSessionState(currentDrillSection);
  stopDrillTimer();
  stopDrillVoiceRecording();
  showDrillView('finished');

  const totalEl = document.getElementById('finishTotalAnswered');
  const comboEl = document.getElementById('finishMaxCombo');
  const masteredEl = document.getElementById('finishMasteredCount');
  if (totalEl) totalEl.textContent = `${drillTotalAnswered}`;
  if (comboEl) comboEl.textContent = `🔥 ${drillMaxCombo}`;

  try {
    const res = await fetch('/api/drills/sections');
    const data = await res.json();
    const sec = (data.sections || []).find(s => s.section === currentDrillSection);
    if (sec && masteredEl) {
      masteredEl.textContent = `${sec.mastered_cards} / ${sec.total_cards}`;
    }
  } catch (e) {
    console.error('Error fetching section stats:', e);
  }

  loadProgress();
}

function initDrillsEvents() {
  const closeBtn = document.getElementById('drillsModalClose');
  const modal = document.getElementById('drillsModal');
  const backBtn = document.getElementById('drillsBackBtn');
  const nextBtn = document.getElementById('drillNextBtn');
  const finishBackBtn = document.getElementById('drillFinishBackBtn');
  const micBtn = document.getElementById('drillMicBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeDrillsModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDrillsModal();
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      saveDrillSessionState();
      stopDrillTimer();
      stopDrillVoiceRecording();
      showDrillView('sections');
      loadDrillSections();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', onDrillNextCard);
  }

  if (finishBackBtn) {
    finishBackBtn.addEventListener('click', () => {
      showDrillView('sections');
      loadDrillSections();
    });
  }

  if (micBtn) {
    micBtn.addEventListener('click', toggleDrillVoiceRecording);
  }

  window.addEventListener('beforeunload', () => {
    saveDrillSessionState();
  });

  const timerPills = document.querySelectorAll('#drillsTimerPills .drill-timer-pill');
  timerPills.forEach(pill => {
    pill.addEventListener('click', () => {
      timerPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      drillTimerSeconds = parseInt(pill.dataset.seconds, 10);
      if (!drillIsAnswered) {
        startDrillCountdown();
      }
    });
  });
  const openGrammarBtn = document.getElementById('openGrammarFromDrillsBtn');
  if (openGrammarBtn) {
    openGrammarBtn.addEventListener('click', () => {
      openGrammarModal(currentDrillSection || 'all');
    });
  }

  const cardRuleBtn = document.getElementById('drillCardRuleBtn');
  if (cardRuleBtn) {
    cardRuleBtn.addEventListener('click', () => {
      openDrillRuleForCurrentCard();
    });
  }
}

function openDrillRuleForCurrentCard() {
  const card = drillQueue[0];
  if (!card) {
    openGrammarModal(currentDrillSection || 'all');
    return;
  }
  const match = grammarRules.find(r => r.category === card.category || (card.tag && card.tag.includes(r.tag))) ||
                grammarRules.find(r => r.lesson === card.section);
  openGrammarModal(match ? match.lesson : (currentDrillSection || 'all'), match ? match.id : null);
}

// =================================================================
// === GRAMMAR GUIDE MODULE (RULES DIVIDED BY LESSONS)           ===
// =================================================================

const grammarRules = [
  // --- УРОК 2-3: СВЯЗКА, АРТИКЛИ, МЕСТОИМЕНИЯ ---
  {
    id: 'definite_indefinite',
    lesson: 'lesson_2_3',
    lessonTitle: 'Урок 2–3',
    sectionId: 'lesson_2_3',
    category: 'definite_indefinite',
    tag: 'MAKE INDEFINITE',
    title: 'Определенность и неопределенность (Артикли)',
    shortExplanation: 'Определенный артикль: <strong>-ը</strong> (после согласных: <em>բժիշկը</em>) или <strong>-ն</strong> (после гласных: <em>տղան</em>). Неопределенность: частица <strong>մի</strong> без артикля (<em>մի բժիշկ</em>).',
    desc: 'В армянском языке существительные бывают определенными (конкретный, известный предмет) и неопределенными (один из многих, некий предмет).',
    detail: '• <strong>Определенный артикль</strong> присоединяется к концу слова:<br>&nbsp;&nbsp;— после согласных: <strong>-ը</strong> (<em>բժիշկ → բժիշկը</em> [bzhishke] «врач»)<br>&nbsp;&nbsp;— после гласных: <strong>-ն</strong> (<em>տղա → տղան</em> [tghan] «мальчик»)<br>• <strong>Неопределенность</strong> выражается частицей <strong>մի</strong> [mi] («какой-то один»), а суффикс <em>-ը/-ն</em> при этом <strong>не ставится</strong>: <em>մի բժիշկ</em> [mi bzhishk] «какой-то врач».',
    formula: 'Определенный: <strong>[Слово] + -ը / -ն</strong><br>Неопределенный: <strong>մի + [Слово без артикля]</strong>',
    examples: [
      {
        armenian: 'Բժիշկը հիվանդանոցում է:',
        phonetic: 'Bzhishke hivandanotsum e',
        translation: 'Врач (конкретный) в больнице'
      },
      {
        armenian: 'Մի բժիշկ հիվանդանոցում է:',
        phonetic: 'Mi bzhishk hivandanotsum e',
        translation: 'Какой-то врач в больнице'
      },
      {
        armenian: 'Ամուսինը եկավ:',
        phonetic: 'Amusine yekav',
        translation: 'Муж пришел (известный муж)'
      },
      {
        armenian: 'Մի ամուսին եկավ:',
        phonetic: 'Mi amusin yekav',
        translation: 'Один какой-то муж пришел'
      }
    ]
  },
  {
    id: 'verb_to_be_plural',
    lesson: 'lesson_2_3',
    lessonTitle: 'Урок 2–3',
    sectionId: 'lesson_2_3',
    category: 'verb_to_be_plural',
    tag: 'MAKE IT PLURAL',
    title: 'Связка «быть» (է / են) и множественное число',
    shortExplanation: 'При множественном числе связка <strong>է</strong> ВСЕГДА меняется на <strong>են</strong>! Окончания: <strong>-եր</strong> (1 слог: <em>տներ, գրքեր</em>) / <strong>-ներ</strong> (многосложные: <em>բժիշկներ</em>).',
    desc: 'В армянском предложении обязательно присутствует вспомогательный глагол «быть». При переходе во множественное число связка <strong>է</strong> ВСЕГДА меняется на <strong>են</strong>!',
    detail: '• <strong>Множественное число существительных:</strong><br>&nbsp;&nbsp;— <strong>-եր</strong> — для односложных корней (<em>գիրք → գրքեր</em> «книги», <em>տուն → տներ</em> «дома»)<br>&nbsp;&nbsp;— <strong>-ներ</strong> — для многосложных слов (<em>խնձոր → խնձորներ</em> «яблоки», <em>բժիշկ → բժիշկներ</em> «врачи»)<br>• Согласование сказуемого: если подлежащее во множественном числе, связка обязательно <strong>են</strong>.',
    formula: 'Ед. число: <strong>Սա [Существительное] է:</strong><br>Мн. число: <strong>Սրանք [Существительное]+-եր/-ներ են:</strong>',
    table: [
      { pr: 'Ես (Я)', v: 'եմ [em]', ex: 'Ես բժիշկ եմ (Я врач)' },
      { pr: 'Դու (Ты)', v: 'ես [es]', ex: 'Դու ուսանող ես (Ты студент)' },
      { pr: 'Նա / Սա / Դա (Он/Это)', v: 'է [e]', ex: 'Սա խնձոր է (Это яблоко)' },
      { pr: 'Մենք (Мы)', v: 'ենք [enk]', ex: 'Մենք ընկերներ ենք (Мы друзья)' },
      { pr: 'Դուք (Вы)', v: 'եք [ek]', ex: 'Դուք բժիշկներ եք (Вы врачи)' },
      { pr: 'Նրանք / Սրանք (Они/Эти)', v: 'են [en]', ex: 'Սրանք խնձորներ են (Это яблоки)' }
    ],
    examples: [
      {
        armenian: 'Սա խնձոր է:',
        phonetic: 'Sa khndzor e',
        translation: 'Это яблоко'
      },
      {
        armenian: 'Սրանք խնձորներ են:',
        phonetic: 'Srankh khndzorner en',
        translation: 'Это яблоки (связка обязательно «են»!)'
      },
      {
        armenian: 'Սա տուն է:',
        phonetic: 'Sa tun e',
        translation: 'Это дом'
      },
      {
        armenian: 'Սրանք տներ են:',
        phonetic: 'Srankh tner en',
        translation: 'Это дома'
      }
    ]
  },
  {
    id: 'demonstratives',
    lesson: 'lesson_2_3',
    lessonTitle: 'Урок 2–3',
    sectionId: 'lesson_2_3',
    category: 'demonstrative_pronouns',
    tag: 'DEMONSTRATIVE',
    title: 'Указательные местоимения (Սա / Դա / Նա)',
    shortExplanation: '<strong>Սա / Սրանք</strong> — этот / эти (близко к себе), <strong>Դա / Դրանք</strong> — тот / те (близко к собеседнику: «у тебя»), <strong>Նա / Նրանք</strong> — вон тот / они (вдали).',
    desc: 'В армянском языке работает трехстепенная система указания, зависящая от расстояния до говорящего и собеседника.',
    detail: '• <strong>Սա</strong> [sa] → мн. ч. <strong>Սրանք</strong> [srankh]: этот / эти (близко к говорящему: «вот это у меня»)<br>• <strong>Դա</strong> [da] → мн. ч. <strong>Դրանք</strong> [drankh]: тот / те (близко к собеседнику: «то у тебя»)<br>• <strong>Նա</strong> [na] → мн. ч. <strong>Նրանք</strong> [nrankh]: вон тот / он / она / они (далеко от обоих участников диалога)',
    formula: 'Ед. ч.: <strong>Սա</strong> / <strong>Դա</strong> / <strong>Նա</strong><br>Мн. ч.: <strong>Սրանք</strong> / <strong>Դրանք</strong> / <strong>Նրանք</strong>',
    examples: [
      {
        armenian: 'Սա գիրք է: → Սրանք գրքեր են:',
        phonetic: 'Sa girk e → Srankh grker en',
        translation: 'Это книга → Это книги'
      },
      {
        armenian: 'Դա աթոռ է: → Դրանք աթոռներ են:',
        phonetic: 'Da ator e → Drankh atorner en',
        translation: 'Это (у тебя) — стул → Это (у тебя) — стулья'
      },
      {
        armenian: 'Նա ուսանող է: → Նրանք ուսանողներ են:',
        phonetic: 'Na usanogh e → Nrankh usanoghner en',
        translation: 'Он студент → Они студенты'
      }
    ]
  },

  // --- УРОК 4: ПОВЕЛИТЕЛЬНОЕ, ОТРИЦАНИЕ, СПРЯЖЕНИЕ ---
  {
    id: 'imperative_commands',
    lesson: 'lesson_4',
    lessonTitle: 'Урок 4',
    sectionId: 'lesson_4',
    category: 'imperative_commands',
    tag: 'COMMAND',
    title: 'Повелительное наклонение (Команды и просьбы)',
    shortExplanation: 'Команда на «ты»: глаголы на <strong>-ել</strong> меняются на <strong>-ի՛ր</strong> (<em>Գրի՛ր, Խոսի՛ր</em>), глаголы на <strong>-ալ</strong> — на <strong>-ա՛</strong> (<em>Կարդա՛</em>). Ударение (՛) на последний слог!',
    desc: 'Как образуются формы приказа и просьбы в единственном числе (обращение на «ты») и множественном (на «вы»).',
    detail: '• Глаголы на <strong>-ել</strong> [-el] меняют окончание на <strong>-ի՛ր</strong> [-ir]:<br>&nbsp;&nbsp;<em>գրել → Գրի՛ր</em> [Grír] «Пиши!»<br>&nbsp;&nbsp;<em>խոսել → Խոսի՛ր</em> [Khosír] «Говори!»<br>&nbsp;&nbsp;<em>ապրել → Ապրի՛ր</em> [Aprír] «Живи!»<br>• Глаголы на <strong>-ալ</strong> [-al] меняют окончание на <strong>-ա՛</strong> [-a]:<br>&nbsp;&nbsp;<em>կարդալ → Կարդա՛</em> [Kardá] «Читай!»<br>• <strong>Знак ударения (շեշտ ՛)</strong> всегда ставится над ударной гласной последнего слога команды!',
    formula: 'Глагол на -ել: основа + <strong>-ի՛ր!</strong><br>Глагол на -ալ: основа + <strong>-ա՛!</strong>',
    examples: [
      {
        armenian: 'Դու գրում ես: → Գրի՛ր:',
        phonetic: 'Du grum es → Grír',
        translation: 'Ты пишешь → Пиши!'
      },
      {
        armenian: 'Դու կարդում ես: → Կարդա՛:',
        phonetic: 'Du kardum es → Kardá',
        translation: 'Ты читаешь → Читай!'
      },
      {
        armenian: 'Դու խոսում ես: → Խոսի՛ր:',
        phonetic: 'Du khosum es → Khosír',
        translation: 'Ты говоришь → Говори!'
      }
    ]
  },
  {
    id: 'negative_particle',
    lesson: 'lesson_4',
    lessonTitle: 'Урок 4',
    sectionId: 'lesson_4',
    category: 'negative_particle',
    tag: 'NEGATIVE',
    title: 'Отрицание глаголов и инверсия порядка слов',
    shortExplanation: 'В отрицании связка встает <strong>ПЕРЕД</strong> смысловым глаголом: <em>Ես չեմ ապրում</em> (не «ապրում չեմ»!). В 3-м лице: строго <strong>չի</strong> (<em>չի ուտում</em>).',
    desc: 'Отрицание в настоящем времени образуется добавлением приставки <strong>չ-</strong> к вспомогательному глаголу.',
    detail: '• <strong>Формы отрицательной связки:</strong><br>&nbsp;&nbsp;<em>չեմ</em> [chem] (я не...), <em>չես</em> [ches] (ты не...), <em>չի</em> [chi] (он/она/оно не...)<br>&nbsp;&nbsp;<em>չենք</em> [chenk] (мы не...), <em>չեք</em> [chek] (вы не...), <em>չեն</em> [chen] (они не...)<br>⚠️ <strong>ГЛАВНОЕ ПРАВИЛО (ИНВЕРСИЯ):</strong><br>В утверждении связка стоит ПОСЛЕ глагола: <em>Ես ապրում եմ</em>.<br>В отрицании связка ОБЯЗАТЕЛЬНО встает <strong>ПЕРЕД</strong> смысловым глаголом: <em>Ես <strong>չեմ</strong> ապրում</em>!',
    formula: 'Утверждение: <strong>[Лицо] + [Глагол-ում] + [связка]</strong><br>Отрицание: <strong>[Лицо] + [չ-связка] + [Глагол-ում]</strong>',
    examples: [
      {
        armenian: 'Ես ապրում եմ: → Ես չեմ ապրում:',
        phonetic: 'Yes aprum em → Yes chem aprum',
        translation: 'Я живу → Я не живу (связка встает перед глаголом!)'
      },
      {
        armenian: 'Դու գրում ես: → Դու չես գրում:',
        phonetic: 'Du grum es → Du ches grum',
        translation: 'Ты пишешь → Ты не пишешь'
      },
      {
        armenian: 'Նա ուտում է: → Նա չի ուտում:',
        phonetic: 'Na utum e → Na chi utum',
        translation: 'Он ест → Он не ест (не «չէ», а строго «չի»!)'
      }
    ]
  },
  {
    id: 'plural_conjugation',
    lesson: 'lesson_4',
    lessonTitle: 'Урок 4',
    sectionId: 'lesson_4',
    category: 'plural_conjugation',
    tag: 'CHANGE TO PLURAL',
    title: 'Спряжение глаголов (Ед. число → Мн. число)',
    shortExplanation: 'Причастие на <strong>-ում</strong> при смене лица не меняется (<em>գնում</em>). Меняется связка: <em>Ես ... եմ → Մենք ... ենք</em>, <em>Դու ... ես → Դուք ... եք</em>, <em>Նա ... է → Նրանք ... են</em>.',
    desc: 'Как преобразовывать фразы в настоящем времени из единственного числа во множественное.',
    detail: 'В армянском языке смысловое причастие на <strong>-ում</strong> при смене лица и числа <strong>НЕ МЕНЯЕТСЯ</strong>!<br>Меняется только личное местоимение и вспомогательный глагол:<br>• <strong>Ես ... եմ</strong> (Я ...) → <strong>Մենք ... ենք</strong> (Мы ...)<br>• <strong>Դու ... ես</strong> (Ты ...) → <strong>Դուք ... եք</strong> (Вы ...)<br>• <strong>Նա ... է</strong> (Он/она ...) → <strong>Նրանք ... են</strong> (Они ...)',
    formula: 'Ես [V]-ում եմ → <strong>Մենք [V]-ում ենք</strong><br>Դու [V]-ում ես → <strong>Դուք [V]-ում եք</strong><br>Նա [V]-ում է → <strong>Նրանք [V]-ում են</strong>',
    examples: [
      {
        armenian: 'Ես գնում եմ: → Մենք գնում ենք:',
        phonetic: 'Yes gnum em → Menq gnum enk',
        translation: 'Я иду → Мы идем'
      },
      {
        armenian: 'Դու նստում ես: → Դուք նստում եք:',
        phonetic: 'Du nstum es → Duk nstum ek',
        translation: 'Ты сидишь → Вы сидите'
      },
      {
        armenian: 'Նա սովորում է: → Նրանք սովորում են:',
        phonetic: 'Na sovorum e → Nrank sovorum en',
        translation: 'Он учится → Они учатся'
      }
    ]
  },

  // --- УРОК 5: ВСЕ 7 ПАДЕЖЕЙ АРМЯНСКОГО ЯЗЫКА ---
  {
    id: 'case_nominative',
    lesson: 'lesson_5',
    lessonTitle: 'Урок 5',
    sectionId: 'lesson_5',
    category: 'case_nominative',
    tag: 'NOMINATIVE (Ո՞վ, Ի՞նչ)',
    title: '1. Именительный падеж (Ուղղական հոլով)',
    shortExplanation: 'Именительный падеж (Ո՞վ / Ի՞նչ). Исходная форма слова (подлежащее). Артикль определенности: <strong>-ը</strong> после согласных (<em>տունը, բժիշկը</em>), <strong>-ն</strong> после гласных (<em>մեքենան</em>).',
    desc: 'Исходная форма существительного. Называет предмет или лицо и отвечает на вопросы Ո՞վ (Кто?) или Ի՞նչ (Что?). Выступает подлежащим в предложении.',
    detail: '• <strong>Определенность:</strong> если предмет конкретный или уже упоминался, присоединяется артикль:<br>&nbsp;&nbsp;— <strong>-ը</strong> — после согласных (<em>տունը, բժիշկը, գիրքը</em>)<br>&nbsp;&nbsp;— <strong>-ն</strong> — после гласных (<em>մեքենան, տղան</em>)<br>• <strong>Неопределенность:</strong> слово остается в чистой форме (<em>մի գիրք, մի տուն</em>).<br>• Во множественном числе: <em>գրքեր / գրքերը, տներ / տները, բժիշկներ / բժիշկները</em>.',
    formula: 'Неопределенное: <strong>[Слово]</strong><br>Определенное: <strong>[Слово] + -ը / -ն</strong>',
    examples: [
      {
        armenian: 'Արամը ուսանող է:',
        phonetic: 'Arame usanogh e',
        translation: 'Арам — студент (Ո՞վ — Кто?)'
      },
      {
        armenian: 'Բժիշկը հիվանդանոցում է:',
        phonetic: 'Bzhishke hivandanotsum e',
        translation: 'Врач в больнице (Ո՞վ — Кто?)'
      },
      {
        armenian: 'Սա նոր գիրք է:',
        phonetic: 'Sa nor girk e',
        translation: 'Это новая книга (Ի՞նչ — Что?)'
      },
      {
        armenian: 'Մեքենան սպիտակ է:',
        phonetic: 'Mekenan spitak e',
        translation: 'Машина белая (Ի՞նչը — Что?)'
      }
    ]
  },
  {
    id: 'case_accusative',
    lesson: 'lesson_5',
    lessonTitle: 'Урок 5',
    sectionId: 'lesson_5',
    category: 'case_accusative',
    tag: 'ACCUSATIVE (Ո՞ւմ, Ի՞նչ)',
    title: '2. Винительный падеж (Հայցական հոլով)',
    shortExplanation: 'Винительный падеж (Ո՞ւմ / Ի՞նչ). <strong>Неодушевленные предметы</strong> совпадают с именительным (<em>Ես գիրք եմ կարդում</em>), а <strong>одушевленные лица (люди)</strong> обязательно принимают форму дательного падежа с артиклем (<em>Ես տեսնում եմ Արամին / բժշկին</em>)!',
    desc: 'Обозначает прямое дополнение (объект действия) и отвечает на вопросы Ո՞ւմ (Кого?), Ի՞նչ (Что?), Ո՞ւր (Куда?).',
    detail: '⚠️ <strong>ГЛАВНОЕ ПРАВИЛО ВИНИТЕЛЬНОГО ПАДЕЖА В АРМЯНСКОМ:</strong><br>• <strong>НЕОДУШЕВЛЕННЫЕ ПРЕДМЕТЫ:</strong> совпадают с Именительным падежом!<br>&nbsp;&nbsp;<em>Ես գիրք եմ կարդում:</em> (Я читаю книгу — форма <em>գիրք</em>, без изменения окончания)<br>&nbsp;&nbsp;<em>Նա ջուր է խմում:</em> (Он пьет воду — форма <em>ջուր</em>)<br>• <strong>ОДУШЕВЛЕННЫЕ ЛИЦА (ЛЮДИ):</strong> ОБЯЗАТЕЛЬНО принимают форму <strong>Дательного падежа</strong> с определенным артиклем (-ին / -ը)!<br>&nbsp;&nbsp;<em>Ես տեսնում եմ Արամ<strong>ին</strong>:</em> (Я вижу Арама — окончание <em>-ին</em>)<br>&nbsp;&nbsp;<em>Նա սիրում է բժշկ<strong>ին</strong>:</em> (Она любит врача)<br>&nbsp;&nbsp;<em>Մենք սպասում ենք ընկերոջ<strong>ը</strong>:</em> (Мы ждем друга)',
    formula: 'Неодушевленное: <strong>[Форма именительного]</strong> (գիրք, ջուր)<br>Одушевленное (человек): <strong>[Форма дательного]</strong> (-ին / -ը)',
    examples: [
      {
        armenian: 'Ես գիրք եմ կարդում:',
        phonetic: 'Yes girk em kardum',
        translation: 'Я читаю книгу (неодуш. = им. п.)'
      },
      {
        armenian: 'Ես տեսնում եմ Արամին:',
        phonetic: 'Yes tesnum em Aramin',
        translation: 'Я вижу Арама (одуш. = дат. п. с -ին!)'
      },
      {
        armenian: 'Նա ջուր է խմում:',
        phonetic: 'Na jur e khmum',
        translation: 'Он пьет воду (неодуш. = им. п.)'
      },
      {
        armenian: 'Մենք սպասում ենք բժշկին:',
        phonetic: 'Menk spasum enk bzhshkin',
        translation: 'Мы ждем врача (одуш. = дат. п.)'
      }
    ]
  },
  {
    id: 'case_genitive',
    lesson: 'lesson_5',
    lessonTitle: 'Урок 5',
    sectionId: 'lesson_5',
    category: 'case_genitive',
    tag: 'GENITIVE (Ո՞ւմ, Ինչի՞)',
    title: '3. Родительный падеж (Սեռական հոլով)',
    shortExplanation: 'Родительный падеж (Ո՞ւմ / Ինչի՞ — Чей? Чего?). Регулярное окончание: <strong>-ի</strong> (<em>Արամի, քաղաքի</em>). Исключения с чередованием: <em>տուն → տան, ընկեր → ընկերոջ, մայր → մոր</em>.',
    desc: 'Выражает принадлежность («чей?») или отношение между предметами. Отвечает на вопросы Ո՞ւմ (Чей? Кого?) или Ինչի՞ (Чего?).',
    detail: '• <strong>Регулярное окончание:</strong> большинство существительных принимают окончание <strong>-ի</strong> [-i]:<br>&nbsp;&nbsp;<em>Արամ → Արամի</em> (Арама: <em>Արամի գիրքը</em> — книга Арама)<br>&nbsp;&nbsp;<em>քաղաք → քաղաքի</em> (города: <em>քաղաքի կենտրոնը</em> — центр города)<br>&nbsp;&nbsp;<em>մեքենա → մեքենայի</em> (машины: <em>մեքենայի բանալին</em> — ключ от машины)<br>• <strong>Слова с чередованием:</strong><br>&nbsp;&nbsp;<em>տուն → տան</em> (дома: <em>տան դուռը</em> — дверь дома)<br>&nbsp;&nbsp;<em>ընկեր → ընկերոջ</em> (друга: <em>ընկերոջ մեքենան</em> — машина друга)<br>&nbsp;&nbsp;<em>մայր → մոր</em> (матери: <em>մոր ձայնը</em> — голос мамы)',
    formula: 'Регулярно: <strong>Основа + -ի</strong><br>Исключения: <strong>տուն → տան, ընկեր → ընկերոջ</strong>',
    examples: [
      {
        armenian: 'Սա Արամի գիրքն է:',
        phonetic: 'Sa Arami girkn e',
        translation: 'Это книга Арама (Ո՞ւմ — Чья?)'
      },
      {
        armenian: 'Սա քաղաքի կենտրոնն է:',
        phonetic: 'Sa kaghaki kentronn e',
        translation: 'Это центр города (Ինչի՞ — Чего?)'
      },
      {
        armenian: 'Սա տան դուռն է:',
        phonetic: 'Sa tan durrn e',
        translation: 'Это дверь дома (տուն → տան)'
      },
      {
        armenian: 'Սա ընկերոջ մեքենան է:',
        phonetic: 'Sa ynkeroj mekenan e',
        translation: 'Это машина друга (ընկեր → ընկերոջ)'
      }
    ]
  },
  {
    id: 'case_dative',
    lesson: 'lesson_5',
    lessonTitle: 'Урок 5',
    sectionId: 'lesson_5',
    category: 'case_dative',
    tag: 'DATIVE (Ո՞ւմ, Ինչի՞ն)',
    title: '4. Дательный падеж (Տրական հոլով)',
    shortExplanation: 'Дательный падеж (Ո՞ւմ / Ինչի՞ն — Кому? Чему?). Образуется от формы родительного падежа + определенный артикль <strong>-ն / -ը</strong> (<em>Արամին, բժշկին, ընկերոջը</em>).',
    desc: 'Обозначает адресата действия (кому отдают, кому звонят, кому говорят). Отвечает на вопросы Ո՞ւմ (Кому?) или Ինչի՞ն (Чему?).',
    detail: '• <strong>Ключевая формула:</strong> В армянском языке Дательный падеж образуется от формы <strong>Родительного падежа + определенный артикль (-ն / -ը)</strong>!<br>&nbsp;&nbsp;<em>Արամի + ն → Արամին</em> (Араму)<br>&nbsp;&nbsp;<em>բժշկի + ն → բժշկին</em> (врачу)<br>&nbsp;&nbsp;<em>ընկերոջ + ը → ընկերոջը</em> (другу)<br>&nbsp;&nbsp;<em>մոր + ը → մորը</em> (матери)<br>&nbsp;&nbsp;<em>քաղաքի + ն → քաղաքին</em> (городу)',
    formula: 'Дательный = <strong>[Родительный падеж] + -ն / -ը</strong>',
    examples: [
      {
        armenian: 'Ես գիրքը տալիս եմ Արամին:',
        phonetic: 'Yes girke talis em Aramin',
        translation: 'Я отдаю книгу Араму (Ո՞ւմ — Кому?)'
      },
      {
        armenian: 'Նա նամակ է գրում մորը:',
        phonetic: 'Na namak e grum more',
        translation: 'Он пишет письмо матери (մայր → մոր → մորը)'
      },
      {
        armenian: 'Ես զանգում եմ բժշկին:',
        phonetic: 'Yes zangum em bzhshkin',
        translation: 'Я звоню врачу (Ո՞ւմ — Кому?)'
      },
      {
        armenian: 'Ես պատասխանում եմ ընկերոջը:',
        phonetic: 'Yes pataskhanum em ynkeroje',
        translation: 'Я отвечаю другу (ընկերոջ + ը)'
      }
    ]
  },
  {
    id: 'case_ablative',
    lesson: 'lesson_5',
    lessonTitle: 'Урок 5',
    sectionId: 'lesson_5',
    category: 'case_ablative',
    tag: 'ABLATIVE (-ից)',
    title: '5. Исходный падеж (Բացառական հոլով)',
    shortExplanation: 'Исходный падеж (Որտեղի՞ց / Ո՞ւմից — Откуда? От кого? Из чего?). Окончание: <strong>-ից</strong> (<em>Երևանից, քաղաքից, տնից, ընկերոջից</em>).',
    desc: 'Обозначает исходную точку движения, удаление («откуда?»), источник информации («от кого?») или материал («из чего?»).',
    detail: '• <strong>Окончание:</strong> почти для всех существительных — <strong>-ից</strong> [-its]:<br>&nbsp;&nbsp;<em>Երևան → Երևանից</em> (из Еревана)<br>&nbsp;&nbsp;<em>քաղաք → քաղաքից</em> (из города)<br>&nbsp;&nbsp;<em>խանութ → խանութից</em> (из магазина)<br>• <strong>Слова с чередованием:</strong><br>&nbsp;&nbsp;<em>տուն → տնից</em> (из дома)<br>&nbsp;&nbsp;<em>ընկեր → ընկերոջից</em> (от друга)<br>&nbsp;&nbsp;<em>բժիշկ → բժշկից</em> (от врача)',
    formula: 'Регулярно: <strong>Основа + -ից</strong><br>Примеры: <strong>Երևանից, քաղաքից, տնից, ընկերոջից</strong>',
    examples: [
      {
        armenian: 'Ես գալիս եմ Երևանից:',
        phonetic: 'Yes galis em Yerevanits',
        translation: 'Я еду из Еревана (Որտեղի՞ց — Откуда?)'
      },
      {
        armenian: 'Նա դուրս եկավ տնից:',
        phonetic: 'Na durs yekav tnits',
        translation: 'Он вышел из дома (տուն → տնից)'
      },
      {
        armenian: 'Ես նվեր ստացա ընկերոջից:',
        phonetic: 'Yes nver statsa ynkerojits',
        translation: 'Я получил подарок от друга (Ո՞ւմից — От кого?)'
      },
      {
        armenian: 'Նա վերադարձավ խանութից:',
        phonetic: 'Na veradardzav khanutits',
        translation: 'Он вернулся из магазина'
      }
    ]
  },
  {
    id: 'case_instrumental',
    lesson: 'lesson_5',
    lessonTitle: 'Урок 5',
    sectionId: 'lesson_5',
    category: 'case_instrumental',
    tag: 'INSTRUMENTAL (-ով)',
    title: '6. Творительный падеж (Գործիական հոլով)',
    shortExplanation: 'Творительный падеж (Ինչո՞վ — Чем? На чем? Как?). Обозначает орудие действия или транспорт. Окончание: <strong>-ով</strong> (<em>ավտոբուսով, մեքենայով, գրիչով</em>).',
    desc: 'Обозначает орудие или средство действия («чем?»), транспорт («на чем?») или образ действия («как?»). Отвечает на вопросы Ինչո՞վ (Чем?), Ինչպե՞ս (Как?).',
    detail: '• <strong>Окончание:</strong> универсальное окончание — <strong>-ով</strong> [-ov]:<br>&nbsp;&nbsp;<em>ավտոբուս → ավտոբուսով</em> (на автобусе / автобусом)<br>&nbsp;&nbsp;<em>մեքենա → մեքենայով</em> (на машине)<br>&nbsp;&nbsp;<em>գրիչ → գրիչով</em> (ручкой: <em>գրել գրիչով</em> — писать ручкой)<br>&nbsp;&nbsp;<em>հաճույք → հաճույքով</em> (с удовольствием)<br>&nbsp;&nbsp;<em>սեր → սիրով</em> (с любовью)',
    formula: 'Окончание: <strong>Основа + -ով</strong><br>Транспорт и орудия: <strong>ավտոբուսով, մեքենայով, գրիչով</strong>',
    examples: [
      {
        armenian: 'Ես գնում եմ ավտոբուսով:',
        phonetic: 'Yes gnum em avtobusov',
        translation: 'Я еду на автобусе (Ինչո՞վ — Чем? На чем?)'
      },
      {
        armenian: 'Նա գրում է գրիչով:',
        phonetic: 'Na grum e grichov',
        translation: 'Он пишет ручкой (орудие действия)'
      },
      {
        armenian: 'Մենք գնում ենք մեքենայով:',
        phonetic: 'Menk gnum enk mekenayov',
        translation: 'Мы едем на машине'
      },
      {
        armenian: 'Ես հաց եմ կտրում դանակով:',
        phonetic: 'Yes hats em ktrum danakov',
        translation: 'Я режу хлеб ножом'
      }
    ]
  },
  {
    id: 'case_locative',
    lesson: 'lesson_5',
    lessonTitle: 'Урок 5',
    sectionId: 'lesson_5',
    category: 'case_locative',
    tag: 'LOCATIVE (-ում)',
    title: '7. Местный падеж (Ներգոյական հոլով)',
    shortExplanation: 'Местный падеж (Որտե՞ղ — Где? В чем?). Окончание: <strong>-ում</strong> (<em>Երևանում, սենյակում</em>). ⚠️ Одушевленные лица местного падежа не имеют (используется <em>մոտ</em>: <em>բժշկի մոտ</em>)!',
    desc: 'Обозначает местонахождение предмета внутри пространства, помещения или города. Отвечает на вопросы Որտե՞ղ (Где?) или Ինչո՞ւմ (В чём?).',
    detail: '• <strong>Окончание:</strong> универсальное окончание — <strong>-ում</strong> [-um]:<br>&nbsp;&nbsp;<em>Երևան → Երևանում</em> (в Ереване: <em>Ես ապրում եմ Երևանում</em>)<br>&nbsp;&nbsp;<em>քաղաք → քաղաքում</em> (в городе)<br>&nbsp;&nbsp;<em>սենյակ → սենյակում</em> (в комнате)<br>&nbsp;&nbsp;<em>դպրոց → դպրոցում</em> (в школе)<br>⚠️ <strong>ОГРАНИЧЕНИЕ: ОДУШЕВЛЕННЫЕ СУЩЕСТВИТЕЛЬНЫЕ НЕ ИМЕЮТ МЕСТНОГО ПАДЕЖА!</strong><br>Нельзя сказать «բժշկում» или «մորում»! Для лиц используется послелог <strong>մոտ</strong> [mot] (у/к):<br>&nbsp;&nbsp;<em>Ես բժշկի մոտ եմ:</em> (Я у врача)<br>&nbsp;&nbsp;<em>Ես ընկերոջս մոտ եմ:</em> (Я у своего друга)',
    formula: 'Неодушевленное место: <strong>Основа + -ում</strong> (Երևանում, սենյակում)<br>Лица (люди): <strong>[Род. п.] + մոտ</strong> (բժշկի մոտ)',
    examples: [
      {
        armenian: 'Ես ապրում եմ Երևանում:',
        phonetic: 'Yes aprum em Yerevanum',
        translation: 'Я живу в Ереване (Որտե՞ղ — Где?)'
      },
      {
        armenian: 'Գիրքը պայուսակում է:',
        phonetic: 'Girke payusakum e',
        translation: 'Книга в сумке (Ինչո՞ւմ — В чем?)'
      },
      {
        armenian: 'Նա հիմա դպրոցում է:',
        phonetic: 'Na hima dprotsum e',
        translation: 'Он сейчас в школе'
      },
      {
        armenian: 'Ես հիմա բժշկի մոտ եմ:',
        phonetic: 'Yes hima bzhshki mot em',
        translation: 'Я сейчас у врача (одуш. через «մոտ»!)'
      }
    ]
  }
];

// =================================================================
// === INTERACTIVE CASE INSPECTOR (DECLENSION EXPLORER)          ===
// =================================================================

const caseWordsData = [
  {
    key: 'tun',
    armenian: 'Տուն',
    meaning: 'дом (нерегулярное)',
    cases: [
      { code: 'nom', name: 'Именительный (Ուղղական)', q: 'Ո՞վ, Ի՞նչ', form: 'տուն / տունը', ph: 'tun / tune', role: 'Подлежащее: дом' },
      { code: 'acc', name: 'Винительный (Հայցական)', q: 'Ի՞նչ, Ո՞ւր', form: 'տուն / տունը', ph: 'tun / tune', role: 'Прямое дополнение: дом' },
      { code: 'gen', name: 'Родительный (Սեռական)', q: 'Ինչի՞', form: 'տան', ph: 'tan', role: 'Чей? дома (տան դուռը)' },
      { code: 'dat', name: 'Дательный (Տրական)', q: 'Ինչի՞ն', form: 'տանը', ph: 'tane', role: 'Чему: дому' },
      { code: 'abl', name: 'Исходный (Բացառական)', q: 'Որտեղի՞ց', form: 'տնից', ph: 'tnits', role: 'Откуда: из дома' },
      { code: 'ins', name: 'Творительный (Գործիական)', q: 'Ինչո՞վ', form: 'տնով', ph: 'tnov', role: 'Чем: домом' },
      { code: 'loc', name: 'Местный (Ներգոյական)', q: 'Որտե՞ղ', form: 'տանը / տան մեջ', ph: 'tane / tan mej', role: 'Где: дома / в доме' }
    ]
  },
  {
    key: 'kaghak',
    armenian: 'Քաղաք',
    meaning: 'город',
    cases: [
      { code: 'nom', name: 'Именительный (Ուղղական)', q: 'Ի՞նչ', form: 'քաղաք / քաղաքը', ph: 'kaghak / kaghake', role: 'Подлежащее: город' },
      { code: 'acc', name: 'Винительный (Հայցական)', q: 'Ի՞նչ, Ո՞ւր', form: 'քաղաք / քաղաքը', ph: 'kaghak / kaghake', role: 'Прямое дополнение: город' },
      { code: 'gen', name: 'Родительный (Սեռական)', q: 'Ինչի՞', form: 'քաղաքի', ph: 'kaghaki', role: 'Чего? города (քաղաքի կենտրոնը)' },
      { code: 'dat', name: 'Дательный (Տրական)', q: 'Ինչի՞ն', form: 'քաղաքին', ph: 'kaghakin', role: 'Чему: городу' },
      { code: 'abl', name: 'Исходный (Բացառական)', q: 'Որտեղի՞ց', form: 'քաղաքից', ph: 'kaghakits', role: 'Откуда: из города' },
      { code: 'ins', name: 'Творительный (Գործիական)', q: 'Ինչո՞վ', form: 'քաղաքով', ph: 'kaghakov', role: 'Чем: городом' },
      { code: 'loc', name: 'Местный (Ներգոյական)', q: 'Որտե՞ղ', form: 'քաղաքում', ph: 'kaghakum', role: 'Где: в городе' }
    ]
  },
  {
    key: 'mekena',
    armenian: 'Մեքենա',
    meaning: 'машина',
    cases: [
      { code: 'nom', name: 'Именительный (Ուղղական)', q: 'Ի՞նչ', form: 'մեքենա / մեքենան', ph: 'mekena / mekenan', role: 'Подлежащее: машина' },
      { code: 'acc', name: 'Винительный (Հայցական)', q: 'Ի՞նչ', form: 'մեքենա / մեքենան', ph: 'mekena / mekenan', role: 'Прямое дополнение: машину' },
      { code: 'gen', name: 'Родительный (Սեռական)', q: 'Ինչի՞', form: 'մեքենայի', ph: 'mekenayi', role: 'Чего? машины (մեքենայի բանալին)' },
      { code: 'dat', name: 'Дательный (Տրական)', q: 'Ինչի՞ն', form: 'մեքենային', ph: 'mekenayin', role: 'Чему: машине' },
      { code: 'abl', name: 'Исходный (Բացառական)', q: 'Որտեղի՞ց', form: 'մեքենայից', ph: 'mekenayits', role: 'Откуда: из машины' },
      { code: 'ins', name: 'Творительный (Գործիական)', q: 'Ինչո՞վ', form: 'մեքենայով', ph: 'mekenayov', role: 'На чем: на машине' },
      { code: 'loc', name: 'Местный (Ներգոյական)', q: 'Որտե՞ղ', form: 'մեքենայում', ph: 'mekenayum', role: 'Где: в машине' }
    ]
  },
  {
    key: 'girk',
    armenian: 'Գիրք',
    meaning: 'книга',
    cases: [
      { code: 'nom', name: 'Именительный (Ուղղական)', q: 'Ի՞նչ', form: 'գիրք / գիրքը', ph: 'girk / girke', role: 'Подлежащее: книга' },
      { code: 'acc', name: 'Винительный (Հայցական)', q: 'Ի՞նչ', form: 'գիրք / գիրքը', ph: 'girk / girke', role: 'Прямое дополнение: книгу' },
      { code: 'gen', name: 'Родительный (Սեռական)', q: 'Ինչի՞', form: 'գրքի', ph: 'grki', role: 'Чего? книги (գրքի էջը)' },
      { code: 'dat', name: 'Дательный (Տրական)', q: 'Ինչի՞ն', form: 'գրքին', ph: 'grkin', role: 'Чему: книге' },
      { code: 'abl', name: 'Исходный (Բացառական)', q: 'Ինչի՞ց', form: 'գրքից', ph: 'grkits', role: 'Из чего: из книги' },
      { code: 'ins', name: 'Творительный (Գործիական)', q: 'Ինչո՞վ', form: 'գրքով', ph: 'grkov', role: 'Чем: книгой' },
      { code: 'loc', name: 'Местный (Ներգոյական)', q: 'Որտե՞ղ', form: 'գրքում', ph: 'grkum', role: 'Где: в книге' }
    ]
  },
  {
    key: 'yerevan',
    armenian: 'Երևան',
    meaning: 'Ереван',
    cases: [
      { code: 'nom', name: 'Именительный (Ուղղական)', q: 'Ի՞նչ', form: 'Երևան / Երևանը', ph: 'Yerevan / Yerevane', role: 'Подлежащее: Ереван' },
      { code: 'acc', name: 'Винительный (Հայցական)', q: 'Ո՞ւր', form: 'Երևան', ph: 'Yerevan', role: 'Куда: в Ереван' },
      { code: 'gen', name: 'Родительный (Սեռական)', q: 'Ինչի՞', form: 'Երևանի', ph: 'Yerevani', role: 'Чего? Еревана' },
      { code: 'dat', name: 'Дательный (Տրական)', q: 'Ինչի՞ն', form: 'Երևանին', ph: 'Yerevanin', role: 'Чему: Еревану' },
      { code: 'abl', name: 'Исходный (Բացառական)', q: 'Որտեղի՞ց', form: 'Երևանից', ph: 'Yerevanits', role: 'Откуда: из Еревана' },
      { code: 'ins', name: 'Творительный (Գործիական)', q: 'Ինչո՞վ', form: 'Երևանով', ph: 'Yerevanov', role: 'Чем: Ереваном' },
      { code: 'loc', name: 'Местный (Ներգոյական)', q: 'Որտե՞ղ', form: 'Երևանում', ph: 'Yerevanum', role: 'Где: в Ереване' }
    ]
  },
  {
    key: 'bzhishk',
    armenian: 'Բժիշկ',
    meaning: 'врач (одушевленное)',
    cases: [
      { code: 'nom', name: 'Именительный (Ուղղական)', q: 'Ո՞վ', form: 'բժիշկ / բժիշկը', ph: 'bzhishk / bzhishke', role: 'Кто? врач' },
      { code: 'acc', name: 'Винительный (Հայցական)', q: 'Ո՞ւմ', form: 'բժշկին', ph: 'bzhshkin', role: 'Кого? врача (= дат. падеж!)' },
      { code: 'gen', name: 'Родительный (Սեռական)', q: 'Ո՞ւմ', form: 'բժշկի', ph: 'bzhshki', role: 'Чей? врача (բժշկի սենյակը)' },
      { code: 'dat', name: 'Дательный (Տրական)', q: 'Ո՞ւմ', form: 'բժշկին', ph: 'bzhshkin', role: 'Кому? врачу' },
      { code: 'abl', name: 'Исходный (Բացառական)', q: 'Ո՞ւմից', form: 'բժշկից', ph: 'bzhshkits', role: 'От кого? от врача' },
      { code: 'ins', name: 'Творительный (Գործիական)', q: 'Ո՞ւմով', form: 'բժշկով', ph: 'bzhshkov', role: 'Кем? врачом' },
      { code: 'loc', name: 'Местный (Ներգոյական)', q: '—', form: '— (нет у лиц)', ph: '—', role: 'Используется «բժշկի մոտ» (у врача)' }
    ]
  },
  {
    key: 'ynker',
    armenian: 'Ընկեր',
    meaning: 'друг (одуш., скл. на -ոջ)',
    cases: [
      { code: 'nom', name: 'Именительный (Ուղղական)', q: 'Ո՞վ', form: 'ընկեր / ընկերը', ph: 'ynker / ynkere', role: 'Кто? друг' },
      { code: 'acc', name: 'Винительный (Հայցական)', q: 'Ո՞ւմ', form: 'ընկերոջը', ph: 'ynkeroje', role: 'Кого? друга (= дат. падеж!)' },
      { code: 'gen', name: 'Родительный (Սեռական)', q: 'Ո՞ւմ', form: 'ընկերոջ', ph: 'ynkeroj', role: 'Чей? друга (ընկերոջ մեքենան)' },
      { code: 'dat', name: 'Дательный (Տրական)', q: 'Ո՞ւմ', form: 'ընկերոջը', ph: 'ynkeroje', role: 'Кому? другу' },
      { code: 'abl', name: 'Исходный (Բացառական)', q: 'Ո՞ւմից', form: 'ընկերոջից', ph: 'ynkerojits', role: 'От кого? от друга' },
      { code: 'ins', name: 'Творительный (Գործիական)', q: 'Ո՞ւմով', form: 'ընկերով', ph: 'ynkerov', role: 'С кем? с другом' },
      { code: 'loc', name: 'Местный (Ներգոյական)', q: '—', form: '— (нет у лиц)', ph: '—', role: 'Используется «ընկերոջ մոտ» (у друга)' }
    ]
  }
];

let activeCaseWordKey = 'tun';

function renderCaseInspector() {
  const container = document.getElementById('grammarCaseInspector');
  if (!container) return;

  const currentWord = caseWordsData.find(w => w.key === activeCaseWordKey) || caseWordsData[0];

  const chipsHtml = caseWordsData.map(w => `
    <button class="case-chip ${w.key === currentWord.key ? 'active' : ''}" data-word-key="${w.key}" type="button">
      <span>${w.armenian}</span>
      <span class="case-chip-meaning">(${w.meaning})</span>
    </button>
  `).join('');

  const rowsHtml = currentWord.cases.map(c => {
    const playText = c.form.includes('/') ? c.form.split('/')[0].trim() : c.form;
    const canPlay = !c.form.startsWith('—');
    return `
      <div class="case-card-row">
        <div class="case-card-top-row">
          <span class="case-badge ${c.code}">${c.name}</span>
          <span class="case-card-q">${c.q}</span>
        </div>
        <div class="case-card-form-row">
          <div class="case-arm-form">
            <span class="case-form-text">${c.form}</span>
            <span class="case-form-phonetic">[${c.ph}]</span>
          </div>
          ${canPlay ? `<button class="case-play-btn" data-arm="${playText}" title="Послушать произношение" type="button">🔊</button>` : ''}
        </div>
        <div class="case-card-role-row">
          <span class="case-role-text">${c.role}</span>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="case-inspector-header">
      <div class="case-inspector-title">
        <span>🔬</span>
        <span>Интерактивный тренажер: Склонение по 7 падежам</span>
      </div>
      <div class="case-inspector-sub">Выберите слово, чтобы увидеть его изменение по всем падежам с озвучкой 🔊</div>
    </div>
    <div class="case-chips-wrap">
      ${chipsHtml}
    </div>
    <div class="case-cards-list">
      ${rowsHtml}
    </div>
  `;

  // Attach chip events
  const chips = container.querySelectorAll('.case-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      activeCaseWordKey = chip.dataset.wordKey;
      renderCaseInspector();
    });
  });

  // Attach audio buttons
  const audioBtns = container.querySelectorAll('.case-play-btn');
  audioBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playDrillSentence(btn.dataset.arm);
    });
  });
}

let activeGrammarLesson = 'all';

function openGrammarModal(filterLesson = 'all', focusRuleId = null) {
  const modal = document.getElementById('grammarModal');
  if (!modal) return;
  document.body.style.overflow = 'hidden';
  modal.classList.add('active');

  // Update tabs UI
  activeGrammarLesson = filterLesson || 'all';
  const tabs = document.querySelectorAll('#grammarTabs .grammar-tab');
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.lesson === activeGrammarLesson);
  });

  renderGrammarRules(activeGrammarLesson, focusRuleId);
}

function closeGrammarModal() {
  const modal = document.getElementById('grammarModal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
}

function renderGrammarRules(filterLesson = 'all', focusRuleId = null) {
  const listEl = document.getElementById('grammarRulesList');
  if (!listEl) return;
  listEl.innerHTML = '';

  const inspectorEl = document.getElementById('grammarCaseInspector');
  if (inspectorEl) {
    if (filterLesson === 'lesson_5' || filterLesson === 'all') {
      inspectorEl.style.display = 'block';
      renderCaseInspector();
    } else {
      inspectorEl.style.display = 'none';
    }
  }

  if (!focusRuleId) {
    const scrollBody = document.getElementById('grammarScrollBody');
    if (scrollBody) scrollBody.scrollTop = 0;
  }

  const filtered = filterLesson === 'all'
    ? grammarRules
    : grammarRules.filter(r => r.lesson === filterLesson);

  if (filtered.length === 0) {
    listEl.innerHTML = '<div style="color: var(--text-dim); text-align: center; padding: 20px;">Нет правил в этом разделе.</div>';
    return;
  }

  for (const r of filtered) {
    const card = document.createElement('div');
    card.className = 'grammar-rule-card';
    card.id = `rule_${r.id}`;

    let tableHtml = '';
    if (Array.isArray(r.table) && r.table.length > 0) {
      tableHtml = `
        <div class="grammar-table-wrap">
          <table class="grammar-table">
            <thead>
              <tr>
                <th>Местоимение</th>
                <th>Связка</th>
                <th>Пример</th>
              </tr>
            </thead>
            <tbody>
              ${r.table.map(row => `
                <tr>
                  <td><strong>${row.pr}</strong></td>
                  <td><span style="color: #60a5fa; font-weight: 700;">${row.v}</span></td>
                  <td>${row.ex}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    let examplesHtml = '';
    if (Array.isArray(r.examples) && r.examples.length > 0) {
      examplesHtml = `
        <div class="grammar-examples-wrap">
          ${r.examples.map(ex => `
            <div class="grammar-example-item">
              <div class="grammar-example-text">
                <div class="grammar-example-arm">${ex.armenian}</div>
                <div class="grammar-example-sub">${ex.translation} ${ex.phonetic ? `[${ex.phonetic}]` : ''}</div>
              </div>
              <button class="grammar-play-btn" data-arm="${ex.armenian}" title="Послушать произношение" type="button">🔊</button>
            </div>
          `).join('')}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="grammar-rule-header">
        <div class="grammar-rule-badges">
          <span class="grammar-badge-lesson">${r.lessonTitle}</span>
          <span class="grammar-badge-tag">${r.tag}</span>
        </div>
      </div>
      <div class="grammar-rule-title">${r.title}</div>
      <div class="grammar-rule-desc">${r.desc}</div>
      <div class="grammar-rule-detail">${r.detail}</div>
      <div class="grammar-formula-box">${r.formula}</div>
      ${tableHtml}
      ${examplesHtml}
      <button class="grammar-train-btn" data-section="${r.sectionId}" type="button">
        <span>🎯 Тренировать в дриллах</span>
        <span>›</span>
      </button>
    `;

    // Attach audio events
    const audioBtns = card.querySelectorAll('.grammar-play-btn');
    audioBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        playDrillSentence(btn.dataset.arm);
      });
    });

    // Attach train button
    const trainBtn = card.querySelector('.grammar-train-btn');
    if (trainBtn) {
      trainBtn.addEventListener('click', () => {
        closeGrammarModal();
        openDrillsModal();
        startDrillSession(r.sectionId);
      });
    }

    listEl.appendChild(card);
  }

  // Scroll to focused rule if provided
  if (focusRuleId) {
    setTimeout(() => {
      const targetCard = document.getElementById(`rule_${focusRuleId}`);
      const scrollBody = document.getElementById('grammarScrollBody');
      if (targetCard && scrollBody) {
        scrollBody.scrollTo({ top: Math.max(0, targetCard.offsetTop - 16), behavior: 'smooth' });
        targetCard.style.borderColor = '#f59e0b';
        targetCard.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.4)';
        setTimeout(() => {
          targetCard.style.borderColor = '';
          targetCard.style.boxShadow = '';
        }, 2200);
      }
    }, 100);
  }
}

function initGrammarModalEvents() {
  const closeBtn = document.getElementById('grammarModalClose');
  const modal = document.getElementById('grammarModal');

  if (closeBtn) closeBtn.addEventListener('click', closeGrammarModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGrammarModal();
    });
  }

  const tabs = document.querySelectorAll('#grammarTabs .grammar-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeGrammarLesson = tab.dataset.lesson;
      renderGrammarRules(activeGrammarLesson);
    });
  });
}

// ==========================================================================
// === READING MODULE: CHUNKS & RHYTHM TRAINER (L1, L2, L3, L4)           ===
// ==========================================================================

const readingStories = [
  {
    id: 'leo_lost_box',
    title: 'Խուզարկու Լեոն և կորած արկղիկը',
    subtitle: 'Детектив Лео и пропавшая шкатулка',
    level: 'A1',
    paragraphs: [
      {
        id: 1,
        chunks: [
          { text: 'Այսօր', type: 'prep', phonetic: 'aysor', translation: 'Сегодня' },
          { text: 'Նյու Հեյվեն քաղաքում', type: 'prep', phonetic: 'Nyu Heyven qaghaqum', translation: 'в городе Нью-Хейвен' },
          { text: 'ցուրտ առավոտ է:', type: 'verb', phonetic: 'tsurt aravot e', translation: 'холодное утро.' },
          { text: 'Անձրև է գալիս:', type: 'verb', phonetic: 'andzrev e galis', translation: 'Идёт дождь.' },
          { text: 'Ջուրը', type: 'subj', phonetic: 'jure', translation: 'Вода' },
          { text: 'թափվում է', type: 'verb', phonetic: 'tapvum e', translation: 'льётся' },
          { text: 'փողոցներին:', type: 'prep', phonetic: 'poghotsnerin', translation: 'на улицы.' },
          { text: 'Երկինքը', type: 'subj', phonetic: 'yerkinqe', translation: 'Небо' },
          { text: 'մոխրագույն է:', type: 'verb', phonetic: 'mokhraguyn e', translation: 'серое.' }
        ]
      },
      {
        id: 2,
        chunks: [
          { text: 'Խուզարկու Լեոն', type: 'subj', phonetic: 'Khuzarku Leon', translation: 'Детектив Лео' },
          { text: 'նստած է', type: 'verb', phonetic: 'nstats e', translation: 'сидит' },
          { text: 'իր սենյակում՝', type: 'prep', phonetic: 'ir senyakum', translation: 'в своей комнате —' },
          { text: 'սեղանի մոտ:', type: 'prep', phonetic: 'seghani mot', translation: 'у стола.' },
          { text: 'Նա', type: 'subj', phonetic: 'na', translation: 'Он' },
          { text: 'հագել է', type: 'verb', phonetic: 'hagel e', translation: 'надел' },
          { text: 'տաք սվիտեր:', type: 'obj', phonetic: 'taq sviter', translation: 'тёплый свитер.' },
          { text: 'Նա', type: 'subj', phonetic: 'na', translation: 'Он' },
          { text: 'նստած է', type: 'verb', phonetic: 'nstats e', translation: 'сидит' },
          { text: 'աթոռին', type: 'prep', phonetic: 'atorin', translation: 'на стуле' },
          { text: 'և', type: 'conn', phonetic: 'yev', translation: 'и' },
          { text: 'խմում է', type: 'verb', phonetic: 'khmum e', translation: 'пьёт' },
          { text: 'տաք սև սուրճ', type: 'obj', phonetic: 'taq sev surch', translation: 'горячий чёрный кофе' },
          { text: 'մի բաժակից:', type: 'prep', phonetic: 'mi bazhakits', translation: 'из чашки.' },
          { text: 'Սուրճը', type: 'subj', phonetic: 'surche', translation: 'Кофе' },
          { text: 'համեղ է:', type: 'verb', phonetic: 'hamegh e', translation: 'вкусный.' },
          { text: 'Լեոյի ընկերը՝ Միան,', type: 'subj', phonetic: 'Leoyi enkere՝ Mian', translation: 'Подруга Лео — Миа,' },
          { text: 'նստած է', type: 'verb', phonetic: 'nstats e', translation: 'сидит' },
          { text: 'պատուհանի մոտ:', type: 'prep', phonetic: 'patuhani mot', translation: 'у окна.' },
          { text: 'Միան', type: 'subj', phonetic: 'Mian', translation: 'Миа' },
          { text: 'նայում է', type: 'verb', phonetic: 'nayum e', translation: 'смотрит' },
          { text: 'առավոտյան լուրերը:', type: 'obj', phonetic: 'aravotyan lurere', translation: 'утренние новости.' },
          { text: 'Սենյակում', type: 'prep', phonetic: 'senyakum', translation: 'В комнате' },
          { text: 'լուռ է:', type: 'verb', phonetic: 'lurr e', translation: 'тихо.' }
        ]
      },
      {
        id: 3,
        chunks: [
          { text: 'Հանկարծ', type: 'prep', phonetic: 'Hankarts', translation: 'Внезапно' },
          { text: 'դուռը', type: 'subj', phonetic: 'durre', translation: 'дверь' },
          { text: 'բացվում է:', type: 'verb', phonetic: 'batsvum e', translation: 'открывается.' },
          { text: 'Ներս է մտնում', type: 'verb', phonetic: 'Ners e mtnum', translation: 'Входит внутрь' },
          { text: 'պապիկ Արթուրը:', type: 'subj', phonetic: 'papik Arture', translation: 'дедушка Артур.' },
          { text: 'Նա', type: 'subj', phonetic: 'na', translation: 'Он' },
          { text: 'հագել է', type: 'verb', phonetic: 'hagel e', translation: 'надел' },
          { text: 'թաց վերարկու:', type: 'obj', phonetic: 'tats verarku', translation: 'мокрое пальто.' },
          { text: 'Արթուրը', type: 'subj', phonetic: 'Arture', translation: 'У Артура' },
          { text: 'ունի', type: 'verb', phonetic: 'uni', translation: 'есть' },
          { text: 'հին խանութ՝', type: 'obj', phonetic: 'hin khanut', translation: 'старый магазин —' },
          { text: 'ներքևում:', type: 'prep', phonetic: 'nerqevum', translation: 'внизу.' },
          { text: 'Արթուրի ձեռքերը', type: 'subj', phonetic: 'Arturi dzerqere', translation: 'Руки Артура' },
          { text: 'դողում են:', type: 'verb', phonetic: 'doghum yen', translation: 'дрожат.' }
        ]
      },
      {
        id: 4,
        chunks: [
          { text: '«Խուզարկու Լեո, Միա,', type: 'subj', phonetic: 'Khuzarku Leo, Mia', translation: '«Детектив Лео, Миа,' },
          { text: 'խնդրում եմ,', type: 'verb', phonetic: 'khndrum yem', translation: 'пожалуйста,' },
          { text: 'օգնեք ինձ»,—', type: 'verb', phonetic: 'ogneq indz', translation: 'помогите мне», —' },
          { text: 'ասում է', type: 'verb', phonetic: 'asum e', translation: 'говорит' },
          { text: 'պապիկ Արթուրը:', type: 'subj', phonetic: 'papik Arture', translation: 'дедушка Артур.' },
          { text: '«Գիշերը', type: 'prep', phonetic: 'Gishere', translation: '«Ночью' },
          { text: 'իմ խանութում', type: 'prep', phonetic: 'im khanutum', translation: 'в моём магазине' },
          { text: 'վատ բան է եղել»:', type: 'verb', phonetic: 'vat ban e yeghel', translation: 'случилась беда».' }
        ]
      },
      {
        id: 5,
        chunks: [
          { text: 'Լեոն', type: 'subj', phonetic: 'Leon', translation: 'Лео' },
          { text: 'դնում է', type: 'verb', phonetic: 'dnum e', translation: 'ставит' },
          { text: 'բաժակը', type: 'obj', phonetic: 'bazhake', translation: 'чашку' },
          { text: 'սեղանին:', type: 'prep', phonetic: 'seghanin', translation: 'на стол.' },
          { text: 'Նա', type: 'subj', phonetic: 'na', translation: 'Он' },
          { text: 'արագ', type: 'prep', phonetic: 'arag', translation: 'быстро' },
          { text: 'բարձրանում է:', type: 'verb', phonetic: 'bardzranum e', translation: 'встаёт.' },
          { text: '«Նստիր, Արթուր»,—', type: 'verb', phonetic: 'Nstir, Artur', translation: '«Садись, Артур», —' },
          { text: 'սիրով', type: 'prep', phonetic: 'sirov', translation: 'с добротой' },
          { text: 'ասում է', type: 'verb', phonetic: 'asum e', translation: 'говорит' },
          { text: 'Լեոն:', type: 'subj', phonetic: 'Leon', translation: 'Лео.' },
          { text: '«Խմիր', type: 'verb', phonetic: 'Khmir', translation: '«Выпей' },
          { text: 'մի քիչ տաք ջուր', type: 'obj', phonetic: 'mi qich taq jur', translation: 'немного тёплой воды' },
          { text: 'և', type: 'conn', phonetic: 'yev', translation: 'и' },
          { text: 'պատմիր՝', type: 'verb', phonetic: 'patmir', translation: 'расскажи —' },
          { text: 'ի՞նչ է եղել', type: 'verb', phonetic: 'inch e yeghel', translation: 'что случилось' },
          { text: 'խանութում»:', type: 'prep', phonetic: 'khanutum', translation: 'в магазине».' }
        ]
      },
      {
        id: 6,
        chunks: [
          { text: 'Արթուրը', type: 'subj', phonetic: 'Arture', translation: 'Артур' },
          { text: 'նստում է', type: 'verb', phonetic: 'nstum e', translation: 'садится' },
          { text: 'աթոռին:', type: 'prep', phonetic: 'atorin', translation: 'на стул.' },
          { text: 'Նա', type: 'subj', phonetic: 'na', translation: 'Он' },
          { text: 'մի քիչ', type: 'prep', phonetic: 'mi qich', translation: 'немного' },
          { text: 'լռում է,', type: 'verb', phonetic: 'lrum e', translation: 'молчит,' },
          { text: 'ապա', type: 'conn', phonetic: 'apa', translation: 'затем' },
          { text: 'սկսում է պատմել:', type: 'verb', phonetic: 'sksum e patmel', translation: 'начинает рассказывать.' },
          { text: '«Գիշերը', type: 'prep', phonetic: 'Gishere', translation: '«Ночью' },
          { text: 'եղանակը', type: 'subj', phonetic: 'yeghanake', translation: 'погода' },
          { text: 'վատ էր:', type: 'verb', phonetic: 'vat er', translation: 'была плохой.' },
          { text: 'Ինչ-որ մեկը', type: 'subj', phonetic: 'Inch-vor meke', translation: 'Кто-то' },
          { text: 'կոտրել է', type: 'verb', phonetic: 'kotrel e', translation: 'разбил' },
          { text: 'իմ խանութի պատուհանը:', type: 'obj', phonetic: 'im khanuti patuhane', translation: 'окно моего магазина.' },
          { text: 'Այդ մարդը', type: 'subj', phonetic: 'Ayd marde', translation: 'Этот человек' },
          { text: 'չի վերցրել', type: 'verb', phonetic: 'chi vercrel', translation: 'не взял' },
          { text: 'իմ ոսկին', type: 'obj', phonetic: 'im voskin', translation: 'моё золото' },
          { text: 'կամ', type: 'conn', phonetic: 'kam', translation: 'или' },
          { text: 'իմ հին ժամացույցները:', type: 'obj', phonetic: 'im hin zhamatsuytsnere', translation: 'мои старинные часы.' },
          { text: 'Նա', type: 'subj', phonetic: 'na', translation: 'Он' },
          { text: 'վերցրել է', type: 'verb', phonetic: 'vercrel e', translation: 'взял' },
          { text: 'միայն մեկ բան՝', type: 'obj', phonetic: 'miayn mek ban', translation: 'только одну вещь —' },
          { text: 'հին երաժշտական արկղիկ:', type: 'obj', phonetic: 'hin yerazhshtakan arkghik', translation: 'старинную музыкальную шкатулку.' },
          { text: 'Դա', type: 'subj', phonetic: 'da', translation: 'Это' },
          { text: 'իմ տատիկից ու պապիկից մնացած', type: 'prep', phonetic: 'im tatikits u papikits mnatsats', translation: 'оставшаяся от дедушки и бабушки' },
          { text: 'ընտանեկան իր է:', type: 'verb', phonetic: 'entanekan ir e', translation: 'семейная реликвия.' },
          { text: 'Արկղիկի մեջ', type: 'prep', phonetic: 'Arkghiki mej', translation: 'В шкатулке' },
          { text: 'կա', type: 'verb', phonetic: 'ka', translation: 'есть' },
          { text: 'գաղտնի անցք', type: 'subj', phonetic: 'gaghni antsq', translation: 'секретное отверстие' },
          { text: 'և', type: 'conn', phonetic: 'yev', translation: 'и' },
          { text: 'թաքնված գրություն»:', type: 'subj', phonetic: 'taqnvats grutyun', translation: 'спрятанная записка».' }
        ]
      },
      {
        id: 7,
        chunks: [
          { text: 'Միան', type: 'subj', phonetic: 'Mian', translation: 'Миа' },
          { text: 'բացում է', type: 'verb', phonetic: 'batsum e', translation: 'открывает' },
          { text: 'իր նոութբուքը:', type: 'obj', phonetic: 'ir noutbuqe', translation: 'свой ноутбук.' },
          { text: '«Ինչ-որ մեկին', type: 'obj', phonetic: 'Inch-vor mekin', translation: '«Кого-нибудь' },
          { text: 'տեսա՞ր', type: 'verb', phonetic: 'tesar', translation: 'ты видел' },
          { text: 'խանութի մոտ, Արթուր»,—', type: 'prep', phonetic: 'khanuti mot, Artur', translation: 'у магазина, Артур?» —' },
          { text: 'հարցնում է', type: 'verb', phonetic: 'hartsnum e', translation: 'спрашивает' },
          { text: 'Միան:', type: 'subj', phonetic: 'Mian', translation: 'Миа.' },
          { text: 'Արթուրը', type: 'subj', phonetic: 'Arture', translation: 'Артур' },
          { text: 'ասում է.', type: 'verb', phonetic: 'asum e', translation: 'говорит:' },
          { text: '«Ոչ,', type: 'prep', phonetic: 'Voch', translation: '«Нет,' },
          { text: 'փողոցը', type: 'subj', phonetic: 'poghotse', translation: 'улица' },
          { text: 'մութ էր ու դատարկ:', type: 'verb', phonetic: 'mut er u datark', translation: 'была тёмной и пустой.' },
          { text: 'Բայց', type: 'conn', phonetic: 'Bayts', translation: 'Но' },
          { text: 'խանութի հատակը', type: 'subj', phonetic: 'khanuti hatake', translation: 'пол магазина' },
          { text: 'թաց էր:', type: 'verb', phonetic: 'tats er', translation: 'был влажным.' },
          { text: 'Ես', type: 'subj', phonetic: 'yes', translation: 'Я' },
          { text: 'տեսա', type: 'verb', phonetic: 'tesa', translation: 'увидел' },
          { text: 'մեծ ոտնահետք', type: 'obj', phonetic: 'mets otnahetq', translation: 'большой след ноги' },
          { text: 'դռան մոտ:', type: 'prep', phonetic: 'dran mot', translation: 'у двери.' },
          { text: 'Հատակին', type: 'prep', phonetic: 'Hatakin', translation: 'На полу' },
          { text: 'կար նաև', type: 'verb', phonetic: 'kar nayev', translation: 'был также' },
          { text: 'մի թուղթ»:', type: 'subj', phonetic: 'mi tught', translation: 'какой-то лист бумаги».' }
        ]
      },
      {
        id: 8,
        chunks: [
          { text: 'Հենց այդ պահին', type: 'prep', phonetic: 'Hents ayd pahin', translation: 'Прямо в этот момент' },
          { text: 'աստիճանների վրա', type: 'prep', phonetic: 'astichanneri vra', translation: 'на лестнице' },
          { text: 'արագ ոտնաձայներ են', type: 'subj', phonetic: 'arag otnadzayner yen', translation: 'быстрые шаги' },
          { text: 'լսվում:', type: 'verb', phonetic: 'lsvum', translation: 'раздаются.' },
          { text: 'Դեղին անձրևանոցով', type: 'prep', phonetic: 'Deghin andzrevanotsov', translation: 'С жёлтым зонтом' },
          { text: 'սենյակ է վազում', type: 'verb', phonetic: 'senyak e vazum', translation: 'в комнату вбегает' },
          { text: 'մի երեխա՝', type: 'subj', phonetic: 'mi yerekha', translation: 'ребёнок —' },
          { text: 'Թոբի անունով:', type: 'prep', phonetic: 'Tobi anunov', translation: 'по имени Тоби.' },
          { text: 'Նրա հետևից', type: 'prep', phonetic: 'Nra hetevits', translation: 'За ним' },
          { text: 'ուրախ', type: 'prep', phonetic: 'urakh', translation: 'радостно' },
          { text: 'հաչում է', type: 'verb', phonetic: 'hachum e', translation: 'лает' },
          { text: 'շագանակագույն շունը՝', type: 'subj', phonetic: 'shaganakaguyn shune', translation: 'коричневая собака —' },
          { text: 'Բարնաբին:', type: 'subj', phonetic: 'Barnabin', translation: 'Барнаби.' },
          { text: 'Թոբին', type: 'subj', phonetic: 'Tobin', translation: 'Тоби' },
          { text: 'ապրում է', type: 'verb', phonetic: 'aprum e', translation: 'живёт' },
          { text: 'հացի խանութի մոտ:', type: 'prep', phonetic: 'hatsi khanuti mot', translation: 'возле булочной.' }
        ]
      },
      {
        id: 9,
        chunks: [
          { text: '«Լեո, պապիկ Արթուր»,—', type: 'subj', phonetic: 'Leo, papik Artur', translation: '«Лео, дедушка Артур», —' },
          { text: 'ասում է', type: 'verb', phonetic: 'asum e', translation: 'говорит' },
          { text: 'Թոբին:', type: 'subj', phonetic: 'Tobin', translation: 'Тоби.' },
          { text: '«Առավոտյան', type: 'prep', phonetic: 'Aravotyan', translation: '«Утром' },
          { text: 'ես ու Բարնաբին', type: 'subj', phonetic: 'yes u Barnabin', translation: 'я и Барнаби' },
          { text: 'այգում էինք:', type: 'verb', phonetic: 'aygum eyinq', translation: 'были в парке.' },
          { text: 'Բարնաբին', type: 'subj', phonetic: 'Barnabin', translation: 'Барнаби' },
          { text: 'հին շատրվանի մոտ', type: 'prep', phonetic: 'hin shatrvani mot', translation: 'у старого фонтана' },
          { text: 'մի փայլուն բանալի', type: 'obj', phonetic: 'mi paylun banali', translation: 'блестящий ключ' },
          { text: 'գտավ»:', type: 'verb', phonetic: 'gtav', translation: 'нашёл».' }
        ]
      },
      {
        id: 10,
        chunks: [
          { text: 'Թոբին', type: 'subj', phonetic: 'Tobin', translation: 'Тоби' },
          { text: 'ցույց է տալիս', type: 'verb', phonetic: 'tsuyts e talis', translation: 'показывает' },
          { text: 'բանալին:', type: 'obj', phonetic: 'banalin', translation: 'ключ.' },
          { text: 'Լեոն', type: 'subj', phonetic: 'Leon', translation: 'Лео' },
          { text: 'վերցնում է', type: 'verb', phonetic: 'vertsnum e', translation: 'берёт' },
          { text: 'բանալին', type: 'obj', phonetic: 'banalin', translation: 'ключ' },
          { text: 'ու', type: 'conn', phonetic: 'u', translation: 'и' },
          { text: 'նայում է նրան:', type: 'verb', phonetic: 'nayum e nran', translation: 'смотрит на него.' },
          { text: 'Ապա', type: 'prep', phonetic: 'Apa', translation: 'Затем' },
          { text: 'նա', type: 'subj', phonetic: 'na', translation: 'он' },
          { text: 'նայում է', type: 'verb', phonetic: 'nayum e', translation: 'смотрит' },
          { text: 'Միային:', type: 'prep', phonetic: 'Miayin', translation: 'на Миа.' },
          { text: '«Կոտրված պատուհան,', type: 'subj', phonetic: 'Kotrvats patuhan', translation: '«Разбитое окно,' },
          { text: 'կորած արկղիկ,', type: 'subj', phonetic: 'korats arkghik', translation: 'пропавшая шкатулка,' },
          { text: 'ոտնահետք', type: 'subj', phonetic: 'otnahetq', translation: 'след ноги' },
          { text: 'և', type: 'conn', phonetic: 'yev', translation: 'и' },
          { text: 'երեխայի գտած բանալի»,—', type: 'subj', phonetic: 'yerekhayi gtats banali', translation: 'найденный ребёнком ключ», —' },
          { text: 'ժպտում է', type: 'verb', phonetic: 'zhptum e', translation: 'улыбается' },
          { text: 'Լեոն:', type: 'subj', phonetic: 'Leon', translation: 'Лео.' },
          { text: '«Մենք', type: 'subj', phonetic: 'Menq', translation: '«У нас' },
          { text: 'ունենք', type: 'verb', phonetic: 'unenq', translation: 'есть' },
          { text: 'մեր առաջին գործը»:', type: 'obj', phonetic: 'mer arajin gortse', translation: 'наше первое дело».' }
        ]
      },
      {
        id: 11,
        chunks: [
          { text: 'Միան', type: 'subj', phonetic: 'Mian', translation: 'Миа' },
          { text: 'բարձրանում է', type: 'verb', phonetic: 'bardzranum e', translation: 'поднимается' },
          { text: 'և', type: 'conn', phonetic: 'yev', translation: 'и' },
          { text: 'վերցնում է', type: 'verb', phonetic: 'vertsnum e', translation: 'берёт' },
          { text: 'իր հեռախոսը:', type: 'obj', phonetic: 'ir herakhose', translation: 'свой телефон.' },
          { text: '«Ես', type: 'subj', phonetic: 'Yes', translation: '«Я' },
          { text: 'պատրաստ եմ»,—', type: 'verb', phonetic: 'patrast yem', translation: 'готова», —' },
          { text: 'ասում է նա:', type: 'verb', phonetic: 'asum e na', translation: 'говорит она.' },
          { text: 'Լեոն', type: 'subj', phonetic: 'Leon', translation: 'Лео' },
          { text: 'ասում է.', type: 'verb', phonetic: 'asum e', translation: 'говорит:' },
          { text: '«Բոլորդ', type: 'subj', phonetic: 'Bolord', translation: '«Все вы' },
          { text: 'հագեք', type: 'verb', phonetic: 'hageq', translation: 'наденьте' },
          { text: 'ձեր վերարկուները:', type: 'obj', phonetic: 'dzer verarkunere', translation: 'ваши пальто.' },
          { text: 'Իջնում ենք ներքև՝', type: 'verb', phonetic: 'Izhnum yenq nerqev', translation: 'Спускаемся вниз —' },
          { text: 'նայելու,', type: 'verb', phonetic: 'nayelu', translation: 'посмотреть,' },
          { text: 'թե ինչ է եղել', type: 'verb', phonetic: 'te inch e yeghel', translation: 'что случилось' },
          { text: 'խանութում»:', type: 'prep', phonetic: 'khanutum', translation: 'в магазине».' },
          { text: 'Բոլորը՝', type: 'subj', phonetic: 'Bolore', translation: 'Все —' },
          { text: 'Լեոն, Միան, Արթուրը,', type: 'subj', phonetic: 'Leon, Mian, Arture', translation: 'Лео, Миа, Артур,' },
          { text: 'Թոբին ու Բարնաբին,', type: 'subj', phonetic: 'Tobin u Barnabin', translation: 'Тоби и Барнаби —' },
          { text: 'դուրս են գալիս', type: 'verb', phonetic: 'durs yen galis', translation: 'выходят' },
          { text: 'սենյակից', type: 'prep', phonetic: 'senyakits', translation: 'из комнаты' },
          { text: 'ու', type: 'conn', phonetic: 'u', translation: 'и' },
          { text: 'իջնում են ներքև:', type: 'verb', phonetic: 'izhnum yen nerqev', translation: 'спускаются вниз.' },
          { text: 'Անձրևը', type: 'subj', phonetic: 'Andzreve', translation: 'Дождь' },
          { text: 'դեռ գալիս է:', type: 'verb', phonetic: 'derr galis e', translation: 'всё ещё идёт.' },
          { text: 'Բայց', type: 'conn', phonetic: 'Bayts', translation: 'Но' },
          { text: 'հիմա', type: 'prep', phonetic: 'hima', translation: 'теперь' },
          { text: 'բոլորը', type: 'subj', phonetic: 'bolore', translation: 'все' },
          { text: 'միասին են,', type: 'verb', phonetic: 'miasin yen', translation: 'вместе,' },
          { text: 'և', type: 'conn', phonetic: 'yev', translation: 'и' },
          { text: 'գործը', type: 'subj', phonetic: 'gortse', translation: 'дело' },
          { text: 'սկսվում է:', type: 'verb', phonetic: 'sksvum e', translation: 'начинается.' }
        ]
      }
    ]
  }
];

let currentReadingStory = readingStories[0];
let currentReadingMode = 'l1'; // 'l1', 'l2', 'l3', 'l4'
let isRhythmTrainerRunning = false;
let rhythmTimer = null;
let currentRhythmIndex = -1;
let storyAllChunks = []; // array of { chunk, el, paragraphId }
let currentReadingAudio = null;
let currentPlayingBtn = null;
let activeTappedChunkEl = null;

function openReadingModal() {
  const modal = document.getElementById('readingModal');
  if (!modal) return;
  modal.classList.add('active');
  renderReadingCards();
  setReadingMode(currentReadingMode);
}

function closeReadingModal() {
  const modal = document.getElementById('readingModal');
  if (modal) modal.classList.remove('active');
  stopRhythmTrainer();
  stopReadingAudio();
  closeChunkSheet();
}

function setReadingMode(mode) {
  currentReadingMode = mode;
  const pills = document.querySelectorAll('#readingModePills .reading-mode-pill');
  pills.forEach(p => {
    p.classList.toggle('active', p.dataset.mode === mode);
  });

  const cardsList = document.getElementById('readingCardsList');
  if (cardsList) {
    cardsList.classList.remove('mode-l1', 'mode-l2', 'mode-l3', 'mode-l4');
    cardsList.classList.add(`mode-${mode}`);
  }
}

function renderReadingCards() {
  const cardsList = document.getElementById('readingCardsList');
  if (!cardsList) return;
  cardsList.innerHTML = '';
  cardsList.className = `reading-cards-list mode-${currentReadingMode}`;
  storyAllChunks = [];

  const story = currentReadingStory;
  document.getElementById('readingStoryTitle').textContent = story.title;
  document.getElementById('readingStorySubtitle').textContent = story.subtitle;

  story.paragraphs.forEach(para => {
    const card = document.createElement('div');
    card.className = 'reading-card';
    card.id = `readingCard_${para.id}`;

    // Card Header: #N badge + Listen button
    const header = document.createElement('div');
    header.className = 'reading-card-header';
    header.innerHTML = `
      <span class="reading-card-num">#${para.id}</span>
      <button class="reading-card-listen-btn" data-para-id="${para.id}">
        <span class="listen-icon">🔊</span>
        <span class="listen-text">Listen</span>
      </button>
    `;

    const listenBtn = header.querySelector('.reading-card-listen-btn');
    listenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playParagraphAudio(para, card, listenBtn);
    });

    // Chunks wrap
    const chunksWrap = document.createElement('div');
    chunksWrap.className = 'reading-chunks-wrap';

    para.chunks.forEach((chunk, chunkIdx) => {
      const chunkEl = document.createElement('span');
      chunkEl.className = `reading-chunk chunk-${chunk.type}`;
      chunkEl.textContent = chunk.text;
      chunkEl.dataset.paraId = para.id;
      chunkEl.dataset.chunkIdx = chunkIdx;

      // Handle click/tap on chunk
      chunkEl.addEventListener('click', (e) => {
        e.stopPropagation();
        handleChunkTap(chunk, chunkEl);
      });

      chunksWrap.appendChild(chunkEl);
      storyAllChunks.push({
        chunk,
        el: chunkEl,
        paragraphId: para.id
      });
    });

    card.appendChild(header);
    card.appendChild(chunksWrap);
    cardsList.appendChild(card);
  });
}

function handleChunkTap(chunk, chunkEl) {
  if (navigator.vibrate) navigator.vibrate(10);

  // If rhythm trainer is running, pause it so user can read
  if (isRhythmTrainerRunning) {
    pauseRhythmTrainer();
  }

  // Deselect previous tapped chunk
  if (activeTappedChunkEl) {
    activeTappedChunkEl.classList.remove('is-tapped-active');
  }

  activeTappedChunkEl = chunkEl;
  chunkEl.classList.add('is-tapped-active');

  openChunkSheet(chunk);
}

function openChunkSheet(chunk) {
  const sheet = document.getElementById('chunkBottomSheet');
  if (!sheet) return;

  const typeBadge = document.getElementById('chunkSheetTypeBadge');
  const armEl = document.getElementById('chunkSheetArmenian');
  const phonEl = document.getElementById('chunkSheetPhonetic');
  const transEl = document.getElementById('chunkSheetTranslation');
  const audioBtn = document.getElementById('chunkSheetAudioBtn');

  // Set type badge
  typeBadge.className = `chunk-sheet-type-badge ${chunk.type}`;
  const typeLabels = {
    subj: 'Субъект (Кто? Что?)',
    verb: 'Действие (Глагол)',
    prep: 'Обстоятельство (Где? Куда? Когда?)',
    obj: 'Объект (Кого? Что?)',
    conn: 'Связка / Союз'
  };
  typeBadge.textContent = typeLabels[chunk.type] || 'Фраза';

  armEl.textContent = chunk.text;
  phonEl.textContent = chunk.phonetic ? `[${chunk.phonetic}]` : '';
  transEl.textContent = chunk.translation || '';

  // Setup single chunk audio playback
  audioBtn.onclick = (e) => {
    e.stopPropagation();
    playChunkAudio(chunk.text);
  };

  sheet.classList.add('active');
}

function closeChunkSheet() {
  const sheet = document.getElementById('chunkBottomSheet');
  if (sheet) sheet.classList.remove('active');
  if (activeTappedChunkEl) {
    activeTappedChunkEl.classList.remove('is-tapped-active');
    activeTappedChunkEl = null;
  }
}

async function playChunkAudio(text) {
  try {
    const cleanText = text.replace(/[.,:;«»!?"'—]/g, '').trim();
    if (!cleanText) return;
    
    if (currentReadingAudio) {
      currentReadingAudio.pause();
      currentReadingAudio = null;
    }

    const res = await fetch('/api/reading/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText })
    });
    const data = await res.json();
    if (data.url) {
      currentReadingAudio = new Audio(data.url);
      currentReadingAudio.play();
    }
  } catch (err) {
    console.error('Error playing chunk audio:', err);
  }
}

// === Rhythm Trainer Engine ===

function toggleRhythmTrainer() {
  if (isRhythmTrainerRunning) {
    stopRhythmTrainer();
  } else {
    startRhythmTrainer();
  }
}

function startRhythmTrainer() {
  if (storyAllChunks.length === 0) return;
  stopReadingAudio();
  closeChunkSheet();

  isRhythmTrainerRunning = true;
  const btn = document.getElementById('rhythmTrainerBtn');
  if (btn) {
    btn.classList.add('is-active-trainer');
    btn.querySelector('#rhythmBtnIcon').textContent = '⏸';
    btn.querySelector('#rhythmBtnText').textContent = 'Пауза';
  }

  if (currentRhythmIndex < 0 || currentRhythmIndex >= storyAllChunks.length - 1) {
    currentRhythmIndex = 0;
  }

  runRhythmStep();
}

function pauseRhythmTrainer() {
  isRhythmTrainerRunning = false;
  if (rhythmTimer) {
    clearTimeout(rhythmTimer);
    rhythmTimer = null;
  }
  const btn = document.getElementById('rhythmTrainerBtn');
  if (btn) {
    btn.classList.remove('is-active-trainer');
    btn.querySelector('#rhythmBtnIcon').textContent = '▶';
    btn.querySelector('#rhythmBtnText').textContent = 'Ритм-тренер';
  }
}

function stopRhythmTrainer() {
  pauseRhythmTrainer();
  currentRhythmIndex = -1;
  clearAllChunkHighlights();
}

function clearAllChunkHighlights() {
  storyAllChunks.forEach(item => {
    item.el.classList.remove('is-rhythm-active');
  });
  document.querySelectorAll('.reading-card.is-active-card').forEach(c => {
    c.classList.remove('is-active-card');
  });
}

function runRhythmStep() {
  if (!isRhythmTrainerRunning) return;
  if (currentRhythmIndex >= storyAllChunks.length) {
    stopRhythmTrainer();
    return;
  }

  clearAllChunkHighlights();

  const item = storyAllChunks[currentRhythmIndex];
  item.el.classList.add('is-rhythm-active');

  const card = document.getElementById(`readingCard_${item.paragraphId}`);
  if (card) {
    card.classList.add('is-active-card');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Calculate interval based on WPM
  const speedSelect = document.getElementById('readingSpeedSelect');
  const wpm = parseInt(speedSelect ? speedSelect.value : '100', 10) || 100;
  const msPerWord = (60 / wpm) * 1000;
  const wordsInChunk = item.chunk.text.trim().split(/\s+/).length;
  const stepDuration = Math.max(480, Math.round(wordsInChunk * msPerWord));

  currentRhythmIndex++;
  rhythmTimer = setTimeout(runRhythmStep, stepDuration);
}

// === Paragraph Audio Playback ===

async function playParagraphAudio(para, cardEl, listenBtn) {
  // If this paragraph is already playing, toggle pause
  if (currentReadingAudio && currentPlayingBtn === listenBtn) {
    stopReadingAudio();
    return;
  }

  stopRhythmTrainer();
  stopReadingAudio();

  const fullText = para.chunks.map(c => c.text).join(' ');
  listenBtn.classList.add('is-playing');
  listenBtn.querySelector('.listen-icon').textContent = '⏳';
  listenBtn.querySelector('.listen-text').textContent = 'Загрузка...';
  currentPlayingBtn = listenBtn;
  cardEl.classList.add('is-active-card');

  try {
    const res = await fetch('/api/reading/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: fullText })
    });
    const data = await res.json();
    if (!data.url) throw new Error('Audio generation failed');

    currentReadingAudio = new Audio(data.url);
    listenBtn.querySelector('.listen-icon').textContent = '⏸';
    listenBtn.querySelector('.listen-text').textContent = 'Стоп';

    const paraChunks = storyAllChunks.filter(c => c.paragraphId === para.id);
    let chunkStepTimer = null;

    currentReadingAudio.onloadedmetadata = () => {
      const duration = currentReadingAudio.duration;
      if (duration && paraChunks.length > 0) {
        const totalWords = para.chunks.reduce((acc, c) => acc + c.text.trim().split(/\s+/).length, 0);
        let currTime = 0;
        let pIdx = 0;

        const scheduleChunkStep = () => {
          if (!currentReadingAudio || currentReadingAudio.paused || pIdx >= paraChunks.length) return;
          paraChunks.forEach(c => c.el.classList.remove('is-rhythm-active'));
          paraChunks[pIdx].el.classList.add('is-rhythm-active');

          const chunkWords = paraChunks[pIdx].chunk.text.trim().split(/\s+/).length;
          const fraction = chunkWords / totalWords;
          const chunkDurationMs = Math.max(350, Math.round(fraction * duration * 1000));
          pIdx++;
          chunkStepTimer = setTimeout(scheduleChunkStep, chunkDurationMs);
        };
        scheduleChunkStep();
      }
    };

    currentReadingAudio.onended = () => {
      clearTimeout(chunkStepTimer);
      stopReadingAudio();
    };

    currentReadingAudio.onerror = () => {
      clearTimeout(chunkStepTimer);
      stopReadingAudio();
      showToast('Ошибка воспроизведения аудио');
    };

    currentReadingAudio.play();
  } catch (err) {
    console.error('Failed to play paragraph audio:', err);
    stopReadingAudio();
    showToast('Не удалось загрузить аудио рассказа');
  }
}

function stopReadingAudio() {
  if (currentReadingAudio) {
    currentReadingAudio.pause();
    currentReadingAudio = null;
  }
  if (currentPlayingBtn) {
    currentPlayingBtn.classList.remove('is-playing');
    currentPlayingBtn.querySelector('.listen-icon').textContent = '🔊';
    currentPlayingBtn.querySelector('.listen-text').textContent = 'Listen';
    currentPlayingBtn = null;
  }
  clearAllChunkHighlights();
}

function initReadingModalEvents() {
  const closeBtn = document.getElementById('readingModalClose');
  const modal = document.getElementById('readingModal');

  if (closeBtn) closeBtn.addEventListener('click', closeReadingModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeReadingModal();
      // Click anywhere inside reading list closes bottom sheet if open
      if (!e.target.closest('#chunkBottomSheet') && !e.target.closest('.reading-chunk')) {
        closeChunkSheet();
      }
    });
  }

  // Mode Switcher Pills
  const pills = document.querySelectorAll('#readingModePills .reading-mode-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      setReadingMode(pill.dataset.mode);
    });
  });

  // Rhythm Trainer button
  const rhythmBtn = document.getElementById('rhythmTrainerBtn');
  if (rhythmBtn) rhythmBtn.addEventListener('click', toggleRhythmTrainer);

  // Bottom Sheet Close
  const sheetClose = document.getElementById('chunkSheetClose');
  if (sheetClose) sheetClose.addEventListener('click', closeChunkSheet);

  const sheetHandle = document.querySelector('.chunk-sheet-drag-handle');
  if (sheetHandle) sheetHandle.addEventListener('click', closeChunkSheet);
}

// === Init ===
localStorage.removeItem('theme');
document.body.classList.remove('cyberpunk');
initModalEvents();
initLearnModalEvents();
initFeedbackEvents();
initVocabModalEvents();
initDrillsEvents();
initGrammarModalEvents();
initReadingModalEvents();
renderActions();
loadProgress();
loadVocabulary();




