if (Signal) {
  Signal.prototype.isActive = function() {
    return this.active && this.getNumListeners() > 0;
  }
}

var RouteSignals = {
  createSignal: function() {
    return new signals.Signal();
  },

  _signals: ['matched', 'switched', 'couldntSwitch', 'couldntActivate', 'routeWasAdded'],

  configureSignals: function(callback) {
    for (signal in this._signals) {
      this[signal] = this.createSignal();
    }
      
    if (callback) {
        if (typeof callback !== 'function') {
          throw Error("Route callback must be a function, was:" + typeof callback);
        }
        this.matched.add(callback);
        this._handler = callback;
    }
  }
}
