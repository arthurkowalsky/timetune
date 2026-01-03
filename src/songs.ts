import type { Song } from './types';

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
