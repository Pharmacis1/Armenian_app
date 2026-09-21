# Armenian Language Learning App (Հայերեն)

Интерактивное веб-приложение для изучения армянского языка (восточноармянский диалект) с аудиопроизношением, распознаванием речи, умным повторением (SRS) и паттерн-дриллами по грамматике.

## Основные возможности

- 📚 **Карточки со словами и 4-этапный мастер изучения:**
  - Шаг 1: Карточка с транскрипцией и аудио
  - Шаг 2: Тест на выбор значения (русский → армянский)
  - Шаг 3: Аудирование (восприятие на слух)
  - Шаг 4: Конструктор слова из букв армянского алфавита
- ⚡ **Pattern Drills (Грамматические дриллы):**
  - Уроки 2–3: Связка «է», артикли, указательные местоимения
  - Урок 4: Настоящее время глаголов, отрицание
  - Урок 5: Все 7 падежей существительных (70 карточек с мгновенными формулами и объяснениями при ошибках)
  - Распознавание голоса (Groq Whisper Large v3)
  - Таймер ответа и умная очередь повторения ошибок (через 2 хода)
- 📖 **Интерактивный справочник грамматики:**
  - Интерактивный инспектор падежей с реальными примерами склонения
  - Полные таблицы и формулы к урокам 2–5
  - Кнопки быстрого перехода в тренировочные дриллы
- 🔊 **Озвучка слов и фраз:**
  - Интеграция с ElevenLabs TTS (модель `eleven_v3` / голос Liam)
  - Локальное кэширование сгенерированного аудио в `public/audio`
- 🧠 **Интервальное повторение (SRS):**
  - Алгоритм повторения (Снова / Трудно / Хорошо / Легко)
  - Сохранение прогресса в PostgreSQL
- 🖥️ **Десктопный трей-режим:**
  - Запуск в фоне через Python (`tray_app.py`) с иконкой в системном трее

## Стек технологий

- **Backend:** Node.js (Express), PostgreSQL (`pg`), REST API
- **Frontend:** Vanilla JS, CSS3 (Mobile-first, Responsive, PWA-ready), HTML5 Web Audio API
- **AI & Speech:**
  - ElevenLabs API (Text-to-Speech)
  - Groq API / Whisper Large v3 (Speech-to-Text)
- **Desktop Companion:** Python (pystray, Pillow)

## Установка и запуск

### 1. Клонирование репозитория
```bash
git clone https://github.com/Pharmacis1/Armenian_app.git
cd Armenian_app
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка окружения
Скопируйте пример файла конфигурации:
```bash
cp .env.example .env
```
Заполните параметры подключения к PostgreSQL и ключи API в `.env`:
```env
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=armenian_app

ELEVENLABS_API_KEY=your_key
ELEVENLABS_VOICE_ID=TX3LPaxmHKxFdv7VOQHJ
ELEVENLABS_MODEL_ID=eleven_v3

GROQ_API_KEY=your_key
```

### 4. Инициализация базы данных и сиды
Создайте базу данных в PostgreSQL:
```sql
CREATE DATABASE armenian_app;
```
При первом запуске сервера таблицы создадутся автоматически. Для наполнения дриллов и лексики используйте скрипты:
```bash
node scripts/seed_drills_lesson2_3.js
node scripts/seed_drills_lesson4.js
node scripts/seed_drills_lesson5.js
```

### 5. Запуск приложения
```bash
npm start
```
Приложение будет доступно по адресу: `http://localhost:3001`
