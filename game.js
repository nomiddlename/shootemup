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
    this.windowBottom = 0;
    this.zIndices = [];
    this.renderList = {};

    this.on("player.move", this.playerMoved);
    this.on("render.register", this.addToRenderList);
    this.on("render.deregister", this.removeFromRenderList);

    this.player = new Player(
      {
        speedX: 0, //in game pixels per second
        speedY: 0, //in game pixels per second
        posX: 300,   //in game coords
        posY: 100,    //in game coords
        width: 50,
        height: 50,
        keys: {
          left: 'a',
          right: 'd',
          up: 'w',
          down: 's',
          fire: ' '
        }
      }
    );
    this.level = new RandomLevel(20000);
  }
  Game.prototype = Object.create(Base.prototype);

  Game.prototype.setCanvas = function(canvas) {
    this.context = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
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
    this.context.clearRect(0, 0, this.width, this.height);
    this.zIndices.forEach(function(zIndex) {
      self.renderList[zIndex].forEach(function(thing) {
        thing.draw.call(thing, self);
      });
    });
  };

  Game.prototype.translateX = function(gamePosX) {
    return gamePosX;
  };

  Game.prototype.translateY = function(gamePosY) {
      return this.height - (gamePosY - this.windowBottom);
  };

  Game.prototype.playerMoved = function(event) {
    this.checkForCollisions(event.source);
    this.changeWindowBottom(event.source);
  };

  Game.prototype.checkForCollisions = function(thing) {
    thing.posX = Math.max(thing.posX, thing.width / 2);
    thing.posX = Math.min(thing.posX, this.width - thing.width / 2);

    thing.posY = Math.max(thing.posY, 100);
    thing.posY = Math.min(thing.posY, this.level.size - this.height + 100);
  };

  Game.prototype.changeWindowBottom = function(thing) {
    //window bottom will always be about 100px below player
    this.windowBottom = thing.posY - 100;
  };

  Game.prototype.handleKeys = function(event) {
    var key = String.fromCharCode(event.keyCode).toLowerCase();
    this.fireEvent(event.type, key);
  };

})(window, document);
