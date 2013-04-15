// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , Vec2 = require('./box2d').Common.Math.b2Vec2
  , Alien = require('./alien');

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

  return RandomLevel;
});
