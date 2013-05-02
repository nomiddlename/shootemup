// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , Vec2 = require('./box2d').Common.Math.b2Vec2;

  function Shields(amount, position, velocity, lifetime) {
    Base.call(this);

    this.amount = amount;
    this.position = position.Copy();
    this.velocity = velocity.Copy();
    this.lifetime = lifetime;
    this.frame = 0;
    this.radius = 0.5;
  
    this.fireEvent("physics.register");
    this.fireEvent("render.register", 1);
    this.on("tick", this.tick);
  }
  Shields.prototype = Object.create(Base.prototype);

  Shields.prototype.tick = function(event) {
    this.frame += 1;
    if (this.frame > 7) {
      this.frame = 0;
    }

    this.lifetime -= event.data;
    if (this.lifetime < 0) {
      this.die();
    }
  };

  Shields.prototype.draw = function(context, camera, assets) {
    var screenX = camera.scaleToPixels(this.physBody.GetPosition().x)
    , screenY = camera.scaleToPixels(this.physBody.GetPosition().y)
    , image = assets['shields']
    , radius = camera.scaleToPixels(this.radius);

    if (camera.isOnScreen(screenX, screenY, radius)) {
      context.drawImage(
        image, 
        this.frame * 32, 
        0, 
        32, 
        32, 
        camera.translateX(screenX - radius), 
        camera.translateY(screenY - radius), 
        2*radius, 
        2*radius
      );
    }
  };

  Shields.prototype.die = function() {
    this.fireEvent("render.deregister", 1);
    this.fireEvent("physics.deregister");
    this.stopListening("tick");
  };

  Shields.prototype.hit = function(other) {
    console.log("shields hit something: ", other);
    if (other.increaseShields) {
      other.increaseShields(this.amount);
      this.lifetime = -1;
    }
  };

  return {
    create: function(probability, position, velocity) {
      var shield;
      if (Math.random() < probability) {
        shield = new Shields(50, position, velocity, 2000);
      }
      return shield;
    }
  };
});
