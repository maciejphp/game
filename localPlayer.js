import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


export class localPlayer {
    constructor(sceneData, name) {
        this.scene = sceneData.scene;
        this.camera = sceneData.camera;
        this.renderer = sceneData.renderer;
        this.name = name;
        this.speed = 5;
        this.mesh = null;
        this.nameMesh = null;

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.enablePan = false;
        this.orbitControls = controls;

        //movement
        this.keysPressed = {};
        window.addEventListener('keydown', (e)=>{
            this.keysPressed[e.code] = true;
        });
        window.addEventListener('keyup', (e)=>{
            this.keysPressed[e.code] = false;
        });
    }

    create() {
        //create Local player
        const textureLoader = new THREE.TextureLoader();

        const redMaterial = new THREE.MeshBasicMaterial({color: "red"});
        const textureMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load('textures/jacob.png')});

        const geometry = new THREE.BoxGeometry(1,1,1);
        const playerModel = new THREE.Mesh(geometry, [redMaterial, redMaterial, redMaterial, redMaterial, textureMaterial, redMaterial]);
        this.scene.add(playerModel);
        this.mesh = playerModel;

        //display name
        const loader = new FontLoader();
        loader.load( 'https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const shapes = font.generateShapes(this.name, .4);
            const geometryText = new THREE.ShapeGeometry(shapes);
            geometryText.computeBoundingBox();
            const xMid = - 0.5 * (geometryText.boundingBox.max.x - geometryText.boundingBox.min.x);
            geometryText.translate(xMid, 0, 0); //center text
            const textMesh = new THREE.Mesh( geometryText, new THREE.MeshBasicMaterial({color: 0xffffff}));
            this.scene.add(textMesh);
            this.nameMesh = textMesh;
        })
    
        //animation
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();


            //make player look at camera direction
            let camLookDirection = this.camera.getWorldDirection(new THREE.Vector3());
            camLookDirection = new THREE.Vector3(camLookDirection.x, 0, camLookDirection.z).normalize();
            this.mesh.lookAt(camLookDirection.clone().add(this.mesh.position));

            //get keyboard input
            let zMovement = 0;
            let xMovement = 0;
            if (this.keysPressed["KeyA"]) xMovement += 1;
            if (this.keysPressed['KeyD']) xMovement += -1;
            if (this.keysPressed['KeyW']) zMovement += 1;
            if (this.keysPressed['KeyS']) zMovement += -1;

            //move player
            const moveDirection = camLookDirection.clone().multiplyScalar(zMovement).add(camLookDirection.clone().multiplyScalar(-xMovement).cross(new THREE.Vector3(0,1,0)));
            const move = moveDirection.normalize().multiplyScalar(this.speed * delta);
            this.mesh.position.add(move);
        
            //move name
            if (this.nameMesh) {
                this.nameMesh.lookAt(this.camera.position)
                this.nameMesh.position.set(this.mesh.position.x, this.mesh.position.y + 1, this.mesh.position.z)
            }
            //make camera follow player
            this.orbitControls.target = this.mesh.position;
            this.camera.position.add(move);
            
            // console.log(this.mesh.2)
        }
        animate();
    }
    move(position) {
        this.mesh.position.set(position.x, position.y, position.z);
    }
    rotate(data) {
        const quaternion = new THREE.Quaternion();
        quaternion.y = data.y;
        quaternion.w = data.w;
        this.mesh.quaternion.copy(quaternion);
    }
}