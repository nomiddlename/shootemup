function Player(definition) {
  this.speedX = definition.speedX;
  this.speedY = definition.speedY;
  this.posX = definition.posX;
  this.posY = definition.posY;
  this.width = definition.width;
  this.height = definition.height;
}

Player.prototype.tick = function(tockMs) {
  this.posY += (tockMs / 1000.0) * speedY;
};

Player.prototype.draw = function(context) {
  //posX and posY are in world coords
  //needs to translate to canvas coordinates
  //should be responsibility of something else
  //with draw passed in the canvas coordinates
  //of the center?
};
