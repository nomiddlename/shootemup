function Player(definition) {
  Base.call(this);
  this.speedX = definition.speedX;
  this.speedY = definition.speedY;
  this.posX = definition.posX;
  this.posY = definition.posY;
  this.width = definition.width;
  this.height = definition.height;
  this.keys = definition.keys;
  this.health = definition.health;

  this.gun = new PewPewGun(this.posX, this.posY + this.height, 600, 500, 100, 600, "pew-pew.mp3");

  this.on("tick", this.updateGunPosition);
  this.on("keydown", this.startMoving);
  this.on("keyup", this.stopMoving);

  //we want to be rendered at zIndex 2
  this.fireEvent("render.register", 2);
  //we want to take part in the physics of the world
  this.fireEvent("physics.register");
}
Player.prototype = Object.create(Base.prototype);

Player.prototype.draw = function(game) {
  var screenX, screenY;

  //posX and posY are in world coords
  //need to translate to canvas coordinates
  screenX = game.translateX(this.posX);
  screenY = game.translateY(this.posY);
  game.context.fillStyle = "rgb(20, 20, 200)";
  game.context.fillRect(screenX - (this.width / 2), screenY - (this.height / 2), this.width, this.height);
};

Player.prototype.startMoving = function(event) {
  switch(event.data) {
  case this.keys.left: this.speedX = -300; break;
  case this.keys.right: this.speedX = 300; break;
  case this.keys.up: this.speedY = 300; break;
  case this.keys.down: this.speedY = -300; break;
  case this.keys.fire: this.gun.fire(); break;
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

Player.prototype.updateGunPosition = function(event) {
  this.gun.updatePosition(this.posX, this.posY + this.height);
};
