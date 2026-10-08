import { Component, ElementRef, viewChild, OnDestroy, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

@Component({
  selector: 'app-3d-model',
  templateUrl: './model-3d.component.html',
})
export class Model3dComponent implements AfterViewInit, OnDestroy {
  protected canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('myCanvas');

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private model: THREE.Object3D | null = null;
  private animationFrameId: number | null = null;

  // // private readonly renderer2 = inject(Renderer2);

  ngAfterViewInit() {
    this.initThree();
    this.initControls();
    this.loadModel();
    this.animate();

    window.addEventListener('resize', this.onWindowResize);
  }

  private initThree() {
    // 1. Configurar Escena, Cámara y Renderizador
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0xf0f0f0);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 2, 5);

    // 2. Asignar el canvas nativo al renderizador
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef().nativeElement,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Luces (Indispensable para ver el modelo)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    // this.scene.add(directionalLight);

    // 3. Agregar objetos a la escena
    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    // const cube = new THREE.Mesh(geometry, material);
    // this.scene.add(cube);

    // this.camera.position.z = 5;

    // 4. Renderizar
    // this.renderer.render(this.scene, this.camera);
  }

  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    if (this.model) {
      const modelCenter = this.calculateModelCenter();
      this.controls.target.set(modelCenter.x, modelCenter.y, modelCenter.z);

      const initialCameraPosition = new THREE.Vector3(0, 0, 10);
      this.camera.position.set(
        initialCameraPosition.x,
        initialCameraPosition.y,
        initialCameraPosition.z,
      );
      this.camera.lookAt(modelCenter);
    }

    this.controls.enableDamping = true; // Suaviza el movimiento
    this.controls.dampingFactor = 0.05;

    // Límites de zoom
    this.controls.minDistance = 2;
    this.controls.maxDistance = 25;

    // Si usas rotación manual propia, desactivas la rotación por defecto de OrbitControls:
    this.controls.enableRotate = false;

    // Opcional: inicializar rotación manual si existe la función
    // this.initManualRotation();
  }

  // object: THREE.Object3D
  private calculateModelCenter(): THREE.Vector3 {
    // const box = new THREE.Box3().setFromObject(object);
    // const center = new THREE.Vector3();
    // box.getCenter(center);
    // return center;

    const modelCenter = new THREE.Vector3();
    let meshCount = 0;

    this.model?.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const boundingBox = child.geometry.boundingBox;

        if (boundingBox) {
          boundingBox.getCenter(modelCenter); // Obtiene el centro de la caja delimitadora
          child.localToWorld(modelCenter); // Convierte las coordenadas locales a coordenadas del mundo
          meshCount++;
        }
      }
    });

    if (meshCount > 0) {
      // Promediar los centros si hay más de un Mesh
      modelCenter.divideScalar(meshCount);
    }

    return modelCenter;
  }

  private onWindowResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private loadModel(): void {
    // Eliminar modelo anterior
    if (this.model) {
      this.scene.remove(this.model);
    }

    const loader = new GLTFLoader();
    loader.load(
      'assets/models/ojo.glb',
      (gltf) => {
        this.model = gltf.scene;
        this.scene.add(this.model);

        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.name = child.name.toLowerCase(); // Asegurarse de que los nombres están en minúsculas
            // this.originalPositions.set(child, child.position.clone()); // Guarda la posición original
          }
        });
      },
      (xhr) => {
        const percentLoaded = (xhr.loaded / xhr.total) * 100;
        console.log(`Cargando modelo: ${Math.round(percentLoaded)}%`);
      },
      (error) => {
        console.error('Ocurrió un error al cargar el modelo 3D:', error);
      },
    );
  }

  // private loadModel(): void {
  //   const loader = new GLTFLoader();

  //   loader.load(
  //     'assets/models/ojo.glb',
  //     (gltf) => {
  //       this.model = gltf.scene;
  //       this.scene.add(this.model);

  //       // Centrar o ajustar escala si es necesario
  //       this.model.position.set(0, 0, 0);
  //     },
  //     (xhr) => {
  //       const percentLoaded = (xhr.loaded / xhr.total) * 100;
  //       console.log(`Cargando modelo: ${Math.round(percentLoaded)}%`);
  //     },
  //     (error) => {
  //       console.error('Ocurrió un error al cargar el modelo 3D:', error);
  //     },
  //   );
  // }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Opcional: rotar el modelo suavemente
    if (this.model) {
      this.model.rotation.y += 0.005;
    }

    this.renderer.render(this.scene, this.camera);
  };

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
