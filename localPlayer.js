import * as THREE from 'three';
import * as OIMO from 'oimo';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { otherPlayer } from "./player.js";


export class localPlayer {
    constructor(sceneData, name) {
        this.scene = sceneData.scene;
        this.camera = sceneData.camera;
        this.renderer = sceneData.renderer;
        this.map = sceneData.map;

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

        const world = this.map.oimoWorld;
        //ground
        world.add({ type: 'box', size: [50, 1, 50], pos: [0, -1, 0], rot: [0, 0, 0], move: false, density: 1 });
        //box
        world.add({ type: 'box', size: [5, 5, 5], pos: [2, 2, 0], rot: [0, 0, 0], move: false, density: 1 });
        const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({ color: "green" }));
        boxMesh.position.set(2,2,0)
        this.scene.add(boxMesh)

        const boxPlayer =world.add({ type: 'box', size: [1, 1, 1], pos: [10,10,0], rot: [0, 0, 0], move: true, density: 1, friction: 1 });

        // Create boxes
        const boxMeshes = [];
        for (let i = 0; i < 10; i++) {
            const box = world.add({ type: 'box', size: [1, 1, 1], pos: [Math.random() * 2 - 1, 5 + i * 2, Math.random() * 2 - 1], rot: [0, 0, 0], move: true, density: 1 });
            const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: "red" }));
            boxMesh.position.set(box.position.x, box.position.y, box.position.z);
            this.scene.add(boxMesh);
            boxMeshes.push({ body: box, mesh: boxMesh });
        }

        let oldPlayerPosition = boxPlayer.getPosition();
        //animation
        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();

	    	world.step();

            for (let box of boxMeshes) {
                box.mesh.position.copy(box.body.getPosition());
                box.mesh.quaternion.copy(box.body.getQuaternion());
            }
            this.mesh.position.copy(boxPlayer.getPosition())
            this.mesh.quaternion.copy(boxPlayer.getQuaternion())


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
            const move = moveDirection.normalize().multiplyScalar(this.speed * delta * 5);
            // this.mesh.position.add(move);

            const force = new OIMO.Vec3(move.x, move.y, move.z);
            const position = boxPlayer.getPosition().clone();
            boxPlayer.applyImpulse(position, force);
        
            //move name
            if (this.nameMesh) {
                this.nameMesh.lookAt(this.camera.position)
                this.nameMesh.position.set(this.mesh.position.x, this.mesh.position.y + 1, this.mesh.position.z)
            }
            //make camera follow player
            this.orbitControls.target = this.mesh.position;
            this.orbitControls.update()
            this.camera.position.add(new THREE.Vector3(position.x - oldPlayerPosition.x, position.y - oldPlayerPosition.y, position.z - oldPlayerPosition.z));
            oldPlayerPosition = position;
            
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