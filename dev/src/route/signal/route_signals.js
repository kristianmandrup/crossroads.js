module.exports = RouteSignalsAble;

var RouteSignals = {
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

var RouteSignalHelper = require('./route_signal_helper');
var SignalsAble       = require('../../signal').SignalsAble;

var RouteSignalsAble = Xtender.extend(RouteSignals, RouteSignalHelper, SignalsAble);


