import * as THREE from 'three';

const size = 3

function createCube(position, this2) {
    const geometry = new THREE.BoxGeometry(size,size,size);
    const material = new THREE.MeshBasicMaterial({color: 'yellow'});
    const wall = new THREE.Mesh(geometry, material);

    wall.position.set(position.x, position.y, position.z);

    this2.map.add(wall);
}

export class map {
    constructor(mapdata) {

        this.map = new THREE.Group();
        this.mapData = {width: mapdata.length, data: []};

        for (let y = 0; y < mapdata.length; y++) {
            const data = mapdata[y]
            for (let x = 0; x < data.length; x++) {
                const wallData = data[x];
                const position = new THREE.Vector3(x * size, 0, y * size);
                this.mapData.data.push({wallType: wallData, position: position})

                if (wallData == 1) {
                    createCube(position, this)
                }
                if (wallData == "P") {
                    this.playerPosition = {x: position.x, y: position.y, z: position.z};
                }
            }
        }
        
        return this;
    }
}