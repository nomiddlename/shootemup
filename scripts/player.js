// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , Vec2 = require('./box2d').Common.Math.b2Vec2
  , PewPewGun = require('./guns');

  function Player(definition) {
    Base.call(this);
    this.position = new Vec2(definition.posX, definition.posY);
    this.radius = definition.radius;
    this.keys = definition.keys;
    this.health = definition.health;
    this.damage = definition.damage;
    
    this.thrustLeft = false;
    this.thrustRight = false;
    this.thrustForward = false;
    
    //we want to take part in the physics of the world
    this.fireEvent("physics.register");
    //we want to be rendered at zIndex 2
    this.fireEvent("render.register", 2);
    //we have to let the rest of the world know where we are,
    //unfortunately.
    this.intervalId = setInterval(this.fireEvent.bind(this, "player.move"), 50);

    this.fireEvent("player.health", this.health);
    
    this.gun = new PewPewGun(30, 500, 100, 100);
    
    this.on("keydown", this.startMoving);
    this.on("keyup", this.stopMoving);
    this.on("tick", this.update);
    
  }
  Player.prototype = Object.create(Base.prototype);

  Player.prototype.update = function(event) {
    var tockMs = event.data;
    if (this.health <= 0) {
      this.die();
    } else {
      this.physBody.SetAngularDamping(1.0);
      if (this.thrustLeft) {
        this.rightThruster();
      }
      if (this.thrustRight) {
        this.leftThruster();
      }
      if (this.thrustForward) {
        this.forwardThruster();
      }
    }

  };

  Player.prototype.draw = function(game) {
    var screenX = game.translateX(game.physics.scaleToPixels(this.physBody.GetPosition().x))
    , screenY = game.translateY(game.physics.scaleToPixels(this.physBody.GetPosition().y))
    , angle = this.physBody.GetAngle()
    , radius = game.physics.scaleToPixels(this.radius)
    , image = game.assets['player']
    , frame = 0;
        
    angle = Math.PI - angle;
    if (angle < 0) {
      angle += Math.PI*2;
    }
    game.context.save();
    game.context.translate(screenX, screenY);
    game.context.rotate(angle);
    if (this.thrustLeft) {
      frame = 1;
    } else if (this.thrustRight) {
      frame = 2;
    } else if (this.thrustForward) {
      frame = 3;
    }
    game.context.drawImage(image, frame*64, 0, 64, 64, -radius, -radius, 2*radius, 2*radius);
    game.context.restore();    
  };

  Player.prototype.fireTheGun = function() {
    var direction = new Vec2(
      Math.sin(this.physBody.GetAngle()), 
      Math.cos(this.physBody.GetAngle())
    )
    , gunDistance = direction.Copy()
    , gunPosition = this.physBody.GetPosition().Copy();
    gunDistance.Multiply(this.radius);
    gunPosition.Add(gunDistance);
    
    this.gun.fire(gunPosition, direction);
  };

  Player.prototype.startMoving = function(event) {
    switch(event.data.key) {
    case this.keys.left: this.thrustLeft = true; break;
    case this.keys.right: this.thrustRight = true; break;
    case this.keys.up: this.thrustForward = true; break;
    case this.keys.fire: this.fireTheGun(); break;
    }
  };

  Player.prototype.leftThruster = function() {
    var angle = this.physBody.GetAngle()
    , force = new Vec2(Math.sin(angle), Math.cos(angle)) 
    , thrusterPosition = this.physBody.GetPosition().Copy()
    , thrusterOffset = new Vec2(
        -Math.cos(angle), 
      Math.sin(angle)
    );
    thrusterOffset.Multiply(this.radius);
    thrusterPosition.Add(thrusterOffset);
    
    force.Multiply(5);
    this.physBody.ApplyForce(force, thrusterPosition);
    this.fireEvent("sounds", { name: "thrust", position: thrusterPosition });
  };
  
  Player.prototype.rightThruster = function() {
    var angle = this.physBody.GetAngle()
    , force = new Vec2(Math.sin(angle), Math.cos(angle)) 
    , thrusterPosition = this.physBody.GetPosition().Copy()
    , thrusterOffset = new Vec2(
        -Math.cos(angle), 
      Math.sin(angle)
    );
    thrusterOffset.Multiply(this.radius);
    thrusterPosition.Subtract(thrusterOffset);
    
    force.Multiply(5);
    this.physBody.ApplyForce(force, thrusterPosition);
    this.fireEvent("sounds", { name: "thrust", position: thrusterPosition });
    
  };

  Player.prototype.forwardThruster = function() {
    var angle = this.physBody.GetAngle()
    , force = new Vec2(Math.sin(angle), Math.cos(angle)) 
    , thrusterPosition = this.physBody.GetPosition().Copy();
    
    force.Multiply(10);
    this.physBody.ApplyForce(force, thrusterPosition);
    this.fireEvent("sounds", { name: "thrust", position: thrusterPosition });
  };

  Player.prototype.rearThruster = function() {
    //do nothing for now
  };
  

  Player.prototype.stopMoving = function(event) {
    switch(event.data.key) {
    case this.keys.left: this.thrustLeft = false; break;
    case this.keys.right: this.thrustRight = false; break;
    case this.keys.up: this.thrustForward = false; break;
      //case this.keys.down: this.speedY = 0; break;
    case this.keys.fire: this.gun.stopFiring(); break;
    }
  };
  
  Player.prototype.hit = function(other, impulse) {
    if (other.health) {
      other.health -= this.damage;
    }
  };
  
  Player.prototype.reduceHealth = function(amount) {
    this.health -= amount;
    this.health = Math.max(0, this.health);
    this.fireEvent("player.health", this.health);
  };

  Player.prototype.die = function() {
    this.fireEvent("player.death");
    this.fireEvent("sounds", { name: "boom", position: this.physBody.GetPosition() });
    this.fireEvent("render.deregister", 2);
    this.fireEvent("physics.deregister");
    this.stopListening("tick");
    this.stopListening("keydown");
    this.stopListening("keyup");
    clearInterval(this.intervalId);
  };

  return Player;
});

