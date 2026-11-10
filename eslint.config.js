/**
 * Configurazione ESLint per Brumavento.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */
export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'public/**'],
  },
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    rules: {
      'no-unused-vars': 'off', // Gestito da TypeScript compiler (strict)
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },
];
