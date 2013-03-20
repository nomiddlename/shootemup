function PewPewGun(speed, rate, damage, range) {
    Base.call(this);
  this.speed = speed;
  this.rate = rate;
  this.damage = damage;
  this.range = range;
}
PewPewGun.prototype = Object.create(Base.prototype);

PewPewGun.prototype.fire = function() {
  console.log("pew pew");
};

PewPewGun.prototype.stopFiring = function() {
  console.log("aw :(");
};
