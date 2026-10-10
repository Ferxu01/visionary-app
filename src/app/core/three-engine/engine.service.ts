import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import {
  ANIMATION_DURATION,
  ANIMATION_EASE,
  EXPLOSION_CONFIGS,
  ModelType,
  OUTLINE_VISIBLE_COLOR_RGB,
} from './three-engine.model';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  // Contexto 3D
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private composer!: EffectComposer;
  private outlinePass!: OutlinePass;
  private animationFrameId!: number;

  // Estado del modelo
  private currentModel: THREE.Object3D | null = null;
  private currentModelType: ModelType = 'Sin Corte';
  private isExploded = false;

  // Transformaciones iniciales
  private readonly initialPositions = new Map<THREE.Object3D, THREE.Vector3>();
  private readonly initialRotations = new Map<THREE.Object3D, THREE.Euler>();
  private readonly initialCameraPos = new THREE.Vector3();
  private readonly initialTargetPos = new THREE.Vector3();

  init(canvas: HTMLCanvasElement): void {
    this.scene = new THREE.Scene();

    // Dimensiones reales del contenedor o ventana
    const width = canvas.parentElement?.clientWidth || canvas.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || canvas.clientHeight || window.innerHeight;

    this.setupCamera(width, height);
    this.setupRenderer(canvas, width, height);
    this.setupControls();
    this.setupPostProcessing(width, height);
    this.setupLights();

    this.animate();
    window.addEventListener('resize', this.onWindowResize);
  }

  loadModel(path: string, onLoadCallback?: (model: THREE.Object3D) => void): void {
    const loader = new GLTFLoader();

    loader.load(
      path,
      (gltf) => {
        // Limpiar modelo anterior si existe
        // this.clearCurrentModel();

        // Limpiar modelo anterior si existe
        if (this.currentModel) {
          this.scene.remove(this.currentModel);
        }

        this.currentModel = gltf.scene;

        // Formatear nombres de las partes a minúsculas
        this.currentModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.name = child.name.toLowerCase();
          }
        });

        this.scene.add(this.currentModel);
        this.fitCameraToModel(this.currentModel);
        this.saveInitialState(this.controls.target);

        if (onLoadCallback) {
          onLoadCallback(this.currentModel);
        }
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          console.log(`Cargando modelo: ${percent}%`);
        }
      },
      (error) => {
        console.error('Error al cargar el modelo 3D:', error);
      },
    );
  }

  setModelType(modelType: ModelType): void {
    this.currentModelType = modelType;
  }

  /**
   * Restablece el modelo y la cámara a su posición y rotación iniciales.
   */
  resetModel(): void {
    if (!this.currentModel) return;

    // 1. Restaurar posición y rotación de las partes
    this.currentModel.traverse((child) => {
      if (child instanceof THREE.Mesh && this.initialPositions.has(child)) {
        const initialPosition = this.initialPositions.get(child)!;
        const initialRotation = this.initialRotations.get(child)!;

        this.animateTransform(child.position, initialPosition);
        this.animateTransform(child.rotation, initialRotation);
      }
    });

    // 2. Restaurar Cámara y OrbitControls
    this.animateTransform(this.camera.position, this.initialCameraPos);
    this.animateTransform(this.controls.target, this.initialTargetPos, () =>
      this.controls.update(),
    );

    this.isExploded = false;
  }

  /**
   * Alterna entre el modelo ensamblado y desglosado (explotado).
   */
  toggleExplosion(): boolean {
    if (!this.currentModel) return false;

    // Obtener la configuración correspondiente al modelo cargado
    const currentConfig = EXPLOSION_CONFIGS[this.currentModelType] || {};

    // 2. Iterar sobre las mallas y aplicar animación según la pieza
    this.currentModel.traverse((child) => {
      if (child instanceof THREE.Mesh && this.initialPositions.has(child)) {
        const initialPosition = this.initialPositions.get(child)!;
        const normalizedName = this.normalizeMeshName(child.name);
        const offsetVector = currentConfig[normalizedName] || new THREE.Vector3(0, 0, 0);

        // Calcular posición objetivo (si está explotado regresa a la inicial, sino añade el offset)
        const targetPosition = this.isExploded
          ? initialPosition.clone()
          : initialPosition.clone().add(offsetVector);

        this.animateTransform(child.position, targetPosition);
      }
    });

    this.isExploded = !this.isExploded;
    return this.isExploded;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getDomElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  getOutlinePass(): OutlinePass {
    return this.outlinePass;
  }

  getCurrentModel(): THREE.Object3D | null {
    return this.currentModel;
  }

  private setupCamera(width: number, height: number): void {
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 5);
  }

  private setupRenderer(canvas: HTMLCanvasElement, width: number, height: number): void {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
  }

  private setupPostProcessing(width: number, height: number): void {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.outlinePass = new OutlinePass(new THREE.Vector2(width, height), this.scene, this.camera);
    this.outlinePass.visibleEdgeColor.set(OUTLINE_VISIBLE_COLOR_RGB);
    this.composer.addPass(this.outlinePass);
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 5); // TODO: 1.55 o 1.5?
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(ambientLight, directionalLight);
  }

  private normalizeMeshName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/_\d+$/, '')
      .replace(/[^a-z]/g, '');
  }

  private fitCameraToModel(model: THREE.Object3D): void {
    // Centrar la cámara y el target de OrbitControls en el modelo cargado
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    this.controls.target.copy(center);

    // Ajustar posición de la cámara según el tamaño del modelo
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 2.5;

    this.camera.position.set(center.x, center.y + maxDim * 0.2, center.z + cameraZ);
    this.camera.lookAt(center);
    this.controls.update();
  }

  private saveInitialState(targetCenter: THREE.Vector3): void {
    this.initialPositions.clear();
    this.initialRotations.clear();

    if (this.currentModel) {
      this.currentModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          this.initialPositions.set(child, child.position.clone());
          this.initialRotations.set(child, child.rotation.clone());
        }
      });
    }

    this.initialCameraPos.copy(this.camera.position);
    this.initialTargetPos.copy(targetCenter);
    this.isExploded = false;
  }

  private animateTransform(
    target: THREE.Vector3 | THREE.Euler,
    destination: THREE.Vector3 | THREE.Euler,
    onUpdate?: () => void,
  ): void {
    gsap.to(target, {
      x: destination.x,
      y: destination.y,
      z: destination.z,
      duration: ANIMATION_DURATION,
      ease: ANIMATION_EASE,
      onUpdate: onUpdate,
    });
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.composer.render();
  };

  private clearCurrentModel(): void {
    if (!this.currentModel) return;

    this.currentModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 1. Libera los vértices y caras (VBOs) de la GPU
        child.geometry?.dispose();

        // 2. Libera los shaders y mapas de texturas asociados
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => this.disposeMaterial(mat));
        } else if (child.material) {
          this.disposeMaterial(child.material);
        }
      }
    });

    this.scene.remove(this.currentModel);
    this.currentModel = null;
  }

  private disposeMaterial(material: THREE.Material): void {
    material.dispose(); // Libera el programa de renderizado/shader

    // Si el material tiene texturas cargadas (map, normalMap, roughnessMap, etc.), hay que liberarlas explícitamente:
    Object.keys(material).forEach((prop) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value = (material as any)[prop];
      if (value && typeof value === 'object' && 'dispose' in value) {
        value.dispose(); // Libera la textura de la VRAM
      }
    });
  }

  private onWindowResize = (): void => {
    const canvas = this.renderer.domElement;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  };

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    cancelAnimationFrame(this.animationFrameId);
    this.renderer.dispose();
  }
}
