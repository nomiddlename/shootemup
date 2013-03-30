function PewPewGun(speed, rate, damage, range) {
  Base.call(this);
  this.speed = speed;
  this.rate = rate;
  this.damage = damage;
  this.range = range;
}
PewPewGun.prototype = Object.create(Base.prototype);

PewPewGun.prototype.fire = function(posX, posY, speedX, speedY) {
  var magnitude = Math.sqrt(speedX*speedX + speedY*speedY)
  , directionX = speedX / magnitude
  , directionY = speedY / magnitude
  , bullet = new Bullet(
    posX, 
    posY, 
    directionX * this.speed, 
    directionY * this.speed, 
    this.damage, 
    this.range
  );
  this.fireEvent("sounds", "pew-pew");
};

PewPewGun.prototype.stopFiring = function() {
};

function Bullet(posX, posY, speedX, speedY, damage, range) {
  Base.call(this);
  this.posX = posX;
  this.posY = posY;
  this.radius = 5;
  this.startX = posX;
  this.startY = posY;
  this.speedX = speedX;
  this.speedY = speedY;
  this.damage = damage;
  this.range = range;

  this.on("tick", this.tick);
  this.fireEvent("render.register", 1);
  this.fireEvent("physics.register");
};
Bullet.prototype = Object.create(Base.prototype);

Bullet.prototype.tick = function(event) {
  //check if we're dead yet.
  var distanceTravelled = Math.sqrt(Math.pow(this.posX - this.startX, 2) + Math.pow(this.posY - this.startY, 2));
  if (distanceTravelled > this.range) {
    this.fireEvent("render.deregister", 1);
    this.fireEvent("physics.deregister");
    this.stopListening("tick");
  }
};

Bullet.prototype.draw = function(game) {
  var screenX = game.translateX(this.posX)
  , screenY = game.translateY(this.posY);
  game.context.fillStyle = "rgb(200, 20, 20)";
  game.context.beginPath();
  game.context.arc(screenX, screenY, this.radius, 0, Math.PI * 2, true);
  game.context.closePath();
  game.context.fill();
};
