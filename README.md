# TimeTune

A multiplayer music trivia game. Listen to songs, guess the release year, and build your timeline!

[![CI](https://github.com/arthurkowalsky/hitster/actions/workflows/ci.yml/badge.svg)](https://github.com/arthurkowalsky/hitster/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Play Now

**[Play Online](https://arthurkowalsky.github.io/timetune/)** — Polish Edition

## Features

- 165 Polish songs (1960-2024)
- Multi-region support (PL, EN, etc.)
- 2+ players/teams support
- Mobile-first with fullscreen mode
- Auto-save progress (localStorage)
- Animated audio visualizer
- Haptic feedback on mobile

## Quick Start

```bash
npm install
npm run dev
```

## Tech Stack

React 19 | TypeScript | Vite 7 | Tailwind CSS 4 | Zustand

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run check` | Full CI check (lint + audit + build) |
| `npm run db:fetch-youtube` | Fetch YouTube IDs for songs |
| `npm run db:generate-json` | Generate songs.json from CSV |

## Song Database

Songs are stored in `public/data/songs.json`:

```json
{
  "id": "1",
  "artist": "Artist Name",
  "title": "Song Title",
  "year": 1984,
  "youtubeId": "dQw4w9WgXcQ",
  "region": "PL"
}
```

### Adding Songs

1. Create/edit CSV in `database/` with columns: `Author,Title,Year`
2. Fetch YouTube IDs:
   ```bash
   npm run db:fetch-youtube -- --region=PL database/polish.csv
   ```
3. Generate JSON:
   ```bash
   npm run db:generate-json -- database/polish.csv
   ```

Multiple CSV files can be combined:
```bash
npm run db:generate-json -- database/polish.csv database/english.csv
```

**Requires:** [yt-dlp](https://github.com/yt-dlp/yt-dlp) for YouTube search.

## Disclaimer

This is an independent, non-commercial implementation of a chronological music game mechanic. Not affiliated with any board game publisher. Music is played via YouTube in accordance with their Terms of Service.

Board game mechanics are not subject to copyright protection (CJEU C-406/10).

## License

[MIT](./LICENSE) © 2025 Artur Kowalski
