import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
    const loader = new GLTFLoader();

    loader.load(
      path,
      (gltf) => {
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
