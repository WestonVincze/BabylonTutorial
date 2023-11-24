import { ArcRotateCamera, Camera, Mesh, Scene, ShadowGenerator, TransformNode, Vector3 } from "@babylonjs/core";

export class Player extends TransformNode {
    public camera: Camera;
    public scene: Scene;
    private _input;

    // Player mesh
    public mesh: Mesh; // collision box of player

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(assets.mesh); // so that player mesh casts shadows

        this._input = input; // from inputController.ts
    }

    private _setupPlayerCamera() {
        let camera4 = new ArcRotateCamera("arc", -Math.PI/2, Math.PI/2, 40, new Vector3(0, 3, 0), this.scene);
    }

}