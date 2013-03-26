function RandomLevel(size) {
  Base.call(this);
  this.size = size;
  this.tileWidth = 100;
  this.tileHeight = 100;
  this.columns = 800 / this.tileWidth; //dodgy hard-coding
  this.rows = this.size / this.tileHeight;
  this.tiles = [];
  
  for (var y = 0; y < this.rows; y++) {
    var row = [];
    for (var x = 0; x < this.columns; x++) {
      row.push((y * this.tileHeight) % 256);  
    }
    this.tiles.push(row);
  }

  this.setupAlienHordes();

  //register us for drawing at zIndex = 0 (right at the bottom)
  this.fireEvent("render.register", 0);
}
RandomLevel.prototype = Object.create(Base.prototype);

RandomLevel.prototype.draw = function(game) {
  var level = this
  , startRow = Math.floor((game.windowBottom / this.tileHeight))
  , endRow = Math.ceil(Math.min(
    startRow + (game.height / this.tileHeight) + 1, 
    level.tiles.length -1))
  , offsetY = game.windowBottom % this.tileHeight;

  for (var row = startRow; row <= endRow; row++) {
    var posY = game.translateY((row * level.tileHeight));
    level.tiles[row].forEach(function(column, index) {
      var posX = game.translateX(index * level.tileWidth);
      game.context.fillStyle = "rgb(0," + column + ",0)";
      game.context.fillRect(posX, posY, level.tileWidth, level.tileHeight);
    });
  }

};

RandomLevel.prototype.setupAlienHordes = function() {
  var i
  , startY
  , numberOfWaves = 10;

  this.waves = [];

  //spread the waves out evenly over the level.
  for (i = 0; i < numberOfWaves; i++) {
    startY = (((this.size - 800) / numberOfWaves)) * i + 800;
    this.waves[i] = new BoringWave(startY, i + 1); 
  }

};


function BoringWave(posY, numberOfAliens) {
  this.posY = posY;
  this.aliens = this.createAliens(numberOfAliens);

  Base.call(this);
};
BoringWave.prototype = Object.create(Base.prototype);  

BoringWave.prototype.createAliens = function(numberOfAliens) {
  var i
  , aliens = [];

  for (i=0; i < numberOfAliens; i++) {
    aliens.push(new Alien(Math.ceil(Math.random() * (800 - 50)), this.posY, -100));
  }

  return aliens;
};

function Alien(posX, posY, speed) {
  this.posX = posX;
  this.posY = posY;
  this.speed = speed;

  Base.call(this);
  this.on("tick", this.tick);
  this.fireEvent("render.register", 1);
}
Alien.prototype = Object.create(Base.prototype);

Alien.prototype.draw = function(game) {
  if (game.windowBottom + game.height >= this.posY) {
    var screenX = game.translateX(this.posX)
    , screenY = game.translateY(this.posY);
   
    game.context.fillStyle = "rgb(200, 50, 100)";
    game.context.fillRect(screenX, screenY, 50, 50);
  }
};

Alien.prototype.tick = function(event) {
  var tockMs = event.data;
  this.posY += this.speed * (tockMs/1000);
  if (this.posY <= 0) {
    //off the bottom of the screen? just give up.
    this.stopListening();
  }
};

//support for loading as node.js module, for testing
if (typeof(module) !== 'undefined') {
  exports.RandomLevel = RandomLevel;
}
