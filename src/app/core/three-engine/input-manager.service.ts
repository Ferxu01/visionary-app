import { Injectable, OnDestroy } from '@angular/core';
import { Command } from './interfaces/Command.interface';

type InputKey = 'h' | 'g' | 'escape';

@Injectable({ providedIn: 'root' })
export class InputManagerService implements OnDestroy {
  private readonly keyBindings = new Map<InputKey, Command>();

  constructor() {
    this.onKeyDown = this.onKeyDown.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
  }

  registerKeyBinding(key: InputKey, command: Command): void {
    this.keyBindings.set(key, command);
  }

  unregisterKeyBinding(key: InputKey): void {
    this.keyBindings.delete(key);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase() as InputKey;
    if (this.keyBindings.has(key)) {
      this.keyBindings.get(key)?.execute();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
