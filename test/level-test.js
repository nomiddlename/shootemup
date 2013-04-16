var RandomLevel = new require('./level').RandomLevel, 
level = new RandomLevel(20000),
testEvent = {
    source: {
	windowBottom: 0,
	width: 800,
	height: 600,
	translateX: function(x) { return x; },
	translateY: function(y) { return this.height - (y - this.windowBottom); },
	context: {
	    fillStyle: "meh",
	    fillRect: function(x, y, w, h) {
		//console.log("context.fillRect(x = %d, y = %d, w = %d, h = %d)", x, y, w, h);
	    }
	}
    }
};

for (var i = 0; i < 20; i++) {
    testEvent.source.windowBottom += 21.23231;
    level.draw(testEvent);
}
