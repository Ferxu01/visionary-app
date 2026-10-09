import { Injectable, OnDestroy } from '@angular/core';
import { Command } from './interfaces/Command.interface';

@Injectable({ providedIn: 'root' })
export class InputManagerService implements OnDestroy {
  private readonly keyBindings = new Map<string, Command>();

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
  }

  registerKeyBinding(key: string, command: Command): void {
    this.keyBindings.set(key.toLowerCase(), command);
  }

  unregisterKeyBinding(key: string): void {
    this.keyBindings.delete(key.toLowerCase());
  }

  private onKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    if (this.keyBindings.has(key)) {
      this.keyBindings.get(key)?.execute();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
