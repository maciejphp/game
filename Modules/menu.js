import * as THREE from 'three';

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
	//make a baseplate
	const textureLoader = new THREE.TextureLoader();
	const texture = textureLoader.load('textures/vloer.png');
	texture.repeat.set(35, 35);
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;

	const imagematerial = new THREE.MeshBasicMaterial(({map: texture}));
	const imagematerial2 = new THREE.MeshBasicMaterial(({map: textureLoader.load('textures/fortnite.png')}));

	const geometry = new THREE.BoxGeometry(50,1,50);
	const floor = new THREE.Mesh(geometry, imagematerial2);
	floor.position.y = -1;
	scene.add(floor);
	
	window.onresize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	};

	return {scene: scene, camera: camera, renderer: renderer};
}