/**
 * Dichiarazioni di tipo per i moduli nativi Node.js utilizzati esclusivamente
 * nella suite di test Vitest, senza introdurre dipendenze npm esterne.
 */

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: string): string;
}

declare module 'node:path' {
  export function resolve(...paths: string[]): string;
}
