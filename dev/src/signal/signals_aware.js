var SignalHelper = require('./signal_helper');

var SignalsAware = {

  configureSignals: function() {
      if (!(this._signals instanceof Array) {
        throw Error('Any SignalsAware class should have an array of Signals in ._signals')
      }

      for (signal in this._signals) {
        this[signal] = this.createSignal();
      }
  }
}

var SignalsAble = Xtender.extend(SignalsAware, SignalHelper);
