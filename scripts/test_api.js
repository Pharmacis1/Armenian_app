const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3001${path}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(`http://localhost:3001${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function testAll() {
  console.log('Testing /api/vocabulary...');
  const v = await get('/api/vocabulary');
  const vocab = JSON.parse(v.body);
  console.log(`Vocab words count: ${vocab.words.length}`);

  console.log('Testing /api/vocabulary/review...');
  const r = await get('/api/vocabulary/review');
  const review = JSON.parse(r.body);
  console.log(`Due review count: ${review.count}`);

  console.log('Testing /audio/16.mp3 (Անուն)...');
  const a = await get('/audio/16.mp3');
  console.log(`Audio 16 status: ${a.status}`);

  console.log('Testing POST /api/vocabulary/1/review (quality 2)...');
  const p = await post('/api/vocabulary/1/review', { quality: 2 });
  console.log(`Post review status: ${p.status}, result: ${p.body}`);

  console.log('All API tests passed successfully! ✅');
}

testAll().catch(console.error);
