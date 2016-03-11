var spaceGame = {};
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game');

spaceGame.stateBoot = function() {

};

spaceGame.stateBoot.prototype = {
  preload: function() {
    this.load.image('progressBar', 'sprites/progressbar.png');
    this.load.image('startButton', 'sprites/startbutton.png');
    this.load.image('downArrow', 'sprites/downarrow.png')
  },

  create: function() {
    this.game.stage.backgroundColor = '#aaa';

    this.state.start('StatePreload');
  }
};

spaceGame.statePreload = function() {
};

spaceGame.statePreload.prototype = {
  preload: function() {
    this.progressBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'progressBar');
    this.progressBar.anchor.setTo(0.5);
    this.load.setPreloadSprite(this.progressBar);
    this.downArrow = this.add.sprite(0, this.game.world.height, 'downArrow');
    this.downArrow.anchor.setTo(0, 1);

    this.load.image('star', 'http://www.first-last-always.com/application/themes/default/images/dot-white.png');
    this.load.image('planet', 'sprites/planet.png');
    this.load.image('bullet', 'sprites/bullet.png');
    this.load.image('ship', 'sprites/spshipspr1.png');
    this.load.image('enemy', 'sprites/smallfreighterspr.png');
    this.load.image('laser', 'sprites/laser.png');
    this.load.image('superLaser', 'sprites/superlaser.png');
    this.load.image('ore', 'sprites/ore.png');
    this.load.spritesheet('asteroids', 'sprites/asteroids.png', 128, 128, 16);
    this.load.spritesheet('explosions', 'sprites/explosion.png', 96, 96, 20);
    this.load.audio('laserSound', 'http://0.0.0.0:8000/lasersfx.wav');
    this.load.audio('superLaserSound', 'http://0.0.0.0:8000/superlasersfx.mp3');
    this.load.audio('bulletSound', 'http://0.0.0.0:8000/bulletshotsfx.mp3');
    this.load.audio('explosionSound', 'http://0.0.0.0:8000/explosionsfx.mp3');
    this.load.audio('engineSound', 'http://0.0.0.0:8000/enginesfx.m4a');
    this.load.image('buyButton', 'sprites/buybutton.png');
    this.load.image('sellButton', 'sprites/sellbutton.png');
    this.load.image('superLaserButton', 'sprites/superlaserbutton.png');
    this.load.image('betterArmorButton', 'sprites/betterarmorbutton.png');
    this.load.image('betterMainButton', 'sprites/bettermainenginebutton.png');
  },

  create: function() {
    this.progressBar.kill();
    this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    this.startButton = this.add.button(this.game.world.centerX, this.game.world.centerY, 'startButton', this.startGame, this);
    this.startButton.anchor.setTo(0.5);
    this.enterKey.onDown.add(this.startGame, this);

    this.text = game.add.text(game.world.centerX, 250, 'Enter Name Before You Start');
    this.text.anchor.set(0.5);
    this.text.align = 'center';

    this.text.font = 'Arial Black';
    this.text.fontSize = 50;
    this.text.fontWeight = 'bold';
    this.text.fill = '#000';

    this.text.setShadow(0, 0, 'rgba(0, 0, 0, 0.5)', 0);
  },

  startGame: function() {
    this.state.start('StateA');
  }
};

spaceGame.stateA = function() {
  this.level = 1;
  this.score = 0;
  this.shipWeapon = spaceGame.stateA.prototype.fireBullet;
  this.health = 10;
  this.oreCollected = 0;
  this.maxVelocity = 300;
  this.la = 300;
  this.pushCount = true;
  this.messageText = "Go, Fight, Win!";
  this.dTime = Infinity;
};

