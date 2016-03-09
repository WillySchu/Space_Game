var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

  game.load.image('star', 'http://www.first-last-always.com/application/themes/default/images/dot-white.png');
  game.load.image("planet", "planet.png");
  game.load.image('bullet', 'bullet.png');
  game.load.image('ship', 'spshipspr1.png');
  game.load.image("enemy", "smallfreighterspr.png");
  game.load.image("laser", "laser.png");
  game.load.spritesheet("asteroids", "asteroids.png", 128, 128, 16);
  game.load.spritesheet("explosions", "explosion.png", 96, 96, 20);
}

var ship;
var planet;
var cursors;
var bullet;
var bullets;
var bulletTime = 0;
var asteroids;
var asteroid;
var explosion;
var lasers;
var laser;
var healthBar;
var score = 0;
var text;
var pKey;
var lKey;
var landed = false;

function create() {
  game.renderer.clearBeforeRender = true;
  game.renderer.roundPixels = true;

  game.world.setBounds(0, 0, 2000, 2000);
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.stage.backgroundColor = "#000";

  createPlanet();

  createAsteroids(40, 2, 4, 5);

  createStars(1000, 1);

  createBullets();

  createLasers();

  createShip(game.world.randomX, game.world.randomY, 1, 10);

  createEnemies(0, 100, 1, 5);

  createConsole();

  cursors = game.input.keyboard.createCursorKeys();
  game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
  pKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
  lKey = game.input.keyboard.addKey(Phaser.Keyboard.L);
}

function update() {
  flyShip();

  game.physics.arcade.overlap(asteroids, bullets, collisionHandler, null, this);

  game.physics.arcade.overlap(ship, lasers, collisionHandler, null, this);

  game.physics.arcade.overlap(enemies, bullets, collisionHandler, null, this);

  bullets.forEachExists(screenWrap, this);
  lasers.forEachExists(screenWrap, this);
  enemies.forEachExists(screenWrap, this);

  for (var i = 0; i < enemies.children.length; i++) {
    if(enemies.children[i].alive){
      flyEnemies(enemies.children[i]);
    }
  }
  lKey.onDown.add(land, this);
  //pKey.onDown.add(pause, this);
  updateScore();
  //victoryTest();
  //console.log(Math.sqrt(ship.body.velocity.x * ship.body.velocity.x + ship.body.velocity.y * ship.body.velocity.y));
}

function createPlanet() {
  planet = game.add.sprite(game.world.bounds.width / 2, game.world.bounds.height / 2, "planet");
  planet.scale.setTo(0.2, 0.2);
}

function createBullets() {
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(40, 'bullet');
  bullets.setAll("anchor.x", 0.5);
  bullets.setAll("anchor.y", 0.5);
}

function createLasers() {
  lasers = game.add.group();
  lasers.enableBody = true;
  lasers.physicsBodyType = Phaser.Physics.ARCADE;
  lasers.createMultiple(40, "laser");
  lasers.setAll("anchor.x", 0.5);
  lasers.setAll("anchor.y", 0.5);
}

function createAsteroids(n, lv, av, health) {
  asteroids = game.add.group();
  asteroids.enableBody = true;
  asteroids.physicsBodyType = Phaser.Physics.ARCADE;

  for (var i = 0; i < n; i++) {
    asteroid = game.add.sprite(game.world.randomX, game.world.randomY, "asteroids", i, asteroids);
    asteroid.body.velocity.x = Math.random() * lv;
    asteroid.body.velocity.y = Math.random() * lv;
    asteroid.body.angularVelocity = Math.random() * av;
    asteroid.anchor.set(0.5, 0.5);
    asteroid.health = health;
  }
}

function createStars(n, s) {
  for (var i = 0; i < n; i++) {
    var star = game.add.sprite(game.world.randomX, game.world.randomY, 'star');
    star.scale.setTo(0.02 * s, 0.02 * s);
  }
}

function createShip(x, y, size, health) {
  ship = game.add.sprite(x, y, 'ship');
  ship.anchor.set(0.5, 0.5);
  ship.scale.setTo(size, size);
  game.camera.follow(ship);
  game.physics.enable(ship, Phaser.Physics.ARCADE);
  ship.body.maxVelocity.set(300);
  ship.health = health;
  ship.totalHealth = health;
}

