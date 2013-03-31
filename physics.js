//Some shorthand references to useful Box2D functions
var Vec2 = Box2D.Common.Math.b2Vec2
, BodyDef = Box2D.Dynamics.b2BodyDef
, Body = Box2D.Dynamics.b2Body
, FixtureDef = Box2D.Dynamics.b2FixtureDef
, Fixture = Box2D.Dynamics.b2Fixture
, World = Box2D.Dynamics.b2World
, MassData = Box2D.Collision.Shapes.b2MassData
, PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
, CircleShape = Box2D.Collision.Shapes.b2CircleShape
, ContactListener = Box2D.Dynamics.b2ContactListener
, DebugDraw = Box2D.Dynamics.b2DebugDraw;
   

function PhysicsEngine() {
  Base.call(this);

  this.world = new World(
    new Vec2(0, 0), //top-down, no gravity
    true
  );

  this.boundaryBodies = this.setupBoundaries();

  var contactListener = new ContactListener();
  contactListener.BeginContact = this.beginContact.bind(this);
  contactListener.EndContact = this.endContact.bind(this);
  contactListener.PreSolve = this.preSolve.bind(this);
  contactListener.PostSolve = this.postSolve.bind(this);
  this.world.SetContactListener(contactListener);

  this.on("boundary", this.updateBoundary);
  this.on("physics.register", this.addAThing);
  this.on("physics.deregister", this.removeAThing);
//  this.on("tick", this.updateWorld);
}
PhysicsEngine.prototype = Object.create(Base.prototype);

PhysicsEngine.prototype.updateBoundary = function(event) {
  this.removeBoundaries();
  this.setupBoundaries(event.data);
};

PhysicsEngine.prototype.removeBoundaries = function() {
  var self = this;
  this.boundaryBodies.forEach(function(body) {
    self.world.DestroyBody(body);
  });
  this.boundaryBodies = [];
};

PhysicsEngine.prototype.setupBoundaries = function(boundary) {
  var boundaryBodies = []
  , bounds = boundary || {
    bottom: 0,
    left: 0,
    top: 1000,
    right: 1000
  }
  , bodyDef = new BodyDef()
  , fixtureDef = new FixtureDef()
  , body;

  bodyDef.type = Body.b2_staticBody;

  //left side of the world
  bodyDef.position = new Vec2(
    this.scaleToWorld(bounds.left), 
    this.scaleToWorld((bounds.top - bounds.bottom) / 2)
  );
  fixtureDef.shape = new PolygonShape();
  fixtureDef.shape.SetAsBox(0.5, this.scaleToWorld((bounds.top - bounds.bottom) / 2));
  boundaryBodies.push(this.world.CreateBody(bodyDef).CreateFixture(fixtureDef));
  
  //right side of the world
  bodyDef.position = new Vec2(
    this.scaleToWorld(bounds.right),
    this.scaleToWorld((bounds.top - bounds.bottom) / 2)
  );
  //fixture should be the same, can reuse.
  boundaryBodies.push(this.world.CreateBody(bodyDef).CreateFixture(fixtureDef));
  
  //top of the world
  bodyDef.position = new Vec2(
    this.scaleToWorld((bounds.right - bounds.left) / 2),
    this.scaleToWorld(bounds.top) 
  );
  fixtureDef.shape = new PolygonShape();
  fixtureDef.shape.SetAsBox(this.scaleToWorld((bounds.right - bounds.left) / 2), 0.5);
  boundaryBodies.push(this.world.CreateBody(bodyDef).CreateFixture(fixtureDef));
  
  //bottom of the world
  bodyDef.position = new Vec2(
    this.scaleToWorld((bounds.right - bounds.left) / 2),
    this.scaleToWorld(bounds.bottom)
  );
  boundaryBodies.push(this.world.CreateBody(bodyDef).CreateFixture(fixtureDef));

  return boundaryBodies;
};

PhysicsEngine.prototype.scaleToWorld = function(valueInPx) {
  return valueInPx / 30;
};

PhysicsEngine.prototype.scaleToPixels = function(valueInWorld) {
  return valueInWorld * 30;
};

PhysicsEngine.prototype.addAThing = function(event) {
  var bodyDef = new BodyDef()
  , fixtureDef = new FixtureDef();

  bodyDef.type = Body.b2_dynamicBody;
  bodyDef.fixedRotation = true;
  bodyDef.position = new Vec2(
    this.scaleToWorld(event.source.posX),
    this.scaleToWorld(event.source.posY)
  );

  fixtureDef.density = 1.0;
  fixtureDef.friction = 0.0;
  fixtureDef.restitution = 0.8;
  fixtureDef.shape = new CircleShape(this.scaleToWorld(event.source.radius));
  
  event.source.physBody = this.world.CreateBody(bodyDef);
  event.source.physBody.CreateFixture(fixtureDef);
  event.source.physBody.SetUserData(event.source);
  event.source.physBody.SetLinearVelocity(new Vec2(event.source.speedX, event.source.speedY));
};

PhysicsEngine.prototype.removeAThing = function(event) {
  this.world.DestroyBody(event.source.physBody);
};

PhysicsEngine.prototype.updateWorld = function(event) {
  //console.log("Updating world");
  this.world.Step( 1/60, 10, 10);
  this.world.ClearForces();
};

PhysicsEngine.prototype.beginContact = function() { 
  //do nothing for now. 
};

PhysicsEngine.prototype.endContact = function() {
  //do nothing for now.
};

PhysicsEngine.prototype.preSolve = function() {
  //do nothing for now.
};

PhysicsEngine.prototype.postSolve = function(bodyA, bodyB, impulses) {
  if (bodyA.GetUserData && bodyB.GetUserData) {
    if (bodyA.GetUserData() && bodyB.GetUserData()) {
      console.log("Bump! A = ", bodyA, "; B = ", bodyB);
    }
  }
//  bodyA.GetUserData().hitBy(bodyB.GetUserData(), impulses[0]);
//  bodyB.GetUserData().hitBy(bodyA.GetUserData(), impulses[0]);
};
