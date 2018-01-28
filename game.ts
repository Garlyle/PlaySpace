import * as PIXI from './lib/pixi.min.js'

var width = 800;
var height = 600;
var speed = 4;
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
  .add("player", "assets/player.png")
  .add("enemy", "assets/enemy.png")
  .add("projectile", "assets/projectile.png")
  .add("particle", "assets/particle.png")
  .add("bgClose", "assets/bgClose.png")
  .add("bgFar", "assets/bgFar.png")
  .add("gameover", "assets/game_over.png")
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
	player: PIXI.Sprite;
	enemies: PIXI.Sprite[];
	particle: PIXI.ParticleContainer;
	projectiles: PIXI.Sprite[];
	bgFar: PIXI.extras.TilingSprite;
	bgClose: PIXI.extras.TilingSprite;
	gameOver: PIXI.Sprite;
	frame: number;
	fireDelay: number;
	constructor() {
		super();

		this.frame = 0;
		this.fireDelay = 0;

		this.bgFar = new PIXI.extras.TilingSprite(PIXI.loader.resources["bgFar"].texture, 320, 240);
		this.bgFar.scale.set(2.5, 2.5);
		app.stage.addChild(this.bgFar);

		this.bgClose = new PIXI.extras.TilingSprite(PIXI.loader.resources["bgClose"].texture, 1440, 240);
		this.bgClose.scale.set(2.5, 2.5);
		app.stage.addChild(this.bgClose);

		this.player = new PIXI.Sprite(PIXI.loader.resources["player"].texture);
		this.player.x = 50;
		this.player.y = height / 2;
		app.stage.addChild(this.player);

		this.particle = new PIXI.ParticleContainer();
		app.stage.addChild(this.particle);

		this.enemies = [];
		this.projectiles = [];
	}
	onUpdate(): void {
		// Update Background
		this.bgFar.tilePosition.x -= 1;
		this.bgClose.tilePosition.x -= 4;

		// Player controls
		if (keyLeft && this.player.x > 0) {
			this.player.x -= speed;
		} else if(keyRight && this.player.x < width - this.player.texture.width) {
			this.player.x += speed;
		}
		if (keyUp && this.player.y > 0) {
			this.player.y -= speed;
		} else if(keyDown && this.player.y < height - this.player.texture.height) {
			this.player.y += speed;
		}

		// Timer check for projectiles
		if (this.fireDelay != 0) {
			this.fireDelay--;
		} else if (keySpace) {
			var newProjectile = new PIXI.Sprite(PIXI.loader.resources["projectile"].texture);
			newProjectile.x = this.player.x;
			newProjectile.y = this.player.y + this.player.texture.height / 2;
			this.projectiles.push(newProjectile);
			app.stage.addChild(newProjectile);
			this.fireDelay = 30;
		}

		// Timer for adding new enemies
		this.frame++;
		if (this.frame >= 120) {
			var newEnemy = new PIXI.Sprite(PIXI.loader.resources["enemy"].texture);
			newEnemy.scale.set(0.25, 0.25);
			newEnemy.x = width + 50;
			newEnemy.y = Math.random() * (height - newEnemy.height);
			this.enemies.push(newEnemy);
			app.stage.addChild(newEnemy);
			this.frame = 0;
		}

		// Update projectiles
		for (var i = 0; i < this.projectiles.length; i++) {
			this.projectiles[i].x += speed * 3;
			if (this.projectiles[i].x > width) {
				app.stage.removeChild(this.projectiles[i]);
				this.projectiles.splice(i, 1);
				i--;
			}
		}

		// Update enemies
		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].x -= speed;
			if (this.collide(this.enemies[i], this.player)) {
				this.onExit();
				currentScene = new SceneMain();
			}
			for (var j = 0; j < this.projectiles.length; j++) {
				if (this.collide(this.enemies[i], this.projectiles[j])) {
					// add particles
					for (var p = 0; p < 10; p++) {
						var tex = new PIXI.Sprite(PIXI.loader.resources["particle"].texture);
						tex.x = this.enemies[i].x;
						tex.y = this.enemies[i].y;
						tex.alpha = 1;
						tex.vx = Math.cos(p * Math.PI / 5) * 3 * speed;
						tex.vy = Math.sin(p * Math.PI / 5) * 3 * speed;
						this.particle.addChild(tex);
					}

					// remove enemy and projectile
					app.stage.removeChild(this.enemies[i]);
					this.enemies.splice(i, 1);
					i--;
					app.stage.removeChild(this.projectiles[j]);
					this.projectiles.splice(j, 1);
					j--;
					break;
				}
			}
		}
		for (var i = 0; i < this.enemies.length; i++) {
			if (this.enemies[i].x < -this.enemies[i].width) {
				app.stage.removeChild(this.enemies[i]);
				this.enemies.splice(i, 1);
				i--;
			}
		}

		// Update Particles
		for (var i = 0; i < this.particle.children.length; i++) {
			this.particle.children[i].x += this.particle.children[i].vx;
			this.particle.children[i].y += this.particle.children[i].vy;
			this.particle.children[i].alpha -= 0.1;
			if (this.particle.children[i].alpha <= 0) {
				this.particle.removeChildAt(i);
				i--;
			}
		}
	}
	onExit(): void {
		app.stage.removeChild(this.bgFar);
		app.stage.removeChild(this.bgClose);
	}
	collide(spriteA: PIXI.Sprite, spriteB: PIXI.Sprite): boolean {
		if (spriteA.x < spriteB.x + spriteB.width &&
		   spriteA.x + spriteA.width > spriteB.x &&
		   spriteA.y < spriteB.y + spriteB.height &&
		   spriteA.height + spriteA.y > spriteB.y) {
		   	return true;
		}
		return false;
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
	currentScene = new SceneGame();
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
