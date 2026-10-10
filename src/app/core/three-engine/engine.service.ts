import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { explosionConfigs, ModelType } from './three-engine.model';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private composer!: EffectComposer;
  private outlinePass!: OutlinePass;
  private animFrameId!: number;

  private currentModel: THREE.Object3D | null = null;
  private currentModelType: ModelType = 'Sin Corte';

  // Mapas para almacenar transformaciones iniciales
  private initialPositions = new Map<THREE.Object3D, THREE.Vector3>();
  private initialRotations = new Map<THREE.Object3D, THREE.Euler>();
  private initialCameraPos = new THREE.Vector3();
  private initialTargetPos = new THREE.Vector3();

  private isExploded = false;

  init(canvas: HTMLCanvasElement): void {
    this.scene = new THREE.Scene();

    // Obtener dimensiones reales del contenedor o la ventana
    const width = canvas.parentElement?.clientWidth || canvas.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || canvas.clientHeight || window.innerHeight;

    // 1. Cámara
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 5);

    // 2. WebGLRenderer vinculado al canvas existente
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // this.renderer.setSize(container.clientWidth, container.clientHeight);
    // container.appendChild(this.renderer.domElement);

    // 3. Controles
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.setupPostProcessing(width, height);
    // this.setupPostProcessing(canvas);
    this.setupLights();
    this.animate();

    window.addEventListener('resize', this.onWindowResize);
  }

  loadModel(path: string, onLoadCallback?: (model: THREE.Object3D) => void): void {
    // loadModel(
    //   {
    //     path,
    //     modelType = 'Sin Corte',
    //   }: {
    //     path: string;
    //     modelType?: ModelType;
    //   },
    //   onLoadCallback?: (model: THREE.Object3D) => void,
    // ): void {
    const loader = new GLTFLoader();

    loader.load(
      path,
      (gltf) => {
        // Limpiar modelo anterior si existe
        if (this.currentModel) {
          this.scene.remove(this.currentModel);
        }

        this.currentModel = gltf.scene;
        // // this.currentModelType = modelType;

        // Formatear nombres de las partes a minúsculas
        this.currentModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.name = child.name.toLowerCase();
          }
        });

        this.scene.add(this.currentModel);

        // Centrar la cámara y el target de OrbitControls en el modelo cargado
        const box = new THREE.Box3().setFromObject(this.currentModel);
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

        this.saveInitialState(center);

        if (onLoadCallback) {
          onLoadCallback(this.currentModel);
        }
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percentLoaded = (xhr.loaded / xhr.total) * 100;
          console.log(`Cargando modelo: ${Math.round(percentLoaded)}%`);
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

  /**
   * Restablece el modelo y la cámara a su posición y rotación iniciales.
   */
  resetModel(): void {
    if (!this.currentModel) return;

    // 1. Restaurar posición y rotación de las partes
    this.currentModel.traverse((child) => {
      if (child instanceof THREE.Mesh && this.initialPositions.has(child)) {
        const origPos = this.initialPositions.get(child)!;
        const origRot = this.initialRotations.get(child)!;

        gsap.to(child.position, {
          x: origPos.x,
          y: origPos.y,
          z: origPos.z,
          duration: 1,
          ease: 'power2.out',
        });

        gsap.to(child.rotation, {
          x: origRot.x,
          y: origRot.y,
          z: origRot.z,
          duration: 1,
          ease: 'power2.out',
        });
      }
    });

    // 2. Restaurar Cámara y OrbitControls
    gsap.to(this.camera.position, {
      x: this.initialCameraPos.x,
      y: this.initialCameraPos.y,
      z: this.initialCameraPos.z,
      duration: 1,
      ease: 'power2.out',
    });

    gsap.to(this.controls.target, {
      x: this.initialTargetPos.x,
      y: this.initialTargetPos.y,
      z: this.initialTargetPos.z,
      duration: 1,
      ease: 'power2.out',
      onUpdate: () => this.controls.update(),
    });

    this.isExploded = false;
  }

  /**
   * Alterna entre el modelo ensamblado y desglosado (explotado).
   */
  // toggleExplosion(): boolean {
  //   if (!this.currentModel) return false;

  //   const center = new THREE.Vector3();
  //   let count = 0;

  //   this.currentModel.traverse((child) => {
  //     if (child instanceof THREE.Mesh) {
  //       center.add(child.position);
  //       count++;
  //     }
  //   });

  //   if (count > 0) center.divideScalar(count);

  //   this.currentModel.traverse((child) => {
  //     if (child instanceof THREE.Mesh && this.initialPositions.has(child)) {
  //       const initialPos = this.initialPositions.get(child)!;
  //       const direction = initialPos.clone().sub(center).normalize();

  //       // Determinar distancias relativas por nombre de capa
  //       let explosionDistance = 1.0;
  //       const name = child.name.toLowerCase();

  //       if (name.includes('cornea')) explosionDistance = 2.0;
  //       else if (name.includes('iris')) explosionDistance = 1.4;
  //       else if (name.includes('pupila')) explosionDistance = 0.8;
  //       else if (name.includes('cristalino')) explosionDistance = 0.4;

  //       const targetPosition = this.isExploded
  //         ? initialPos.clone()
  //         : initialPos.clone().add(direction.multiplyScalar(explosionDistance));

  //       gsap.to(child.position, {
  //         x: targetPosition.x,
  //         y: targetPosition.y,
  //         z: targetPosition.z,
  //         duration: 1.2,
  //         ease: 'power2.out',
  //       });
  //     }
  //   });

  //   this.isExploded = !this.isExploded;
  //   return this.isExploded;
  // }

  toggleExplosion(): boolean {
    if (!this.currentModel) return false;

    // TODO: REVISAR SI ES NECESARIO
    // 1. Guardar posiciones iniciales en el mapa si aún no están registradas
    // if (!this.initialPositions.size) {
    //   this.currentModel.traverse((child) => {
    //     if (child instanceof THREE.Mesh) {
    //       this.initialPositions.set(child, child.position.clone());
    //     }
    //   });
    // }

    // Obtener la configuración correspondiente al modelo cargado
    const currentConfig = explosionConfigs[this.currentModelType] || {};

    // 2. Iterar sobre las mallas y aplicar animación según la pieza
    this.currentModel.traverse((child) => {
      if (child instanceof THREE.Mesh && this.initialPositions.has(child)) {
        const initialPos = this.initialPositions.get(child)!;

        const normalizedName = child.name.trim().toLowerCase().replace(/_\d+$/, '');

        // Obtener el vector de offset de la configuración actual (o Vector3(0,0,0) por defecto)
        const offsetVector = currentConfig[normalizedName] || new THREE.Vector3(0, 0, 0);

        // Calcular posición objetivo (si está explotado regresa a la inicial, sino añade el offset)
        const targetPosition = this.isExploded
          ? initialPos.clone()
          : initialPos.clone().add(offsetVector);

        // Animar con GSAP
        gsap.to(child.position, {
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          duration: 1.2,
          ease: 'power2.out',
        });
      }
    });

    this.isExploded = !this.isExploded;
    return this.isExploded;
  }

  private setupPostProcessing(width: number, height: number): void {
    const size = new THREE.Vector2(width, height);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    this.outlinePass = new OutlinePass(size, this.scene, this.camera);
    this.outlinePass.visibleEdgeColor.set('#ff0000');
    this.composer.addPass(this.outlinePass);
  }

  //   private setupPostProcessing(container: HTMLElement): void {
  //     const size = new THREE.Vector2(container.clientWidth, container.clientHeight);
  //     this.composer = new EffectComposer(this.renderer);
  //     this.composer.addPass(new RenderPass(this.scene, this.camera));

  //     this.outlinePass = new OutlinePass(size, this.scene, this.camera);
  //     this.outlinePass.visibleEdgeColor.set('#ff0000');
  //     this.composer.addPass(this.outlinePass);
  //   }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    this.scene.add(ambientLight, dirLight);
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.composer.render();
  };

  private onWindowResize = (): void => {
    const canvas = this.renderer.domElement;
    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
  };

  setCurrentModel(model: THREE.Object3D): void {
    if (this.currentModel) this.scene.remove(this.currentModel);
    this.currentModel = model;
    this.scene.add(model);
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

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    cancelAnimationFrame(this.animFrameId);
    this.renderer.dispose();
  }
}
