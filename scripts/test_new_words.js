const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function testNewWords() {
  const v = await get('http://localhost:3001/api/vocabulary');
  const vocab = JSON.parse(v.data).words;
  console.log(`Total words: ${vocab.length}`);

  const last5 = vocab.slice(-5);
  console.log('Last 5 words:');
  for (const w of last5) {
    const a = await get(`http://localhost:3001/audio/${w.id}.mp3`);
    console.log(`- [${w.id}] ${w.armenian} [${w.phonetic}] — ${w.translation} | audio status: ${a.status}`);
  }
}

testNewWords().catch(console.error);
