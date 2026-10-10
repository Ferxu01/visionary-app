import * as THREE from 'three';
import { gsap } from 'gsap';
import { Command } from '../interfaces/Command.interface';
import { EngineService } from '../engine.service';
import { SelectionService } from '../selection.service';
import { ANIMATION_DURATION, ANIMATION_EASE } from '../three-engine.model';

export class RotateCommand implements Command {
  constructor(
    private engineService: EngineService,
    private selectionService: SelectionService,
    private degrees: number,
    private axis: 'x' | 'y' | 'z',
    private duration: number = ANIMATION_DURATION,
  ) {}

  execute(): void {
    // 1. Determinar el objetivo (Objeto seleccionado o el modelo completo)
    const target =
      this.selectionService.getSelectedObject() || this.engineService.getCurrentModel();

    if (!target) return;

    // 2. Convertir grados sexagesimales a radianes
    const radians = THREE.MathUtils.degToRad(this.degrees);
    const targetRotation = target.rotation[this.axis] + radians;

    // 3. Animar la rotación del objetivo con GSAP
    gsap.to(target.rotation, {
      [this.axis]: targetRotation,
      duration: this.duration,
      ease: ANIMATION_EASE,
      onUpdate: () => {
        target.updateMatrix();
      },
    });
  }

  undo(): void {
    const target =
      this.selectionService.getSelectedObject() || this.engineService.getCurrentModel();

    if (!target) return;

    const radians = THREE.MathUtils.degToRad(this.degrees);
    const targetRotation = target.rotation[this.axis] - radians;

    gsap.to(target.rotation, {
      [this.axis]: targetRotation,
      duration: this.duration,
      ease: ANIMATION_EASE,
      onUpdate: () => {
        target.updateMatrix();
      },
    });
  }
}

// export class RotateCommand implements Command {
//   constructor(
//     private engineService: EngineService,
//     private selectionService: SelectionService,
//     private degrees: number,
//     private axis: 'x' | 'y' | 'z',
//   ) {}

//   execute(): void {
//     const target =
//       this.selectionService.getSelectedObject() || this.engineService.getCurrentModel();
//     if (!target) return;

//     const radians = (this.degrees * Math.PI) / 180;
//     gsap.to(target.rotation, {
//       [this.axis]: target.rotation[this.axis] + radians,
//       duration: 1,
//       ease: 'power2.out',
//     });
//   }
// }
