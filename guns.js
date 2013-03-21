function PewPewGun(posX, posY, speed, rate, damage, range, soundEffect) {
  Base.call(this);
  this.speed = speed;
  this.rate = rate;
  this.damage = damage;
  this.range = range;
  this.soundEffect = soundEffect;
  this.posX = posX;
  this.posY = posY;

  this.on("player.tick", this.tick);
  this.on("player.render", this.draw);
  this.on("player.move", this.updatePosition);
  this.on("bullet.end", this.removeBullet);
}
PewPewGun.prototype = Object.create(Base.prototype);

PewPewGun.prototype.fire = function() {
  console.log("pew pew");
  var bullet = new Bullet(this.posX, this.posY, this.speed, this.damage, this.range);
  bullet.listen(this);
  this.listen(bullet);
  this.fireEvent("sounds", this.soundEffect);
};

PewPewGun.prototype.stopFiring = function() {
  console.log("aw :(");
};

PewPewGun.prototype.tick = function(event) {
  //console.log("firing gun.tick event");
  this.fireEvent("gun.tick", event.data);
};

PewPewGun.prototype.draw = function(event) {
  this.fireEvent("gun.render", event.data);
};

PewPewGun.prototype.updatePosition = function(event) {
  var player = event.source;
  this.posX = player.posX;
  this.posY = player.posY;
};

PewPewGun.prototype.removeBullet = function(event) {
  this.removeListener(event.source);
  event.source.removeListener(this);
};


function Bullet(posX, posY, speed, damage, range) {
  Base.call(this);
  this.posX = posX;
  this.posY = posY;
  this.startY = posY;
  this.speed = speed;
  this.damage = damage;
  this.range = range;

  this.on("gun.tick", this.tick);
  this.on("gun.render", this.draw);
};
Bullet.prototype = Object.create(Base.prototype);

//bullet needs draw, tick functions
Bullet.prototype.tick = function(event) {
  this.posY += this.speed * (event.data / 1000);
  //console.log("in bullet.tick, with posY = ", this.posY);
  if (this.posY >= this.startY + this.range) {
    this.fireEvent("bullet.end");
  }
};

Bullet.prototype.draw = function(event) {
  var game = event.data
  , screenX = game.translateX(this.posX)
  , screenY = game.translateY(this.posY);

  //console.log("In bullet.draw");

  game.context.fillStyle = "rgb(200, 20, 20)";
  game.context.fillRect(screenX - 10, screenY - 20, 20, 40);
};
