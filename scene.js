import * as THREE from 'three';
import * as OIMO from 'oimo';
import { map } from './createmap.js';

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

	const geometry = new THREE.BoxGeometry(50,1,50);
	const floor = new THREE.Mesh(geometry, imagematerial);
	floor.position.y = -1;
	scene.add(floor);

	//make walls
	const walls = [
		// "11111.....11111",
		// "1...1111111...1",
		// "1.............1",
		// "1...111P111...1",
		// "11111.111.11111"
		"P"
	]

	const mapModel = new map(walls);
	scene.add(mapModel.map);
	
	window.onresize = function () {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	};

	//oimo world
	const world = new OIMO.World({ timestep: 1/60, iterations: 8, broadphase: 2, worldscale: 1, random: true, info: false });
	
	return {scene: scene, camera: camera, renderer: renderer, map: {walls: walls, playerPosition: mapModel.playerPosition, oimoWorld: world}};
}