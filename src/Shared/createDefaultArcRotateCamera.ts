import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";

export function createDefaultArcRotateCamera(scene: Scene): ArcRotateCamera {
    const camera = new ArcRotateCamera("arcRotateCamera", 0, 0, 45, new Vector3(0, 1, 0), scene);
    camera.minZ = 0.1;
    camera.maxZ = 500;
    camera.setPosition(new Vector3(0, 1, -4.5));
    camera.attachControl(undefined, false);
    camera.inertia = 0.8;
    camera.speed = 10;

    return camera;
}
