// Records the README screenshots and demo video into docs/media/.
// Usage: npm run media            (both)
//        npm run media -- --only shots | --only video
// Every run uses a fresh browser profile and seeds its own sample decks (see seed.mjs).
import os from 'node:os';
import path from 'node:path';
import { devServer, launch, wait, tap, typeSlow, smoothScroll, shot, startRecording, encode, ROOT, OUT, only } from './lib.mjs';
import { seed, makePhoto } from './seed.mjs';

const URL = 'http://localhost:5180/';
const stopServer = await devServer(URL, 'npx vite --port 5180 --strictPort', { cwd: ROOT });
const PHOTO = path.join(os.tmpdir(), 'mywords-strawberry.png');
const flip = (page) => page.locator('.flip-card');

async function open(colorScheme) {
  const s = await launch({ colorScheme });
  await s.page.goto(URL); await wait(s.page, 800);
  await seed(s.page); await s.page.reload(); await wait(s.page, 1200);
  await makePhoto(s.page, PHOTO, '🍓', ['#ffe1e6', '#ff9fb1']);
  return s;
}

try {
  if (only('shots')) {
    const { browser, page } = await open('light');
    await shot(page, `${OUT}/01-decks.png`);
    await page.getByText('Spanish · Food').click(); await wait(page, 1200);
    await shot(page, `${OUT}/02-deck.png`);
    await page.getByRole('link', { name: '+ Add card' }).click(); await wait(page, 800);
    await page.getByRole('radio', { name: 'Image' }).click();
    await page.locator('input[type=file]').setInputFiles(PHOTO); await wait(page, 1200);
    await page.locator('#back').fill('la fresa'); await wait(page, 300);
    await shot(page, `${OUT}/03-new-card.png`);
    await page.getByRole('button', { name: 'Save', exact: true }).click(); await wait(page, 1000);
    await page.goto(page.url() + '/study?mode=ordered'); await wait(page, 1200);
    await shot(page, `${OUT}/04-study-front.png`);
    await flip(page).click(); await wait(page, 1200);
    await shot(page, `${OUT}/05-study-back.png`);
    await browser.close();

    const dark = await open('dark');
    await dark.page.getByText('World capitals').click(); await wait(dark.page, 1000);
    await dark.page.goto(dark.page.url() + '/study?mode=random'); await wait(dark.page, 1000);
    await dark.page.getByRole('button', { name: /Next/ }).click(); await wait(dark.page, 500);
    await flip(dark.page).click(); await wait(dark.page, 1200);
    await shot(dark.page, `${OUT}/06-study-dark.png`);
    await dark.browser.close();
  }

  if (only('video')) {
    const { browser, page } = await open('light');
    const rec = await startRecording(page);
    await wait(page, 1200);
    await tap(page, page.getByText('Spanish · Food')); await wait(page, 1400);
    await smoothScroll(page, 400); await wait(page, 500);
    await tap(page, page.getByRole('link', { name: '+ Add card' })); await wait(page, 900);
    await tap(page, page.getByRole('radio', { name: 'Image' })); await wait(page, 700);
    const chooser = page.waitForEvent('filechooser');
    await tap(page, page.getByRole('button', { name: /Choose photo/ }));
    await (await chooser).setFiles(PHOTO); await wait(page, 1300);
    await typeSlow(page, page.locator('#back'), 'la fresa', 110); await wait(page, 700);
    await tap(page, page.getByRole('button', { name: 'Save', exact: true })); await wait(page, 1200);
    await smoothScroll(page, 900, { steps: 25 }); await wait(page, 1200);
    await tap(page, page.getByRole('button', { name: 'Study' })); await wait(page, 900);
    await tap(page, page.getByRole('button', { name: 'Shuffle' })); await wait(page, 1300);
    for (let i = 0; i < 4; i++) {
      await tap(page, flip(page)); await wait(page, 1500);
      await tap(page, page.getByRole('button', { name: /Next/ })); await wait(page, 900);
    }
    const frames = await rec.stop();
    await browser.close();
    encode(frames, OUT, 'demo', { posterAt: 0.8 });
  }
} finally {
  await stopServer();
}
