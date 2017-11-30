import * as THREE from 'three';

export class SkyBoxBuilder {
  constructor(skyTexture) {
    this.cubeMap = new THREE.CubeTexture([]);
    this.cubeMap.format = THREE.RGBFormat;
    this.cubeShader = THREE.ShaderLib['cube'];
    this.cubeMaterial = new THREE.ShaderMaterial({});
    this.setTexture(skyTexture);
    this.updateMaterial();
  }

  getSkyBox() {
    return new THREE.Mesh(
      new THREE.BoxGeometry(1000000, 1000000, 1000000),
      this.cubeMaterial
    );
  }

  setTexture(skyTexture) {
    let loader = new THREE.ImageLoader();
    loader.load(skyTexture, (image) => {
      let getSide = function (x, y) {
        let size = 1024;
        let canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        let context = canvas.getContext('2d');
        context.drawImage(image, -x * size, -y * size);
        return canvas;
      };
      this.cubeMap.images[0] = getSide(2, 1); // px
      this.cubeMap.images[1] = getSide(0, 1); // nx
      this.cubeMap.images[2] = getSide(1, 0); // py
      this.cubeMap.images[3] = getSide(1, 2); // ny
      this.cubeMap.images[4] = getSide(1, 1); // pz
      this.cubeMap.images[5] = getSide(3, 1); // nz
      this.cubeMap.needsUpdate = true;
    });
    this.cubeShader.uniforms['tCube'].value = this.cubeMap;

    return this;
  }

  updateMaterial() {
    this.cubeMaterial = new THREE.ShaderMaterial({
      fragmentShader: this.cubeShader.fragmentShader,
      vertexShader: this.cubeShader.vertexShader,
      uniforms: this.cubeShader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
    });

    return this;
  }
}
