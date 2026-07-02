# diamond-birthday

A romantic birthday SPA — a personalised, interactive web experience built for someone special.  
This project is **independent** from Pawra: it has its own tech stack, its own content model, its own deployment pipeline, and its own visual identity.

**Stack:** React · Vite · TypeScript · CSS  
**Deployment:** Static site served via GitHub Pages  
**State:** Mini-game high scores persisted in `localStorage`  
**No backend, no database, no API server.**

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Local development](#local-development)
- [Project structure](#project-structure)
- [Adding photos](#adding-photos)
- [Editing content and data](#editing-content-and-data)
  - [Content and data files](#content-and-data-files)
  - [Categories](#categories)
  - [How to add a new entry](#how-to-add-a-new-entry)
- [Configuring the Vite base path for GitHub Pages](#configuring-the-vite-base-path-for-github-pages)
- [Deployment (GitHub Actions)](#deployment-github-actions)
- [localStorage — game high scores](#localstorage--game-high-scores)
- [Customisation checklist](#customisation-checklist)

---

## Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **pnpm** ≥ 8 (install via `corepack enable && corepack prepare pnpm@latest --activate`, or `npm install -g pnpm`)

---

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd diamond-birthday

# 2. Install dependencies
pnpm install

# 3. Start the dev server
pnpm dev
```

The app opens at `http://localhost:5173` by default.

---

## Local development

| Command                  | What it does                          |
|--------------------------|---------------------------------------|
| `pnpm dev`               | Start Vite dev server with HMR        |
| `pnpm build`             | Build for production                  |
| `pnpm preview`           | Serve the production build locally    |
| `pnpm typecheck`         | Run TypeScript type checking          |
| `pnpm test`              | Run all tests (vitest)                |
| `pnpm test:watch`        | Run tests in watch mode               |
| `pnpm test:coverage`     | Run tests with coverage report        |

> Note: there are no `lint` or `format` scripts configured. Code is checked by the TypeScript compiler (`pnpm typecheck`), the test suite (`pnpm test`), and the build step (`pnpm build`).

---

## Project structure

```
diamond-birthday/
├── public/
│   └── photos/              # Photo files (SVG placeholders; swap for your own)
├── src/
│   ├── content/             # Single canonical source for all visible text — UI copy, editorial content & types
│   │   └── page.ts          # All UI strings in Spanish (buttons, titles, hints, game text)
│   ├── data/                # Re-export barrels for backward compatibility; canonical content in content/page.ts
│   │   ├── wife.ts          # Your loved one's name, age, birthday, special message
│   │   ├── messages.ts      # Love letters (title, date, excerpt, content, signature)
│   │   ├── timeline.ts      # Milestones (year, month, title, description, icon)
│   │   ├── gallery.ts       # Gallery categories + image references (src, alt, caption)
│   │   ├── games.ts         # Mini-game settings + high-score types + localStorage key
│   │   └── trivia.ts        # Trivia questions + getShuffledTrivia() (question, options, correctIndex, explanation)
│   ├── components/          # React components
│   │   ├── Hero.tsx
│   │   ├── Timeline.tsx
│   │   ├── Letters.tsx
│   │   ├── Gallery.tsx
│   │   ├── GalleryModal.tsx
│   │   ├── Surprise.tsx
│   │   ├── Trivia.tsx
│   │   ├── ScratchCard.tsx
│   │   ├── Spinner.tsx
│   │   ├── MiniGames.tsx
│   │   ├── GameFlappy.tsx
│   │   ├── GameSnake.tsx
│   │   ├── GameLaneRunner.tsx
│   │   ├── GameMemoryMatch.tsx
│   │   ├── MemoriesButton.tsx
│   │   └── Footer.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useIntersectionObserver.ts
│   │   ├── useReducedMotion.ts
│   │   └── useSwipe.ts
│   ├── utils/               # Shared utilities
│   │   ├── assets.ts        # assetUrl() helper — resolves public paths under BASE_URL
│   │   ├── confetti.ts
│   │   └── shuffle.ts
│   ├── test/                # Test setup
│   │   └── setup.ts         # Vitest globals (matchMedia, localStorage mocks)
│   ├── App.tsx              # Root layout — all sections rendered on one page
│   ├── index.css            # All application styles (global, components, keyframes)
│   └── main.tsx             # Entry point
├── .env.example             # Environment variable template
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions → GitHub Pages
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

The app is a **single-page scroll** with no client-side router. Every section (Hero, Timeline, Letters, Gallery, Surprise, Trivia, ScratchCard, Spinner, MiniGames, Footer) is rendered on one page and lazy-loaded via `React.lazy` when it scrolls into view.

**Test files** are co-located with the code they test (`*.test.ts` / `*.test.tsx`) plus a shared setup at `src/test/setup.ts`. Tests use **Vitest** with `jsdom` and `@testing-library/react`. See [Local development](#local-development) for available test commands.

---

## Adding photos

1. Place your image files inside **`public/photos/`**.
2. Add a matching entry in `src/content/page.ts` (in the `galleryImages` array):

```typescript
{
  id: "my-photo",
  src: "/photos/my-photo.jpg",
  thumb: "/photos/my-photo.jpg",   // same image, or a smaller thumbnail
  alt: "Description for accessibility",
  caption: "A sweet caption for this memory",
  category: "moments",             // must match a category id in galleryCategories
}
```

Because files in `public/` are served as-is by Vite, use a path starting with `/photos/...` — no import needed.

**Current photos:** 12 SVG placeholder illustrations organised into three categories (`journey`, `moments`, `forever`). Swap these for your own JPEG, PNG, WebP, or AVIF files. Keep individual file sizes reasonable (< 500 KB preferred) for fast loading.

---

## Editing content and data

All visible text lives in a **single canonical file**:

- **`src/content/page.ts`** — every user‑visible string, including UI copy (buttons, headings, labels, ARIA, hints) **and** editorial content (wife info, love letters, timeline milestones, gallery captions, trivia questions). Every React component reads its text from this file.
- **`src/data/*.ts`** — backward‑compatibility re‑export barrels that re‑export the same values from `content/page.ts`. These exist so existing imports continue to work; do **not** edit them for content changes. The sole exception is `data/games.ts`, which holds game‑mechanics configuration (gravity, speed, grid size) — that is still canonical there.

You never need to touch a component to change a word, a date, or a category.

### Content and data files

| File / dir        | What it holds                                                                   |
|-------------------|---------------------------------------------------------------------------------|
| `content/page.ts` | **Canonical source for all visible text** — UI copy (titles, buttons, ARIA, hints, spinner options) *and* editorial data (wife info, letters, timeline, gallery, trivia questions) |
| `data/wife.ts`    | Re‑export barrel → edit in `content/page.ts`                                    |
| `data/messages.ts`| Re‑export barrel → edit in `content/page.ts`                                    |
| `data/timeline.ts`| Re‑export barrel → edit in `content/page.ts`                                    |
| `data/gallery.ts` | Re‑export barrel → edit in `content/page.ts`                                    |
| `data/trivia.ts`  | Re‑export barrel → edit in `content/page.ts`                                    |
| `data/games.ts`   | **Canonical** game‑mechanics config (gravity, speed, grid size) + high‑score types — not a re‑export |

### Categories

Gallery photos are organised by category. Categories are defined in `src/content/page.ts`:

```typescript
export const galleryCategories: GalleryCategory[] = [
  { id: 'journey', name: 'Our Journey', description: '...' },
  { id: 'moments', name: 'Sweet Moments', description: '...' },
  { id: 'forever', name: 'Forever Yours', description: '...' },
];
```

To add a category, append an object to `galleryCategories` and assign its `id` to any images in `galleryImages`. The category-filter UI (`Gallery.tsx`) picks up new categories automatically.

### How to add a new entry

Open `src/content/page.ts` and append an object to the relevant array in the editorial section. Follow the existing shape:

```typescript
// src/content/page.ts (timeline array) — adding a milestone
{
  year: '2026',
  month: 'December',
  title: 'Our Latest Adventure',
  description: 'We embarked on a new journey together...',
  icon: 'heart',   // 'heart' | 'star' | 'diamond' | 'flower' | 'ring'
}

// src/content/page.ts (letters array) — adding a letter
{
  id: 'new-letter',
  title: 'A Letter for You',
  date: 'December 25, 2026',
  excerpt: 'A short preview of the letter...',
  content: 'The full letter content...',
  signature: 'With all my love',
}
```

Components pick up new entries automatically on next reload (HMR in dev, or after rebuild for production).

---

## Configuring the Vite base path for GitHub Pages

GitHub Pages serves your site from a sub-path (`https://<user>.github.io/<repo>/`). Vite must be told this path so asset URLs are correct.

The project already handles this in two places:

- **`vite.config.ts`** reads `VITE_BASE_PATH` at build time:
  ```typescript
  base: process.env.VITE_BASE_PATH || '/',
  ```
- **`.github/workflows/deploy.yml`** sets the env var from the repository name:
  ```yaml
  - run: pnpm build
    env:
      VITE_BASE_PATH: /${{ github.event.repository.name }}/
  ```

Because the base path is derived from the repository name at build time, moving or forking the repo automatically adapts — no hardcoded path needed.

### Manual override (local testing)

```bash
# Build with a custom base path
VITE_BASE_PATH=/diamond-birthday/ pnpm build

# Preview the result
pnpm preview
```

Open `http://localhost:4173/diamond-birthday/` to verify assets load under the sub-path.

### Quick check

To verify the base path is working, inspect the built `dist/index.html` — script and link `src`/`href` attributes should be prefixed with `/diamond-birthday/` (or whatever value you set).

### Using assetUrl for public assets

For component code that references images or other public files, use the `assetUrl()` helper from `src/utils/assets.ts`:

```typescript
import { assetUrl } from '../utils/assets';

// Resolves to /<base>/photos/cat.svg regardless of the current BASE_URL
assetUrl('/photos/cat.svg');
```

This is safer than hardcoding `/photos/...` paths because it respects the Vite `base` setting at runtime.

---

## Deployment (GitHub Actions)

A GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys to GitHub Pages whenever you push to `main`.

### Workflow

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
        env:
          VITE_BASE_PATH: /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
```

### One-time GitHub Pages setup

1. Go to your repository **Settings → Pages**.
2. Under **Source**, select **GitHub Actions**.
3. Push to `main` — the workflow runs and deploys automatically.

### Manual deployment

```bash
pnpm build
```

The output goes to `dist/` and can be served from any static host.

---

## localStorage — game high scores

Mini-game progress is persisted in `localStorage` under a **single key** so returning visitors keep their best scores.

### Storage key

```
diamond-birthday-games
```

### What is stored

```typescript
{
  flappy: number,       // best score in Flappy Love
  snake: number,        // best score in Love Snake
  laneRunner: number,   // best score in Lane of Love
  memoryMatch: number,  // best time (seconds) in Memory Match
}
```

### Where it is used

Only the **Memory Match** game currently persists high scores (`GameMemoryMatch.tsx`). The other mini-games (Flappy, Snake, Lane Runner) and the Trivia quiz are in-memory only and reset on page reload.

### How it works

- **On first visit:** the game uses a default high-score value of `0` for every category.
- **On game completion:** if the new score beats the stored score, it is written to `localStorage`.
- **On return:** the stored high score is restored and displayed.

### Important notes

- **Private / incognito browsing** may block `localStorage` writes. The `useLocalStorage` hook wraps writes in `try/catch` — the game still works, it just won't persist between sessions.
- **Clearing browser data** resets all high scores. This is expected behaviour.
- **No version field** is stored. Future schema changes assume backward compatibility or a fresh start.
- **No sensitive data** is ever written to `localStorage` — only numeric game scores.

---

## Customisation checklist

Ready to make this your own?

- [ ] Replace `public/photos/` with your own images
- [ ] Edit `src/content/page.ts` — UI copy (headings, buttons, labels, hints)
- [ ] Edit `src/content/page.ts` — wife info (name, age, birthday, special message)
- [ ] Edit `src/content/page.ts` — love letters (title, date, excerpt, content, signature)
- [ ] Edit `src/content/page.ts` — timeline milestones (year, title, description, icon)
- [ ] Edit `src/content/page.ts` — gallery categories and image entries
- [ ] Edit `src/content/page.ts` — trivia questions (question, options, correct index, explanation)
- [ ] Tweak game settings in `src/data/games.ts` (gravity, speed, grid size) — this file is still canonical for game mechanics
- [ ] Adjust CSS custom properties in `src/index.css` (colours, fonts, glow effects)
- [ ] Update the site title in `index.html`
- [ ] Push to `main` — the CI workflow deploys automatically
