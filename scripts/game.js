// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , AssetLoader = require('./asset-loader')
  , PhysicsEngine = require('./physics')
  , SoundEngine = require('./sounds')
  , Camera = require('./camera')
  , Player = require('./player')
  , TiledLevel = require('./tiled-level')
  , Display = require('./display')
  , firstLevel = require('json!../assets/stars.json')
  , fullscreen = require('./fullscreen')
  ;

  function Game() {
    Base.call(this);

    this.zIndices = [];
    this.renderList = {};

    this.on("render.register", this.addToRenderList);
    this.on("render.deregister", this.removeFromRenderList);
    this.on("assets.loaded", this.assetsLoaded);
    this.on("game.start", this.createPlayer);

    this.assetLoader = new AssetLoader([
      { name: 'boom', file: 'assets/boom3_0.png' },
	    { name: 'alien', file: 'assets/alien.png' },
	    { name: 'player', file: 'assets/ship.png' },
      { name: 'stars.png', file: 'assets/stars.png' },
      { name: 'stars-transparent.png', file: 'assets/stars-transparent.png' },
      { name: 'shields', file: 'assets/shields.png' }
    ]);
    this.physics = new PhysicsEngine();
    this.sounds = new SoundEngine();                    
  }
  Game.prototype = Object.create(Base.prototype);

  Game.prototype.assetsLoaded = function(event) {
    this.assets = event.data;
    this.level = new TiledLevel(firstLevel);
    this.display = new Display();
  };

  Game.prototype.createPlayer = function(event) {
    this.player = new Player(
      {
        posX: this.camera.scaleToWorld(this.level.width / 2),    //in game coords
        posY: this.camera.scaleToWorld(this.level.height / 2),    //in game coords
        radius: 0.8,
        health: 250,
        damage: 200,
        keys: {
          left: 37,
          right: 39,
          up: 38,
          down: 40,
          fire: 32
        }
      }
    );
  };

  Game.prototype.setCanvas = function(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.camera = new Camera(canvas.width, canvas.height);
  };
  
  Game.prototype.tick = function(tockMs) {
    this.fireEvent("tick", tockMs);
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
    this.context.clearRect(0, 0, this.camera.width, this.camera.height);
    this.zIndices.forEach(function(zIndex) {
      self.renderList[zIndex].forEach(function(thing) {
        thing.draw.call(thing, self.context, self.camera, self.assets);
      });
    });

  };

  Game.prototype.resize = function() {
    var rect;
    if (fullscreen.isFullScreen()) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.camera.resize(window.innerWidth, window.innerHeight);
    } else {
      this.canvas.width = 800;
      this.canvas.height = 600;
      this.camera.resize(800, 600);
    }
  };

  Game.prototype.handleKeys = function(event) {
    var key = String.fromCharCode(event.keyCode).toLowerCase();
    if (fullscreen.supported && key === 'f') {
      fullscreen.toggle(this.canvas);
    } else {
      this.fireEvent(event.type, { key: key, code: event.keyCode });
    }
    //space bar makes the page scroll
    if (key === ' ') {
      event.preventDefault();
    }

    //toggle debug mode
    if (key === 'd' && event.type === 'keyup') {
      this.fireEvent("debug");
    }
  };

  return Game;
});
