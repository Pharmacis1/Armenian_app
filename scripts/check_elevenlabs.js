require('dotenv').config();
const https = require('https');

function fetchApi(apiPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.elevenlabs.io',
      path: apiPath,
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    console.log('Fetching voices...');
    const voicesData = await fetchApi('/v1/voices');
    if (voicesData.voices) {
      const liam = voicesData.voices.filter(v => v.name.toLowerCase().includes('liam'));
      console.log('Liam voices:', liam.map(v => ({ id: v.voice_id, name: v.name, category: v.category, labels: v.labels })));
    } else {
      console.log('Voices response:', voicesData);
    }

    console.log('\nFetching models...');
    const modelsData = await fetchApi('/v1/models');
    if (Array.isArray(modelsData)) {
      console.log('Models:', modelsData.map(m => ({ id: m.model_id, name: m.name, can_do_text_to_speech: m.can_do_text_to_speech, languages: m.languages ? m.languages.length : 0 })));
    } else {
      console.log('Models response:', modelsData);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
