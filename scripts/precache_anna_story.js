const paragraphs = [
  'Այսօր կիրակի է: Առավոտյան արևը շողում է: Երկինքը կապույտ է ու պարզ:',
  'Աննան զարթնում է և ժպտում: Նա գնում է խոհանոց: Խոհանոցում տաք է: Աննան եփում է համեղ սուրճ: Սեղանին կա թարմ հաց, պանիր և կարմիր խնձոր:',
  'Աննան նստում է աթոռին՝ պատուհանի մոտ: Նա դանդաղ խմում է տաք սուրճը և կարդում է հետաքրքիր գիրք:',
  'Սենյակ է գալիս փոքրիկ կատուն: Կատվի անունը Միկի է: Միկին ցատկում է Աննայի գիրկը և քնում: Աննան ուրախ է: Լավ օր է սկսվում:'
];

async function precache() {
  console.log('Precaching 4 paragraphs of Anna story...');
  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i];
    const res = await fetch('http://localhost:3001/api/reading/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const d = await res.json();
    console.log(`Para #${i+1}: ${d.url} [cached: ${d.cached}]`);
    await new Promise(r => setTimeout(r, 300));
  }
  console.log('Done precaching Anna story!');
}

precache();
