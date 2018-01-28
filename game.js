"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//exports.__esModule = true;
//var PIXI = require("./lib/pixi.min.js");
var width = 800;
var height = 600;
var currentScene;
var msg = "text";
var keyLeft, keyRight, keyUp, keyDown, keySpace;
//Create a Pixi Application
var app = new PIXI.Application({
    width: width,
    height: height
});
document.body.appendChild(app.view);
app.renderer.backgroundColor = 0x000000;
// Add Event Listener
document.addEventListener('keydown', keyPressed, false);
document.addEventListener('keyup', keyReleased, false);
// Load Assets
PIXI.loader
    .add("logo", "assets/logo.png")
    .add("bgStars", "assets/bgStars.jpg")
    .add("button1", "assets/button1.png")
    .add("button2", "assets/button2.png")
    .add("button3", "assets/button3.png")
    .add("buttonExit", "assets/buttonExit.png")
    .load(run);
var Scene = /** @class */ (function () {
    function Scene() {
    }
    ;
    return Scene;
}());
var SceneSplash = /** @class */ (function (_super) {
    __extends(SceneSplash, _super);
    function SceneSplash() {
        var _this = _super.call(this) || this;
        _this.frame = 0;
        _this.logo = new PIXI.Sprite(PIXI.loader.resources["logo"].texture);
        _this.logo.x = (width - _this.logo.width) / 2;
        _this.logo.y = (height - _this.logo.height) / 2;
        _this.logo.alpha = 0;
        app.stage.addChild(_this.logo);
        return _this;
    }
    SceneSplash.prototype.onUpdate = function () {
        if (this.frame < 12) {
            this.logo.alpha += 1 / 12;
        }
        else if (this.frame > (120 - 12) && this.frame <= 120) {
            this.logo.alpha -= 1 / 12;
        }
        if (this.frame > 240) {
            this.onExit();
            currentScene = new SceneMain();
        }
        this.frame++;
    };
    SceneSplash.prototype.onRender = function () {
        // no extra updates
    };
    SceneSplash.prototype.onExit = function () {
        app.stage.removeChild(this.logo);
    };
    return SceneSplash;
}(Scene));
var SceneMain = /** @class */ (function (_super) {
    __extends(SceneMain, _super);
    function SceneMain() {
        var _this = _super.call(this) || this;
        _this.bg = new PIXI.Sprite(PIXI.loader.resources["bgStars"].texture);
        _this.bg.width = width;
        _this.bg.height = height;
        app.stage.addChild(_this.bg);
        _this.buttons = new Array(4);
        _this.buttons[0] = new Button("button1", 100, 500);
        _this.buttons[1] = new Button("button2", 250, 500);
        _this.buttons[2] = new Button("button3", 400, 500);
        _this.buttons[3] = new Button("buttonExit", 550, 500);
        return _this;
    }
    SceneMain.prototype.onUpdate = function () {
        if (msg == "buttonExit") {
            this.onExit();
            currentScene = new SceneSplash();
        }
    };
    SceneMain.prototype.onRender = function () {
    };
    SceneMain.prototype.onExit = function () {
        msg = "";
        app.stage.removeChild(this.bg);
        for (var i = 0; i < 4; i++) {
            this.buttons[i].destroy();
        }
    };
    return SceneMain;
}(Scene));
var Button = /** @class */ (function () {
    function Button(tex, x, y) {
        this.isdown = false;
        this.isOver = false;
        this.message = tex;
        var texture = PIXI.utils.TextureCache[tex];
        var rectangle = new PIXI.Rectangle(0, 0, texture.width, 40);
        texture.frame = rectangle;
        this.button = new PIXI.Sprite(texture);
        this.button.x = x;
        this.button.y = y;
        this.button.interactive = true;
        this.button.buttonMode = true;
        this.button.message = tex;
        this.button
            .on('pointerdown', this.onButtonDown)
            .on('pointerup', this.onButtonUp)
            .on('pointerupoutside', this.onButtonUp)
            .on('pointerover', this.onButtonOver)
            .on('pointerout', this.onButtonOut);
        app.stage.addChild(this.button);
    }
    Button.prototype.onButtonDown = function () {
        this.isdown = true;
        this.texture.frame.y = 80;
        this.texture._updateUvs();
    };
    Button.prototype.onButtonUp = function () {
        this.isdown = false;
        if (this.isOver) {
            this.texture.frame.y = 40;
            msg = this.message;
            console.log(msg);
            console.log(this.message);
        }
        else {
            this.texture.frame.y = 0;
        }
        this.texture._updateUvs();
    };
    Button.prototype.onButtonOver = function () {
        this.isOver = true;
        if (this.isdown) {
            return;
        }
        this.texture.frame.y = 40;
        this.texture._updateUvs();
    };
    Button.prototype.onButtonOut = function () {
        this.isOver = false;
        if (this.isdown) {
            return;
        }
        this.texture.frame.y = 0;
        this.texture._updateUvs();
    };
    Button.prototype.destroy = function () {
        app.stage.removeChild(this.button);
    };
    return Button;
}());
var SceneGame = /** @class */ (function (_super) {
    __extends(SceneGame, _super);
    function SceneGame() {
        return _super.call(this) || this;
    }
    SceneGame.prototype.onUpdate = function () {
    };
    SceneGame.prototype.onRender = function () {
    };
    SceneGame.prototype.onExit = function () {
    };
    return SceneGame;
}(Scene));
function keyPressed(event) {
    if (event.keyCode == 39) {
        keyRight = true;
    }
    else if (event.keyCode == 37) {
        keyLeft = true;
    }
    if (event.keyCode == 40) {
        keyDown = true;
    }
    else if (event.keyCode == 38) {
        keyUp = true;
    }
    if (event.keyCode == 32) {
        keySpace = true;
    }
}
function keyReleased(event) {
    if (event.keyCode == 39) {
        keyRight = false;
    }
    else if (event.keyCode == 37) {
        keyLeft = false;
    }
    if (event.keyCode == 40) {
        keyDown = false;
    }
    else if (event.keyCode == 38) {
        keyUp = false;
    }
    if (event.keyCode == 32) {
        keySpace = false;
    }
}
function run() {
    // Init Global Variables
    currentScene = new SceneMain();
    keyLeft = false;
    keyRight = false;
    keyUp = false;
    keyDown = false;
    keySpace = false;
    // Let it run
    update();
}
function update() {
    requestAnimationFrame(update);
    currentScene.onUpdate();
    currentScene.onRender();
}
