function PewPewGun(speed, rate, damage, range) {
  this.speed = speed;
  this.rate = rate;
  this.damage = damage;
  this.range = range;
}
PewPewGun.prototype = Base.prototype;

PewPewGun.prototype.fire = function() {
  console.log("pew pew");
};

PewPewGun.prototype.stopFiring = function() {
  console.log("aw :(");
};
