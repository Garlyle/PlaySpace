import * as PIXI from './lib/pixi.min.js'

var width = 800;
var height = 600;
var currentScene;
var msg = "text";
var keyLeft, keyRight, keyUp, keyDown, keySpace;

//Create a Pixi Application
var app = new PIXI.Application({
    width: width,
    height: height
  }
);
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
  .add("stars", "assets/stars.png")
  .load(run);

abstract class Scene {
	constructor(){};
	abstract onUpdate(): void;
	abstract onExit(): void;
}

class SceneSplash extends Scene {
	private logo: PIXI.Sprite;
	private frame: number;
	constructor() {
		super();
		this.frame = 0;
		this.logo = new PIXI.Sprite(PIXI.loader.resources["logo"].texture);
		this.logo.x = (width - this.logo.width) / 2;
		this.logo.y = (height - this.logo.height) / 2;
		this.logo.alpha = 0;
		app.stage.addChild(this.logo);
  	}

  	onUpdate(): void {
		if (this.frame < 12) {
			this.logo.alpha += 1 / 12;
		} else if (this.frame > (120 - 12) && this.frame <= 120) {
			this.logo.alpha -= 1 / 12;
		}
		if (this.frame > 240) {
			this.onExit();
			currentScene = new SceneMain();
		}
		this.frame++;
  	}

  	onExit(): void {
  		app.stage.removeChild(this.logo);
  	}
}

class SceneMain extends Scene {
	private buttons: PIXI.Sprite[];
	private bg: PIXI.extras.TilingSprite;
	private stars: PIXI.extras.AnimatedSprite;
	private logo: PIXI.Sprite;
	constructor() {
		super();
		this.bg = new PIXI.extras.TilingSprite(PIXI.loader.resources["bgStars"].texture, 1920, 1080);
		this.bg.scale.set(0.6, 0.6);
		this.bg.position.x = 0;
		this.bg.position.y = 0;
		this.bg.tilePosition.x = 0;
		this.bg.tilePosition.y = 0;
		app.stage.addChild(this.bg);

		var frames = [];
		for (var i = 0; i < 13; i++) {
			var tex = new PIXI.Texture(PIXI.loader.resources["stars"].texture);
			var rectangle = new PIXI.Rectangle((i % 5) * 96, Math.floor(i / 5) * 96, 96, 96);
			tex.frame = rectangle;			
			frames.push(tex);
		}
		this.stars = new PIXI.extras.AnimatedSprite(frames);
	    this.stars.x = app.screen.width / 2;
	    this.stars.y = app.screen.height / 2;
	    this.stars.anchor.set(0.5);
	    this.stars.animationSpeed = 0.1;
	    this.stars.alpha = 0.2;
	    this.stars.scale.set(10, 10);
	    this.stars.play();
		app.stage.addChild(this.stars);

		this.logo = new PIXI.Sprite(PIXI.loader.resources["logo"].texture);
		this.logo.x = (width - this.logo.width) / 4;
		this.logo.y = (height - this.logo.height) / 3;
		app.stage.addChild(this.logo);

		this.buttons = new Array(4);

		this.buttons[0] = new Button("button1", 100, 500);
		this.buttons[1] = new Button("button2", 250, 500);
		this.buttons[2] = new Button("button3", 400, 500);
		this.buttons[3] = new Button("buttonExit", 550, 500);

	}
	onUpdate(): void {
		this.bg.tilePosition.x -= 1;
		if (msg == "buttonExit") {
			this.onExit();
			currentScene = new SceneSplash();
		}
		if (msg == "button1" || msg == "button2" || msg == "button3") {
			this.onExit();
			currentScene = new SceneGame();
		}
	}

	onExit(): void {
		msg = "";
		app.stage.removeChild(this.logo);
		app.stage.removeChild(this.stars);
		app.stage.removeChild(this.bg);
		for(var i = 0; i < 4; i++) {
			this.buttons[i].destroy();
		}
	}
}

class Button {
	texture: PIXI.texture;
	isdown: boolean = false;
	isOver: boolean = false;
	message: string;
	button: PIXI.Sprite;
	constructor(tex: string, x: number, y: number) {
		this.message = tex;
		let texture = PIXI.utils.TextureCache[tex];
		let rectangle = new PIXI.Rectangle(0, 0, texture.width, 40);
		texture.frame = rectangle;
		this.button = new PIXI.Sprite(texture);
		this.button.x = x;
		this.button.y = y;
		this.button.interactive = true;
		this.button.buttonMode = true;
		this.button.message = tex;
	    this.button
	        // Mouse & touch events are normalized into
	        // the pointer* events for handling different
	        // button events.
	        .on('pointerdown', this.onButtonDown)
	        .on('pointerup', this.onButtonUp)
	        .on('pointerupoutside', this.onButtonUp)
	        .on('pointerover', this.onButtonOver)
	        .on('pointerout', this.onButtonOut);
	    app.stage.addChild(this.button);
	}
	onButtonDown(): void {
	    this.isdown = true;
	    this.texture.frame.y = 80;
	    this.texture._updateUvs();
	}

	onButtonUp(): void {
	    this.isdown = false;
	    if (this.isOver) {
	        this.texture.frame.y = 40;
	        msg = this.message;
	    }
	    else {
	        this.texture.frame.y = 0;
	    }
	    this.texture._updateUvs();
	}

	onButtonOver(): void {
	    this.isOver = true;
	    if (this.isdown) {
	        return;
	    }
	    this.texture.frame.y = 40;
	    this.texture._updateUvs();
	}

	onButtonOut(): void {
	    this.isOver = false;
	    if (this.isdown) {
	        return;
	    }
	    this.texture.frame.y = 0;
	    this.texture._updateUvs();
	}

	destroy(): void {
		app.stage.removeChild(this.button);
	}

}

class SceneGame extends Scene {
	constructor() {
		super();
	}
	onUpdate(): void {

	}
	onRender(): void {

	}
	onExit(): void {

	}
}

function keyPressed(event) {
    if(event.keyCode == 39) {
      keyRight = true;
    } else if(event.keyCode == 37) {
      keyLeft = true;
    }
    if(event.keyCode == 40) {
    	keyDown = true;
    } else if(event.keyCode == 38) {
    	keyUp = true;
    }
    if (event.keyCode == 32) {
      keySpace = true;
    }
}

function keyReleased(event) {
    if(event.keyCode == 39) {
      keyRight = false;
    } else if(event.keyCode == 37) {
      keyLeft = false;
    }
    if(event.keyCode == 40) {
    	keyDown = false;
    } else if(event.keyCode == 38) {
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
}
