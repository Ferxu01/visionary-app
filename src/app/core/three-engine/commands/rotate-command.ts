import { EngineService } from '../engine.service';
import { Command } from '../interfaces/Command.interface';
import { gsap } from 'gsap';
import { SelectionService } from '../selection.service';

export class RotateCommand implements Command {
  constructor(
    private engineService: EngineService,
    private selectionService: SelectionService,
    private degrees: number,
    private axis: 'x' | 'y' | 'z',
  ) {}

  execute(): void {
    const target =
      this.selectionService.getSelectedObject() || this.engineService.getCurrentModel();
    if (!target) return;

    const radians = (this.degrees * Math.PI) / 180;
    gsap.to(target.rotation, {
      [this.axis]: target.rotation[this.axis] + radians,
      duration: 1,
      ease: 'power2.out',
    });
  }
}
