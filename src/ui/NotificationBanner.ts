/**
 * Banner di notifica e feedback a comparsa (Toast cartoon).
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.1
 */

import { globalEventBus } from '../core/EventBus';

export interface BannerPayload {
  text: string;
  duration?: number;
  actionText?: string;
  onAction?: () => void;
}

export class NotificationBanner {
  private element: HTMLElement | null = null;
  private textElement: HTMLElement | null = null;
  private actionButton: HTMLButtonElement | null = null;
  private timeoutId: number | null = null;
  private currentActionCallback: (() => void) | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.element = document.getElementById('notification-toast');
      this.textElement = document.getElementById('toast-text');
      this.actionButton = document.getElementById('toast-action-btn') as HTMLButtonElement | null;

      if (this.actionButton) {
        this.actionButton.addEventListener('click', () => {
          if (this.currentActionCallback) {
            const cb = this.currentActionCallback;
            this.currentActionCallback = null;
            cb();
          }
          this.hide();
        });
      }
    }

    globalEventBus.on<BannerPayload>('banner-show', (payload) => {
      this.show(payload.text, payload.duration || 3000, payload.actionText, payload.onAction);
    });
  }

  public show(text: string, durationMs = 3000, actionText?: string, onAction?: () => void): void {
    if (this.timeoutId !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (!this.element || !this.textElement) return;

    // Rigorosamente textContent per conformità e sicurezza
    this.textElement.textContent = text;

    if (this.actionButton) {
      if (actionText && onAction) {
        this.actionButton.textContent = actionText;
        this.actionButton.classList.remove('hidden');
        this.currentActionCallback = onAction;
      } else {
        this.actionButton.classList.add('hidden');
        this.currentActionCallback = null;
      }
    }

    this.element.classList.remove('hidden');

    if (typeof window !== 'undefined') {
      this.timeoutId = window.setTimeout(() => {
        this.hide();
      }, durationMs);
    }
  }

  public hide(): void {
    if (this.timeoutId !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.currentActionCallback = null;
    if (this.element) {
      this.element.classList.add('hidden');
    }
    if (this.actionButton) {
      this.actionButton.classList.add('hidden');
    }
  }
}
