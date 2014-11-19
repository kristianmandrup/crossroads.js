var RouterSignals = {
  _defaultSignalStrategy : function(signalName) {
    if (this[signalName]) {
      var args = [].slice.call(arguments, 1)
      this[signalName].dispatch(args);
    } else {
      logWarning("No signal for:" + signalName);
    }
  }
}

var RouterSignalsAble = Xtender.extend(RouterSignals, SignalsAble);
