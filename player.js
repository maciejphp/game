import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

export class otherPlayer {
    constructor(sceneData, name) {
        this.scene = sceneData.scene;
        this.camera = sceneData.camera;
        this.renderer = sceneData.renderer;
        this.name = name;
        this.speed = 5;
        this.mesh;
        this.nameMesh;
        this.animationId;
    }

    create() {
        //create player
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
            geometryText.translate(xMid, 0, 0); //ceneter text
            const textMesh = new THREE.Mesh( geometryText, new THREE.MeshBasicMaterial({color: 0xffffff}));
            this.scene.add(textMesh);
            this.nameMesh = textMesh;

            const clock = new THREE.Clock();

            const animate = () => {
                this.animationId = requestAnimationFrame( animate );
                this.nameMesh.lookAt(this.camera.position)
                this.nameMesh.position.set(this.mesh.position.x, this.mesh.position.y + 1, this.mesh.position.z)
            }
            animate();
        })
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
    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.scene.remove(this.mesh);
        this.scene.remove(this.nameMesh);
    }
}
