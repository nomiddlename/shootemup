// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , Alien = require('./alien');

  function TiledLevel(config) {
    Base.call(this);

    this.config = config;
    this.maxAliens = 100;
    this.aliens = [];

    this.width = this.config.width * this.config.tilewidth;
    this.height = this.config.height * this.config.tileheight;
    this.config.tilesets[0].numXTiles = Math.floor(
      this.config.tilesets[0].imagewidth / this.config.tilewidth
    );

    //let the game know how big we are
    this.fireEvent("boundary", { left: 0, right: this.width, bottom: 0, top: this.height });
    //register us for drawing at zIndex = 0 (right at the bottom)
    this.fireEvent("render.register", 0);
    
    this.on("game.start", this.setupAlienHordes);
    this.on("enemy.death", this.spawnMoreAliens);

  }
  TiledLevel.prototype = Object.create(Base.prototype);

  TiledLevel.prototype.draw = function(game) {
    var self = this
    , tiles = game.assets[this.config.tilesets[0].image]
    , tileData = this.config.layers[0].data;

    //This is a bit inefficient
    //We could calculate the starting row and column
    //and avoid checking to see if each tile was on screen
    //but the maths gets messy and this is easier to read

    tileData.forEach(function(tileIdx, tileNumber) {
      var tileInfo = self.getTileInfo(tileIdx)
      , tilePosition = self.getTilePosition(tileNumber);

      if (game.isOnScreen(
        tilePosition.x
        , tilePosition.y
        , self.config.tilewidth 
        , self.config.tileheight
      )) {
        game.context.drawImage(
          tiles
          , tileInfo.x
          , tileInfo.y
          , self.config.tilewidth
          , self.config.tileheight
          , game.translateX(tilePosition.x)
          , game.translateY(tilePosition.y)
          , self.config.tilewidth
          , self.config.tileheight
        );
      }
    });
  };
     
  //given the tile's index, works out the source image positions
  TiledLevel.prototype.getTileInfo = function(tileIndex) {
    return {
      x: Math.floor((tileIndex - 1) % this.config.tilesets[0].numXTiles) * this.config.tilewidth,
      y: Math.floor((tileIndex - 1) / this.config.tilesets[0].numXTiles) * this.config.tileheight
    };
  };

  //given the tile's position in the data list, work out the screen position
  TiledLevel.prototype.getTilePosition = function(tileNumber) {
    return {
      x: Math.floor(tileNumber % this.config.width) * this.config.tilewidth,
      y: Math.floor(tileNumber / this.config.width) * this.config.tileheight
    };
  };


  TiledLevel.prototype.getRidOfExistingAliens = function() {
    this.aliens.forEach(function(alien) {
      alien.destroy();
    });
    this.aliens = [];
  };
  
  TiledLevel.prototype.setupAlienHordes = function() {
    var i
    , numberOfAliens = 30;
    
    this.getRidOfExistingAliens();
    
    //spread the aliens out evenly over the level.
    for (i = 0; i < numberOfAliens; i++) {
      this.spawnAlien();
    }
  };

  TiledLevel.prototype.spawnMoreAliens = function(event) {
    var deadAlien = event.source;
    //remove the dead alien from the list
    this.aliens = this.aliens.filter(function(alien) { return alien !== deadAlien; });
    //for each alien that dies, spawn two more.
    this.spawnAlien();
    this.spawnAlien();
  };
  
  TiledLevel.prototype.spawnAlien = function() {
    var startX, startY;
    
    if (this.aliens.length < this.maxAliens) {
      startX = Math.round((Math.random() * (this.width - 800)) + 100);
      startY = Math.round((Math.random() * (this.height - 600)) + 100);
      this.aliens.push(new Alien(startX / 30, startY / 30, 8, 50, 50));
    }
  };

  return TiledLevel;
});
