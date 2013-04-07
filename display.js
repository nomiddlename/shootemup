function Display(width, height) {
  Base.call(this);
  this.width = width;
  this.height = height;

  this.playerHealth = 0;
  this.score = 0;
  this.gameIsOver = false;
  this.gameHasStarted = false;
  
  this.fireEvent("render.register", 5);
  this.on("keydown", this.gameStart);
  
};
Display.prototype = Object.create(Base.prototype);

Display.prototype.write = function(context, size, align, text, x, y) {
  context.font = "bold " + size + "px Arial";
  context.fillStyle = "black";
  context.textAlign = align;
  context.fillText(text, x+2, y+2);
  context.fillStyle = "white";
  context.fillText(text, x, y);
}

Display.prototype.draw = function(game) {
  var context = game.context;
  //draw the player's current health
  this.write(context, 20, "start", "Health: " + this.playerHealth, 50, 50);
  //draw the player's score
  this.write(context, 20, "end", "Score: " + this.score, game.width - 50, 50);
  
  //if game.over, let them know
  if (this.gameIsOver) {
    this.write(context, 40, "center", "Game Over", game.width / 2, game.height / 2);
    this.write(context, 20, "center", "Press any key to start again", game.width / 2, game.height / 2 + 100);
  }

  if (!this.gameHasStarted && !this.gameIsOver) {
    this.write(context, 40, "center", "Press any key to start", game.width / 2, game.height / 2);
  }
};

Display.prototype.updatePlayerHealth = function(event) {
  this.playerHealth = event.data;
};

Display.prototype.updateScore = function(event) {
  this.score += 10;
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
