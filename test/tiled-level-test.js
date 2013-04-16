var assert = require('assert')
, TiledLevel = require('../scripts/tiled-level')
, game = {
  _drawArgs: []
  , width: 50
  , height: 50
  , windowX: 10
  , windowY: 10
  , assets: { "test": "correct", "city.jpg": "correct" }
  , translateX: function(value) { return "x"; }
  , translateY: function(value) { return "y"; }
  , isOnScreen: function() { return true; }
  , context: {
    drawImage: function() { game._drawArgs.push(Array.prototype.slice.call(arguments)); }
  }
}
, config
, level;

//simple config - single 1x2 image, 3x3 level
config = {
  width: 3,
  height: 3,
  tilewidth: 32,
  tileheight: 32,
  layers: [
    {
      data: [
        1, 2, 1, 2, 1, 2, 1, 2, 1
      ]
    }
  ],
  tilesets: [
    {
      image: "test",
      imagewidth: 64,
      imageheight: 32
    }
  ]
};

level = new TiledLevel(config);
level.draw(game);

assert.equal(9, game._drawArgs.length);
game._drawArgs.forEach(function(args, i) {
  assert.equal("correct", args[0]);
  assert.equal(config.layers[0].data[i] === 1 ? 0 : 32, args[1]);
  assert.equal(0, args[2]);
  assert.equal(32, args[3]);
  assert.equal(32, args[4]);
  assert.equal("x", args[5]);
  assert.equal("y", args[6]);
  assert.equal(32, args[7]);
  assert.equal(32, args[8]);
});

//now try a bigger tileset, still small map though
config = {
  width: 3,
  height: 1,
  tilewidth: 32,
  tileheight: 32,
  layers: [
    {
      data: [
        177, 176, 175
      ]
    }
  ],
  tilesets: [
    {
      image: "test",
      imagewidth: 423, //13 tiles per row
      imageheight: 600
    }
  ]
};

level = new TiledLevel(config);

//tile no. 177 should be 177 / 13 = 13 rem 8
assert.equal(7*32, level.getTileInfo(177).x);
assert.equal(13*32, level.getTileInfo(177).y);

game._drawArgs = [];
//now test drawing them all
level = new TiledLevel(require('../assets/city.json'));
level.draw(game);
//console.log(game._drawArgs);
assert.equal(100*100, game._drawArgs.length);
//just going to check that we never pass undefined, or NaN
game._drawArgs.forEach(function(args, i) {
  args.forEach(function(arg, j) {
    assert.ok(arg || arg === 0, "_drawArgs[" + i +"][" + j + "] = " + arg);
  });
});
