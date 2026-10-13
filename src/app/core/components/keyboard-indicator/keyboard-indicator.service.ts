import { Injectable, signal } from '@angular/core';

interface ActiveMode {
  key: string; // Keyboard input
  action: string;
}

@Injectable({ providedIn: 'root' })
export class KeyboardIndicatorService {
  /** Signal que contiene el modo actualmente activo, o null si estamos en modo libre por defecto */
  private readonly _activeMode = signal<ActiveMode | null>(null);
  readonly activeMode = this._activeMode.asReadonly();

  /**
   * Establece un modo activo persistente o lo reemplaza directamente si entra otro.
   */
  setMode(key: string, action: string): void {
    this._activeMode.set({ key, action });
  }

  /**
   * Alterna un modo: si ya está activo lo apaga (null), si no está activo lo enciende.
   */
  toggleMode(key: string, action: string): void {
    const current = this._activeMode();
    if (current && current.key.toLowerCase() === key.toLowerCase()) {
      this.clearMode();
    } else {
      this.setMode(key, action);
    }
  }

  /**
   * Quita el modo activo actual y vuelve al estado predeterminado.
   */
  clearMode(): void {
    this._activeMode.set(null);
  }
}
