function Player(definition) {
  Base.call(this);
  this.speedX = definition.speedX;
  this.speedY = definition.speedY;
  this.posX = definition.posX;
  this.posY = definition.posY;
  this.radius = definition.radius;
  this.keys = definition.keys;
  this.health = definition.health;

  this.gun = new PewPewGun(600, 500, 100, 600);

  this.on("keydown", this.startMoving);
  this.on("keyup", this.stopMoving);

  //we want to be rendered at zIndex 2
  this.fireEvent("render.register", 2);
  //we want to take part in the physics of the world
  this.fireEvent("physics.register");
  //we have to let the rest of the world know where we are,
  //unfortunately.
  setInterval(this.fireEvent.bind(this, "player.move"), 200);
}
Player.prototype = Object.create(Base.prototype);

Player.prototype.draw = function(game) {
  var screenX, screenY;

  //posX and posY are in world coords
  //need to translate to canvas coordinates
  screenX = game.translateX(this.posX);
  screenY = game.translateY(this.posY);
  game.context.fillStyle = "rgb(20, 20, 200)";
  game.context.beginPath();
  game.context.arc(screenX, screenY, this.radius, 0, Math.PI*2, true);
  game.context.closePath();
  game.context.fill();
};

Player.prototype.fireTheGun = function() {
  var speedY = Math.abs(this.speedX) == 0 && Math.abs(this.speedY) == 0 ? 600 : this.speedY;
  this.gun.fire(this.posX, this.posY, this.speedX, speedY);
};

Player.prototype.startMoving = function(event) {
  switch(event.data) {
  case this.keys.left: this.speedX = -300; break;
  case this.keys.right: this.speedX = 300; break;
  case this.keys.up: this.speedY = 300; break;
  case this.keys.down: this.speedY = -300; break;
  case this.keys.fire: this.fireTheGun(); break;
  }
};


Player.prototype.stopMoving = function(event) {
  switch(event.data) {
  case this.keys.left: this.speedX = 0; break;
  case this.keys.right: this.speedX = 0; break;
  case this.keys.up: this.speedY = 0; break;
  case this.keys.down: this.speedY = 0; break;
  case this.keys.fire: this.gun.stopFiring(); break;
  }
};

