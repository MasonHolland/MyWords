// Sample decks for the README media, written through the app's own Dexie helpers.
// Only works against the Vite dev server, which serves /src/db.ts as a module.
import { Buffer } from 'node:buffer';
import fs from 'node:fs';

export async function seed(page) {
  await page.evaluate(async () => {
    const m = await import('/src/db.ts');
    const img = async (emoji, bg) => {
      const c = document.createElement('canvas'); c.width = c.height = 640;
      const g = c.getContext('2d');
      const grad = g.createLinearGradient(0, 0, 640, 640);
      grad.addColorStop(0, bg[0]); grad.addColorStop(1, bg[1]);
      g.fillStyle = grad; g.fillRect(0, 0, 640, 640);
      g.font = '380px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 30; g.shadowOffsetY = 14;
      g.fillText(emoji, 320, 345);
      return await new Promise((r) => c.toBlob(r, 'image/webp', 0.9));
    };
    const food = await m.createDeck('Spanish · Food');
    const fd = [
      ['🍎', 'la manzana', ['#fde2e1', '#f8b4b0']],
      ['🧀', 'el queso', ['#fff4cc', '#ffd966']],
      ['🍞', 'el pan', ['#f6e7d2', '#e2bf8f']],
      ['🥕', 'la zanahoria', ['#ffe8d6', '#ffb37a']],
      ['🍇', 'las uvas', ['#ece3fb', '#c4aef0']],
      ['🥑', 'el aguacate', ['#e6f4dc', '#b6dc96']],
      ['🍋', 'el limón', ['#fffad1', '#fff08a']],
      ['☕', 'el café', ['#efe4dc', '#c9a991']],
    ];
    for (const [e, back, bg] of fd) await m.addCard(food, { frontType: 'image', frontImage: await img(e, bg), back });
    await m.addCard(food, { frontType: 'text', frontText: 'I would like a coffee, please.', back: 'Quisiera un café, por favor.' });

    const caps = await m.createDeck('World capitals');
    for (const [q, a] of [['Canada', 'Ottawa'], ['Australia', 'Canberra'], ['New Zealand', 'Wellington'], ['Brazil', 'Brasília'], ['Japan', 'Tokyo'], ['Kenya', 'Nairobi'], ['Norway', 'Oslo'], ['Peru', 'Lima'], ['Morocco', 'Rabat'], ['Vietnam', 'Hanoi'], ['Turkey', 'Ankara'], ['Switzerland', 'Bern']])
      await m.addCard(caps, { frontType: 'text', frontText: q, back: a });

    const jp = await m.createDeck('Japanese · Greetings');
    for (const [q, a] of [['おはよう', 'Good morning (ohayō)'], ['こんにちは', 'Hello (konnichiwa)'], ['ありがとう', 'Thank you (arigatō)'], ['すみません', 'Excuse me (sumimasen)'], ['おやすみ', 'Good night (oyasumi)']])
      await m.addCard(jp, { frontType: 'text', frontText: q, back: a });

    const bio = await m.createDeck('Biology 101');
    for (const [q, a] of [['Mitochondria', 'Organelle that produces most of the cell’s ATP'], ['Osmosis', 'Diffusion of water across a semi-permeable membrane'], ['Ribosome', 'Builds proteins from amino acids'], ['Chlorophyll', 'Green pigment that absorbs light for photosynthesis']])
      await m.addCard(bio, { frontType: 'text', frontText: q, back: a });
    // Most recently updated decks show first; make Spanish the newest.
    await m.db.decks.update(food, { updatedAt: Date.now() + 1000 });
  });
}

/** A PNG on disk to pick in the "photo library" during the demo. */
export async function makePhoto(page, file, emoji, bg) {
  const b64 = await page.evaluate(async ([emoji, bg]) => {
    const c = document.createElement('canvas'); c.width = c.height = 900;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 900, 900);
    grad.addColorStop(0, bg[0]); grad.addColorStop(1, bg[1]);
    g.fillStyle = grad; g.fillRect(0, 0, 900, 900);
    g.font = '520px "Segoe UI Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(0,0,0,.18)'; g.shadowBlur = 40; g.shadowOffsetY = 18;
    g.fillText(emoji, 450, 485);
    return c.toDataURL('image/png').split(',')[1];
  }, [emoji, bg]);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
}
