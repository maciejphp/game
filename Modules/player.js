import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const loader = new FontLoader();

export class playerModule {
    constructor(sceneData, name) {
        this.scene = sceneData.scene;
        this.camera = sceneData.camera;
        this.renderer = sceneData.renderer;
        this.name = name;
    }

    create() {
        // Create player
        const textureLoader = new THREE.TextureLoader();

        const textureMaterial = new THREE.MeshBasicMaterial({ map: textureLoader.load('../textures/ball.jpg') });
        
        // Create a sphere geometry
        const geometry = new THREE.SphereGeometry(0.5, 42, 42);
        const playerModel = new THREE.Mesh(geometry, textureMaterial);
        this.scene.add(playerModel);
        this.mesh = playerModel;

        loader.load('https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json', (font) => {
            const shapes = font.generateShapes(this.name, 0.4);
            const geometryText = new THREE.ShapeGeometry(shapes);
            geometryText.computeBoundingBox();
            const xMid = -0.5 * (geometryText.boundingBox.max.x - geometryText.boundingBox.min.x);
            geometryText.translate(xMid, 0, 0); // Center text
            const textMesh = new THREE.Mesh(geometryText, new THREE.MeshBasicMaterial({ color: 0xffffff }));
            this.scene.add(textMesh);
            this.nameMesh = textMesh;
        });
    }

    move(position) {
        this.mesh.position.set(position.x, position.y, position.z);
        if (this.nameMesh) {
            this.nameMesh.lookAt(this.camera.position);
            this.nameMesh.position.set(this.mesh.position.x, this.mesh.position.y + 1, this.mesh.position.z);
        }
    }

    rotate(data) {
        this.mesh.quaternion.copy(data);
    }

    destroy() {
        this.scene.remove(this.mesh);
        this.scene.remove(this.nameMesh);
    }
}