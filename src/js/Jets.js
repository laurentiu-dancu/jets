import * as THREE from 'three';
import * as Detector from './Detector';
import { OrbitControls } from './controls/OrbitControls';
import { SkyBoxBuilder } from './SkyBoxBuilder'
import '../css/style.css';
import SkyImage from '../images/skyboxsun25degtest.png';
import WateryScene from './WateryScene';
let Stats = require('./libs/stats.min');

if (!Detector.webgl) {
  Detector.addGetWebGLMessage();
  document.getElementById('container').innerHTML = "";
}

export default class Jets {
  constructor() {
    this.renderer = this.constructor.buildRenderer();
    this.container = document.getElementById('container');
    this.camera = this.constructor.buildCamera();
    this.wateryScene = new WateryScene(this.renderer, this.camera);
    this.controls = this.constructor.buildControls(this.camera, this.renderer.domElement);

    this.container.appendChild(this.renderer.domElement);

    let skyBoxBuilder = new SkyBoxBuilder(SkyImage);
    this.wateryScene.add(skyBoxBuilder.buildSkyBox());
    //
    let geometry = new THREE.IcosahedronGeometry(400, 4);
    let i = 0, j = geometry.faces.length;
    for (; i < j; i++) {
      geometry.faces[i].color.setHex(Math.random() * 0xffffff);
    }
    let material = new THREE.MeshPhongMaterial({
      vertexColors: THREE.FaceColors,
      shininess: 100,
    });
    this.sphere = new THREE.Mesh(geometry, material);
    this.wateryScene.add(this.sphere);

    this.stats = new Stats();
    this.container.appendChild(this.stats.dom);

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  static buildRenderer() {
    let renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    return renderer;
  }

  static buildCamera() {
    let camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 3000000);
    camera.position.set(2000, 750, 2000);

    return camera;
  }

  static buildControls(camera, domElement) {
    let controls = new OrbitControls(camera, domElement);
    controls.enablePan = false;
    controls.minDistance = 1000.0;
    controls.maxDistance = 5000.0;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 500, 0);
    controls.update();

    return controls;
  }

  run() {
    requestAnimationFrame(this.run.bind(this));
    this.render();
    this.stats.update();
  }

  render() {
    let time = performance.now() * 0.00001;
    this.sphere.position.y = Math.sin(time) * 500 + 250;
    this.sphere.rotation.x = time * 0.5;
    this.sphere.rotation.z = time * 0.51;
    this.wateryScene.water.material.uniforms.time.value += 1.0 / 60.0;
    this.wateryScene.water.render();
    this.renderer.render(this.wateryScene.scene, this.camera);
  }
}
