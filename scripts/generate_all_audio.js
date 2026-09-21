require('dotenv').config();
const db = require('../db');
const { getOrGenerateAudio } = require('../services/tts');

async function main() {
  console.log('🎙️ Starting batch Armenian speech generation via ElevenLabs (Liam + Eleven v3)...');

  await db.initDb();
  const words = await db.getVocabulary();

  if (!words || words.length === 0) {
    console.log('No words found in vocabulary table.');
    process.exit(0);
  }

  console.log(`Found ${words.length} words to process.`);
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'TX3LPaxmHKxFdv7VOQHJ';
  console.log(`Using voice ID: ${voiceId} (Liam)`);
  console.log(`Using model ID: ${process.env.ELEVENLABS_MODEL_ID || 'eleven_v3'}`);

  for (const word of words) {
    try {
      // force = true to ensure fresh high-quality audio with Liam + Eleven v3
      const res = await getOrGenerateAudio(word.id, word.armenian, voiceId, true);
      const status = res.cached ? '⚡ cached' : '✨ synthesized';
      console.log(`[${word.id}] ${word.armenian} (${word.phonetic}) -> ${res.url} [${status}]`);
      // Small pause to be gentle on API rate limits
      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      console.error(`❌ Failed for [${word.id}] ${word.armenian}:`, err.message);
    }
  }

  console.log('🎉 Audio generation finished!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
