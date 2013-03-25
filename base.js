/**
 * Base object for all game items to use as prototype.
 * Provides event handling functions.
 */
function Base() {
}
Base.prototype.listeners = {};

Base.prototype.on = function(eventType, listener) {
  if (!this.listeners[eventType]) {
    this.listeners[eventType] = [];
  }
  this.listeners[eventType].push(listener.bind(this));
};

Base.prototype.stopListening = function(eventType, listener) {
  this.listeners[eventType] = this.listeners[eventType].filter(function(item) { return listener === item; });
};

Base.prototype.fireEvent = function(eventType, data) {
  var self = this;
  if (this.listeners[eventType]) {
    this.listeners[eventType].forEach(function(listener) {
      if (listener) {
        listener.call(null, { source: self, data: data });
      }
    });
  }
};

