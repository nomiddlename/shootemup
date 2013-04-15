// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base');

  function Explosion(position) {
    Base.call(this);
    this.position = position;
    this.currentFrame = 0;
    
    this.fireEvent("render.register", 3);
    this.on('tick', this.update);
  }
  Explosion.prototype = Object.create(Base.prototype);

  Explosion.prototype.draw = function(game) {
    var frames = game.assets['boom']
    , frameX = Math.round(Math.random() * 8) * 128
    , frameY = Math.round(this.currentFrame) * 128
    , screenX = game.translateX(game.physics.scaleToPixels(this.position.x)) - 64
    , screenY = game.translateY(game.physics.scaleToPixels(this.position.y)) - 64;
    
    game.context.drawImage(frames, frameX, frameY, 128, 128, screenX, screenY, 128, 128);
  };

  Explosion.prototype.update = function(tock) {
    this.currentFrame += 0.5;
    if (this.currentFrame > 8) {
      this.stopListening('tick');
      this.fireEvent('render.deregister', 3);
    }
  };

  return {
    create: function(position) {
      return new Explosion(position);
    }
  };
});
