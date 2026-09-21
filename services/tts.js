const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const AUDIO_DIR = path.join(__dirname, '..', 'public', 'audio');

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

/**
 * Synthesize speech using ElevenLabs Multilingual v2
 * @param {string} text Armenian text to synthesize
 * @param {string} voiceId ElevenLabs voice id
 * @returns {Promise<Buffer>} MP3 buffer
 */
async function synthesizeElevenLabs(text, voiceId = process.env.ELEVENLABS_VOICE_ID || 'TX3LPaxmHKxFdv7VOQHJ') {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY is missing in .env');
  }

  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_v3';

  const payload = JSON.stringify({
    text: text,
    model_id: modelId,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errBody = '';
        res.on('data', chunk => (errBody += chunk));
        res.on('end', () => reject(new Error(`ElevenLabs error ${res.statusCode}: ${errBody}`)));
        return;
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Get or generate MP3 audio for a specific vocabulary word
 */
async function getOrGenerateAudio(wordId, armenianText, voiceId = process.env.ELEVENLABS_VOICE_ID || 'TX3LPaxmHKxFdv7VOQHJ', force = false) {
  const filename = `${wordId}.mp3`;
  const filePath = path.join(AUDIO_DIR, filename);

  if (!force && fs.existsSync(filePath)) {
    return { url: `/audio/${filename}`, cached: true };
  }

  const buffer = await synthesizeElevenLabs(armenianText, voiceId);
  fs.writeFileSync(filePath, buffer);
  return { url: `/audio/${filename}`, cached: false };
}

const crypto = require('crypto');

async function getOrGenerateSentenceAudio(text, voiceId = process.env.ELEVENLABS_VOICE_ID || 'TX3LPaxmHKxFdv7VOQHJ') {
  const hash = crypto.createHash('md5').update(text.trim()).digest('hex').slice(0, 16);
  const filename = `drill_${hash}.mp3`;
  const filePath = path.join(AUDIO_DIR, filename);

  if (fs.existsSync(filePath)) {
    return { url: `/audio/${filename}`, cached: true };
  }

  const buffer = await synthesizeElevenLabs(text, voiceId);
  fs.writeFileSync(filePath, buffer);
  return { url: `/audio/${filename}`, cached: false };
}

module.exports = {
  synthesizeElevenLabs,
  getOrGenerateAudio,
  getOrGenerateSentenceAudio,
  AUDIO_DIR,
};
