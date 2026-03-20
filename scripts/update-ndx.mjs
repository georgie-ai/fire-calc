#!/usr/bin/env node
/**
 * Update NDX (Nasdaq-100) monthly return data from Stooq.
 * Appends any new months not already in the JSON file.
 * Format: [{ "date": "YYYY-MM", "return": -0.01184 }, ...]
 * Returns are monthly price returns: (close_cur / close_prev) - 1
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'src', 'data', 'ndx.json');

async function fetchStooqCSV(symbol, interval) {
  const url = `https://stooq.com/q/d/l/?s=${symbol}&i=${interval}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Stooq fetch failed: ${res.status}`);
  return res.text();
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const header = lines[0].toLowerCase().split(',');
  const dateIdx = header.indexOf('date');
  const closeIdx = header.indexOf('close');
  if (dateIdx === -1 || closeIdx === -1) throw new Error('Unexpected CSV format');

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length <= Math.max(dateIdx, closeIdx)) continue;
    const date = cols[dateIdx].trim();
    const close = parseFloat(cols[closeIdx]);
    if (!date || isNaN(close)) continue;
    rows.push({ date, close });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
}

function toYYYYMM(dateStr) {
  return dateStr.slice(0, 7);
}

async function main() {
  console.log('Fetching NDX monthly data from Stooq...');
  const csv = await fetchStooqCSV('^ndx', 'm');
  const rows = parseCSV(csv);

  if (rows.length < 2) {
    console.log('Not enough data from Stooq, skipping.');
    return;
  }

  // Calculate monthly returns
  const monthlyReturns = [];
  for (let i = 1; i < rows.length; i++) {
    const ret = (rows[i].close / rows[i - 1].close) - 1;
    monthlyReturns.push({
      date: toYYYYMM(rows[i].date),
      return: Math.round(ret * 1e6) / 1e6,
    });
  }

  // Load existing data
  const existing = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  const existingDates = new Set(existing.map(e => e.date));
  const lastExisting = existing[existing.length - 1]?.date;

  // Find new entries
  const newEntries = monthlyReturns.filter(
    e => !existingDates.has(e.date) && e.date > lastExisting
  );

  if (newEntries.length === 0) {
    console.log(`NDX: already up to date (last: ${lastExisting})`);
    return;
  }

  const updated = [...existing, ...newEntries];
  writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2) + '\n');
  console.log(`NDX: added ${newEntries.length} new month(s). Last: ${newEntries[newEntries.length - 1].date}`);
}

main().catch(err => {
  console.error('NDX update failed:', err.message);
  process.exit(1);
});
