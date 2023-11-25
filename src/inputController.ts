import { ActionManager, ExecuteCodeAction, Scalar, Scene } from "@babylonjs/core";

export class PlayerInput {
    public inputMap;

    public vertical: number;
    public horizonal: number;
    private _desiredVertical: number;
    private _desiredHorizonal: number;

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
        console.log(this.inputMap);
        // vertical axis
        if (this.inputMap["ArrowUp"] || this.inputMap["w"]) {
            this._desiredVertical = 1;
            this.vertical = Scalar.Lerp(this.vertical, this._desiredVertical, 0.5);
        } else if (this.inputMap["ArrowDown"] || this.inputMap["s"]) {
            this._desiredVertical = -1;
            this.vertical = Scalar.Lerp(this.vertical, this._desiredVertical, 0.5);
        } else {
            this._desiredVertical = 0;
            this.vertical = 0; 
        }

        // horizontal axis
        if (this.inputMap["ArrowLeft"] || this.inputMap["a"]) {
            this._desiredHorizonal = -1;
            this.horizonal = Scalar.Lerp(this.horizonal, this._desiredHorizonal, 0.5);
        } else if (this.inputMap["ArrowRight"] || this.inputMap["d"]) {
            this._desiredHorizonal = 1;
            this.horizonal = Scalar.Lerp(this.horizonal, this._desiredHorizonal, 0.5);
        } else {
            this._desiredHorizonal = 0;
            this.horizonal = 0; 
        }

        console.log("vertical, horizontal");
        console.log(this.vertical);
        console.log(this.horizonal);
    }
}