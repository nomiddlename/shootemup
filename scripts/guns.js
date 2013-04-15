// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , Alien = require('./alien');

  function PewPewGun(speed, damage, range) {
    Base.call(this);
    this.speed = speed; //speed of bullets
    this.damage = damage; //damage of each bullet
    this.range = range; //range/lifetime of bullets (in ticks)
  }
  PewPewGun.prototype = Object.create(Base.prototype);

  PewPewGun.prototype.fire = function(position, direction) {
    var velocity = direction.Copy();
    
    velocity.Normalize();
    velocity.Multiply(this.speed);
    
    bullet = new Bullet(
      position,
      velocity, 
      this.damage, 
      this.range
    );
    this.fireEvent("sounds", { name: "pew-pew", position: position });
  };

  PewPewGun.prototype.stopFiring = function() {
  };

  function Bullet(position, velocity, damage, range) {
    Base.call(this);
    this.velocity = velocity.Copy();
    this.radius = 0.2;
    this.damage = damage;
    this.range = range;
    this.bullet = true;
    
    this.position = velocity.Copy();
    this.position.Normalize();
    this.position.Multiply(this.radius*2);
    this.position.Add(position);
    
    this.fireEvent("physics.register");
    this.fireEvent("render.register", 1);
    this.on("tick", this.tick);
  };
  Bullet.prototype = Object.create(Base.prototype);

  Bullet.prototype.tick = function(event) {
    this.range -= 1;
    if (this.range <= 0) {
      this.die();
    }
  };

  Bullet.prototype.draw = function(game) {
    var screenX = game.translateX(game.physics.scaleToPixels(this.physBody.GetPosition().x))
    , screenY = game.translateY(game.physics.scaleToPixels(this.physBody.GetPosition().y));
    
    game.context.beginPath();
    game.context.fillStyle = "rgb(200, 20, 20)";
    game.context.arc(
      screenX, 
      screenY, 
      game.physics.scaleToPixels(this.radius), 
      0, 
      Math.PI * 2, 
      true
    );
    game.context.fill();
    game.context.strokeStyle = "pink";
    game.context.lineWidth = 1;
    game.context.stroke();
    game.context.closePath();
  };

  Bullet.prototype.hit = function(other, impulse) {
    if (other instanceof Alien) {
      other.health -= this.damage;
      this.die();
    }
  };

  Bullet.prototype.die = function() {
    this.fireEvent("render.deregister", 1);
    this.fireEvent("physics.deregister");
    this.stopListening("tick");
  }; 

  return PewPewGun;
});
