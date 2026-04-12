import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseLibraryAttendanceCsv } from '$lib/data/libraryData';

let cachedDataset;

export function getLibraryDataset() {
  if (cachedDataset) return cachedDataset;

  const csvPath = resolve(process.cwd(), 'static/film-permits.csv');
  const csvText = readFileSync(csvPath, 'utf-8');

  cachedDataset = parseLibraryAttendanceCsv(csvText);
  return cachedDataset;
}
