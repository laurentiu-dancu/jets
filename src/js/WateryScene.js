import * as THREE from 'three';

import { Water } from './WaterShader'
import WaterTexture from '../images/waternormals.jpg';

export default class WateryScene {
  constructor(renderer, camera) {
    const parameters = {
      width: 2000,
      height: 2000,
      widthSegments: 250,
      heightSegments: 250,
      depth: 1500,
      param: 4,
      filterparam: 1
    };

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xaabbbb, 0.0001);

    this.scene.add(new THREE.AmbientLight(0x444444));

    let light = new THREE.DirectionalLight(0xffffbb, 1);
    light.position.set(-1, 1, -1);
    this.scene.add(light);

    let waterNormals = new THREE.TextureLoader().load(WaterTexture);
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    this.water = new Water(renderer, camera, this.scene, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      alpha: 1.0,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 50.0,
      fog: true
    });

    let water = this.water;

    let mirrorMesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(parameters.width * 500, parameters.height * 500),
        water.material
    );
    mirrorMesh.add(water);
    mirrorMesh.rotation.x = -Math.PI * 0.5;
    this.scene.add(mirrorMesh);
  }

  add(element) {
    this.scene.add(element);
  }
}
