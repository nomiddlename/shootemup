//dodgy loading of Box2d into global context because it's not a module
eval(require('fs').readFileSync('./Box2dWeb-2.1.a.3.js').toString('utf8'));

var assert = require('assert')
, Vec2 = Box2D.Common.Math.b2Vec2
, Alien = require('./level').Alien
, fakePhysBody = {
  GetPosition: function() {
    return this.position;
  },
  GetAngle: function() {
    return this.angle;
  },
  SetAngle: function(value) {
    this.angle = value;
  }
}
, playerPosition = Object.create(fakePhysBody)
, testAlien = new Alien(0, 0, 1, 1, 1);


function playerAt(x, y) {
  playerPosition.position = new Vec2(x, y);
  testAlien.updatePlayerPosition({ source: { physBody: playerPosition } });
  testAlien.physBody.angle = 0;
  testAlien.tick();
}

//Alien should face The Enemy
testAlien.physBody = Object.create(fakePhysBody);
testAlien.physBody.position = new Vec2(0,0);

//Move player to (1, 1) - 45deg NE
playerAt(1,1);
assert.equal(testAlien.physBody.angle, Math.PI / 4);

//Move player to (-1, 1) - still at 45 deg, but the other direction
playerAt(-1, 1);
assert.equal(testAlien.physBody.angle, (Math.PI * 2) - (Math.PI/4));

//Move player to (1, -1), 45 deg, down-right
playerAt(1, -1);
assert.equal(testAlien.physBody.angle, Math.PI - (Math.PI/4));

//Move player to (-1, -1), 45 deg, down-left
playerAt(-1, -1);
assert.equal(testAlien.physBody.angle, Math.PI + (Math.PI/4));

playerAt(0, 1);
assert.equal(testAlien.physBody.angle, 0);
playerAt(1, 0);
assert.equal(testAlien.physBody.angle, Math.PI / 2);
playerAt(-1, 0);
assert.equal(testAlien.physBody.angle, 3 * Math.PI / 2);
playerAt(0, -1);
assert.equal(testAlien.physBody.angle, Math.PI);
