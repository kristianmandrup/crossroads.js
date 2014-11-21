module.exports = SignalHelper;

// createSignal(), _isSignalDelegate(delegate), _delegateSignal(signalName, delegate, args)
// _isActiveSignal(), _canDispatch(), _dispatch(signalName, ...)

if (Signal) {
  Signal.prototype.isActive = function() {
    return this.active && this.getNumListeners() > 0;
  }
}

var SignalHelper = {
  _isSignalDelegate: function(delegate) {
    if (!delegate)
      return false;

    var receiver = delegate._defaultSignalStrategy;
    return receiver && typeof receiver == 'function';
  },

  _delegateSignal: function(signalName, delegate, args) {
    if (_isSignalDelegate(delegate)) {
      delegate._defaultSignalStrategy(signalName, args);
      return true;
    }
    return false;
  },

  _isActiveSignal: function(signal) {
    return signal && signal.isActive();
  },

  _canDispatch: function(signalName) {
    return this._isActiveSignal(signalName);
  },

  _dispatch: function(signalName /*, args */) {
    if (this._canDispatch(signalName)) {
      var signal = this[signalName];
      var args = [].slice.call(arguments, 1);
      signal.dispatch(args);
    }
  }
}
