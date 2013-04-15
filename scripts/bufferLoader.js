// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  //taken from http://www.html5rocks.com/en/tutorials/webaudio/intro/
  //messed about with a bit by me, though.
  function BufferLoader(context, soundMap, callback) {
    this.context = context;
    this.soundMap = soundMap;
    this.loadedSounds = {};
    this.onload = callback;
    this.loadCount=0;
    this.totalSoundsToLoad = Object.keys(this.soundMap).length;
  }

  BufferLoader.prototype.loadBuffer = function(soundName, url) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    var loader = this;
    request.onload = function(){ 
      loader.context.decodeAudioData(
        request.response,
        function(buffer) { 
          if (!buffer) { 
            console.error('error decoding file data: ' + url); 
            return; 
          }
          loader.loadedSounds[soundName] = buffer;
          if (++loader.loadCount == loader.totalSoundsToLoad) {
            loader.onload(loader.loadedSounds);
          }
        },
        function(error) { console.error('decodeAudioData error',error); }
      );
    };
    request.onerror = function() { console.error('BufferLoader: XHR error'); }
    request.send();
  };

  BufferLoader.prototype.load = function() {
    var self = this;
    Object.keys(this.soundMap).forEach(function(soundName) {
      self.loadBuffer(soundName, self.soundMap[soundName]);
    });
  };

  return BufferLoader;
});
