// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , Vec2 = require('./box2d').Common.Math.b2Vec2;

  function clamp(thing, min, max) {
    return Math.min(max, Math.max(thing, min));
  }

  function Camera(width, height, scale) {
    Base.call(this);
    this.width = width;
    this.height = height;
    this.hwidth = width / 2;
    this.hheight = height / 2;
    this.centreX = this.hwidth;
    this.centreY = this.hheight;
    this.scale = scale || 30;
    this.bounds = {
      bottom: 0,
      left: 0,
      right: 1000,
      top: 1000
    };
    
    this.on("boundary.pixels", this.setBounds);
    this.on("player.move", this.updatePosition);
  };
  Camera.prototype = Object.create(Base.prototype);

  Camera.prototype.setBounds = function(event) {
    this.bounds = event.data;
    this.fireEvent("boundary.world", {
      bottom: this.scaleToWorld(this.bounds.bottom),
      left: this.scaleToWorld(this.bounds.left),
      top: this.scaleToWorld(this.bounds.top),
      right: this.scaleToWorld(this.bounds.right)
    });
  };
  
  Camera.prototype.updatePosition = function(event) {
    this.centreX = this.scaleToPixels(event.source.physBody.GetPosition().x);
    this.centreY = this.scaleToPixels(event.source.physBody.GetPosition().y);

    this.centreX = clamp(
      this.centreX, 
      this.bounds.left + this.hwidth, 
      this.bounds.right - this.hwidth
    );
    this.centreY = clamp(
      this.centreY, 
      this.bounds.bottom + this.hheight, 
      this.bounds.top - this.hheight
    );
  };

  Camera.prototype.scaleToWorld = function(valueInPx) {
    return valueInPx / this.scale;
  };

  Camera.prototype.scaleToPixels = function(valueInWorld) {
    return valueInWorld * this.scale;
  };

  Camera.prototype.translateX = function(gamePosX, parallax) {
    parallax = parallax || 1.0;
    return Math.round(gamePosX - ((this.centreX - this.hwidth) * parallax));
  };

  Camera.prototype.translateY = function(gamePosY, parallax) {
    parallax = parallax || 1.0;
    return Math.round(gamePosY - ((this.centreY - this.hheight) * parallax));
  };

  /**
   * gameX, gameY, width, height are all in pixels
   */
  Camera.prototype.isOnScreen = function(gameX, gameY, width, height, parallax) {
    var posX = this.translateX(gameX, parallax)
    , posY = this.translateY(gameY, parallax);

    if (!height) {
      height = width;
    }
    return (posX + width > 0)
      && (posX - width < this.width)
      && (posY + height > 0)
      && (posY - height < this.height);
  };

  Camera.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;
    this.hwidth = width / 2;
    this.hheight = height / 2;
  };

  return Camera;
});
