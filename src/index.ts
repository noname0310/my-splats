import type { ISceneBuilder } from "./Shared/baseRuntime";
import { buildSceneEntry } from "./Shared/buildSceneEntry";

const scenes: [string, () => Promise<ISceneBuilder>][] = [
    ["ibm system360", async(): Promise<ISceneBuilder> => new (await import("@/Scenes/ibmSystem360")).SceneBuilder()],
    ["lmi lambda", async(): Promise<ISceneBuilder> => new (await import("@/Scenes/lmiLambda")).SceneBuilder()],
    ["saying it with picture", async(): Promise<ISceneBuilder> => new (await import("@/Scenes/sayingItWithPicture")).SceneBuilder()]
];
buildSceneEntry(scenes);
