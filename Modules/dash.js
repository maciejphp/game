import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.min.js';
import * as THREE from 'three';

let lastDash = 0;

const dashDelay = 1;
const dashLength = 0.5;

export function dash(player, webSocket) {
    const currentTime = Date.now();
    if (!webSocket || currentTime - lastDash > dashDelay * 1000) {
        lastDash = currentTime;

        const material = new THREE.MeshBasicMaterial({
            color: "green",
            transparent: true,
            opacity: 1
        })
        const geometry = new THREE.CylinderGeometry(2.5, 2.5, 10, 16);
        const Cylinder = new THREE.Mesh(geometry, material);
        player.mesh.add(Cylinder);

        //send server message if websocket given
        if (webSocket) {
            const messageData = {type: "dash"};
            webSocket.send(JSON.stringify(messageData));
        }

        //animate dash
        const currentSize = {x: 0, y: 0, z: 0 };
        const finalSize = {x: 1, y: dashLength, z: 1 };
        
        new TWEEN.Tween(Cylinder.material)
        .to({ opacity: 0 }, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

        new TWEEN.Tween(currentSize)
        .to(finalSize, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            //update cylinder scale
            Cylinder.scale.set(currentSize.x, currentSize.y, currentSize.z);
        })
        .onComplete(() => {
            //delete cylinder
            player.mesh.remove(Cylinder);
        })
        .start();
    }
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
}
animate();

