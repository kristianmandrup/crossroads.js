module.exports = RouterSignals;

var Signals = require('../signal')

var RouterSignals = Xtender.extend(Signals, RouterSignalsStrategy);

var RouterSignalsStrategy = {
  _defaultSignalStrategy : function(signalName) {
    if (this[signalName]) {
      var args = [].slice.call(arguments, 1)
      this[signalName].dispatch(args);
    } else {
      logWarning("No signal for:" + signalName);
    }
  }
}


