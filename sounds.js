function SoundEngine() {
  Base.call(this);

  this.context = new webkitAudioContext();
  this.gainNode = this.context.createGainNode();
  this.gainNode.connect(this.context.destination);
  this.playerPosition = null;

  this.sounds = {
    "pew-pew": "assets/zander-noriega-scifi-vol-1/laser_gun_2.wav",
    "bounce": "assets/JBM_Sfxr_pack_1/samples/collect/collect01.wav",
    "boom": "assets/JBM_Sfxr_pack_1/samples/explosions/small/explosion-1.wav"
  };
  this.soundBuffers = {};
  this.loadSounds();

  this.on("sounds", this.playSound);
  this.on("player.move", this.updatePlayerPosition);
}
SoundEngine.prototype = Object.create(Base.prototype);

SoundEngine.prototype.playSound = function(event) {
  var soundName = event.data.name
  , position = event.data.position
  , volume = this.volumeByDistance(position)
  , source;

  if (this.soundBuffers[soundName]) {
    source = this.context.createBufferSource();
    source.buffer = this.soundBuffers[soundName];
    source.connect(this.gainNode);
    this.gainNode.gain.value = volume;
    source.noteOn(0);
  }
};

SoundEngine.prototype.updatePlayerPosition = function(event) {
  if (event.source.physBody) {
    this.playerPosition = event.source.physBody.GetPosition();
  }
};

SoundEngine.prototype.volumeByDistance = function(soundPosition) {
  var volume, distance, position = soundPosition.Copy();
  position.Subtract(this.playerPosition);
  distance = position.Length();
  
  if (distance > 30) {
    volume = 0;
  } else {
    volume = 1 - (distance/30);
  }

  return volume;
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
