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
  , tockMs = event.data
  , buckets = this.sortThingsIntoHorizontalBuckets();

  //update pos based on speed
  this.things.forEach(function(thing) {
    if (Math.abs(thing.speedX) > 0) {
      thing.posX += (tockMs / 1000.0) * thing.speedX;
    }
    if (Math.abs(thing.speedY) > 0) {
      thing.posY += (tockMs / 1000.0) * thing.speedY;
    }
    //check for collisions with the level boundary
    physics.checkForBoundaryCollisions(thing);
  });

  //check for collisions with other things
  buckets.forEach(function(bucket) {
    bucket.forEach(function(thing) {
      bucket.forEach(function(otherThing) {
        if (thing !== otherThing) {
          var distanceBetweenThings = Math.sqrt(
            Math.pow(thing.posX - otherThing.posX, 2) + 
              Math.pow(thing.posY - otherThing.posY, 2)
          );
          if (distanceBetweenThings <= (thing.radius + otherThing.radius)) {
            //boing! we have a collision
            //let's do a simple inelastic bounce, ignoring sizes,
            //speed, etc.
            if (!thing.keys) {
              thing.speedX = - thing.speedX;
              thing.speedY = - thing.speedY;
            }
          }
        }
      });
    });
  });
};

PhysicsEngine.prototype.sortThingsIntoHorizontalBuckets = function() {
  var y, buckets = [];
  for ( y = this.boundary.bottom ; y < this.boundary.top; y += 200 ) {
    var bucket = this.things.filter(function(thing) { return (thing.posY >= y) && (thing.posY < y + 200); });
    //only one thing in the bucket? don't bother looking for collisions.
    if (bucket.length > 1) {
      buckets.push(bucket);
    }
  }
  return buckets;
}; 

PhysicsEngine.prototype.checkForBoundaryCollisions = function(thing) {
  var width = thing.width ? thing.width / 2 : thing.radius;
  if (thing.keys) {
    thing.posX = Math.max(thing.posX, width + this.boundary.left);
    thing.posX = Math.min(thing.posX, this.boundary.right - width);
    
    thing.posY = Math.max(thing.posY, this.boundary.bottom);
    thing.posY = Math.min(thing.posY, this.boundary.top);
  } else {
    if (thing.posX + width > this.boundary.right) {
      thing.posX = this.boundary.right - width;
      thing.speedX = - thing.speedX;
    }
    if (thing.posX - width < this.boundary.left) {
      thing.posX = this.boundary.left + width;
      thing.speedX = - thing.speedX;
    }
    if (thing.posY + width > this.boundary.top) {
      thing.posY = this.boundary.top - width;
      thing.speedY = - thing.speedY;
    }
    if (thing.posY - width < this.boundary.bottom) {
      thing.posY = this.boundary.bottom + width;
      thing.speedY = - thing.speedY;
    }
  }
};
