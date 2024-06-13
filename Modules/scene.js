import * as THREE from 'three';

export function createScene() {
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x87ceeb);
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
	camera.position.y = 15;
	camera.position.x = 35;
	camera.lookAt(new THREE.Vector3(0, -1, 0));

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(.6);
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
	document.body.appendChild(renderer.domElement);

	//map
	//make a baseplate
	const textureLoader = new THREE.TextureLoader();
	const texture = textureLoader.load('textures/grass2.png');
	texture.repeat.set(16, 16);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;

	const imagematerial = new THREE.MeshBasicMaterial(({ map: texture }));

	const geometry = new THREE.BoxGeometry(50, 1, 50);
	const floor = new THREE.Mesh(geometry, imagematerial);
	floor.position.y = -1;
	scene.add(floor);

	//add towers
	const textureTower1 = new THREE.TextureLoader();
	const cubeTexture = textureTower1.load('textures/castle.png', function (texture) {
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(2, 2); 

		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.generateMipmaps = false;
	});

	function makeTower(x,y,z) {
		const cubeGeometry1 = new THREE.BoxGeometry(7, 14, 7);
		const cubeMaterial1 = new THREE.MeshBasicMaterial({ map: cubeTexture });
		const cube1 = new THREE.Mesh(cubeGeometry1, cubeMaterial1);
		cube1.position.set(x, y, z);
		scene.add(cube1);
	
		const cubeGeometry11 = new THREE.ConeGeometry(5,4,4,4);
		const cubeMaterial11 = new THREE.MeshBasicMaterial({ color: "red",  map: cubeTexture  });
		const cube11 = new THREE.Mesh(cubeGeometry11, cubeMaterial11);
		cube11.position.set(x, y + 9, z);
		cube11.rotation.y = 0.785398163
		scene.add(cube11);
	}
	makeTower(20, 6, 20);
	makeTower(20, 6, -20);
	makeTower(-20, 6, 20);
	makeTower(-20, 6, -20);

	window.onresize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	};

	return { scene: scene, camera: camera, renderer: renderer };
}