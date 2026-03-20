#!/usr/bin/env node
/**
 * Update Federal Funds Rate monthly data from FRED.
 * Uses the public FRED data download (no API key needed for CSV).
 * Format: [{ "date": "YYYY-MM", "rate": 0.0399 }, ...]
 * Rates are stored as decimals (e.g., 4% = 0.04).
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'src', 'data', 'fedFundsRate.json');

async function fetchFREDcsv(seriesId) {
  // FRED public CSV download — no API key required
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
    const date = dateStr.trim().slice(0, 7); // "YYYY-MM-DD" -> "YYYY-MM"
    entries.push({ date, rate: Math.round((value / 100) * 1e6) / 1e6 }); // % to decimal
  }
  return entries;
}

async function main() {
  console.log('Fetching Fed Funds Rate (FEDFUNDS) from FRED...');
  const csv = await fetchFREDcsv('FEDFUNDS');
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
    console.log(`Fed Funds: already up to date (last: ${lastExisting})`);
    return;
  }

  const updated = [...existing, ...newEntries];
  writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2) + '\n');
  console.log(`Fed Funds: added ${newEntries.length} new month(s). Last: ${newEntries[newEntries.length - 1].date}`);
}

main().catch(err => {
  console.error('Fed Funds update failed:', err.message);
  process.exit(1);
});
