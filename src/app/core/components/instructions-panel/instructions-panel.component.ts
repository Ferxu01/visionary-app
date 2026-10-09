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
    { icon: 'assets/images/instructions/move.png', labelKey: 'Pages.3dModel.instructions.move' },
    {
      icon: 'assets/images/instructions/rotate.png',
      labelKey: 'Pages.3dModel.instructions.rotate',
    },
    { icon: 'assets/images/instructions/zoom.png', labelKey: 'Pages.3dModel.instructions.zoom' },
    {
      icon: 'assets/images/instructions/select.png',
      labelKey: 'Pages.3dModel.instructions.select',
    },
    {
      icon: 'assets/images/instructions/focus.png',
      labelKey: 'Pages.3dModel.instructions.focus',
    },
    {
      icon: 'assets/images/instructions/blur.png',
      labelKey: 'Pages.3dModel.instructions.defocus',
    },
  ];

  protected toggle(): void {
    this.isOpen.update((value) => !value);
  }
}
