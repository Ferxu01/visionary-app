import { inject, Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { EngineService } from './engine.service';
import { SelectionService } from './selection.service';

@Injectable({ providedIn: 'root' })
export class DragManagerService implements OnDestroy {
  private readonly engineService = inject(EngineService);
  private readonly selectionService = inject(SelectionService);

  private isMoveModeEnabled = false;
  private isDragging = false;
  private dragAction: 'translate' | 'rotate' | null = null;

  private movePlane = new THREE.Plane();
  private offset = new THREE.Vector3();
  private intersectionPoint = new THREE.Vector3();
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  // Variables para la rotación con ratón
  private prevMouseX = 0;
  private prevMouseY = 0;
  private readonly rotationSpeed = 0.005;

  private boundOnPointerDown = this.onPointerDown.bind(this);
  private boundOnPointerMove = this.onPointerMove.bind(this);
  private boundOnPointerUp = this.onPointerUp.bind(this);

  /**
   * Inicializa los eventos del ratón/pointer sobre el canvas de Three.js.
   */
  init(domElement: HTMLCanvasElement): void {
    domElement.addEventListener('pointerdown', this.boundOnPointerDown);
    window.addEventListener('pointermove', this.boundOnPointerMove);
    window.addEventListener('pointerup', this.boundOnPointerUp);
  }

  /**
   * Activa o desactiva el modo de movimiento libre.
   */
  setMoveMode(enabled: boolean): void {
    this.isMoveModeEnabled = enabled;
  }

  toggleMoveMode(): boolean {
    this.isMoveModeEnabled = !this.isMoveModeEnabled;
    return this.isMoveModeEnabled;
  }

  isMoveMode(): boolean {
    return this.isMoveModeEnabled;
  }

  private onPointerDown(event: PointerEvent): void {
    // Solo actuamos con clic primario (izquierdo) o secundario (derecho)
    if (event.button !== 0 && event.button !== 2) return;

    const selected = this.selectionService.getSelectedObject();
    const camera = this.engineService.getCamera();
    const domElement = this.engineService.getDomElement();

    this.updatePointerCoords(event, domElement);

    // 1. MODO TRASLACIÓN (Activado con Tecla 'G')
    if (this.isMoveModeEnabled && selected) {
      this.raycaster.setFromCamera(this.pointer, camera);

      const planeNormal = new THREE.Vector3();
      camera.getWorldDirection(planeNormal).negate();
      this.movePlane.setFromNormalAndCoplanarPoint(planeNormal, selected.position);

      if (this.raycaster.ray.intersectPlane(this.movePlane, this.intersectionPoint)) {
        this.offset.subVectors(selected.position, this.intersectionPoint);
        this.isDragging = true;
        this.dragAction = 'translate';
        this.engineService.getControls().enabled = false;
      }
      return;
    }

    // 2. MODO ROTACIÓN DE PIEZA INDIVIDUAL
    // Si hay una parte seleccionada y se arrastra con clic izquierdo (o clic derecho), rotamos la pieza
    if (selected && event.button === 0) {
      this.isDragging = true;
      this.dragAction = 'rotate';
      this.prevMouseX = event.clientX;
      this.prevMouseY = event.clientY;

      // Desactivar temporalmente los OrbitControls para que no gire toda la escena
      this.engineService.getControls().enabled = false;
    }
  }

  private onPointerMove(event: PointerEvent): void {
    if (!this.isDragging || !this.dragAction) return;

    const selected = this.selectionService.getSelectedObject();
    if (!selected) return;

    // --- ACCIÓN: TRASLACIÓN DE LA PIEZA ---
    if (this.dragAction === 'translate') {
      const camera = this.engineService.getCamera();
      const domElement = this.engineService.getDomElement();

      this.updatePointerCoords(event, domElement);
      this.raycaster.setFromCamera(this.pointer, camera);

      if (this.raycaster.ray.intersectPlane(this.movePlane, this.intersectionPoint)) {
        selected.position.copy(this.intersectionPoint.add(this.offset));
        selected.updateMatrix();
      }
      return;
    }

    // --- ACCIÓN: ROTACIÓN LIBRE CON EL RATÓN ---
    if (this.dragAction === 'rotate') {
      const deltaX = event.clientX - this.prevMouseX;
      const deltaY = event.clientY - this.prevMouseY;

      // Rotar según el desplazamiento diferencial del ratón en X e Y
      selected.rotation.y += deltaX * this.rotationSpeed;
      selected.rotation.x += deltaY * this.rotationSpeed;
      selected.updateMatrix();

      this.prevMouseX = event.clientX;
      this.prevMouseY = event.clientY;
    }
  }

  // private onPointerDown(event: PointerEvent): void {
  //   // Solo permitir mover si el modo está activo y fue clic derecho o izquierdo sobre una pieza seleccionada
  //   if (!this.isMoveModeEnabled) return;

  //   const selected = this.selectionService.getSelectedObject();
  //   if (!selected) return;

  //   const camera = this.engineService.getCamera();
  //   const domElement = this.engineService.getDomElement();

  //   this.updatePointerCoords(event, domElement);
  //   this.raycaster.setFromCamera(this.pointer, camera);

  //   // Crear un plano paralelo a la cámara que pasa por el centro del objeto
  //   const planeNormal = new THREE.Vector3();
  //   camera.getWorldDirection(planeNormal).negate();
  //   this.movePlane.setFromNormalAndCoplanarPoint(planeNormal, selected.position);

  //   // Calcular la diferencia (offset) entre la posición del objeto y el clic
  //   if (this.raycaster.ray.intersectPlane(this.movePlane, this.intersectionPoint)) {
  //     this.offset.subVectors(selected.position, this.intersectionPoint);
  //     this.isDragging = true;

  //     // Deshabilitar temporálmente OrbitControls para que no rote mientras arrastramos
  //     this.engineService.getControls().enabled = false;
  //   }
  // }

  // private onPointerMove(event: PointerEvent): void {
  //   if (!this.isDragging || !this.isMoveModeEnabled) return;

  //   const selected = this.selectionService.getSelectedObject();
  //   if (!selected) return;

  //   const camera = this.engineService.getCamera();
  //   const domElement = this.engineService.getDomElement();

  //   this.updatePointerCoords(event, domElement);
  //   this.raycaster.setFromCamera(this.pointer, camera);

  //   if (this.raycaster.ray.intersectPlane(this.movePlane, this.intersectionPoint)) {
  //     // Aplicar nueva posición sumando el offset inicial
  //     const newPos = this.intersectionPoint.add(this.offset);

  //     // Desplazamiento en el plano 3D alineado a la vista
  //     selected.position.copy(newPos);
  //     selected.updateMatrix();
  //   }
  // }

  private onPointerUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.dragAction = null;

      // Reactivar OrbitControls
      this.engineService.getControls().enabled = true;
    }
  }

  private updatePointerCoords(event: PointerEvent, domElement: HTMLElement): void {
    const rect = domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  ngOnDestroy(): void {
    window.removeEventListener('pointermove', this.boundOnPointerMove);
    window.removeEventListener('pointerup', this.boundOnPointerUp);
  }
}
