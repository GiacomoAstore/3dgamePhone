/**
 * Configurazione Vite per Brumavento.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // Consente l'accesso da smartphone nella stessa rete Wi-Fi
    port: 5173,
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 4096,
  },
});
