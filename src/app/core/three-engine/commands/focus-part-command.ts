import { Command } from '../interfaces/Command.interface';
import { gsap } from 'gsap';
import * as THREE from 'three';
import { EngineService } from '../engine.service';
import { SelectionService } from '../selection.service';
import { ANIMATION_DURATION, ANIMATION_EASE } from '../three-engine.model';

const DEFAULT_MESH_OPACITY = 0.05; // 0.15 antes

export class FocusPartCommand implements Command {
  constructor(
    private selectionService: SelectionService,
    private engineService: EngineService,
  ) {}

  execute(): void {
    const selected = this.selectionService.getSelectedObject();

    // Si no hay objeto seleccionado o ya se está enfocado en él, quitamos el foco
    if (!selected || !(selected instanceof THREE.Mesh)) {
      this.engineService.resetFocus();
      return;
    }

    const camera = this.engineService.getCamera();
    const controls = this.engineService.getControls();
    const scene = this.engineService.getScene();

    // 1. Guardar la posición previa de la cámara si es la primera vez que enfocamos
    this.engineService.storePreFocusCameraState();

    // 2. Calcular el centro del objeto objetivo
    const boundingBox = new THREE.Box3().setFromObject(selected);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    // 3. Calcular la dirección y distancia óptima de acercamiento
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction).negate();

    const size = boundingBox.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const distance = Math.max(maxDimension * 2.5, 1.5); // Distancia de seguridad para evitar traspasar el mesh

    const targetPos = center.clone().addScaledVector(direction, distance);

    // 4. Animar la posición de la cámara y el target de OrbitControls simultáneamente
    this.engineService.animateTransform(camera.position, targetPos);
    this.engineService.animateTransform(controls.target, center, () => controls.update);

    // 5. Aplicar transparencia atenuada al resto de mallas no seleccionadas
    this.applyFocusTransparency(scene, selected);
  }

  private applyFocusTransparency(scene: THREE.Scene, focusedObject: THREE.Object3D): void {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const isFocused = child === focusedObject;
        const materials = Array.isArray(child.material) ? child.material : [child.material];

        materials.forEach((mat) => {
          if (
            mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial
          ) {
            // Guardar opacidad y transparencia originales en userData del material
            if (mat.userData['origOpacity'] === undefined) {
              mat.userData['origOpacity'] = mat.opacity;
              mat.userData['origTransparent'] = mat.transparent;
            }

            mat.transparent = true;

            const opacity = isFocused ? mat.userData['origOpacity'] : DEFAULT_MESH_OPACITY;
            gsap.to(mat, {
              opacity,
              duration: ANIMATION_DURATION,
              ease: ANIMATION_EASE,
            });
          }
        });
      }
    });
  }
}

// import { Command } from '../interfaces/Command.interface';
// import { gsap } from 'gsap';
// import * as THREE from 'three';
// import { EngineService } from '../engine.service';
// import { SelectionService } from '../selection.service';
// import { ANIMATION_DURATION, ANIMATION_EASE } from '../three-engine.model';

// export class FocusPartCommand implements Command {
//   constructor(
//     private selectionService: SelectionService,
//     private engineService: EngineService,
//   ) {}

//   execute(): void {
//     const selected = this.selectionService.getSelectedObject();

//     if (!selected || !(selected instanceof THREE.Mesh)) {
//       this.engineService.resetFocus();
//       return;
//     }

//     const camera = this.engineService.getCamera();
//     const controls = this.engineService.getControls();
//     const scene = this.engineService.getScene();

//     this.engineService.storePreFocusCameraState();

//     const boundingBox = new THREE.Box3().setFromObject(selected);
//     const center = new THREE.Vector3();
//     boundingBox.getCenter(center);

//     const direction = new THREE.Vector3();
//     camera.getWorldDirection(direction).negate();

//     const size = boundingBox.getSize(new THREE.Vector3());
//     const maxDimension = Math.max(size.x, size.y, size.z);
//     const distance = Math.max(maxDimension * 2.2, 1.2);

//     const targetPos = center.clone().addScaledVector(direction, distance);

//     // Animar cámara y OrbitControls
//     gsap.to(camera.position, {
//       x: targetPos.x,
//       y: targetPos.y,
//       z: targetPos.z,
//       duration: ANIMATION_DURATION,
//       ease: ANIMATION_EASE,
//     });

//     gsap.to(controls.target, {
//       x: center.x,
//       y: center.y,
//       z: center.z,
//       duration: ANIMATION_DURATION,
//       ease: ANIMATION_EASE,
//       onUpdate: () => controls.update(),
//     });

//     // Aplicar atenuación drástica
//     this.applyFocusTransparency(scene, selected);
//   }

//   private applyFocusTransparency(scene: THREE.Scene, focusedObject: THREE.Object3D): void {
//     scene.traverse((child) => {
//       if (child instanceof THREE.Mesh) {
//         const isFocused = child === focusedObject;
//         const materials = Array.isArray(child.material) ? child.material : [child.material];

//         materials.forEach((mat) => {
//           if (
//             mat instanceof THREE.MeshStandardMaterial ||
//             mat instanceof THREE.MeshPhysicalMaterial
//           ) {
//             // Guardar valores originales la primera vez
//             if (mat.userData['origOpacity'] === undefined) {
//               mat.userData['origOpacity'] = mat.opacity;
//               mat.userData['origTransparent'] = mat.transparent;
//               mat.userData['origDepthWrite'] = mat.depthWrite;
//             }

//             mat.transparent = true;
//             // Desactivar depthWrite en mallas no enfocadas para que no tapen al objeto principal
//             mat.depthWrite = isFocused;

//             // Opacidad casi invisible (0.02) para dar un toque sutil de silueta sin tapar
//             const targetOpacity = isFocused ? mat.userData['origOpacity'] : 0.02;

//             gsap.to(mat, {
//               opacity: targetOpacity,
//               duration: ANIMATION_DURATION,
//               ease: ANIMATION_EASE,
//             });
//           }
//         });
//       }
//     });
//   }
// }
