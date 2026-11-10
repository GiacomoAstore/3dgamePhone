/**
 * Macchina a stati principale di Brumavento.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.1.0
 */

export enum GameState {
  LOADING = 'LOADING',
  START_MENU = 'START_MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  DIALOGUE = 'DIALOGUE',
}

export type StateChangeCallback = (newState: GameState, oldState: GameState) => void;

/**
 * Gestore centralizzato degli stati di gioco con notifiche ai listener.
 */
export class StateManager {
  private currentState: GameState = GameState.LOADING;
  private listeners: StateChangeCallback[] = [];

  /**
   * Restituisce lo stato corrente.
   */
  public getState(): GameState {
    return this.currentState;
  }

  /**
   * Modifica lo stato corrente notificando i listener registrati.
   * @param newState Nuovo stato di gioco.
   */
  public setState(newState: GameState): void {
    if (this.currentState === newState) return;
    const oldState = this.currentState;
    this.currentState = newState;
    for (const listener of this.listeners) {
      listener(newState, oldState);
    }
  }

  /**
   * Registra un callback per il cambio di stato.
   */
  public onStateChange(callback: StateChangeCallback): void {
    this.listeners.push(callback);
  }
}
