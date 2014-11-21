module.exports = RouteSignals;

var RouteSignalHelper = require('./route_signal_helper');
var SignalsAble       = require('../../signal').SignalsAble;

var RouteSignals = Xtender.extend(RouteSignalsContainer, RouteSignalHelper, SignalsAble);

// _configureSignals(callback)

var RouteSignalsContainer = {
  _signals: ['matched', 'switched', 'couldntSwitch', 'couldntActivate'],

  _configureSignals: function(callback) {
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
};



