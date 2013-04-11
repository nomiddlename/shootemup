if (typeof(module) !== 'undefined') {
  var Base = require('./base').Base;
  //dodgy loading of Box2d into global context because it's not a module
  eval(require('fs').readFileSync('./Box2dWeb-2.1.a.3.js').toString('utf8'));
  var Vec2 = Box2D.Common.Math.b2Vec2;
}

function RandomLevel(width, height) {
  Base.call(this);
  this.width = width;
  this.height = height;
  this.tileWidth = 100;
  this.tileHeight = 100;
  this.columns = this.width / this.tileWidth; 
  this.rows = this.height / this.tileHeight;
  this.maxAliens = 100;
  this.aliens = [];
  this.tiles = [];
  
  for (var y = 0; y < this.rows; y++) {
    var row = [];
    for (var x = 0; x < this.columns; x++) {
      var colour = (x * this.tileWidth) % 128 + (y * this.tileHeight) % 128;
      row.push("rgb("+colour+", "+colour+", "+colour+")");  
    }
    this.tiles.push(row);
  }

  //let the game know how big we are
  this.fireEvent("boundary", { left: 0, right: this.width, bottom: 0, top: this.height });
  //register us for drawing at zIndex = 0 (right at the bottom)
  this.fireEvent("render.register", 0);

  this.on("game.start", this.setupAlienHordes);
  this.on("enemy.death", this.spawnMoreAliens);
}
RandomLevel.prototype = Object.create(Base.prototype);

RandomLevel.prototype.draw = function(game) {
  var level = this
  , startRow = Math.max(0, Math.floor((game.windowY / this.tileHeight)))
  , endRow = Math.ceil(Math.min(
    startRow + (game.height / this.tileHeight) + 1, 
    level.tiles.length -1))
  , startCol = Math.max(0, Math.floor((game.windowX / this.tileWidth)))
  , endCol = Math.ceil(Math.min(
    startCol + (game.width / this.tileWidth) + 1, 
    level.tiles[startRow].length -1))
  , offsetX = game.windowX % this.tileWidth
  , offsetY = game.windowY % this.tileHeight;

  for (var row = startRow; row <= endRow; row++) {
    var posY = game.translateY((row * level.tileHeight));
    for (var col = startCol; col <= endCol; col++) {
      var posX = game.translateX(col * level.tileWidth);
      game.context.fillStyle = level.tiles[row][col];
      game.context.fillRect(posX, posY, level.tileWidth, level.tileHeight);
    };
  }

};

RandomLevel.prototype.getRidOfExistingAliens = function() {
  this.aliens.forEach(function(alien) {
    alien.destroy();
  });
  this.aliens = [];
};

RandomLevel.prototype.setupAlienHordes = function() {
  var i
  , numberOfAliens = 30;

  this.getRidOfExistingAliens();

  //spread the aliens out evenly over the level.
  for (i = 0; i < numberOfAliens; i++) {
    this.spawnAlien();
  }
};

RandomLevel.prototype.spawnMoreAliens = function(event) {
  var deadAlien = event.source;
  //remove the dead alien from the list
  this.aliens = this.aliens.filter(function(alien) { return alien !== deadAlien; });
  //for each alien that dies, spawn two more.
  this.spawnAlien();
  this.spawnAlien();
};

RandomLevel.prototype.spawnAlien = function() {
  var startX, startY;

  if (this.aliens.length < this.maxAliens) {
    startX = Math.round((Math.random() * (this.width - 800)) + 100);
    startY = Math.round((Math.random() * (this.height - 600)) + 100);
    this.aliens.push(new Alien(startX / 30, startY / 30, 8, 50, 50));
  }
};

function Alien(posX, posY, speed, health, damage) {
  this.position = new Vec2(posX, posY);
  this.speed = speed;
  this.radius = 1.2;
  this.health = health;
  this.damage = damage;
  this.frame = Math.floor(Math.random() * 8);

  Base.call(this);
  this.fireEvent("physics.register");
  this.fireEvent("render.register", 1);
  this.on("tick", this.tick);
  this.on("player.move", this.updatePlayerPosition);
}
Alien.prototype = Object.create(Base.prototype);

Alien.prototype.draw = function(game) {
  var screenX = game.physics.scaleToPixels(this.physBody.GetPosition().x)
  , screenY = game.physics.scaleToPixels(this.physBody.GetPosition().y)
  , image = game.assets['alien']
  , radius = game.physics.scaleToPixels(this.radius)
  , angle = this.physBody.GetAngle();
  
  if (game.isOnScreen(screenX, screenY, radius)) {
    angle = Math.PI - angle;
    if (angle < 0) {
      angle += Math.PI*2;
    }
    game.context.save();
    game.context.translate(game.translateX(screenX), game.translateY(screenY));
    game.context.rotate(angle);
    game.context.drawImage(image, Math.floor(this.frame) * 64, 0, 64, 64, -radius, -radius, 2*radius, 2*radius);
    game.context.restore();
  }
};

Alien.prototype.tick = function(event) {
  if (this.health <= 0) {
    this.die();
  } else {
    this.frame += .1;
    if (this.frame > 7) {
      this.frame = 0;
    }
    //need to work out a normalised vector between our position and the
    //player's position, then multiply it by our speed
    if (this.playerBody) {
      var currentAngle = this.physBody.GetAngle()
      , angle
      , newAngle
      , direction = this.playerBody.GetPosition().Copy();

      direction.Subtract(this.physBody.GetPosition());
      direction.Normalize();
      direction.Multiply(this.speed);

      angle = Math.atan2(direction.x, direction.y);
      if (angle >= 0) {
        this.physBody.SetAngle(angle);
      } else {
        this.physBody.SetAngle(Math.PI*2 + angle);
      }
      this.physBody.ApplyForce(direction, this.physBody.GetPosition());
      
    }
  }
};

Alien.prototype.updatePlayerPosition = function(event) {
  this.playerBody = event.source.physBody;
};

Alien.prototype.hit = function(other, impulse) {
  if (other.reduceHealth) {
    other.reduceHealth(this.damage);
  }
};

Alien.prototype.die = function() {
  new Explosion(this.physBody.GetPosition());
  this.fireEvent("enemy.death");
  this.fireEvent("sounds", { name: "boom", position: this.physBody.GetPosition() });
  this.destroy();
};

Alien.prototype.destroy = function() {
  this.fireEvent("render.deregister", 1);
  this.fireEvent("physics.deregister");
  this.stopListening("tick");
  this.stopListening("player.move");
};

//support for loading as node.js module, for testing
if (typeof(module) !== 'undefined') {
  exports.RandomLevel = RandomLevel;
  exports.Alien = Alien;
}
