import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, Color4, FollowCamera, FreeCamera } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";

enum State { START, GAME, LOSE, CUTSCENE }

class App {
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;

  private _state: State;
  private _gameScene: Scene;
  private _cutScene: Scene;

  constructor() {
    // General
    this._canvas = document.createElement("canvas");
    this._canvas.id = "gameCanvas";
    document.body.appendChild(this._canvas);

    // Scene - related
    this._engine = new Engine(this._canvas, true);
    this._scene = new Scene(this._engine);

    /*
    const camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
    camera.attachControl(this._canvas, true);
    const light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
    const sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);
    */

    // add controls to show/hide the inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'I') {
          if (this._scene.debugLayer.isVisible()) {
              this._scene.debugLayer.hide();
          } else {
              this._scene.debugLayer.show();
          }
      }
    })

    window.addEventListener("keydown", (ev) => {
      if (ev.key === "f") alert("yes");
    })

    this._main();

    /*
    this._engine.runRenderLoop(() => {
      this._scene.render();
    })
    */
  }

  private async _main(): Promise<void> {
    console.log("main");
    await this._goToStart();

    // register a render loop
    this._engine.runRenderLoop(() => {
      switch (this._state) {
        case (State.START):
          this._scene.render();
          break;
        case (State.CUTSCENE):
          this._scene.render();
          break;
        case (State.GAME):
          this._scene.render();
          break;
        case (State.LOSE):
          this._scene.render();
          break;
        default: break;
      }
    });

    window.addEventListener('resize', () => {
      this._engine.resize();
    })
  }

  // sets up a blank scene
  private _makeScene(): Scene {
    let scene = new Scene(this._engine);
    scene.clearColor = new Color4(0, 0, 0, 1);
    let camera = new FollowCamera("follow_cam", new Vector3(0, 0, 0), scene);
    camera.setTarget(Vector3.Zero());

    return scene;
  }

  private async _goToStart(): Promise<void> {
    console.log("going to start");
    // loading
    this._engine.displayLoadingUI();

    // scene set up
    this._scene.detachControl();
    let scene = new Scene(this._engine);
    scene.clearColor = new Color4(0, 0, 0, 1);
    let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
    camera.setTarget(Vector3.Zero());
    console.log(scene);

    // GUI
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    guiMenu.idealHeight = 720; // fit fullscreen ui to this height

    // simple button
    const startBtn = Button.CreateSimpleButton("start", "PLAY");
    startBtn.width = 0.2;
    startBtn.height = "40px";
    startBtn.color = "white";
    startBtn.top = "-14px";
    startBtn.thickness = 0;
    startBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    guiMenu.addControl(startBtn);

    startBtn.onPointerDownObservable.add(() => {
      this._goToCutScene();
      scene.detachControl();
    })

    // loaded
    await scene.whenReadyAsync();
    this._engine.hideLoadingUI();
    this._scene.dispose();
    this._scene = scene;
    this._state = State.START;
  }

  private async _goToLose(): Promise<void> {
    // loading
    this._engine.displayLoadingUI();

    // scene set up
    this._scene.detachControl();
    let scene = new Scene(this._engine);
    scene.clearColor = new Color4(0, 0, 0, 1);
    let camera = new FollowCamera("follow_cam", new Vector3(0, 0, 0), scene);
    camera.setTarget(Vector3.Zero());

    // GUI
    const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const mainBtn = Button.CreateSimpleButton("mainmenu", "MAIN MENU");
    mainBtn.width = 0.2;
    mainBtn.height = "40px";
    mainBtn.color = "white";
    guiMenu.addControl(mainBtn);

    mainBtn.onPointerUpObservable.add(() => {
      this._goToStart();
    });

    // loaded
    await scene.whenReadyAsync();
    this._engine.hideLoadingUI();
    this._scene.dispose();
    this._scene = scene;
    this._state = State.LOSE;
  }

  private async _goToCutScene() {
    this._engine.displayLoadingUI();
    this._scene.detachControl();
    this._cutScene = new Scene(this._engine);
    let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this._cutScene);
    camera.setTarget(Vector3.Zero());
    this._cutScene.clearColor = new Color4(0, 0, 0, 1);

    const cutScene = AdvancedDynamicTexture.CreateFullscreenUI("cutscene");

    //--PROGRESS DIALOGUE--
    const next = Button.CreateSimpleButton("next", "NEXT");
    next.color = "white";
    next.thickness = 0;
    next.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    next.width = "64px";
    next.height = "64px";
    next.top = "-3%";
    next.left = "-12%";
    cutScene.addControl(next);

    next.onPointerUpObservable.add(() => {
      this._goToGame();
    })

    //--WHEN SCENE IS FINISHED LOADING--
    await this._cutScene.whenReadyAsync();
    this._engine.hideLoadingUI();
    this._scene.dispose();
    this._state = State.CUTSCENE;
    this._scene = this._cutScene;

    var finishedLoading = false;
    await this._setUpGame().then((red) => {
      finishedLoading = true;
    });
  }

  private async _setUpGame() {
    let scene = new Scene(this._engine);
    this._scene = scene;

    // load assets?
  }

  private async _goToGame() {
    /* --SETUP SCENE-- */
    this._scene.detachControl();
    let scene = this._scene;
    scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better
    let camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), scene);
    camera.setTarget(Vector3.Zero());

    /* --GUI-- */
    const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    // don't detect any inputs from this ui while the game is loading
    scene.detachControl();

    // create a simple button
    const loseBtn = Button.CreateSimpleButton("lose", "LOSE");
    loseBtn.width = 0.2
    loseBtn.height = "40px";
    loseBtn.color = "white";
    loseBtn.top = "-14px";
    loseBtn.thickness = 0;
    loseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    playerUI.addControl(loseBtn);

    // this handles interactions with the start button attached to the scene
    loseBtn.onPointerDownObservable.add(() => {
        this._goToLose();
        scene.detachControl(); // observables disabled
    });

    // temporary scene objects
    var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
    var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

    // get rid of start scene, switch to scene and change states
    this._scene.dispose();
    this._state = State.GAME;
    this._scene = scene;
    this._engine.hideLoadingUI();
    // the game is ready, attach control back
    this._scene.attachControl();
  }

}

new App();