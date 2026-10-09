import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SelectionService {
  private readonly selectedObjectSubject = new BehaviorSubject<THREE.Object3D | null>(null);
  selectedObject$: Observable<THREE.Object3D | null> = this.selectedObjectSubject.asObservable();

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private outlinePass!: OutlinePass;

  setOutlinePass(outlinePass: OutlinePass): void {
    this.outlinePass = outlinePass;
  }

  raycast(
    event: MouseEvent,
    camera: THREE.Camera,
    scene: THREE.Scene,
    domElement: HTMLElement,
  ): THREE.Object3D | null {
    // 1. Obtener la posición del clic relativa al canvas
    const rect = domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 2. Proyectar rayo desde la cámara
    this.raycaster.setFromCamera(this.pointer, camera);

    // 3. Buscar colisiones con los objetos de la escena
    const intersects = this.raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      // Tomamos el primer objeto impactado por el rayo
      const hitObject = intersects[0].object;
      this.setSelectedObject(hitObject);
      return hitObject;
    }

    // Si hace clic en el fondo, deseleccionamos
    this.clearSelection();
    return null;
  }

  setSelectedObject(object: THREE.Object3D | null): void {
    this.selectedObjectSubject.next(object);

    if (this.outlinePass) {
      this.outlinePass.selectedObjects = object ? [object] : [];
    }

    // this.selectedObjectSubject.next(object);
    // if (this.outlinePass && object) {
    //   this.outlinePass.selectedObjects = [object];
    // } else if (this.outlinePass) {
    //   this.outlinePass.selectedObjects = [];
    // }
  }

  getSelectedObject(): THREE.Object3D | null {
    return this.selectedObjectSubject.value;
  }

  clearSelection(): void {
    this.setSelectedObject(null);
  }
}
