var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

  game.load.image('star', 'http://www.first-last-always.com/application/themes/default/images/dot-white.png');
  game.load.image('bullet', 'bullet.png');
  game.load.image('ship', 'spshipspr1.png');
  game.load.image("enemy", "smallfreighterspr")
}

var sprite;
var cursors;
var bullet;
var bullets;
var bulletTime = 0;

function create() {
  game.renderer.clearBeforeRender = true;
  game.renderer.roundPixels = true;

  game.world.setBounds(0, 0, 2000, 2000);

  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.stage.backgroundColor = "#000";

  for (var i = 0; i < 50; i++) {
      game.add.sprite(game.world.randomX, game.world.randomY, 'star');
  }

  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;

  sprite = game.add.sprite(300, 300, 'ship');
  sprite.anchor.set(0.5);

  bullets.createMultiple(40, 'bullet');
  bullets.setAll("anchor.x", 0.5);
  bullets.setAll("anchor.y", 0.5);

  game.camera.follow(sprite);

  game.physics.enable(sprite, Phaser.Physics.ARCADE);

  sprite.body.maxVelocity.set(300);

  cursors = game.input.keyboard.createCursorKeys();
  game.input.keyboard.addKeyCapture([ Phaser.Keyboard.SPACEBAR ]);

}

function update() {
  if (cursors.up.isDown) {
    game.physics.arcade.accelerationFromRotation(sprite.rotation, 300, sprite.body.acceleration);
  } else {
    sprite.body.acceleration.set(0);
  }

  if (cursors.left.isDown) {
    sprite.body.angularVelocity = -300;
  } else if (cursors.right.isDown) {
    sprite.body.angularVelocity = 300;
  } else {
    sprite.body.angularVelocity = 0;
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      fireBullet();
  }

    screenWrap(sprite);

    bullets.forEachExists(screenWrap, this);
}

function fireBullet () {

    if (game.time.now > bulletTime) {
        bullet = bullets.getFirstExists(false);

        if (bullet) {
            bullet.reset(sprite.body.x + 16, sprite.body.y + 16);
            bullet.lifespan = 2000;
            bullet.rotation = sprite.rotation;
            game.physics.arcade.velocityFromRotation(sprite.rotation, 400, bullet.body.velocity);
            bulletTime = game.time.now + 50;
        }
    }
}

function screenWrap (sprite) {
  if (sprite.x < 0) {
      sprite.x = game.world.bounds.width;
  }
  else if (sprite.x > game.world.bounds.width) {
      sprite.x = 0;
  }

  if (sprite.y < 0) {
      sprite.y = game.world.bounds.height;
  }
  else if (sprite.y > game.world.bounds.height) {
      sprite.y = 0;
  }
}

function render() {
  game.debug.cameraInfo(game.camera, 32, 32);
}
