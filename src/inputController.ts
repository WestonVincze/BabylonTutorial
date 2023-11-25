import { ActionManager, ExecuteCodeAction, Scalar, Scene } from "@babylonjs/core";

export class PlayerInput {
    public inputMap: {string: boolean} | {};

    public vertical: number;
    public horizonal: number;
    public desiredVertical: number;
    public desiredHorizonal: number;

    constructor(scene: Scene) {
        scene.actionManager = new ActionManager(scene);

        this.inputMap = {};

        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (ev) => {
            this.inputMap[ev.sourceEvent.key] = true;
        }));

        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (ev) => {
            this.inputMap[ev.sourceEvent.key] = false;
        }));

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        })
    }

    private _updateFromKeyboard() {
        // vertical axis
        if (this.inputMap["ArrowUp"] || this.inputMap["w"]) {
            this.desiredVertical = 1;
            this.vertical = Scalar.Lerp(this.vertical, this.desiredVertical, 0.5);
        } else if (this.inputMap["ArrowDown"] || this.inputMap["s"]) {
            this.desiredVertical = -1;
            this.vertical = Scalar.Lerp(this.vertical, this.desiredVertical, 0.5);
        } else {
            this.desiredVertical = 0;
            this.vertical = 0; 
        }

        // horizontal axis
        if (this.inputMap["ArrowLeft"] || this.inputMap["a"]) {
            this.desiredHorizonal = -1;
            this.horizonal = Scalar.Lerp(this.horizonal, this.desiredHorizonal, 0.5);
        } else if (this.inputMap["ArrowRight"] || this.inputMap["d"]) {
            this.desiredHorizonal = 1;
            this.horizonal = Scalar.Lerp(this.horizonal, this.desiredHorizonal, 0.5);
        } else {
            this.desiredHorizonal = 0;
            this.horizonal = 0; 
        }
    }
}