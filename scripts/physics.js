// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  //Some shorthand references to useful Box2D functions
  var Base = require('./base')
  , Box2D = require('./box2d')
  , Vec2 = Box2D.Common.Math.b2Vec2
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

    this.boundaryBodies = [];
    this.deadThings = [];
    
    var contactListener = new ContactListener();
    contactListener.BeginContact = this.beginContact.bind(this);
    contactListener.EndContact = this.endContact.bind(this);
    contactListener.PreSolve = this.preSolve.bind(this);
    contactListener.PostSolve = this.postSolve.bind(this);
    this.world.SetContactListener(contactListener);
    
    this.on("boundary.world", this.updateBoundary);
    this.on("physics.register", this.addAThing);
    this.on("physics.deregister", this.removeAThing);
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
    bodyDef.position = new Vec2(bounds.left, (bounds.top - bounds.bottom) / 2);
    fixtureDef.shape = new PolygonShape();
    fixtureDef.shape.SetAsBox(0.5, (bounds.top - bounds.bottom) / 2);
    boundaryBodies.push(this.world.CreateBody(bodyDef).CreateFixture(fixtureDef));
  
    //right side of the world
    bodyDef.position = new Vec2(bounds.right, (bounds.top - bounds.bottom) / 2);
    //fixture should be the same, can reuse.
    boundaryBodies.push(this.world.CreateBody(bodyDef).CreateFixture(fixtureDef));
  
    //top of the world
    bodyDef.position = new Vec2((bounds.right - bounds.left) / 2, bounds.top);
    fixtureDef.shape = new PolygonShape();
    fixtureDef.shape.SetAsBox((bounds.right - bounds.left) / 2, 0.5);
    boundaryBodies.push(this.world.CreateBody(bodyDef).CreateFixture(fixtureDef));
    
    //bottom of the world
    bodyDef.position = new Vec2((bounds.right - bounds.left) / 2, bounds.bottom);
    boundaryBodies.push(this.world.CreateBody(bodyDef).CreateFixture(fixtureDef));

    return boundaryBodies;
  };
  
  PhysicsEngine.prototype.addAThing = function(event) {
    var bodyDef = new BodyDef()
    , fixtureDef = new FixtureDef();

    bodyDef.type = Body.b2_dynamicBody;
    bodyDef.position = event.source.position;
    
    if (event.source.bullet) {
      bodyDef.bullet = true;
    }

    fixtureDef.density = 1.0;
    fixtureDef.friction = 0.5;
    fixtureDef.restitution = 0.5;
    fixtureDef.shape = new CircleShape(event.source.radius);
  
    event.source.physBody = this.world.CreateBody(bodyDef);
    event.source.physBody.CreateFixture(fixtureDef);
    event.source.physBody.SetUserData(event.source);
    if (event.source.velocity) {
      event.source.physBody.SetLinearVelocity(event.source.velocity);
    }
  };

  PhysicsEngine.prototype.removeAThing = function(event) {
    this.deadThings.push(event.source.physBody);
  };
  
  PhysicsEngine.prototype.updateWorld = function(event) {
    var self = this;
    //console.log("Updating world");
    this.world.Step( 1/60, 10, 10);
    this.world.ClearForces();
    
    this.deadThings.forEach(function(thing) {
      self.world.DestroyBody(thing);
    });
    this.deadThings = [];

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

  PhysicsEngine.prototype.postSolve = function(contact, impulses) {
    var bodyA = contact.GetFixtureA().GetBody()
    , bodyB = contact.GetFixtureB().GetBody();
    if (bodyA.GetUserData && bodyB.GetUserData) {
      if (bodyA.GetUserData() && bodyB.GetUserData()) {
        bodyA.GetUserData().hit(bodyB.GetUserData(), impulses[0]);
        bodyB.GetUserData().hit(bodyA.GetUserData(), impulses[0]);      
      }
    }
  };

  return PhysicsEngine;
});
