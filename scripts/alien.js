// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , Vec2 = require('./box2d').Common.Math.b2Vec2
  , explosion = require('./explosion')
  , shields = require('./shields');

  function Alien(posX, posY, speed, health, damage) {
    this.position = new Vec2(posX, posY);
    this.speed = speed;
    this.radius = 0.8;
    this.health = health;
    this.damage = damage;
    this.frame = Math.floor(Math.random() * 8);
    
    Base.call(this);
    this.fireEvent("physics.register");
    this.fireEvent("render.register", 1);
    this.on("tick", this.tick);
    this.on("player.move", this.updatePlayerPosition);
  }
  Alien.prototype = Object.create(Base.prototype);

  Alien.prototype.draw = function(context, camera, assets) {
    var screenX = camera.scaleToPixels(this.physBody.GetPosition().x)
    , screenY = camera.scaleToPixels(this.physBody.GetPosition().y)
    , image = assets['alien']
    , radius = camera.scaleToPixels(this.radius)
    , angle = this.physBody.GetAngle();
    
    if (camera.isOnScreen(screenX, screenY, radius)) {
      angle = Math.PI - angle;
      if (angle < 0) {
        angle += Math.PI*2;
      }
      context.save();
      context.translate(camera.translateX(screenX), camera.translateY(screenY));
      context.rotate(angle);
      context.drawImage(image, Math.floor(this.frame) * 64, 0, 64, 64, -radius, -radius, 2*radius, 2*radius);
      context.restore();
    }
  };

  Alien.prototype.tick = function(event) {
    if (this.health <= 0) {
      this.die();
    } else {
      this.frame += .1;
      if (this.frame > 7) {
        this.frame = 0;
      }
      //need to work out a normalised vector between our position and the
      //player's position, then multiply it by our speed
      if (this.playerBody) {
        var currentAngle = this.physBody.GetAngle()
        , angle
        , newAngle
        , direction = this.playerBody.GetPosition().Copy();
        
        direction.Subtract(this.physBody.GetPosition());
        direction.Normalize();
        direction.Multiply(this.speed);
        
        angle = Math.atan2(direction.x, direction.y);
        if (angle >= 0) {
          this.physBody.SetAngle(angle);
        } else {
          this.physBody.SetAngle(Math.PI*2 + angle);
        }
        this.physBody.ApplyForce(direction, this.physBody.GetPosition());
        
      }
    }
  };

  Alien.prototype.updatePlayerPosition = function(event) {
    this.playerBody = event.source.physBody;
  };

  Alien.prototype.hit = function(other, impulse) {
    if (other.reduceHealth) {
      other.reduceHealth(this.damage);
    }
  };

  Alien.prototype.die = function() {
    explosion.create(this.physBody.GetPosition());
    shields.create(0.5, this.physBody.GetPosition(), this.physBody.GetLinearVelocity());
    this.fireEvent("enemy.death");
    this.fireEvent("sounds", { name: "boom", position: this.physBody.GetPosition() });
    this.destroy();
  };

  Alien.prototype.destroy = function() {
    this.fireEvent("render.deregister", 1);
    this.fireEvent("physics.deregister");
    this.stopListening("tick");
    this.stopListening("player.move");
  };
  
  return Alien;
});
