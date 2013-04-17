define(function() {
  var supported = document.fullScreenEnabled || 
    document.webkitFullscreenEnabled || 
    document.mozFullScreenEnabled;

  
  return {
    addEventListener: function(cb) {
      document.addEventListener("webkitfullscreenchange", cb);
      document.addEventListener("mozfullscreenchange", cb);
      document.addEventListener("fullscreenchange", cb);
    },

    supported: supported,

    isFullScreen: function() {
      return document.fullScreen || 
        document.webkitIsFullScreen ||
        document.mozFullScreen;
    },

    cancel: function() {
      var cancel = document.cancelFullScreen ||
        document.webkitCancelFullScreen ||
        document.mozCancelFullScreen;

      cancel.call(document);
    },

    requestFullScreen: function(element) {
      var request = element.requestFullScreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullScreen;

      request.call(element);
    },

    toggle: function(element) {
      if (this.isFullScreen()) {
        this.cancel();
      } else {
        this.requestFullScreen(element);
      }
    }
  };

});
