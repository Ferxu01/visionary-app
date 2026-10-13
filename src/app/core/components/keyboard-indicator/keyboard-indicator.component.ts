import { Component, inject } from '@angular/core';
import { KeyboardIndicatorService } from './keyboard-indicator.service';

@Component({
  selector: 'app-keyboard-indicator',
  templateUrl: './keyboard-indicator.component.html',
})
export class KeyboardIndicatorComponent {
  private readonly indicatorService = inject(KeyboardIndicatorService);

  protected readonly activeMode = this.indicatorService.activeMode;
}
