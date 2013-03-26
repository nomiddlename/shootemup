function PewPewGun(posX, posY, speed, rate, damage, range, soundEffect) {
  Base.call(this);
  this.speed = speed;
  this.rate = rate;
  this.damage = damage;
  this.range = range;
  this.soundEffect = soundEffect;
  this.posX = posX;
  this.posY = posY;

  this.on("player.move", this.updatePosition);
}
PewPewGun.prototype = Object.create(Base.prototype);

PewPewGun.prototype.fire = function() {
  console.log("pew pew");
  var bullet = new Bullet(this.posX, this.posY, this.speed, this.damage, this.range);
  this.fireEvent("sounds", this.soundEffect);
};

PewPewGun.prototype.stopFiring = function() {
  console.log("aw :(");
};

PewPewGun.prototype.updatePosition = function(event) {
  var player = event.source;
  this.posX = player.posX;
  this.posY = player.posY + player.height;
};

function Bullet(posX, posY, speed, damage, range) {
  Base.call(this);
  this.posX = posX;
  this.posY = posY;
  this.startY = posY;
  this.speed = speed;
  this.damage = damage;
  this.range = range;

  this.on("tick", this.tick);
  this.fireEvent("render.register", 1);
};
Bullet.prototype = Object.create(Base.prototype);

//bullet needs draw, tick functions
Bullet.prototype.tick = function(event) {
  this.posY += this.speed * (event.data / 1000);
  if (this.posY >= this.startY + this.range) {
    console.log("Dead Bullet");
    this.fireEvent("render.deregister", 1);
    this.stopListening("tick", this.tick);
  }
};

Bullet.prototype.draw = function(game) {
  var screenX = game.translateX(this.posX - 5)
  , screenY = game.translateY(this.posY);

  game.context.fillStyle = "rgb(200, 20, 20)";
  game.context.fillRect(screenX, screenY, 10, 40);
};
