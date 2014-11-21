module.exports = Signals;

// _configureSignals()

var SignalsAware = {
  _configureSignals: function() {
      if (!(this._signals instanceof Array)) {
        throw Error('Any SignalsAware class should have an array of Signals in ._signals')
      }

      for (signal in this._signals) {
        this[signal] = this.createSignal();
      }
  }
};

