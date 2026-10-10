import * as THREE from 'three';

export type EyePart =
  | 'pupila'
  | 'iris'
  | 'cornea'
  | 'ojo'
  | 'cristalino'
  | 'cristalino_1'
  | 'cristalino_2'
  | 'epiteliopigmentario'
  | 'esclera'
  | 'coroides'
  | 'cuerpociliar'
  | 'fibraszonulares'
  | 'retina'
  | 'fovea'
  | 'nerviooptico'
  | 'humorvitreo'
  | 'humoracuoso';

export type ModelType = 'Sin Corte' | 'Sagital' | 'Frontal';

type BaseRoute = 'assets/models/';
type ModelRoute =
  `${BaseRoute}ojo.glb` | `${BaseRoute}ojo_interno.glb` | `${BaseRoute}retinografia.glb`;

export const MODEL_PATHS: Record<ModelType, ModelRoute> = {
  'Sin Corte': 'assets/models/ojo.glb',
  Sagital: 'assets/models/ojo_interno.glb',
  Frontal: 'assets/models/retinografia.glb',
};

export const EXPLOSION_CONFIGS: Record<ModelType, Record<string, THREE.Vector3>> = {
  // Modelo entero (Sin Corte): Desplazamiento lineal en eje Z
  'Sin Corte': {
    cornea: new THREE.Vector3(0, 0, 2.0),
    iris: new THREE.Vector3(0, 0, 1.2),
    pupila: new THREE.Vector3(0, 0, 0.7),
    cristalino: new THREE.Vector3(0, 0, 0.3),
  },

  // Modelo con corte sagital (Interior): Desplazamiento axial combinado (X e Z)
  Sagital: {
    humorvitreo: new THREE.Vector3(4.0, 0, 0),
    retina: new THREE.Vector3(2.0, 0, 0),
    fovea: new THREE.Vector3(2.0, 0, 0),
    nerviooptico: new THREE.Vector3(2.0, 0, 0),
    coroides: new THREE.Vector3(-2.0, 0, 0),
    fibraszonulares: new THREE.Vector3(-2.0, 0, 0),
    cuerpociliar: new THREE.Vector3(-2.0, 0, 0),
    esclera: new THREE.Vector3(-4.0, 0, 0),
    cornea: new THREE.Vector3(2.0, 0, 2.0),
    iris: new THREE.Vector3(2.0, 0, 1.5),
    pupila: new THREE.Vector3(2.0, 0, 1.0),
    cristalino: new THREE.Vector3(1.5, 0, 0.25),
    humoracuoso: new THREE.Vector3(2.0, 0, 0.5),
  },

  Frontal: {
    cornea: new THREE.Vector3(0, 0, 1.5),
  },
};

export const ANIMATION_DURATION = 1.2;
export const ANIMATION_EASE = 'power2.out';
export const OUTLINE_VISIBLE_COLOR_RGB = '#ff0000';
