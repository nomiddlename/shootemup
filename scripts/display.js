// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , big = 40
  , small = 25;

  function Display() {
    Base.call(this);
    
    this.playerHealth = 0;
    this.score = 0;
    this.gameIsOver = false;
    this.gameHasStarted = false;
    
    this.fireEvent("render.register", 5);
    this.on("keydown", this.gameStart);
    
  };
  Display.prototype = Object.create(Base.prototype);

  Display.prototype.write = function(context, size, align, text, x, y) {
    context.beginPath();
    context.font = "bold " + size + "px Arial";
    context.fillStyle = "black";
    context.textAlign = align;
    context.fillText(text, x+3, y+3);
    context.fillStyle = "orange";
    context.fillText(text, x, y);
    context.strokeStyle = "gold";
    context.lineWidth = 1;
    context.strokeText(text, x, y);
    context.closePath();
  }
  
  Display.prototype.draw = function(context, camera) {
    this.write(context, small, "start", "Health: " + this.playerHealth, 50, 50);
    this.write(context, small, "end", "Aliens Destroyed: " + this.score, camera.width - 50, 50);
    
    //if game.over, let them know
    if (this.gameIsOver) {
      this.write(context, big, "center", "Game Over", camera.hwidth, camera.hheight);
      this.write(context, small, "center", "Press space to start again", camera.hwidth, camera.hheight + 100);
    }

    if (!this.gameHasStarted && !this.gameIsOver) {
      this.write(context, big, "center", "Press space to start", camera.hwidth, camera.hheight);
    }
  };

  Display.prototype.updatePlayerHealth = function(event) {
    this.playerHealth = event.data;
  };

  Display.prototype.updateScore = function(event) {
    this.score += 1;
  };

  Display.prototype.gameOver = function(event) {
    this.gameIsOver = true;
    this.stopListening("enemy.death");
    this.stopListening("player.death");
    this.stopListening("player.health");
    //wait a little while before listening to keys
    //otherwise we'll start a new game straight away.
    var self = this;
    setTimeout(function() {
      self.on("keydown", self.gameStart);
    }, 1000);
  };

  Display.prototype.gameStart = function(event) {
    this.score = 0;
    this.stopListening("keydown");
    this.on("player.health", this.updatePlayerHealth);
    this.on("enemy.death", this.updateScore);
    this.on("player.death", this.gameOver);    
    this.gameIsOver = false;
    this.gameHasStarted = true;
    this.fireEvent("game.start");
  };

  return Display;
});