spaceGame.stateA.prototype = {
  create: function() {
    game.renderer.clearBeforeRender = true;
    game.renderer.roundPixels = true;

    game.world.setBounds(0, 0, 2000, 2000);
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.stage.backgroundColor = '#000';

    this.createStars(1000, 1);

    this.createPlanet();

    this.createAsteroids(40, 2, 4, 5);

    this.createBullets();

    this.createLasers();

    this.createSuperLasers();

    this.createShip(this.planet.x + this.planet.width / 2, this.planet.y + this.planet.height / 2, 1, this.health);

    this.createEnemies(this.level + Math.floor(this.level * Math.random()), 100, 1, 5);

    this.createConsole();

    this.createMessage(this.messageText);

    this.cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
    this.pKey = game.input.keyboard.addKey(Phaser.Keyboard.P);
    this.lKey = game.input.keyboard.addKey(Phaser.Keyboard.L);
  },

  update: function() {
    this.name = $('input').val();
    this.flyShip();

    game.physics.arcade.overlap(this.enemies, superLasers, this.collisionHandler, null, this);

    game.physics.arcade.overlap(this.asteroids, superLasers, this.collisionHandler, null, this);

    game.physics.arcade.overlap(this.asteroids, bullets, this.collisionHandler, null, this);

    game.physics.arcade.overlap(this.asteroids, lasers, this.collisionHandler, null, this);

    game.physics.arcade.overlap(ship, lasers, this.collisionHandler, null, this);

    game.physics.arcade.overlap(this.enemies, bullets, this.collisionHandler, null, this);

    game.physics.arcade.overlap(ship, ores, this.pickupOre, null, this);

    bullets.forEachExists(this.screenWrap, this);
    lasers.forEachExists(this.screenWrap, this);
    this.enemies.forEachExists(this.screenWrap, this);

    for (var i = 0; i < this.enemies.children.length; i++) {
      if (this.enemies.children[i].alive) {
        this.flyEnemies(this.enemies.children[i]);
      }
    }
    this.lKey.onDown.add(this.land, this);
    this.pKey.onDown.add(this.pause, this);
    this.updateConsole();
    this.updateMessage();
    this.victoryTest();
    // console.log(Math.sqrt(ship.body.velocity.x * ship.body.velocity.x + ship.body.velocity.y * ship.body.velocity.y));
  },

  render: function() {
  },

  createPlanet: function() {
    this.planet = game.add.sprite(game.world.bounds.width / 2, game.world.bounds.height / 2, 'planet');
    this.planet.scale.setTo(0.2, 0.2);
  },

  createBullets: function() {
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(40, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bulletSFX = this.add.audio('bulletSound');
  },

  createLasers: function() {
    lasers = game.add.group();
    lasers.enableBody = true;
    lasers.physicsBodyType = Phaser.Physics.ARCADE;
    lasers.createMultiple(40, 'laser');
    lasers.setAll('anchor.x', 0.5);
    lasers.setAll('anchor.y', 0.5);
    laserSFX = this.add.audio('laserSound');
  },

  createSuperLasers: function() {
    superLasers = game.add.group();
    superLasers.enableBody = true;
    superLasers.physicsBodyType = Phaser.Physics.ARCADE;
    superLasers.createMultiple(40, 'superLaser');
    superLasers.setAll('anchor.x', 0.5);
    superLasers.setAll('anchor.y', 0.5);
    superLaserSFX = this.add.audio('superLaserSound');
  },

  createOres: function(n) {
    ores = game.add.group();
    ores.enableBody = true;
    ores.physicsBodyType = Phaser.Physics.ARCADE;
    ores.createMultiple(n, 'ore');
    ores.setAll('anchor.x', 0.5);
    ores.setAll('anchor.y', 0.5);
  },

  createAsteroids: function(n, lv, av, health) {
    this.asteroids = game.add.group();
    this.asteroids.enableBody = true;
    this.asteroids.physicsBodyType = Phaser.Physics.ARCADE;

    for (var i = 0; i < n; i++) {
      asteroid = game.add.sprite(game.world.randomX, game.world.randomY, 'asteroids', i, this.asteroids);
      asteroid.body.velocity.x = Math.random() * lv;
      asteroid.body.velocity.y = Math.random() * lv;
      asteroid.body.angularVelocity = Math.random() * av;
      asteroid.anchor.set(0.5, 0.5);
      asteroid.health = health;
    }
    this.createOres(n);
  },

  createStars: function(n, s) {
    for (var i = 0; i < n; i++) {
      var star = game.add.sprite(game.world.randomX, game.world.randomY, 'star');

      star.scale.setTo(0.02 * s, 0.02 * s);
    }
  },

  createEnemies: function(n, v, size, health) {
    this.enemies = game.add.group();

    for (var i = 0; i < n; i++) {
      var enemy = game.add.sprite(game.world.randomX, game.world.randomY, 'enemy', 1, this.enemies);

      enemy.anchor.set(0.5);
      enemy.scale.setTo(size, size);
      game.physics.enable(enemy, Phaser.Physics.ARCADE);
      enemy.body.maxVelocity.set(v);
      enemy.health = health;
      enemy.rof = 0;
      enemy.weapon = this.fireLaser;
    }
  },

  createConsole: function() {
    var barConfig = { width: 100, height: 10, x: 60, y: 15 };

    this.healthBar = new HealthBar(this.game, barConfig);
    this.healthBar.setFixedToCamera(true);

    this.consoleText = this.game.add.text(10, 30, 'Score: ' + this.score + '\nOre: ' + this.oreCollected, { font: '40px', fill: '#fff' });
    this.consoleText.fixedToCamera = true;
  },

  createShip: function(x, y, size, health) {
    ship = game.add.sprite(x, y, 'ship');
    ship.velocity = this.maxVelocity;
    ship.range = 1000;
    ship.aa = 200;
    ship.la = this.la;
    ship.rof = 0;
    ship.weapon = this.shipWeapon;
    ship.anchor.set(0.5, 0.5);
    ship.scale.setTo(size, size);
    game.camera.follow(ship);
    game.physics.enable(ship, Phaser.Physics.ARCADE);
    ship.body.maxVelocity.set(ship.velocity);
    ship.health = health;
    ship.totalHealth = health;
    explosionSFX = this.add.audio('explosionSound');
    engineSFX = this.add.audio('engineSound');
  },

  spawnOre: function(asteroid) {
    ore = ores.getFirstExists(false);

    ore.scale.setTo(0.25, 0.25);
    ore.reset(asteroid.body.x + asteroid.body.width / 2, asteroid.body.y + asteroid.body.height / 2);
    ore.rotation = asteroid.rotation;
    game.physics.arcade.velocityFromRotation(asteroid.rotation, asteroid.body.velocity, ore.body.velocity);
  },

  fireBullet: function() {
    if (game.time.now > this.rof) {
      bullet = bullets.getFirstExists(false);


      if (bullet) {
        bullet.power = 1;
        bullet.reset(ship.body.x + Math.cos(ship.rotation) * 50 + 25, ship.body.y + Math.sin(ship.rotation) * 50 + 25);
        bullet.lifespan = 1000;
        bullet.rotation = ship.rotation;
        game.physics.arcade.velocityFromRotation(ship.rotation, 600, bullet.body.velocity);
        this.rof = game.time.now + 50;
        bulletSFX.play();
      }
    }
  },

  fireSuperLaser: function(ship) {
    if (game.time.now > this.rof) {
      superLaser = superLasers.getFirstExists(false);

      if (superLaser) {
        superLaser.power = 3;
        superLaser.reset(ship.body.x + Math.cos(ship.rotation) * 50 + 25, ship.body.y + Math.sin(ship.rotation) * 50 + 25);
        superLaser.lifespan = 2000;
        superLaser.rotation = ship.rotation;
        game.physics.arcade.velocityFromRotation(ship.rotation, 400, superLaser.body.velocity);
        this.rof = game.time.now + 200;
        superLaserSFX.play();
      }
    }
  },

  fireLaser: function(enemy) {
    if (game.time.now > this.rof) {
      laser = lasers.getFirstExists(false);

      if (laser) {
        laser.power = 1;
        laser.reset(enemy.body.x + Math.cos(enemy.rotation) * 50 + 25, enemy.body.y + Math.sin(enemy.rotation) * 50 + 25);
        laser.lifespan = 1600;
        laser.rotation = enemy.rotation;
        game.physics.arcade.velocityFromRotation(enemy.rotation, 400, laser.body.velocity);
        this.rof = game.time.now + 100;
        laserSFX.play();
      }
    }
  },

  flyShip: function() {
    this.screenWrap(ship);
    if (this.cursors.up.isDown) {
      game.physics.arcade.accelerationFromRotation(ship.rotation, ship.la, ship.body.acceleration);
      engineSFX.play();
    } else {
      ship.body.acceleration.set(0);
    }
    if (this.cursors.left.isDown) {
      ship.body.angularVelocity = -ship.aa;
    } else if (this.cursors.right.isDown) {
      ship.body.angularVelocity = ship.aa;
    } else {
      ship.body.angularVelocity = 0;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      ship.weapon(ship);
    }
  },

  flyEnemies: function(enemy) {
    var direction = new Phaser.Point(ship.x, ship.y);
    var vector;

    direction.subtract(enemy.x, enemy.y);
    direction.normalize();
    vector = Math.atan2(direction.y, direction.x) - enemy.rotation;
    if (vector > 0.1) {
      enemy.body.angularVelocity = 200;
    } else if (vector < -0.1) {
      enemy.body.angularVelocity = -200;
    } else {
      enemy.body.angularVelocity = 0;
      enemy.weapon(enemy);
    }
    game.physics.arcade.accelerationFromRotation(enemy.rotation, 400, enemy.body.acceleration);
  },

  screenWrap: function(ship) {
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
  },

  collisionHandler: function(target, projectile) {
    if(target.health > 0) {
      target.health -= projectile.power;
      if(target === ship) {
        this.healthBar.setPercent(100 * (target.health / target.totalHealth))
      }
    } else {
      if(target.key === 'asteroids') {
        this.spawnOre(target);
      }
      target.kill();
      var explode = game.add.sprite(target.body.x, target.body.y, 'explosions');
      explode.animations.add('boom');
      explode.play('boom');
      explosionSFX.play();
    }
    projectile.kill();
  },

  pickupOre: function(ship, ore) {
    ore.kill();
    this.oreCollected += 1;
  },

  victoryTest: function() {
    if (ship.health <= 0) {
      this.messageText = "You lose...";
      if (this.pushCount) {
        this.dTime = this.game.time.now;
        console.log(this.dTime);
        scoreData.push({ name: this.name, score: this.score });
        this.pushCount = !this.pushCount;
      }
      console.log(this.dTime);
      if (this.game.time.now > this.dTime + 2000) {
        this.level = 1;
        this.score = 0;
        this.shipWeapon = spaceGame.stateA.prototype.fireBullet;
        this.health = 10;
        this.oreCollected = 0;
        this.maxVelocity = 300;
        this.la = 300;
        this.pushCount = true;
        this.messageText = "Go, Fight, Win!";
        this.dTime = Infinity;

        game.state.start('StateA');
      }
      return;
    } else {
      for (var i = 0; i < this.enemies.children.length; i++) {
        if(this.enemies.children[i].alive) {
          return;
        }
      }
    }
  },

  pause: function() {
    game.paused = game.paused ? false : true;
  },

  land: function() {
    var velMag = Math.sqrt(ship.body.velocity.x * ship.body.velocity.x + ship.body.velocity.y * ship.body.velocity.y);

    if (ship.x > this.planet.x && ship.x < this.planet.x + this.planet.width &&
    ship.y > this.planet.y && ship.y < this.planet.y + this.planet.height) {
      if (velMag < 20) {
        level += 1;
        this.state.start('StateB');
      } else {
        this.messageText = "Slow down to land."
      }
    }
  },

  createMessage: function() {
    this.firstMessageText = this.game.add.text(10, this.game.height - 20, this.messageText, { font: '40px', fill: '#fff' });
    this.firstMessageText.fixedToCamera = true;
  },

  updateConsole: function() {
    this.consoleText.setText('Score: ' + this.score + '\nOre: ' + this.oreCollected);
  },

  updateMessage: function() {
    this.firstMessageText.setText(this.messageText);
  }
};

spaceGame.stateB = function(game) {
  this.otherState = game.state.states.StateA;
  this.messageText = 'Welcom to Earth.'
};

spaceGame.stateB.prototype = {
  create: function() {
    this.game.stage.backgroundColor = '#888';
    this.showScore();

    this.buyButton = this.game.add.button(game.width / 7, game.height / 4, 'buyButton', this.buy, this);

    this.sellButton = this.game.add.button(game.width / 1.5, game.height / 4, 'sellButton', this.sell, this);

    this.createMessage();

    this.lKey = game.input.keyboard.addKey(Phaser.Keyboard.L);
  },
  update: function() {
    this.lKey.onDown.add(this.launch, this);
    this.updateScore();
    this.updateMessage();
  },

  render: function() {
  },

  createMessage: function() {
    this.firstMessageText = this.game.add.text(10, this.game.height - 20, this.messageText, { font: '40px', fill: '#fff' });
  },

  buy: function() {
    console.log('BUY');
    this.superLaserButton = this.game.add.button(game.width / 4, game.height / 4 + this.buyButton.height, 'superLaserButton', this.buySuperLaser, this);
    this.betterArmorButton = this.game.add.button(game.width / 4, game.height / 4 + this.buyButton.height + this.superLaserButton.height, 'betterArmorButton', this.buyBetterArmor, this);
    this.betterMainButton = this.game.add.button(game.width / 4, game.height / 4 + this.buyButton.height + this.superLaserButton.height + this.betterArmorButton.height, 'betterMainButton', this.buyBetterMain, this);
  },

  sell: function() {
    this.otherState.score += this.otherState.oreCollected * 25;
    this.messageText = 'Sold ' + this.otherState.oreCollected + ' ore for ' + this.otherState.oreCollected * 25 + ' points.';
    this.otherState.oreCollected = 0;
  },

  buySuperLaser: function() {
    if (this.otherState.score > 499) {
      this.messageText = "Bought Super Laser."
      this.otherState.shipWeapon = spaceGame.stateA.prototype.fireSuperLaser;
      this.otherState.score -= 500;
    }
  },

  buyBetterArmor: function() {
    if (this.otherState.score > 999) {
      this.messageText = 'Bought New Armor.';
      this.otherState.health = 20;
      this.otherState.score -= 1000;
    }
  },

  buyBetterMain: function() {
    if (this.otherState.score > 999) {
      this.messageText = 'Bought New Engine.'
      this.otherState.la = 500;
      this.otherState.maxVelocity = 500;
      this.otherState.score -= 1000;
    }
  },

  showScore: function() {
    this.text = this.game.add.text(10, 30, 'Score: ' + this.otherState.score,
    { fontSize: '100px', fill: '#fff' });
  },

  launch: function() {
    this.state.start('StateA');
  },

  updateMessage: function() {
    this.firstMessageText.setText(this.messageText);
  },

  updateScore: function() {
    this.text.setText('Score: ' + this.otherState.score);
  }
};

game.state.add('StateA', spaceGame.stateA);
game.state.add('StateB', spaceGame.stateB);
game.state.add('StatePreload', spaceGame.statePreload);
game.state.add('StateBoot', spaceGame.stateBoot);

game.state.start('StateBoot');
