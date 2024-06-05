import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.min.js';
import * as THREE from 'three';

let lastShockwave = 0;

const shockwaveDelay = 1;
const shockwaveRadius = 5;

export function shockwave(player, webSocket) {
    const currentTime = Date.now();
    if (!webSocket) print("other player shockwave")
    if (currentTime - lastShockwave > shockwaveDelay * 1000 || !webSocket) {
        lastShockwave = currentTime

        const material = new THREE.MeshBasicMaterial({
            color: "blue",
            transparent: true,
            opacity: 1
        })
        const geometry = new THREE.SphereGeometry(1);
        const sphere = new THREE.Mesh(geometry, material);
        player.mesh.add(sphere);
        
        //send server message if websocket given
        if (webSocket) {
            const messageData = {type: "shockwave"};
            webSocket.send(JSON.stringify(messageData));
        }

        //animate shockwave
        const currentSize = {x: 0, y: 0, z: 0 };
        const finalSize = {x: shockwaveRadius, y: shockwaveRadius, z: shockwaveRadius }

        new TWEEN.Tween(sphere.material)
        .to({ opacity: 0 }, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

        new TWEEN.Tween(currentSize)
        .to(finalSize, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            // Update sphere scale
            sphere.scale.set(currentSize.x, currentSize.y, currentSize.z);
        })
        .onComplete(() => {
            //delete sphere
            player.mesh.remove(sphere);
        })
        .start();
    }
}


function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
}
animate();