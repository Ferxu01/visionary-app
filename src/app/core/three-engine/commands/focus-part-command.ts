import { Command } from '../interfaces/Command.interface';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { EngineService } from '../engine.service';
import { SelectionService } from '../selection.service';

export class FocusPartCommand implements Command {
  constructor(
    private selectionService: SelectionService,
    private engineService: EngineService,
  ) {}

  execute(): void {
    const selected = this.selectionService.getSelectedObject();
    if (!selected || !(selected instanceof THREE.Mesh)) return;

    const camera = this.engineService.getCamera();
    const boundingBox = new THREE.Box3().setFromObject(selected);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction).negate();

    const distance = boundingBox.getSize(new THREE.Vector3()).length() * 2;
    const targetPos = center.clone().addScaledVector(direction, distance);

    gsap.to(camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => camera.lookAt(center),
    });
  }
}
