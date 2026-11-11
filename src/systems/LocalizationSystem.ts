/**
 * Sistema di localizzazione (i18n) per Brumavento.
 * Gestisce il caricamento delle stringhe testuali separate dal codice.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import itLocale from '../data/locales/it.json';

export type LocaleData = typeof itLocale;

export class LocalizationSystem {
  private currentLocale: LocaleData = itLocale;

  /**
   * Risolve una chiave di testo (es. "dialogues.nonna_bussola.node_start_text")
   * supportando parametri dinamici opzionali {name}.
   */
  public t(key: string, params?: Record<string, string | number>): string {
    const segments = key.split('.');
    let current: unknown = this.currentLocale;

    for (const segment of segments) {
      if (current && typeof current === 'object' && segment in current) {
        current = (current as Record<string, unknown>)[segment];
      } else {
        console.warn(`[i18n] Chiave di localizzazione non trovata: "${key}"`);
        return key;
      }
    }

    if (typeof current !== 'string') {
      return key;
    }

    let result = current;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      }
    }

    return result;
  }

  /**
   * Metodo helper statico per accedere rapidamente alla localizzazione globale.
   */
  public static t(key: string, params?: Record<string, string | number>): string {
    return localization.t(key, params);
  }
}

export const localization = new LocalizationSystem();
