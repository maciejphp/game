import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { playerModule } from "./player.js";
import { shockwave } from "./shockwave.js";
import { dash } from "./dash.js";
import { jump } from "./jump.js";

export class localPlayerModule
 {
    constructor(sceneData, name, webSocket) {
        this.scene = sceneData.scene;
        this.camera = sceneData.camera;
        this.renderer = sceneData.renderer;

        this.speed = 5;
        this.name = name;
        this.webSocket = webSocket;
        this.oldPosition = {x:0, y:0, z:0};

        this.player = new playerModule(sceneData, name);

        const controls = new OrbitControls( this.camera, this.renderer.domElement );
        controls.enablePan = false;
        this.orbitControls = controls;

        // this.camera.position.set(playerPosition.x, playerPosition.y + 5, playerPosition.z);
    

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

        const animate = () => {
            requestAnimationFrame(animate);

            //make player look at camera direction
            let camLookDirection = this.camera.getWorldDirection(new THREE.Vector3());
            camLookDirection = new THREE.Vector3(camLookDirection.x, 0, camLookDirection.z).normalize();
            camLookDirection = {x: camLookDirection.x, z: camLookDirection.z}
            // this.mesh.lookAt(camLookDirection.clone().add(this.mesh.position));
            // console.log(camLookDirection)

            //get keyboard input
            let zMovement = 0;
            let xMovement = 0;
            if (this.keysPressed["KeyA"]) xMovement += 1;
            if (this.keysPressed['KeyD']) xMovement += -1;
            if (this.keysPressed['KeyW']) zMovement += 1;
            if (this.keysPressed['KeyS']) zMovement += -1;

            //shockwavwe
            if (this.keysPressed['KeyF']) shockwave(this.player, this.webSocket);
            //dash
            if (this.keysPressed['KeyE']) dash(this.player, this.webSocket);
            //jump
            if (this.keysPressed['Space']) jump(this.player, this.webSocket);

            //send keyboard input
            const messageData = {type: "handleUserInput", input: {x: xMovement, z: zMovement}, quaternion: this.mesh.quaternion, direction: camLookDirection};
            this.webSocket.send(JSON.stringify(messageData));
        }
        animate();
    }
    move(position) {
        this.player.move(position);
        this.camera.position.add(new THREE.Vector3(position.x - this.oldPosition.x, position.y - this.oldPosition.y, position.z - this.oldPosition.z));
        this.orbitControls.target = this.mesh.position;
        this.orbitControls.update()
        this.oldPosition = position;
    }
    rotate(data) {
        this.mesh.quaternion.copy(data);
    }
}