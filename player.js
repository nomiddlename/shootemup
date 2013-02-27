function Player(definition) {
  this.speedX = definition.speedX;
  this.speedY = definition.speedY;
  this.posX = definition.posX;
  this.posY = definition.posY;
  this.width = definition.width;
  this.height = definition.height;
  this.keys = definition.keys;

  this.listeners = [];
  this.actions = {};

  this.on("render", this.draw);
  this.on("tick", this.tick);
  this.on("keydown", this.startMoving);
  this.on("keyup", this.stopMoving);
}

Player.prototype.listen = function(listener) {
  this.listeners.push(listener);
};

Player.prototype.fireEvent = function(eventType, data) {
  var self = this;
  this.listeners.forEach(function(listener) {
    listener.receive(eventType, { source: self, data: data });
  });
};

Player.prototype.tick = function(event) {
  var tockMs = event.data;
  this.posX += (tockMs / 1000.0) * this.speedX;
  this.posY += (tockMs / 1000.0) * this.speedY;
  if (this.speedX !== 0 || this.speedY !== 0) {
    this.fireEvent("player.move");
  }
};

Player.prototype.receive = function(eventType, event) {
  if (this.actions[eventType]) {
    this.actions[eventType].call(this, event);
  }
};

Player.prototype.on = function(eventType, cb) {
  this.actions[eventType] = cb;
};

Player.prototype.draw = function(event) {
  var game = event.source, screenX, screenY;
  //posX and posY are in world coords
  //need to translate to canvas coordinates
  screenX = game.translateX(this.posX);
  screenY = game.translateY(this.posY);
  game.context.fillStyle = "rgb(20, 20, 200)";
  game.context.fillRect(screenX - (this.width / 2), screenY - (this.height / 2), this.width, this.height);
};

Player.prototype.startMoving = function(event) {
  switch(event.data) {
  case this.keys.left: this.speedX = -200; break;
  case this.keys.right: this.speedX = 200; break;
  case this.keys.up: this.speedY = 200; break;
  case this.keys.down: this.speedY = -200; break;
  }
};

Player.prototype.stopMoving = function(event) {
  switch(event.data) {
  case this.keys.left: this.speedX = 0; break;
  case this.keys.right: this.speedX = 0; break;
  case this.keys.up: this.speedY = 0; break;
  case this.keys.down: this.speedY = 0; break;
  }
};
