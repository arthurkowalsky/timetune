#!/usr/bin/env npx tsx

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const RATE_LIMIT_MS = 1000;
const MAX_RETRIES = 2;

interface SongRecord {
  author: string;
  title: string;
  year: string;
  youtubeId: string;
  origin: string;
}

interface ProcessingResult {
  success: number;
  skipped: number;
  failed: string[];
}

interface CliArgs {
  origin: string | null;
  csvPath: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let origin = "";
  let csvPath = "";

  for (const arg of args) {
    if (arg.startsWith("--origin=")) {
      origin = arg.split("=")[1];
    } else if (!arg.startsWith("-")) {
      csvPath = arg;
    }
  }

  if (!csvPath) {
    console.error("Error: CSV file path is required");
    console.error("Usage: npm run db:fetch-youtube -- [--origin=XX] database/file.csv");
    console.error("  --origin is optional if CSV has Origin column");
    process.exit(1);
  }

  if (!existsSync(csvPath)) {
    console.error(`Error: File not found: ${csvPath}`);
    process.exit(1);
  }

  return { origin: origin ? origin.toUpperCase() : null, csvPath };
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

function escapeCSVField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function recordToCSVLine(record: SongRecord): string {
  return [
    escapeCSVField(record.author),
    escapeCSVField(record.title),
    record.year,
    record.youtubeId,
    record.origin,
  ].join(",");
}

function searchYouTube(query: string): string | null {
  try {
    const escapedQuery = query.replace(/'/g, "'\\''");
    const result = execSync(
      `yt-dlp --get-id --no-warnings --no-playlist 'ytsearch1:${escapedQuery}'`,
      {
        encoding: "utf-8",
        timeout: 30000,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    const videoId = result.trim();
    if (videoId && videoId.length === 11) {
      return videoId;
    }
    return null;
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processSongs(): Promise<void> {
  const { origin, csvPath } = parseArgs();

  console.log(`Reading CSV file: ${csvPath}`);

  const csvContent = readFileSync(csvPath, "utf-8");
  const lines = csvContent.split("\n").filter((line) => line.trim());

  const headerFields = parseCSVLine(lines[0]);
  const hasOriginColumn = headerFields.includes("Origin");

  if (!hasOriginColumn && !origin) {
    console.error("Error: CSV has no Origin column and --origin not provided");
    console.error("Usage: npm run db:fetch-youtube -- --origin=XX database/file.csv");
    process.exit(1);
  }

  if (origin) {
    console.log(`Default origin: ${origin}`);
  }
  if (hasOriginColumn) {
    console.log("Using Origin from CSV");
  } else {
    console.log("Adding Origin column to CSV...");
  }

  const header = hasOriginColumn ? lines[0] : lines[0] + ",Origin";

  const records: SongRecord[] = lines.slice(1).map((line) => {
    const fields = parseCSVLine(line);
    return {
      author: fields[0] || "",
      title: fields[1] || "",
      year: fields[2] || "",
      youtubeId: fields[3] || "",
      origin: fields[4] || origin || "",
    };
  });

  const result: ProcessingResult = {
    success: 0,
    skipped: 0,
    failed: [],
  };

  const total = records.length;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const progress = `[${i + 1}/${total}]`;

    if (!record.origin && origin) {
      record.origin = origin;
    }

    if (record.youtubeId) {
      console.log(`${progress} Skipping: ${record.author} - ${record.title}`);
      result.skipped++;
      continue;
    }

    const searchQuery = `${record.author} ${record.title}`;
    console.log(`${progress} Searching: ${searchQuery}`);

    let videoId: string | null = null;
    let attempts = 0;

    while (!videoId && attempts < MAX_RETRIES) {
      attempts++;
      videoId = searchYouTube(searchQuery);

      if (!videoId && attempts < MAX_RETRIES) {
        console.log(`  Retry ${attempts}/${MAX_RETRIES}...`);
        await sleep(RATE_LIMIT_MS);
      }
    }

    if (videoId) {
      record.youtubeId = videoId;
      result.success++;
      console.log(`  Found: ${videoId}`);
    } else {
      result.failed.push(`${record.author} - ${record.title}`);
      console.log(`  FAILED: No video found`);
    }

    if (i < records.length - 1) {
      await sleep(RATE_LIMIT_MS);
    }
  }

  console.log("\nWriting updated CSV...");
  const outputLines = [header, ...records.map(recordToCSVLine)];
  writeFileSync(csvPath, outputLines.join("\n") + "\n", "utf-8");

  console.log("\n=== Summary ===");
  console.log(`Total songs: ${total}`);
  console.log(`Successfully found: ${result.success}`);
  console.log(`Skipped (already had ID): ${result.skipped}`);
  console.log(`Failed: ${result.failed.length}`);

  if (result.failed.length > 0) {
    console.log("\nFailed songs:");
    result.failed.forEach((song) => console.log(`  - ${song}`));
  }
}

processSongs().catch(console.error);
