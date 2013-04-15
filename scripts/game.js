// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , PhysicsEngine = require('./physics')
  , SoundEngine = require('./sounds')
  , Player = require('./player')
  , RandomLevel = require('./level')
  , Display = require('./display')
  ;

  function Game() {
    Base.call(this);
    this.windowX = 2100;
    this.windowY = 2200;
    this.width = 800;
    this.height = 600;
    this.zIndices = [];
    this.renderList = {};

    this.on("render.register", this.addToRenderList);
    this.on("render.deregister", this.removeFromRenderList);

    this.physics = new PhysicsEngine();
    this.sounds = new SoundEngine();

    this.loadAssets(this.assetsLoaded.bind(this));
                    
    this.on("game.start", this.createPlayer);
  }
  Game.prototype = Object.create(Base.prototype);

  Game.prototype.loadAssets = function(cb) {
    var self = this
    , numberLoaded = 0
    , assetsToLoad = [
      { name: 'boom', file: 'assets/boom3_0.png' },
	    { name: 'alien', file: 'assets/alien.png' },
	    { name: 'player', file: 'assets/ship.png' }
    ];
    this.assets = {};
    
    assetsToLoad.forEach(function(asset) {
      var image = new Image();
      image.onload = function() {
        self.assets[asset.name] = image;
        numberLoaded += 1;
        if (numberLoaded >= assetsToLoad.length) {
          cb();
        }
      };
      image.src = asset.file;
    });

  };

  Game.prototype.assetsLoaded = function() {
    this.level = new RandomLevel(5000, 5000);
    this.display = new Display(this.width, this.height);
  };

  Game.prototype.createPlayer = function(event) {
    this.windowX = 2100;
    this.windowY = 2200;
    this.player = new Player(
      {
        posX: this.physics.scaleToWorld(this.windowX + (this.width / 2)),    //in game coords
        posY: this.physics.scaleToWorld(this.windowY + (this.height / 2)),    //in game coords
        radius: 0.8,
        health: 200,
        damage: 200,
        keys: {
          left: 'a', // left arrow = 37,
          right: 'd', // right arrow = 39,
          up: 'w', // up arrow = 38,
          down: 's', // down arrow = 40,
          fire: ' ' // space = 32
        }
      }
    );
  };

  Game.prototype.setCanvas = function(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
  };
  
  Game.prototype.tick = function(tockMs) {
    this.fireEvent("tick", tockMs);
    this.moveWindow();
  };

  Game.prototype.addToRenderList = function(event) {
    if (this.zIndices.indexOf(event.data) === -1) {
      this.zIndices.push(event.data);
      this.zIndices = this.zIndices.sort();
      this.renderList[event.data] = [];
    }

    this.renderList[event.data].push(event.source);
  };

  Game.prototype.removeFromRenderList = function(event) {
    this.renderList[event.data] = this.renderList[event.data].filter(function(item) { return item !== event.source; });
  };

  Game.prototype.render = function() {
    var self = this;
    this.context.clearRect(0, 0, this.width, this.height);
    this.zIndices.forEach(function(zIndex) {
      self.renderList[zIndex].forEach(function(thing) {
        thing.draw.call(thing, self);
      });
    });

  };

  Game.prototype.translateX = function(gamePosX) {
    return gamePosX - this.windowX;
  };

  Game.prototype.translateY = function(gamePosY) {
    return gamePosY - this.windowY;
  };


  Game.prototype.moveWindow = function() {
    //we want to move the window when the player gets within 100px of
    //the edges of the screen
    //but let's start with centring the player on the screen
    if (this.player) {
      var posX = this.physics.scaleToPixels(this.player.physBody.GetPosition().x)
      , posY = this.physics.scaleToPixels(this.player.physBody.GetPosition().y);
      this.windowX = posX - (this.width / 2);
      this.windowY = posY - (this.height / 2);
    }
  };

  Game.prototype.isOnScreen = function(posX, posY, radius) {
    return (posX + radius > this.windowX) 
      && (posX - radius < this.windowX + this.width)
      && (posY + radius > this.windowY)
      && (posY - radius < this.windowY + this.height);
  };

  Game.prototype.toggleFullScreen = function() {
    if (document.webkitIsFullScreen) {
      document.webkitCancelFullScreen();
    } else {
      this.canvas.webkitRequestFullScreen(true);
    }
  };

  Game.prototype.resize = function() {
    var rect;
    console.log("in resize, with document.webkitIsFullScreen = ", document.webkitIsFullScreen);
    if (document.webkitIsFullScreen) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
    } else {
      this.canvas.width = 800;
      this.canvas.height = 600;
      this.width = 800;
      this.height = 600;
    }
  };

  Game.prototype.handleKeys = function(event) {
    var key = String.fromCharCode(event.keyCode).toLowerCase();
    if (key === 'f') {
      this.toggleFullScreen();
    } else {
      this.fireEvent(event.type, { key: key, code: event.keyCode });
    }
    //space bar makes the page scroll
    if (key === ' ') {
      event.preventDefault();
    }
  };

    return Game;
});
