function RandomLevel(size) {
  this.size = size;
  this.tileWidth = 100;
  this.tileHeight = 100;
  this.columns = 800 / this.tileWidth; //dodgy hard-coding
  this.rows = this.size / this.tileHeight;
  this.tiles = [];
  
  this.actions = {};
  this.listeners = [];
 
  for (var y = 0; y < this.rows; y++) {
    var row = [];
    for (var x = 0; x < this.columns; x++) {
      row.push(Math.round((Math.sin(y / 8) + 1) * 128.0));  
    }
    this.tiles.push(row);
  }

  this.on("render", this.draw);
}

RandomLevel.prototype.draw = function(event) {
  var level = this, game = event.source,
  startRow = Math.round((game.windowBottom / this.tileHeight)),
  endRow = Math.round(Math.min(startRow + (game.height / this.tileHeight) + 1, level.tiles.length -1)),
  offsetY = game.windowBottom % this.tileHeight;
//  console.log("StartRow %d, EndRow %d, offsetY %d", startRow, endRow, offsetY);
  for (var row = startRow; row <= endRow; row++) {
    level.tiles[row].forEach(function(column, index) {
      var posY = game.translateY((row * level.tileHeight) + offsetY), 
      posX = game.translateX(index * level.tileWidth);
      game.context.fillStyle = "rgb(0," + column + ",0)";
      game.context.fillRect(posX, posY, level.tileWidth, level.tileHeight);
    });
  }
};

RandomLevel.prototype.listen = function(listener) {
  this.listeners.push(listener);
};

RandomLevel.prototype.fireEvent = function(eventType, data) {
  var self = this;
  this.listeners.forEach(function(listener) {
    listener.receive(eventType, { source: self, data: data });
  });
};

RandomLevel.prototype.receive = function(eventType, event) {
  if (this.actions[eventType]) {
    this.actions[eventType].call(this, event);
  }
};

RandomLevel.prototype.on = function(eventType, cb) {
  this.actions[eventType] = cb;
};

