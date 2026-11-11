/**
 * Configurazione regolabile per i controlli touch, joystick e sensibilità della telecamera.
 * Autore: Pip & Nonna Bussola dev team
 * Ultima modifica: 2026-11-10 - v0.3.1
 */

export interface ControlsConfig {
  joystickRadius: number; // Raggio massimo di escursione del joystick in pixel
  joystickDeadzone: number; // Zona morta al centro in pixel
  cameraTouchSensitivity: number; // Sensibilità di rotazione camera touch (smartphone)
  cameraMouseSensitivity: number; // Sensibilità di rotazione camera mouse (desktop)
}

export const controlsConfig: ControlsConfig = {
  joystickRadius: 65,
  joystickDeadzone: 8,
  cameraTouchSensitivity: 0.005,
  cameraMouseSensitivity: 0.003,
};

