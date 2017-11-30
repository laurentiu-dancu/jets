import * as THREE from 'three';
import * as Detector from './js/Detector';
import { OrbitControls } from './js/controls/OrbitControls';
import { Water } from './js/WaterShader'
import { SkyBoxBuilder } from './js/SkyBoxBuilder'
import './css/style.css';
import Sky from './images/skyboxsun25degtest.png';
import WaterTexture from './images/waternormals.jpg';
let Stats = require('./js/libs/stats.min');

if (!Detector.webgl) {
  Detector.addGetWebGLMessage();
  document.getElementById('container').innerHTML = "";
}

class Program {
  constructor() {
    const parameters = {
      width: 2000,
      height: 2000,
      widthSegments: 250,
      heightSegments: 250,
      depth: 1500,
      param: 4,
      filterparam: 1
    };

    this.renderer = new THREE.WebGLRenderer();
    this.container = document.getElementById('container');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 3000000);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    let controls = this.controls;
    let camera = this.camera;
    let scene = this.scene;
    let renderer = this.renderer;
    let container = this.container;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene.fog = new THREE.FogExp2(0xaabbbb, 0.0001);

    camera.position.set(2000, 750, 2000);

    controls.enablePan = false;
    controls.minDistance = 1000.0;
    controls.maxDistance = 5000.0;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 500, 0);
    controls.update();
    scene.add(new THREE.AmbientLight(0x444444));

    let light = new THREE.DirectionalLight(0xffffbb, 1);
    light.position.set(-1, 1, -1);
    scene.add(light);

    let waterNormals = new THREE.TextureLoader().load(WaterTexture);
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

    this.water = new Water(renderer, camera, scene, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      alpha: 1.0,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 50.0,
      fog: scene.fog !== undefined
    });

    let water = this.water;

    let mirrorMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(parameters.width * 500, parameters.height * 500),
      water.material
    );
    mirrorMesh.add(water);
    mirrorMesh.rotation.x = -Math.PI * 0.5;
    scene.add(mirrorMesh);

    let skyBoxBuilder = new SkyBoxBuilder(Sky);
    scene.add(skyBoxBuilder.getSkyBox());
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
    let sphere = this.sphere;
    scene.add(sphere);
    //
    this.stats = new Stats();
    container.appendChild(this.stats.dom);
    //
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
  }

  onWindowResize() {
    let camera = this.camera;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
  }

  render() {
    let time = performance.now() * 0.001;
    this.sphere.position.y = Math.sin(time) * 500 + 250;
    this.sphere.rotation.x = time * 0.5;
    this.sphere.rotation.z = time * 0.51;
    this.water.material.uniforms.time.value += 1.0 / 60.0;
    this.water.render();
    this.renderer.render(this.scene, this.camera);
  }
}

let program = new Program();
program.animate();