import { Component, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

interface InstructionItem {
  icon: string;
  labelKey: string;
}

@Component({
  selector: 'app-instructions-panel',
  templateUrl: './instructions-panel.component.html',
  imports: [TranslocoPipe],
})
export class InstructionsPanelComponent {
  protected readonly isOpen = signal(false);

  protected readonly instructions: InstructionItem[] = [
    { icon: 'assets/images/instructions/move.png', labelKey: 'MOVE' },
    {
      icon: 'assets/images/instructions/rotate.png',
      labelKey: 'ROTATE',
    },
    { icon: 'assets/images/instructions/zoom.png', labelKey: 'ZOOM' },
    {
      icon: 'assets/images/instructions/select.png',
      labelKey: 'SELECT',
    },
    {
      icon: 'assets/images/instructions/focus.png',
      labelKey: 'FOCUS',
    },
    {
      icon: 'assets/images/instructions/blur.png',
      labelKey: 'BLUR',
    },
  ];

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }
}
