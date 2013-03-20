/**
 * Base object for all game items to use as prototype.
 * Provides event handling functions.
 */
function Base() {
    this.listeners = [];
    this.actions = {};
}

Base.prototype.listen = function(listener) {
  this.listeners.push(listener);
};

Base.prototype.fireEvent = function(eventType, data) {
  var self = this;
  this.listeners.forEach(function(listener) {
    listener.receive(eventType, { source: self, data: data });
  });
};

Base.prototype.receive = function(eventType, event) {
  if (this.actions[eventType]) {
    this.actions[eventType].call(this, event);
  }
};

Base.prototype.on = function(eventType, cb) {
  this.actions[eventType] = cb;
};

