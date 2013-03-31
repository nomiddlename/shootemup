function RandomLevel(width, height) {
  Base.call(this);
  this.width = width;
  this.height = height;
  this.tileWidth = 100;
  this.tileHeight = 100;
  this.columns = this.width / this.tileWidth; 
  this.rows = this.height / this.tileHeight;
  this.tiles = [];
  
  for (var y = 0; y < this.rows; y++) {
    var row = [];
    for (var x = 0; x < this.columns; x++) {
      var xColour = (x * this.tileWidth) % 256;
      var yColour = (y * this.tileHeight) % 256;
      row.push("rgb("+xColour+", "+yColour+", "+xColour+")");  
    }
    this.tiles.push(row);
  }

  this.setupAlienHordes();

  //register us for drawing at zIndex = 0 (right at the bottom)
  this.fireEvent("render.register", 0);
  //let the game know how big we are
  this.fireEvent("boundary", { left: 0, right: this.width, bottom: 0, top: this.height });
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

RandomLevel.prototype.setupAlienHordes = function() {
  var i
  , startY
  , numberOfAliens = 30;

  //spread the aliens out evenly over the level.
  for (i = 0; i < numberOfAliens; i++) {
    startX = Math.round((Math.random() * (this.width - 800)) + 100);
    startY = Math.round((Math.random() * (this.height - 600)) + 100);
    new Alien(startX, startY, 15, 100);
  }
};

function Alien(posX, posY, speed, health) {
  this.posX = posX;
  this.posY = posY;
  this.speed = speed;
  this.speedX = (Math.random() - 0.5) * 2 * speed;
  this.speedY = (Math.random() - 0.5) * 2 * speed;
  this.radius = 25;
  this.health = health;
  this.playerX = 0;
  this.playerY = 0;

  Base.call(this);
  //this.on("tick", this.tick);
  //this.on("player.move", this.updatePlayerPosition);
  this.fireEvent("render.register", 1);
  this.fireEvent("physics.register");
}
Alien.prototype = Object.create(Base.prototype);

Alien.prototype.draw = function(game) {
  if (this.physBody) {
    var screenX = game.physics.scaleToPixels(this.physBody.GetPosition().x)
    , screenY = game.physics.scaleToPixels(this.physBody.GetPosition().y);
  
    if (game.isOnScreen(screenX, screenY, this.radius)) {
      game.context.fillStyle = "rgb(200, 50, 100)";
      game.context.beginPath();
      game.context.arc(game.translateX(screenX), game.translateY(screenY), this.radius, 0, Math.PI*2, true);
      game.context.closePath();
      game.context.fill();
    }
  }
};

Alien.prototype.tick = function(event) {
  //need to work out a normalised vector between our position and the
  //player's position, then multiply it by our speed
  var dx = (this.playerX - this.posX)
  , dy = (this.playerY - this.posY)
  , magnitude = Math.sqrt(dx*dx + dy*dy);

  this.speedX = dx * this.speed / magnitude;
  this.speedY = dy * this.speed / magnitude;

};

Alien.prototype.updatePlayerPosition = function(event) {
  this.playerX = event.source.posX;
  this.playerY = event.source.posY;
};

//support for loading as node.js module, for testing
if (typeof(module) !== 'undefined') {
  exports.RandomLevel = RandomLevel;
}
