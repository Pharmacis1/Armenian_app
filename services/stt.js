require('dotenv').config();

/**
 * Transcribe Armenian audio using Groq Whisper Large-v3
 * @param {Buffer|Blob} audioBuffer - raw audio buffer from client
 * @param {string} mimeType - e.g. 'audio/webm', 'audio/wav', 'audio/mp4'
 * @param {string} promptHint - optional target armenian phrase to guide decoder
 * @returns {Promise<{ text: string, raw: object }>}
 */
async function transcribeArmenianAudio(audioBuffer, mimeType = 'audio/webm', promptHint = '') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in .env');
  }

  // Determine file extension
  let ext = 'webm';
  if (mimeType.includes('wav')) ext = 'wav';
  else if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = 'm4a';
  else if (mimeType.includes('mp3')) ext = 'mp3';
  else if (mimeType.includes('ogg')) ext = 'ogg';

  const blob = audioBuffer instanceof Blob ? audioBuffer : new Blob([audioBuffer], { type: mimeType });
  const formData = new FormData();
  formData.append('file', blob, `speech.${ext}`);
  formData.append('model', 'whisper-large-v3');
  formData.append('language', 'hy'); // Force Armenian
  if (promptHint && typeof promptHint === 'string') {
    formData.append('prompt', promptHint.trim());
  }

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq STT Error:', response.status, errorText);
    throw new Error(`Groq STT API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const text = (result.text || '').trim();
  return {
    text,
    raw: result,
  };
}

module.exports = {
  transcribeArmenianAudio,
};
