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
	renderer.setPixelRatio(1);
	document.body.appendChild(renderer.domElement);

	//map
	//make a baseplate
	const textureLoader = new THREE.TextureLoader();
	const texture = textureLoader.load('textures/grass.jpg');
	texture.repeat.set(35, 35);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;

	const imagematerial = new THREE.MeshBasicMaterial(({ map: texture }));

	const geometry = new THREE.BoxGeometry(50, 2, 50);
	const floor = new THREE.Mesh(geometry, imagematerial);
	floor.position.y = -1;
	scene.add(floor);

	//add towers
	const textureTower1 = new THREE.TextureLoader();
	const cubeTexture = textureTower1.load('../textures/castle.png', function (texture) {
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(4, 4); 
	});

	const cubeGeometry1 = new THREE.BoxGeometry(7, 14, 7);
	const cubeMaterial1 = new THREE.MeshBasicMaterial({ map: cubeTexture });
	const cube1 = new THREE.Mesh(cubeGeometry1, cubeMaterial1);
	cube1.position.set(20, 6, 20);
	scene.add(cube1);

	const cubeGeometry2 = new THREE.BoxGeometry(7, 14, 7);
	const cubeMaterial2 = new THREE.MeshBasicMaterial({ map: cubeTexture });
	const cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial2);
	cube2.position.set(-20, 6, -20); // Position it so its base is on the floor
	scene.add(cube2);

	const cubeGeometry3 = new THREE.BoxGeometry(7, 14, 7);
	const cubeMaterial3 = new THREE.MeshBasicMaterial({ map: cubeTexture });
	const cube3 = new THREE.Mesh(cubeGeometry3, cubeMaterial3);
	cube3.position.set(-20, 6, 20); // Position it so its base is on the floor
	scene.add(cube3);

	const cubeGeometry4 = new THREE.BoxGeometry(7, 14, 7);
	const cubeMaterial4 = new THREE.MeshBasicMaterial({ map: cubeTexture });
	const cube4 = new THREE.Mesh(cubeGeometry4, cubeMaterial4);
	cube4.position.set(20, 6, -20); // Position it so its base is on the floor
	scene.add(cube4);


	window.onresize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	};

	return { scene: scene, camera: camera, renderer: renderer };
}