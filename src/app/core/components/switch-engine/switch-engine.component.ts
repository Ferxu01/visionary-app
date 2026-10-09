import { Component, computed, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-switch-engine',
  templateUrl: './switch-engine.component.html',
  imports: [TranslocoPipe],
})
export class SwitchEngineComponent {
  readonly engine = input(false);
  readonly switchedEngine = output<'Threejs' | 'Webgl'>();

  protected readonly currentEngine = computed(() => (this.engine() ? 'Webgl' : 'Threejs'));

  public toggleEngine(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const engine = isChecked ? 'Webgl' : 'Threejs';
    this.switchedEngine.emit(engine);
  }

  protected isThreeEngine(): boolean {
    return this.currentEngine() === 'Threejs';
  }
}
