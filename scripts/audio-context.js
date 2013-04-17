define(function(){
  return window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
});
