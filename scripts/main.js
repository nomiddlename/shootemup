requirejs.config({
  shim: {
    'box2d': {
      exports: 'Box2D'
    }
  }
});
       
require(
  ['domReady!', 'requestAnimationFrame', 'fullscreen', 'game'], 
  function(document, requestAnimationFrame, fullscreen, Game) {
    var game = new Game()
    , lastTime = Date.now()
    , canvas = document.getElementById('theCanvas');

    game.setCanvas(canvas);

    document.addEventListener("keydown", game.handleKeys.bind(game));
    document.addEventListener("keyup", game.handleKeys.bind(game));
    fullscreen.addEventListener(game.resize.bind(game));

    (function mainLoop() {
      var now = Date.now(), delta = now - lastTime;
      lastTime = now;
      requestAnimationFrame(mainLoop);
      game.tick(delta);
      game.physics.updateWorld();
      game.render();
    })();

  }
);
