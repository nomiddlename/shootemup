function PhysicsEngine() {
  Base.call(this);

  this.things = [];
  this.boundary = {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0
  };

  this.on("boundary", this.updateBoundary);
  this.on("physics.register", this.addAThing);
  this.on("physics.deregister", this.removeAThing);
  this.on("tick", this.updatePositionsOfAllTheThings);
}
PhysicsEngine.prototype = Object.create(Base.prototype);

PhysicsEngine.prototype.updateBoundary = function(event) {
  this.boundary = event.data;
};

PhysicsEngine.prototype.addAThing = function(event) {
  this.things.push(event.source);
};

PhysicsEngine.prototype.removeAThing = function(event) {
  this.things = this.things.filter(function(thing) { return thing !== event.source; });
};

PhysicsEngine.prototype.updatePositionsOfAllTheThings = function(event) {
  var physics = this
  , tockMs = event.data;

  this.things.forEach(function(thing) {
    //update pos based on speed
    thing.posX += (tockMs / 1000.0) * thing.speedX;
    thing.posY += (tockMs / 1000.0) * thing.speedY;
    //check for collisions with other things
    //check for collisions with the level boundary
    physics.checkForBoundaryCollisions(thing);
  });
};

PhysicsEngine.prototype.checkForBoundaryCollisions = function(thing) {
  thing.posX = Math.max(thing.posX, (thing.width / 2) + this.boundary.left);
  thing.posX = Math.min(thing.posX, this.boundary.right - thing.width / 2);
  
  thing.posY = Math.max(thing.posY, this.boundary.bottom);
  thing.posY = Math.min(thing.posY, this.boundary.top);
};
