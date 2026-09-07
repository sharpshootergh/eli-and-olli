import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');

function ensureDataDirExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('[Storage] Error creating data directory:', err);
  }
}

export function readJson<T>(filename: string, fallback: T): T {
  ensureDataDirExists();
  const filePath = path.join(DATA_DIR, filename);

  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed !== null && parsed !== undefined) {
        return parsed as T;
      }
    }
  } catch (err) {
    console.error(`[Storage] Error reading ${filename}:`, err);
  }

  return fallback;
}

export function writeJson<T>(filename: string, data: T): boolean {
  ensureDataDirExists();
  const filePath = path.join(DATA_DIR, filename);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[Storage] Error writing ${filename}:`, err);
    return false;
  }
}
