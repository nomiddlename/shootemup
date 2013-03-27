function SoundEngine() {
  Base.call(this);

  this.context = new webkitAudioContext();
  this.sounds = {
    "pew-pew": "assets/zander-noriega-scifi-vol-1/laser_gun_2.wav"
  };
  this.soundBuffers = {};
  this.loadSounds();

  this.on("sounds", this.playSound);
}
SoundEngine.prototype = Object.create(Base.prototype);

SoundEngine.prototype.playSound = function(event) {
  var soundName = event.data, source;
  if (this.soundBuffers[soundName]) {
    source = this.context.createBufferSource();
    source.buffer = this.soundBuffers[soundName];
    source.connect(this.context.destination);
    source.noteOn(0);
  }
};

SoundEngine.prototype.loadSounds = function() {
  var bufferLoader = new BufferLoader(
    this.context,
    this.sounds,
    this.createSoundBuffers.bind(this)
  );

  bufferLoader.load();
};

SoundEngine.prototype.createSoundBuffers = function(loadedSounds) {
  this.soundBuffers = loadedSounds;
};

//taken from http://www.html5rocks.com/en/tutorials/webaudio/intro/
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
