import { Component, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

interface InstructionItem {
  icon: string;
  labelKey: string;
  descriptionKey?: string; // Descripción detallada para la vista expandida
}

@Component({
  selector: 'app-instruction-detail-modal',
  templateUrl: './instruction-detail-modal.component.html',
  imports: [TranslocoPipe],
})
export class InstructionDetailModalComponent {
  protected readonly isOpen = signal(false);

  protected readonly instructions: InstructionItem[] = [
    {
      icon: 'assets/images/instructions/move.png',
      labelKey: 'MOVE',
      descriptionKey: 'INSTRUCTIONS.MOVE_DESC',
    },
    {
      icon: 'assets/images/instructions/rotate.png',
      labelKey: 'ROTATE',
      descriptionKey: 'INSTRUCTIONS.ROTATE_DESC',
    },
    {
      icon: 'assets/images/instructions/zoom.png',
      labelKey: 'ZOOM',
      descriptionKey: 'INSTRUCTIONS.ZOOM_DESC',
    },
    {
      icon: 'assets/images/instructions/select.png',
      labelKey: 'SELECT',
      descriptionKey: 'INSTRUCTIONS.SELECT_DESC',
    },
    {
      icon: 'assets/images/instructions/focus.png',
      labelKey: 'FOCUS',
      descriptionKey: 'INSTRUCTIONS.FOCUS_DESC',
    },
    {
      icon: 'assets/images/instructions/blur.png',
      labelKey: 'BLUR',
      descriptionKey: 'INSTRUCTIONS.BLUR_DESC',
    },
  ];

  open(): void {
    this.isOpen.set(true);
  }

  protected close(): void {
    this.isOpen.set(false);
  }
}
