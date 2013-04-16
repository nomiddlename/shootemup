// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base');

  function AssetLoader(assetsToLoad) {
    Base.call(this);
    this.loadAssets(assetsToLoad);
  }
  AssetLoader.prototype = Object.create(Base.prototype);

  AssetLoader.prototype.loadAssets = function(assetsToLoad) {
    var self = this
    , numberLoaded = 0
    , assets = {};
    
    assetsToLoad.forEach(function(asset) {
      var image = new Image();
      image.onload = function() {
        assets[asset.name] = image;
        numberLoaded += 1;
        if (numberLoaded >= assetsToLoad.length) {
          self.fireEvent("assets.loaded", assets);
        }
      };
      image.src = asset.file;
    });

  };
  
  return AssetLoader;
});
