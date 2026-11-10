/**
 * Banner di notifica e feedback a comparsa (Toast cartoon).
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.2.0
 */

import { globalEventBus } from '../core/EventBus';

export interface BannerPayload {
  text: string;
  duration?: number;
}

export class NotificationBanner {
  private element: HTMLElement;
  private textElement: HTMLElement;
  private timeoutId: number | null = null;

  constructor() {
    this.element = document.getElementById('notification-toast') as HTMLElement;
    this.textElement = document.getElementById('toast-text') as HTMLElement;

    globalEventBus.on<BannerPayload>('banner-show', (payload) => {
      this.show(payload.text, payload.duration || 3000);
    });
  }

  public show(text: string, durationMs = 3000): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
    }

    // Rigorosamente textContent per sicurezza (Regola utente 5)
    this.textElement.textContent = text;
    this.element.classList.remove('hidden');

    this.timeoutId = window.setTimeout(() => {
      this.element.classList.add('hidden');
      this.timeoutId = null;
    }, durationMs);
  }
}
