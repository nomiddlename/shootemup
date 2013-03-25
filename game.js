(function(window, document) {
  var game, level, lastTime = Date.now();

  window.onload = function() {
    var canvas = document.getElementById('theCanvas'),
    player = new Player({
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
    });
    game = new Game(canvas.getContext('2d'), canvas.width, canvas.height);
    level = new RandomLevel(20000);

    document.addEventListener("keydown", game.handleKeys.bind(game));
    document.addEventListener("keyup", game.handleKeys.bind(game));
    
    mainLoop();
  };

  function mainLoop() {
    var now = Date.now(), delta = now - lastTime;
    lastTime = now;
    window.requestAnimationFrame(mainLoop);
    game.tick(delta);
    game.render();
  }

  function Game(context, width, height) {
    Base.call(this);
    this.context = context;
    this.width = width;
    this.height = height;
    this.windowBottom = 0;
    this.on("player.move", this.playerMoved);
  }
  Game.prototype = Object.create(Base.prototype);
  
  
  Game.prototype.tick = function(tockMs) {
    this.fireEvent("tick", tockMs);
  };

  Game.prototype.render = function() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.fireEvent("render");
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
    thing.posY = Math.min(thing.posY, level.size - this.height + 100);
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
