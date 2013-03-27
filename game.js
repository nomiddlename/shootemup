(function(window, document) {
  
  window.onload = function() {
    var game = new Game()
    , lastTime = Date.now()
    , canvas = document.getElementById('theCanvas');

    game.setCanvas(canvas);

    document.addEventListener("keydown", game.handleKeys.bind(game));
    document.addEventListener("keyup", game.handleKeys.bind(game));
    
    (function mainLoop() {
      var now = Date.now(), delta = now - lastTime;
      lastTime = now;
      window.requestAnimationFrame(mainLoop);
      game.tick(delta);
      game.render();
    })();
  };

  function Game() {
    Base.call(this);
    this.windowX = 2500;
    this.windowY = 2500;
    this.width = 800;
    this.height = 600;
    this.zIndices = [];
    this.renderList = {};

    this.on("render.register", this.addToRenderList);
    this.on("render.deregister", this.removeFromRenderList);

    this.physics = new PhysicsEngine();
    this.sounds = new SoundEngine();
    this.player = new Player(
      {
        speedX: 0, //in game pixels per second
        speedY: 0, //in game pixels per second
        posX: this.windowX + (this.width / 2),    //in game coords
        posY: this.windowY + (this.height / 2),    //in game coords
        width: 50,
        height: 50,
        health: 100,
        keys: {
          left: 'a',
          right: 'd',
          up: 'w',
          down: 's',
          fire: ' '
        }
      }
    );
    this.level = new RandomLevel(5000, 5000);
  }
  Game.prototype = Object.create(Base.prototype);

  Game.prototype.setCanvas = function(canvas) {
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
    //canvas y has 0 at the top, so we need to subtract from height
    return this.height - (gamePosY - this.windowY);
  };


  Game.prototype.moveWindow = function() {
    //we want to move the window when the player gets within 100px of
    //the edges of the screen
    //but let's start with centring the player on the screen
    this.windowX = this.player.posX - (this.width / 2);
    this.windowY = this.player.posY - (this.height / 2);
  };

  Game.prototype.isOnScreen = function(thing) {
    return (thing.posX > this.windowX) 
      && (thing.posX < this.windowX + this.width)
      && (thing.posY > this.windowY)
      && (thing.posY < this.windowY + this.height);
  };

  Game.prototype.handleKeys = function(event) {
    var key = String.fromCharCode(event.keyCode).toLowerCase();
    this.fireEvent(event.type, key);
  };

})(window, document);
