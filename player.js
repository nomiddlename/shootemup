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
  var screenX, screenY, angle, radius;

  //posX and posY are in world coords
  //need to translate to canvas coordinates
  screenX = game.translateX(game.physics.scaleToPixels(this.physBody.GetPosition().x));
  screenY = game.translateY(game.physics.scaleToPixels(this.physBody.GetPosition().y));
  angle = this.physBody.GetAngle();
  radius = game.physics.scaleToPixels(this.radius);

  game.context.fillStyle = "rgb(20, 20, 200)";
  game.context.beginPath();
  game.context.arc(screenX, screenY, radius, 0, Math.PI*2, true);
  game.context.closePath();
  game.context.fill();
  game.context.strokeStyle = "black";
  game.context.moveTo(screenX, screenY);
  game.context.lineTo(
    screenX + (radius * Math.sin(angle)), 
    screenY + (radius * Math.cos(angle))
  );
  game.context.stroke();

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
  switch(event.data.code) {
  case this.keys.left: this.thrustLeft = true; break;
  case this.keys.right: this.thrustRight = true; break;
  case this.keys.up: this.thrustForward = true; break;
  //case this.keys.down: this.rearThrust = true; break;
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

};

Player.prototype.forwardThruster = function() {
  var angle = this.physBody.GetAngle()
  , force = new Vec2(Math.sin(angle), Math.cos(angle)) 
  , thrusterPosition = this.physBody.GetPosition().Copy();

  force.Multiply(10);
  this.physBody.ApplyForce(force, thrusterPosition);
};

Player.prototype.rearThruster = function() {
  //do nothing for now
};
  

Player.prototype.stopMoving = function(event) {
  switch(event.data.code) {
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

