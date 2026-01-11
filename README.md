# TimeTune

A music timeline guessing game. Listen to songs, guess the release year, and build your timeline! Play locally with friends or create online rooms.

[![CI](https://github.com/arthurkowalsky/hitster/actions/workflows/ci.yml/badge.svg)](https://github.com/arthurkowalsky/hitster/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Play Now

**[Play Online](https://arthurkowalsky.github.io/timetune/)** — Polish Edition (530 songs)

## Features

**Game Modes**
- Local multiplayer — pass the phone between players
- Online multiplayer — create rooms and invite friends via link

**Gameplay**
- 530 Polish songs spanning 1950-2024
- Song filtering by origin (Polish/International), genres, and year range
- Configurable turn timer and target score
- Auto-play mode — skip manual play button
- Voice voting for bonus points (online multiplayer)

**Experience**
- PWA — install as mobile app from browser
- Mobile-first with fullscreen mode
- Animated audio visualizer with gradient glow
- Mystery card animation on song draw
- Haptic feedback on mobile
- Auto-save progress (localStorage)

## Quick Start

```bash
npm install
npm run dev
```

For online multiplayer development:
```bash
npm run dev:all  # Starts Vite + PartyKit servers
```

## Tech Stack

React 19 | TypeScript | Vite 7 | Tailwind CSS 4 | Zustand | PartyKit

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run dev:party` | PartyKit server (multiplayer) |
| `npm run dev:all` | Both servers concurrently |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run check` | Full CI check (lint + audit + build) |
| `npm run deploy:party` | Deploy PartyKit to production |
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
  "origin": "PL",
  "genres": ["pop", "rock"]
}
```

**Origin:** `PL` (Polish) or `INT` (International)

**Genres:** `pop`, `rock`, `hip-hop`, `disco-polo`, `folk`, `jazz`, `electronic`, `metal`, `r&b`, `alternative`

### Adding Songs

1. Create/edit CSV in `database/` with columns: `Author,Title,Year,YoutubeId,Origin,Genres,Region`
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

[MIT](./LICENSE) © 2026 Artur Kowalski
