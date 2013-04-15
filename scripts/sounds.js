// Help Node out by setting up define.
if (typeof module === 'object' && typeof define !== 'function') {
    var define = function (factory) {
        module.exports = factory(require, exports, module);
    };
}

define(function (require, exports, module) {
  var Base = require('./base')
  , BufferLoader = require('./bufferLoader');

  function SoundEngine() {
    Base.call(this);

    this.context = new webkitAudioContext();
    this.gainNode = this.context.createGainNode();
    this.gainNode.connect(this.context.destination);
    this.playerPosition = null;

    this.sounds = {
      "pew-pew": "assets/pew.mp3",
      "bounce": "assets/JBM_Sfxr_pack_1/samples/collect/collect01.wav",
      "boom": "assets/sounds/explosions/6.wav",
      "thrust": "assets/thrust.mp3"
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
    var volume = 0
    , distance
    , position = soundPosition.Copy();
    
    if (this.playerPosition) {
      position.Subtract(this.playerPosition);
      distance = position.Length();
      
      if (distance > 30) {
        volume = 0;
      } else {
        volume = 1 - (distance/30);
      }
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

  return SoundEngine;
});
