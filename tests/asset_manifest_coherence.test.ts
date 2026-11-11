/**
 * Test di coerenza tra il manifest degli asset generato (src/data/asset_manifest.json)
 * e la documentazione formale in ASSETS.md.
 * Verifica che ogni file presente nel manifest sia censito in ASSETS.md e viceversa.
 *
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-11 - v0.4.0
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import manifest from '../src/data/asset_manifest.json';

describe('Coerenza Asset Manifest vs ASSETS.md', () => {
  it('dovrebbe avere tutti i file fisici del manifest debitamente documentati in ASSETS.md', () => {
    const assetsMdPath = path.resolve('ASSETS.md');
    const content = fs.readFileSync(assetsMdPath, 'utf-8');

    expect(manifest.assets.length).toBeGreaterThan(0);

    for (const asset of manifest.assets) {
      // Verifica che il nome file o il percorso compaia nel documento ASSETS.md
      const appearsInMd = content.includes(asset.filename) || content.includes(asset.path);
      expect(appearsInMd, `L'asset fisico "${asset.path}" non è documentato in ASSETS.md!`).toBe(true);

      // Verifica che il checksum SHA-256 coincida con quello documentato
      const shaAppears = content.includes(asset.sha256);
      expect(shaAppears, `Il checksum SHA-256 di "${asset.path}" (${asset.sha256}) non coincide con ASSETS.md!`).toBe(true);
    }
  });

  it('dovrebbe non avere file documentati nella sezione attiva di ASSETS.md che mancano dal manifest', () => {
    // Estrae i file della tabella 2 da ASSETS.md
    const assetsMdPath = path.resolve('ASSETS.md');
    const content = fs.readFileSync(assetsMdPath, 'utf-8');

    // Cerca tutte le righe del tipo | **`filename`** |
    const regex = /\|\s*\*\*`([^`]+)`\*\*\s*\|/g;
    const documentedFiles: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      documentedFiles.push(match[1]);
    }

    expect(documentedFiles.length).toBe(manifest.assets.length);

    for (const docFile of documentedFiles) {
      const foundInManifest = manifest.assets.some(
        (a) => a.filename === docFile || a.path.endsWith(docFile)
      );
      expect(foundInManifest, `Il file "${docFile}" documentato in ASSETS.md non esiste nel manifest fisico!`).toBe(true);
    }
  });

  it('dovrebbe garantire che la versione del gioco sia allineata tra package.json e VERSION senza discrepanze', () => {
    const pkgPath = path.resolve('package.json');
    const versionPath = path.resolve('VERSION');
    const pkgContent = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const versionContent = fs.readFileSync(versionPath, 'utf-8').trim();

    expect(pkgContent.version).toBe(versionContent);
  });
});
