#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {Genre, Origin} from "../src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const JSON_PATH = join(__dirname, "..", "public", "data", "songs.json");

interface CSVRecord {
  author: string;
  title: string;
  year: string;
  youtubeId: string;
  origin: string;
  genres: string;
}

interface Song {
  id: string;
  artist: string;
  title: string;
  year: number;
  youtubeId: string;
  origin: Origin;
  genres: Genre;
}

function parseArgs(): string[] {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));

  if (args.length === 0) {
    console.error("Error: At least one CSV file is required");
    console.error("Usage: npm run db:generate-json -- database/polish.csv [database/english.csv ...]");
    process.exit(1);
  }

  for (const file of args) {
    if (!existsSync(file)) {
      console.error(`Error: File not found: ${file}`);
      process.exit(1);
    }
  }

  return args;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSVFile(filePath: string): CSVRecord[] {
  console.log(`Reading: ${filePath}`);
  const csvContent = readFileSync(filePath, "utf-8");
  const lines = csvContent.split("\n").filter((line) => line.trim());

  const headerFields = parseCSVLine(lines[0]);
  const hasOriginColumn = headerFields.includes("Origin");
  const hasGenresColumn = headerFields.includes("Genres");

  if (!hasOriginColumn) {
    console.warn(`  Warning: ${filePath} has no Origin column`);
  }
  if (!hasGenresColumn) {
    console.warn(`  Warning: ${filePath} has no Genres column`);
  }

  return lines.slice(1).map((line) => {
    const fields = parseCSVLine(line);
    return {
      author: fields[0] || "",
      title: fields[1] || "",
      year: fields[2] || "",
      youtubeId: fields[3] || "",
      origin: fields[4] || "",
      genres: fields[5] || "",
    };
  });
}

function generateSongsJson(): void {
  const csvFiles = parseArgs();

  console.log(`Processing ${csvFiles.length} CSV file(s)...\n`);

  const allRecords: CSVRecord[] = [];
  for (const file of csvFiles) {
    const records = parseCSVFile(file);
    console.log(`  Found ${records.length} records`);
    allRecords.push(...records);
  }

  console.log(`\nTotal records: ${allRecords.length}`);

  const songs: Song[] = allRecords
    .filter((record) => {
      const hasValidId = record.youtubeId && record.youtubeId.length === 11;
      const hasValidYear = !isNaN(parseInt(record.year));

      if (!hasValidId) {
        console.log(`  Skipping (no YouTube ID): ${record.author} - ${record.title}`);
      } else if (!hasValidYear) {
        console.log(`  Skipping (invalid year): ${record.author} - ${record.title}`);
      }

      return hasValidId && hasValidYear;
    })
    .map((record, index) => {
      const genres: Genre[] = record.genres
        ? (record.genres.split("|").map(g => g.trim()).filter(Boolean) as Genre[])
        : [];

      const origin = (record.origin || 'INT') as Origin;

      return {
        id: String(index + 1),
        artist: record.author,
        title: record.title,
        year: parseInt(record.year),
        youtubeId: record.youtubeId,
        origin,
        genres,
      };
    });

  songs.sort((a, b) => a.year - b.year);

  songs.forEach((song, index) => {
    song.id = String(index + 1);
  });

  console.log(`\nFiltered to ${songs.length} songs with valid YouTube IDs`);

  console.log(`Writing to ${JSON_PATH}...`);
  writeFileSync(JSON_PATH, JSON.stringify(songs, null, 2) + "\n", "utf-8");

  console.log("\n=== Summary by Decade ===");
  const decades = new Map<number, number>();
  songs.forEach((song) => {
    const decade = Math.floor(song.year / 10) * 10;
    decades.set(decade, (decades.get(decade) || 0) + 1);
  });

  Array.from(decades.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([decade, count]) => {
      console.log(`  ${decade}s: ${count} songs`);
    });

  console.log("\n=== Summary by Origin ===");
  const origins = new Map<string, number>();
  songs.forEach((song) => {
    origins.set(song.origin, (origins.get(song.origin) || 0) + 1);
  });

  Array.from(origins.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([origin, count]) => {
      console.log(`  ${origin}: ${count} songs`);
    });

  console.log("\n=== Summary by Genres ===");
  const genreCounts = new Map<string, number>();
  songs.forEach((song) => {
    song.genres.forEach((genre) => {
      genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
    });
  });

  if (genreCounts.size === 0) {
    console.log("  (no genres tagged yet)");
  } else {
    Array.from(genreCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .forEach(([genre, count]) => {
        console.log(`  ${genre}: ${count} songs`);
      });
  }

  console.log(`\nTotal: ${songs.length} songs`);
  console.log(`Year range: ${songs[0]?.year || "N/A"} - ${songs[songs.length - 1]?.year || "N/A"}`);
  console.log("\nDone!");
}

generateSongsJson();
