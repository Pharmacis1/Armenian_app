require('dotenv').config();
const https = require('https');

async function testSynth() {
  const payload = JSON.stringify({
    text: 'Շնորհակալություն',
    model_id: 'eleven_v3',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  const options = {
    hostname: 'api.elevenlabs.io',
    path: `/v1/text-to-speech/TX3LPaxmHKxFdv7VOQHJ`,
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const req = https.request(options, (res) => {
    console.log('Status code:', res.statusCode);
    let body = [];
    res.on('data', chunk => body.push(chunk));
    res.on('end', () => {
      const buffer = Buffer.concat(body);
      console.log('Response length:', buffer.length, 'bytes');
      if (res.statusCode === 200) {
        console.log('✅ Successfully synthesized using Liam + Eleven v3!');
      } else {
        console.log('Response body:', buffer.toString('utf8'));
      }
    });
  });

  req.on('error', (err) => console.error('Error:', err));
  req.write(payload);
  req.end();
}

testSynth();
