import { ArcRotateCamera, Camera, Mesh, Scene, ShadowGenerator, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";

export class Player extends TransformNode {
    public camera: UniversalCamera;
    public scene: Scene;
    private _input;
    private _camRoot;
    private _yTilt;

    // Player mesh
    public mesh: Mesh; // collision box of player

    // constants
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);

    constructor(assets, scene: Scene, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this._setupPlayerCamera();

        this.mesh = assets.mesh;
        this.mesh.parent = this;

        shadowGenerator.addShadowCaster(this.mesh); // so that player mesh casts shadows

        this._input = input; // from inputController.ts
    }

    private _setupPlayerCamera(): UniversalCamera {
        // camera hierarchy = camRoot -> yTilt -> camera
        // root parent node for camera
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0);
        // rotate to be in sync with player (odd choice IMO)
        this._camRoot.rotation = new Vector3(0, Math.PI, 0);

        // rotations along x-axis
        let yTilt = new TransformNode("yTilt");
        // adjust camera to point at player
        yTilt.rotation = Player.ORIGINAL_TILT;
        yTilt.parent = this._camRoot;
        this._yTilt = yTilt;

        // instantiate universal camera and point to root node
        this.camera = new UniversalCamera("cam", new Vector3(0, 0, -30), this.scene);
        this.camera.lockedTarget = this._camRoot.position;
        this.camera.fov = 0.47350045992678597;
        this.camera.parent = this._yTilt;

        this.scene.activeCamera = this.camera;
        return this.camera;
    }

    private _updatePlayerCamera(): void {
        // 2 = 1/2 player height (why hard code values like this?)
        let centerPlayer = this.mesh.position.y + 2;
        this._camRoot.position = Vector3.Lerp(this._camRoot.position, new Vector3(this.mesh.position.x, centerPlayer, this.mesh.position.z), 0.4);
    }

    public activatePlayerCamera(): UniversalCamera {
        this.scene.registerBeforeRender(() => {
            this._updatePlayerCamera();
        })

        return this.camera;
    }
}