import type { Song, GameFilter, SongCategory, SongEra } from './types';
import { ERA_CONFIG } from './types';

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
    if (filter.origins && filter.origins.length > 0) {
      if (!filter.origins.includes(song.origin)) {
        return false;
      }
    }

    if (filter.genres && filter.genres.length > 0) {
      const hasMatchingGenre = song.genres.some((genre) =>
        filter.genres!.includes(genre)
      );
      if (!hasMatchingGenre) {
        return false;
      }
    }

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

export function filterByCategory(songs: Song[], category: SongCategory): Song[] {
  switch (category) {
    case 'polish':
      return filterSongs(songs, { origins: ['PL'] });
    case 'international':
      return songs.filter(s => s.origin !== 'PL');
    case 'all':
    default:
      return songs;
  }
}

export function getSongCounts(songs: Song[]): Record<SongCategory, number> {
  return {
    all: songs.length,
    polish: songs.filter(s => s.origin === 'PL').length,
    international: songs.filter(s => s.origin !== 'PL').length,
  };
}

export function filterByEra(songs: Song[], era: SongEra): Song[] {
  const config = ERA_CONFIG[era];
  return songs.filter(song => {
    if (config.minYear !== undefined && song.year < config.minYear) return false;
    if (config.maxYear !== undefined && song.year > config.maxYear) return false;
    return true;
  });
}

export function getEraCounts(songs: Song[]): Record<SongEra, number> {
  return {
    all: songs.length,
    oldSchool: songs.filter(s => s.year <= 1989).length,
    newSchool: songs.filter(s => s.year >= 1990).length,
  };
}
