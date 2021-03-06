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

    this.debug = false;

    this.config = config;
    this.maxAliens = 100;
    this.aliens = [];

    this.width = this.config.width * this.config.tilewidth;
    this.height = this.config.height * this.config.tileheight;
    this.config.tilesets.forEach(function(tileset) {
      tileset.numXTiles = Math.floor(
        tileset.imagewidth / tileset.tilewidth
      );
    });

    //let the game know how big we are
    this.fireEvent("boundary.pixels", { left: 0, right: this.width, bottom: 0, top: this.height });
    //register us for drawing at zIndex = 0 (right at the bottom)
    this.fireEvent("render.register", 0);
    
    this.on("game.start", this.setupAlienHordes);
    this.on("enemy.death", this.spawnMoreAliens);
    this.on("debug", this.toggleDebug);

  }
  TiledLevel.prototype = Object.create(Base.prototype);

  TiledLevel.prototype.toggleDebug = function(event) {
    this.debug = !this.debug;
  };

  TiledLevel.prototype.draw = function(context, camera, assets) {
    var self = this;

    this.config.layers.forEach(function(layer) {
      
      layer.data.forEach(function(tileIndex, tileNumber) {
        //tileIndex of zero means don't draw a tile here
        if (tileIndex > 0) {
          var tileInfo = self.getTileInfo(tileIndex)
          , tilePosition = self.getTilePosition(tileNumber);
          
          if (camera.isOnScreen(
            tilePosition.x, 
            tilePosition.y, 
            tileInfo.width, 
            tileInfo.height, 
            layer.properties.parallax
          )) {

            context.drawImage(
              assets[tileInfo.image]
              , tileInfo.x
              , tileInfo.y
              , tileInfo.width
              , tileInfo.height
              , camera.translateX(tilePosition.x, layer.properties.parallax)
              , camera.translateY(tilePosition.y, layer.properties.parallax)
              , tileInfo.width
              , tileInfo.height
            );

            if (self.debug) {
              context.beginPath();
              context.font = "16px Arial";
              context.fillStyle = "blue";
              context.textAlign = "center";
              context.fillText(
                tileNumber, 
                camera.translateX(tilePosition.x, layer.properties.parallax),
                camera.translateY(tilePosition.y, layer.properties.parallax)
              );
              context.closePath();
            }
          }
        }
      });
    });

  };

  //given a game X,Y work out the tile's number in the data list
  TiledLevel.prototype.getTileNumber = function(x, y) {
    var row = Math.floor(y / this.config.tileheight)
    , column = Math.floor(x / this.config.tilewidth);

    return (row * this.config.width) + column;
  };
     
  //given the tile's index, works out the source image info
  TiledLevel.prototype.getTileInfo = function(tileIndex) {
    var i, tileset;
    for (i = this.config.tilesets.length - 1; i >=0 ; i -= 1) {
      if (this.config.tilesets[i].firstgid <= tileIndex) {
        tileset = this.config.tilesets[i];
        break;
      }
    }

    return {
      image: tileset.image,
      width: tileset.tilewidth,
      height: tileset.tileheight,
      x: ((tileIndex - tileset.firstgid) % tileset.numXTiles) * tileset.tilewidth,
      y: Math.floor((tileIndex - tileset.firstgid) / tileset.numXTiles) * tileset.tileheight
    };
  };

  //given the tile's position in the data list, work out the screen position
  TiledLevel.prototype.getTilePosition = function(tileNumber) {
    return {
      x: (tileNumber % this.config.width) * this.config.tilewidth,
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
      this.aliens.push(new Alien(startX / 30, startY / 30, 5, 50, 50));
    }
  };

  return TiledLevel;
});
