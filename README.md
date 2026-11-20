# MyWords

MyWords is a flashcard app built for your phone. It runs in any modern browser, and the long-term plan is a native iOS app.

## What it does

- **Decks:** create, rename and delete decks (groups of cards).
- **Cards:** the front of a card is **text or an image**, and the back is **text**. Images come from your photo library or straight from the camera, and are shrunk before saving to save space. Use "Save & add another" to enter cards quickly.
- **Custom order:** drag a card's ⠿ handle to reorder the deck. On a phone, press briefly before dragging so the list still scrolls normally.
- **Study mode:** go through a deck **in order** or **shuffled**. Tap the card to flip it, and use Prev/Next to move between cards. A progress counter shows where you are. At the end you can restart, shuffle again, or go back to the deck. Shuffling never changes the deck's saved order.
- **Works offline:** all data is stored on the device, with no account or server. You can add the app to the iPhone home screen (Share → *Add to Home Screen*) and it opens full screen like a native app.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (includes npm)

### Install

```bash
git clone <repo-url> MyWords
cd MyWords
npm install
```

### Run (development)

```bash
npm run dev
```

Open http://localhost:5180. To try it on your phone, connect the phone to the same Wi‑Fi network and open the **Network** address Vite prints (for example `http://192.168.x.x:5180`).

### Other scripts

| Command | What it does |
| --- | --- |
| `npm run build` | Type-checks and builds the production app into `dist/` |
| `npm run preview` | Serves the production build at http://localhost:5181 |
| `npm test` | Runs the unit tests (Vitest) |
| `node scripts/make-icons.mjs` | Regenerates the PNG app icons in `public/` |

## Tech stack

| Area | Choice |
| --- | --- |
| UI | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build tooling | [Vite](https://vite.dev/) |
| Routing | [React Router](https://reactrouter.com/) |
| Storage | IndexedDB via [Dexie](https://dexie.org/) and `dexie-react-hooks` (live queries) |
| Drag & drop | [dnd-kit](https://dndkit.com/) (`core`, `sortable`, `modifiers`), with touch support |
| Offline / installable | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (web manifest + service worker) |
| Styling | Plain CSS with custom properties: mobile-first, light/dark themes, safe-area aware |
| Testing | [Vitest](https://vitest.dev/) |

### Project layout

```
src/
  db.ts              Dexie schema and data helpers (decks, cards, ordering)
  pages/             DeckList, DeckDetail, CardEditor, Study
  components/        FlipCard, SortableCardRow, Sheet, TopBar, …
  lib/               shuffle, reorder, image resizing (pure helpers + tests)
  hooks/             useObjectUrl
  styles.css         All app styles
public/              Icons and static assets
scripts/             Icon generator
```
