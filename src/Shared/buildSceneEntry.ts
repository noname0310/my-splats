import { Engine } from "@babylonjs/core/Engines/engine";
import type { Nullable } from "@babylonjs/core/types";

import type { ISceneBuilder } from "./baseRuntime";
import { BaseRuntime } from "./baseRuntime";

export async function buildSceneEntry(sceneList: [string, () => Promise<ISceneBuilder>][]): Promise<void> {
    await new Promise<void>(resolve => window.onload = (): void => resolve());

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    document.body.appendChild(canvas);

    const loader = new class {
        private _runtime: BaseRuntime | null = null;

        public async loadScene(sceneBuilder: ISceneBuilder): Promise<BaseRuntime> {
            if (this._runtime) {
                this._runtime.dispose();
            }

            const engine = new Engine(canvas, false, {
                preserveDrawingBuffer: false,
                stencil: false,
                antialias: false,
                alpha: true,
                premultipliedAlpha: false,
                doNotHandleContextLost: true,
                doNotHandleTouchAction: false,
                audioEngine: false
            }, true);

            const runtime = this._runtime = await BaseRuntime.Create({
                canvas,
                engine,
                sceneBuilder
            });
            runtime.run();

            return runtime;
        }
    }();

    const parentDiv = canvas.parentElement!;
    parentDiv.style.display = "flex";
    parentDiv.style.flexDirection = "row-reverse";

    const canvasNewParentDiv = document.createElement("div");
    canvasNewParentDiv.style.width = "100%";
    canvasNewParentDiv.style.height = "100%";
    parentDiv.appendChild(canvasNewParentDiv);

    parentDiv.removeChild(canvas);
    canvasNewParentDiv.appendChild(canvas);

    const listContainerOuter = document.createElement("div");
    listContainerOuter.style.position = "absolute";
    listContainerOuter.style.top = "0";
    listContainerOuter.style.right = "0";
    listContainerOuter.style.width = "100%";
    listContainerOuter.style.height = "100%";
    listContainerOuter.style.overflow = "hidden";
    listContainerOuter.style.pointerEvents = "none";
    canvasNewParentDiv.appendChild(listContainerOuter);


    const listContainer = document.createElement("div");
    listContainer.style.position = "absolute";
    listContainer.style.top = "0";
    listContainer.style.right = "0";
    listContainer.style.width = "auto";
    listContainer.style.height = "100%";
    listContainer.style.transition = "right 0.5s";
    listContainer.style.pointerEvents = "none";
    listContainer.style.zIndex = "100";
    listContainerOuter.appendChild(listContainer);

    const listContainerToggle = document.createElement("button");
    listContainerToggle.style.position = "absolute";
    listContainerToggle.style.width = "20px";
    listContainerToggle.style.height = "20px";
    listContainerToggle.style.top = "0";
    listContainerToggle.style.right = "100%";
    listContainerToggle.style.backgroundColor = "rgba(0, 0, 0, 0)";
    listContainerToggle.style.border = "none";
    listContainerToggle.style.textAlign = "center";
    listContainerToggle.style.color = "black";
    listContainerToggle.style.pointerEvents = "auto";
    listContainerToggle.textContent = ">";
    listContainerToggle.style.textShadow = "1px 1px 1px #aaa";
    listContainer.appendChild(listContainerToggle);
    let listContainerToggleFadeOutTimeout: Nullable<number> = null;
    listContainerToggle.style.transition = "opacity 0.5s";
    const listContainerToggleFadeOut = (): void => {
        listContainerToggle.style.opacity = "1";

        if (listContainerToggleFadeOutTimeout !== null) {
            window.clearTimeout(listContainerToggleFadeOutTimeout);
            listContainerToggleFadeOutTimeout = null;
        }

        listContainerToggleFadeOutTimeout = window.setTimeout(() => {
            listContainerToggleFadeOutTimeout = null;
            listContainerToggle.style.opacity = "0";
        }, 2000);
    };
    listContainerToggle.ontouchmove = (): void => {
        if (listContainer.style.right !== "0px") listContainerToggleFadeOut();
    };
    listContainerToggle.onmousemove = (): void => {
        if (listContainer.style.right !== "0px") listContainerToggleFadeOut();
    };
    listContainerToggle.onmousemove(new MouseEvent("mousemove"));
    listContainerToggle.onclick = (): void => {
        if (listContainer.style.right === "0px") {
            listContainer.style.right = -listContainer.clientWidth + "px";
            listContainerToggle.textContent = "<";
            listContainerToggleFadeOut();

        } else {
            listContainer.style.right = "0px";
            listContainerToggle.textContent = ">";
            window.clearTimeout(listContainerToggleFadeOutTimeout ?? undefined);
            listContainerToggleFadeOutTimeout = null;
            listContainerToggle.style.opacity = "1";
        }
    };


    const list = document.createElement("div");
    list.style.display = "flex";
    list.style.width = "auto";
    list.style.height = "100%";
    list.style.flexDirection = "column";
    list.style.justifyContent = "right";
    list.style.pointerEvents = "auto";
    list.style.overflowX = "hidden";
    list.style.overflowY = "auto";
    list.style.scrollbarGutter = "stable";
    list.style.pointerEvents = "none";
    listContainer.appendChild(list);

    let blockLoad = false;

    for (let i = 0; i < sceneList.length; ++i) {
        const item = document.createElement("a");
        item.style.padding = "3px";
        item.style.cursor = "pointer";
        item.style.fontFamily = "sans-serif";
        item.style.fontSize = "14px";
        item.style.fontWeight = "bold";
        item.style.textAlign = "right";
        item.style.textShadow = "1px 1px 1px #aaa";
        item.style.userSelect = "none";
        item.style.pointerEvents = "auto";
        item.textContent = sceneList[i][0];
        item.onclick = async(): Promise<void> => {
            if (blockLoad) return;
            location.hash = `#${i}`;
        };
        list.appendChild(item);
    }

    async function loadScene(): Promise<void> {
        if (blockLoad) return;
        const hash = location.hash;
        console.log("Loading scene from hash:", hash);
        if (hash) {
            const index = parseInt(hash.slice(1), 10);
            if (!isNaN(index) && index >= 0 && index < sceneList.length) {
                blockLoad = true;
                listContainerToggle.click();
                loader.loadScene(await sceneList[index][1]()).then(() => {
                    blockLoad = false;
                });
            }
        }
    }
    loadScene();
    window.onhashchange = (): void => {
        loadScene();
    };
}
