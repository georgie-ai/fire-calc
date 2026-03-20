#!/usr/bin/env node
/**
 * Update CPI (Consumer Price Index) monthly data from FRED.
 * Uses the public FRED CSV download (no API key needed).
 * Format: [{ "date": "YYYY-MM", "value": 29.01 }, ...]
 * Values are CPIAUCSL index levels (1982-84=100 base).
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'src', 'data', 'cpi.json');

async function fetchFREDcsv(seriesId) {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED fetch failed: ${res.status}`);
  return res.text();
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const entries = [];
  for (let i = 1; i < lines.length; i++) {
    const [dateStr, valueStr] = lines[i].split(',');
    if (!dateStr || !valueStr || valueStr === '.') continue;
    const value = parseFloat(valueStr);
    if (isNaN(value)) continue;
    const date = dateStr.trim().slice(0, 7);
    entries.push({ date, value });
  }
  return entries;
}

async function main() {
  console.log('Fetching CPI (CPIAUCSL) from FRED...');
  const csv = await fetchFREDcsv('CPIAUCSL');
  const freshData = parseCSV(csv);

  if (freshData.length === 0) {
    console.log('No data from FRED, skipping.');
    return;
  }

  // Load existing data
  const existing = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  const existingDates = new Set(existing.map(e => e.date));
  const lastExisting = existing[existing.length - 1]?.date;

  // Find new entries only
  const newEntries = freshData.filter(
    e => !existingDates.has(e.date) && e.date > lastExisting
  );

  if (newEntries.length === 0) {
    console.log(`CPI: already up to date (last: ${lastExisting})`);
    return;
  }

  const updated = [...existing, ...newEntries];
  writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2) + '\n');
  console.log(`CPI: added ${newEntries.length} new month(s). Last: ${newEntries[newEntries.length - 1].date}`);
}

main().catch(err => {
  console.error('CPI update failed:', err.message);
  process.exit(1);
});
