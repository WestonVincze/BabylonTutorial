import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, Color4, FollowCamera, FreeCamera, Matrix, Quaternion, StandardMaterial, Color3, PointLight, ShadowGenerator } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control } from "@babylonjs/gui";
import { Environment } from "./environments";
import { Player } from "./characterController";
import { PlayerInput } from "./inputController";

enum State { START, GAME, LOSE, CUTSCENE }

class App {
  // general app
  private _scene: Scene;
  private _canvas: HTMLCanvasElement;
  private _engine: Engine;

  // game state
  public assets;
  private _player: Player;
  private _playerInput: PlayerInput;
  private _state: State;
  private _gameScene: Scene;
  private _cutScene: Scene;
  private _environment: Environment;

  constructor() {
    // initialize canvas
    this._canvas = document.createElement("canvas");
    this._canvas.id = "gameCanvas";
    document.body.appendChild(this._canvas);

    // initialize engine and scene
    this._engine = new Engine(this._canvas, true);
    this._scene = new Scene(this._engine);

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

    this._main();
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
    console.log("gotolose");
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
    console.log("gotocutscene");
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
    console.log('setupgame');
    let scene = new Scene(this._engine);
    this._gameScene = scene;

    // instantiate environment
    const environment = new Environment(scene);
    this._environment = environment;
    await this._environment.load();
    await this._loadCharacterAssets(scene);
  }

  private async _goToGame() {
    console.log("gotogame");
    /* --SETUP SCENE-- */
    this._scene.detachControl();
    let scene = this._gameScene;
    scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098);

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

    await this._initializeGameAsync(scene);

    await scene.whenReadyAsync();
    console.log(scene.getMeshByName("outer"));
    scene.getMeshByName("outer").position = new Vector3(0, 3, 0);

    // get rid of start scene, switch to scene and change states
    this._scene.dispose();
    this._state = State.GAME;
    this._scene = scene;
    this._engine.hideLoadingUI();
    // the game is ready, attach control back
    this._scene.attachControl();
  }

  private async _loadCharacterAssets(scene: Scene) {

    async function loadCharacter() {
      const outer = MeshBuilder.CreateBox("outer", { width: 2, depth: 1, height: 3 }, scene);
      outer.isVisible = false;
      outer.isPickable = false;
      outer.checkCollisions = true;

      // move box collider origin to bottom of mesh
      outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0));

      // collisions
      outer.ellipsoid = new Vector3(1, 1.5, 1);
      outer.ellipsoidOffset = new Vector3(1, 1.5, 1);

      // rotate character 180 degrees to see back
      outer.rotationQuaternion = new Quaternion(0, 1, 0, 0);

      const faceColor = new Color4(0, 0, 0, 1);
      let box = MeshBuilder.CreateBox("small", { width: 0.5, depth: 0.5, height: 0.25, faceColors: [faceColor, faceColor, faceColor, faceColor, faceColor, faceColor] }, scene);
      box.position.y = 1.5;
      box.position.x = 1;

      let body = MeshBuilder.CreateCylinder("body", { height: 3, diameterTop: 2, diameterBottom: 2 }, scene);
      let bodymtl = new StandardMaterial("red", scene);
      bodymtl.diffuseColor = new Color3(0.8, 0.5, 0.5);
      body.material = bodymtl;
      body.isPickable = false;
      body.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0)); // simulate imported mesh's origin

      // parent the mesh's
      box.parent = body;
      body.parent = outer;
      
      return {
        mesh: outer as Mesh
      }
    }

    return loadCharacter().then(assets => {
      this.assets = assets;
    });
  }

  private async _initializeGameAsync(scene: Scene): Promise<void> {
    var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);

    const light = new PointLight("sparklight", new Vector3(0, 0, 0), scene);
    light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
    light.intensity = 35;
    light.radius = 1;

    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.darkness = 0.4;

    this._playerInput = new PlayerInput(scene);
    this._player = new Player(this.assets, scene, shadowGenerator, this._playerInput);

    const camera = this._player.activatePlayerCamera();
  }
}

new App();