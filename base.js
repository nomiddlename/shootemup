/**
 * Base object for all game items to use as prototype.
 * Provides event handling functions.
 */
function Base() {
  this.actions = {};
}
Base.prototype.listeners = [];

Base.prototype.on = function(eventType, listener) {
  if (this.listeners.indexOf(this) === -1) {
    this.listeners.push(this);
  }
  this.actions[eventType] = listener;
};

Base.prototype.stopListening = function(eventType) {
  var self = this;
  if (eventType) {
    this.actions[eventType] = null;
  } else {
    this.listeners = this.listeners.filter(function(item) { return item === self; });
  }
};

Base.prototype.fireEvent = function(eventType, data) {
  var self = this;
  this.listeners.forEach(function(listener) {
    if (listener.actions[eventType]) {
      listener.actions[eventType].call(listener, { source: self, data: data });
    }
  });
};

