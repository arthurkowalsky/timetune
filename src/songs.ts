import type { Song, GameFilter } from './types';

let songsData: Song[] = [];
let songsLoaded = false;

export async function loadSongs(): Promise<Song[]> {
  if (songsLoaded) return songsData;

  try {
    const response = await fetch('./data/songs.json');
    songsData = await response.json();
    songsLoaded = true;
    return songsData;
  } catch (error) {
    console.error('Failed to load songs:', error);
    return [];
  }
}

export function getSongs(): Song[] {
  return songsData;
}

export function shuffleSongs(songs: Song[]): Song[] {
  const shuffled = [...songs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function filterSongs(songs: Song[], filter: GameFilter): Song[] {
  return songs.filter((song) => {
    // Filter by origin (PL, INT, etc.)
    if (filter.origins && filter.origins.length > 0) {
      if (!filter.origins.includes(song.origin)) {
        return false;
      }
    }

    // Filter by genres (song must have at least one matching genre)
    if (filter.genres && filter.genres.length > 0) {
      const hasMatchingGenre = song.genres.some((genre) =>
        filter.genres!.includes(genre)
      );
      if (!hasMatchingGenre) {
        return false;
      }
    }

    // Filter by year range
    if (filter.yearRange) {
      if (filter.yearRange.min !== undefined && song.year < filter.yearRange.min) {
        return false;
      }
      if (filter.yearRange.max !== undefined && song.year > filter.yearRange.max) {
        return false;
      }
    }

    return true;
  });
}
