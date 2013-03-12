function RandomLevel(size) {
  this.size = size;
  this.tileWidth = 100;
  this.tileHeight = 100;
  this.columns = 800 / this.tileWidth; //dodgy hard-coding
  this.rows = this.size / this.tileHeight;
  this.tiles = [];
  
  for (var y = 0; y < this.rows; y++) {
    var row = [];
    for (var x = 0; x < this.columns; x++) {
      row.push((y * this.tileHeight) % 256);  
    }
    this.tiles.push(row);
  }

  this.on("render", this.draw);
}
RandomLevel.prototype = Base.prototype;

RandomLevel.prototype.draw = function(event) {
  var level = this, game = event.source,
  startRow = Math.floor((game.windowBottom / this.tileHeight)),
  endRow = Math.ceil(Math.min(startRow + (game.height / this.tileHeight) + 1, level.tiles.length -1)),
  offsetY = game.windowBottom % this.tileHeight;
  for (var row = startRow; row <= endRow; row++) {
    var posY = game.translateY((row * level.tileHeight));
    level.tiles[row].forEach(function(column, index) {
      var posX = game.translateX(index * level.tileWidth);
      game.context.fillStyle = "rgb(0," + column + ",0)";
      game.context.fillRect(posX, posY, level.tileWidth, level.tileHeight);
    });
  }
};

//support for loading as node.js module, for testing
if (typeof(module) !== 'undefined') {
  exports.RandomLevel = RandomLevel;
}
