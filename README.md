# TimeTune

A web-based music trivia game for teams. Listen to songs, guess the release year, and place them chronologically on your timeline.

## ⚠️ Disclaimer

This project is an independent, non-commercial implementation of a game mechanic based on arranging songs chronologically.

- Not affiliated with any board game publisher
- Not an official digital version of any existing game
- For educational and entertainment purposes only
- Music is played via YouTube in accordance with their Terms of Service

Board game mechanics are not subject to copyright protection (CJEU C-406/10). Any similarities to existing games arise from the nature of the genre.

## Getting Started

```bash
npm install
npm run dev
```

## Build & Deploy

```bash
npm run build
```

Automatic deployment to GitHub Pages on push to `main`.

## Song Database

268 Polish songs in `public/data/songs.json`. Format:

```json
{
  "id": "1",
  "title": "Song Title",
  "artist": "Artist Name",
  "year": 1984,
  "youtubeId": "abc123"
}
```

CSV conversion: `node convert-csv.cjs`

## Tech Stack

- React 19, TypeScript, Vite 7
- Tailwind CSS 4
- Zustand (state + localStorage persistence)
- YouTube iframe API

## License

MIT
