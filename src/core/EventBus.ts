/**
 * Event Bus tipizzato per la comunicazione disaccoppiata tra sistemi.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

export type EventCallback<T = unknown> = (data: T) => void;

export class EventBus {
  private events: Map<string, EventCallback<unknown>[]> = new Map();

  /**
   * Iscrive un listener a un evento specifico.
   */
  public on<T>(event: string, callback: EventCallback<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback as EventCallback<unknown>);
  }

  /**
   * Rimuove un listener precedentemente registrato.
   */
  public off<T>(event: string, callback: EventCallback<T>): void {
    const listeners = this.events.get(event);
    if (!listeners) return;
    this.events.set(
      event,
      listeners.filter((cb) => cb !== (callback as EventCallback<unknown>))
    );
  }

  /**
   * Notifica tutti i listener registrati per l'evento specificato.
   */
  public emit<T>(event: string, data?: T): void {
    const listeners = this.events.get(event);
    if (listeners) {
      for (const callback of listeners) {
        callback(data);
      }
    }
  }
}

export const globalEventBus = new EventBus();
