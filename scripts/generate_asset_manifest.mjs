/**
 * Script di generazione automatica del manifest degli asset 3D per la build.
 * Scansiona public/models/ ed emette src/data/asset_manifest.json.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.4.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const MODELS_DIR = path.resolve('public/models');
const OUTPUT_FILE = path.resolve('src/data/asset_manifest.json');

function scanDirectory(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      results.push(...scanDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      const buffer = fs.readFileSync(fullPath);
      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex').toUpperCase();

      results.push({
        path: relPath,
        filename: entry.name,
        sizeBytes: stats.size,
        sizeKB: Number((stats.size / 1024).toFixed(1)),
        sha256
      });
    }
  }

  return results.sort((a, b) => a.path.localeCompare(b.path));
}

export function generateManifest() {
  const assets = scanDirectory(MODELS_DIR);
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalAssets: assets.length,
    totalSizeBytes: assets.reduce((sum, a) => sum + a.sizeBytes, 0),
    totalSizeKB: Number((assets.reduce((sum, a) => sum + a.sizeBytes, 0) / 1024).toFixed(1)),
    assets
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  console.log(`✅ Asset manifest generato: ${assets.length} file registrati in ${OUTPUT_FILE} (${manifest.totalSizeKB} KB totali)`);
  return manifest;
}

generateManifest();

