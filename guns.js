function PewPewGun(posX, posY, speed, rate, damage, range) {
  Base.call(this);
  this.speed = speed;
  this.rate = rate;
  this.damage = damage;
  this.range = range;
  this.posX = posX;
  this.posY = posY;
}
PewPewGun.prototype = Object.create(Base.prototype);

PewPewGun.prototype.fire = function() {
  var bullet = new Bullet(this.posX, this.posY, this.speed, this.damage, this.range);
  this.fireEvent("sounds", "pew-pew");
};

PewPewGun.prototype.stopFiring = function() {
};

PewPewGun.prototype.updatePosition = function(x, y) {
  this.posX = x;
  this.posY = y;
};

function Bullet(posX, posY, speed, damage, range) {
  Base.call(this);
  this.posX = posX;
  this.posY = posY;
  this.width = 10;
  this.height = 40;
  this.startY = posY;
  this.speedX = 0.0;
  this.speedY = speed;
  this.damage = damage;
  this.range = range;

  this.on("tick", this.tick);
  this.fireEvent("render.register", 1);
  this.fireEvent("physics.register");
};
Bullet.prototype = Object.create(Base.prototype);

Bullet.prototype.tick = function(event) {
  //check if we're dead yet.
  if (this.posY >= this.startY + this.range) {
    this.fireEvent("render.deregister", 1);
    this.fireEvent("physics.deregister");
  }
};

Bullet.prototype.draw = function(game) {
  var screenX = game.translateX(this.posX - (this.width / 2))
  , screenY = game.translateY(this.posY);
  game.context.fillStyle = "rgb(200, 20, 20)";
  game.context.fillRect(screenX, screenY, this.width, this.height);
};
