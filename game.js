(function(window, document) {
  var context, canvasWidth, canvasHeight, player;

  window.onload = function() {
    var canvas = document.getElementById('theCanvas');
    context = canvas.getContext('2d');
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    player = new Player({
      speedX: 200, //in pixels per second?
      speedY: 200,
      posX: 300,
      posY: 50,
      width: 50,
      height: 50
    });

    console.log("Document loaded. Screen size is ", canvasWidth, 'x', canvasHeight);
    mainLoop();
  };

  function mainLoop(time) {
    var delta = time - lastTime;
    window.requestAnimationFrame(mainLoop);
    player.tick(delta);
    render();
  }

  function render() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    
    drawBackground();
    player.draw(context);
  }

})(window, document);
