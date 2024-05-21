import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { otherPlayer } from "./player.js";


export class localPlayer {
    constructor(sceneData, name) {
        this.scene = sceneData.scene;
        this.camera = sceneData.camera;
        this.renderer = sceneData.renderer;

        this.speed = 5;
        this.name = name;

        this.player = new otherPlayer(sceneData, name);

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
        this.player.create();
        this.mesh = this.player.mesh;
        this.nameMesh = this.player.nameMesh;
    
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
            
        }
        animate();
    }
    move(position) {
        this.mesh.position.set(position.x, position.y, position.z);
        const playerPosition = this.mesh.position.clone();
        this.camera.position.set(playerPosition.x, playerPosition.y + 5, playerPosition.z);
    }
    rotate(data) {
        const quaternion = new THREE.Quaternion();
        quaternion.y = data.y;
        quaternion.w = data.w;
        this.mesh.quaternion.copy(quaternion);
    }
}