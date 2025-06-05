import "@babylonjs/loaders/SPLAT/splatFileLoader";

import { LoadAssetContainerAsync } from "@babylonjs/core";
import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";

// import { Inspector } from "@babylonjs/inspector";
import { createDefaultArcRotateCamera } from "@/Shared/createDefaultArcRotateCamera";

import type { ISceneBuilder } from "../Shared/baseRuntime";

export class SceneBuilder implements ISceneBuilder {
    public async build(_canvas: HTMLCanvasElement, engine: AbstractEngine): Promise<Scene> {
        const scene = new Scene(engine);
        scene.clearColor = new Color4(0.95, 0.95, 0.95, 1.0);

        createDefaultArcRotateCamera(scene);
        // captured from Computer History Museum
        // https://computerhistory.org
        const assetContainer = await LoadAssetContainerAsync("res/saying_it_with_picture.splat", scene);
        const root = assetContainer.meshes[0];
        root.scaling.setAll(2);
        root.position.x = -1;
        root.position.y = -1;
        root.position.z = -1;
        root.rotation.y = 3.9 * Math.PI / 180.0;
        assetContainer.addAllToScene();

        // Inspector.Show(scene, { });
        return scene;
    }
}