function createEnemies(n, v, size, health) {
  enemies = game.add.group();

  for (var i = 0; i < n; i++) {
    var enemy = game.add.sprite(game.world.randomX, game.world.randomY, "enemy", 1, enemies);
    enemy.anchor.set(0.5);
    enemy.scale.setTo(size, size);
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.maxVelocity.set(v)
    enemy.health = health;
    enemy.laserTime = 0;
  }
}

function createConsole() {
  var barConfig = {width: 100, height: 10, x: 60, y: 15};
  healthBar = new HealthBar(this.game, barConfig);
  healthBar.setFixedToCamera(true);

  text = game.add.text(10, 30, "Score: " + score, {font: "40px", fill: "#fff"});
  text.fixedToCamera = true;
}

function updateScore() {
  score++;

  text.setText("Score: " + score);
}

function land() {
  var velMag = Math.sqrt(ship.body.velocity.x * ship.body.velocity.x + ship.body.velocity.y * ship.body.velocity.y);
  if(landed) {
    landed = !landed;
    pause();
  } else {
    if((ship.x > planet.x) && (ship.x < (planet.x + planet.width)) &&
    ((ship.y > planet.y) && (ship.y < (planet.y + planet.height)))){
      if(velMag < 20) {
        landed = !landed;
        pause();
      } else {
        console.log("Slow Down!");
      }
    }
  }
}

function fireBullet() {
  if(game.time.now > bulletTime) {
    bullet = bullets.getFirstExists(false);

    if(bullet) {
      bullet.reset(ship.body.x + 25, ship.body.y + 25);
      bullet.lifespan = 1000;
      bullet.rotation = ship.rotation;
      game.physics.arcade.velocityFromRotation(ship.rotation, 600, bullet.body.velocity);
      bulletTime = game.time.now + 50;
    }
  }
}

function fireLaser(enemy) {
  if(game.time.now > enemy.laserTime) {
    laser = lasers.getFirstExists(false);

    if(laser) {
      laser.reset(enemy.body.x + 25, enemy.body.y + 25);
      laser.lifespan = 1600;
      laser.rotation = enemy.rotation;
      game.physics.arcade.velocityFromRotation(enemy.rotation, 400, laser.body.velocity);
      enemy.laserTime = game.time.now + 100;
    }
  }
}

function flyEnemies(enemy) {
  var direction = new Phaser.Point(ship.x, ship.y);
  var vector;
  direction.subtract(enemy.x, enemy.y);
  direction.normalize();
  vector = Math.atan2(direction.y, direction.x) - enemy.rotation;
  if(vector > 0.1) {
    enemy.body.angularVelocity = 200;
  } else if(vector < -0.1) {
    enemy.body.angularVelocity = -200;
  } else {
    enemy.body.angularVelocity = 0;
    fireLaser(enemy);
  }
  game.physics.arcade.accelerationFromRotation(enemy.rotation, 400, enemy.body.acceleration);
}

function flyShip() {
  screenWrap(ship);
  if (cursors.up.isDown) {
    game.physics.arcade.accelerationFromRotation(ship.rotation, 300, ship.body.acceleration);
  } else {
    ship.body.acceleration.set(0);
  }
  if (cursors.left.isDown) {
    ship.body.angularVelocity = -300;
  } else if (cursors.right.isDown) {
    ship.body.angularVelocity = 300;
  } else {
    ship.body.angularVelocity = 0;
  }
  if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    fireBullet();
  }
}

function screenWrap (ship) {
  if (ship.x < 0) {
    ship.x = game.world.bounds.width;
  }
  else if (ship.x > game.world.bounds.width) {
    ship.x = 0;
  }

  if (ship.y < 0) {
    ship.y = game.world.bounds.height;
  }
  else if (ship.y > game.world.bounds.height) {
    ship.y = 0;
  }
}

function collisionHandler(target, projectile) {
  if(target.health) {
    target.health -= 1;
    if(target === ship) {
      healthBar.setPercent(100 * (target.health / target.totalHealth))
    }
  } else {
    target.kill();
    var explode = game.add.sprite(target.body.x, target.body.y, "explosions");
    explode.animations.add("boom");
    explode.play("boom");
  }
  projectile.kill();
}

function victoryTest() {
  if(ship.health === 0) {
    console.log("You lose...");
    return;
  } else {
    for (var i = 0; i < enemies.children.length; i++) {
      if(enemies.children[i].alive){
        return;
      }
    }
  }
  console.log("You WIN!");
}

function pause() {
  game.paused = (game.paused ? false : true);
}

function render() {
}
