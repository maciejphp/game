import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

export function createScene() {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
	camera.position.y = 10;
	camera.lookAt(new THREE.Vector3(0,-1,0));

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(1);
	document.body.appendChild(renderer.domElement);

    //map
    function createMap() {
		const textureLoader = new THREE.TextureLoader();
		const texture = textureLoader.load('textures/vloer.png');
		texture.repeat.set(35, 35);

		// const gui = new GUI();
		// const params = {
		// 	repeatX: 35, // Initial repeat count along X axis
		// 	repeatY: 35  // Initial repeat count along Y axis
		// };
		// const textureFolder = gui.addFolder('Texture Settings');
		// textureFolder.add(params, 'repeatX', 1, 100).name('Repeat X').onChange(updateTextureRepeat);
		// textureFolder.add(params, 'repeatY', 1, 100).name('Repeat Y').onChange(updateTextureRepeat);
		// function updateTextureRepeat() {
		// 	texture.repeat.set(params.repeatX, params.repeatY);
		// 	texture.needsUpdate = true; // Ensure the texture is updated
		// }


		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;

		const imagematerial = new THREE.MeshBasicMaterial(({map: texture}));

        const geometry = new THREE.BoxGeometry(50,1,50);
        const material = new THREE.MeshBasicMaterial({color: 0x555555});
        const floor = new THREE.Mesh(geometry, imagematerial);
        floor.position.y = -1;
        scene.add(floor);
    }
    createMap();
	
	window.onresize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	};
	

	return {scene: scene, camera: camera, renderer: renderer};
}