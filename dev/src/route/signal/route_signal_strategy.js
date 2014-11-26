module.exports = RouteSignalHelper;

var RouteSignalHelper = {
  _defaultSignalStrategy : function(signalName, request) {
    var args = this._defaultSignalArgs(request)
    if (this._canDispatch(signalName)) {
      this._dispatch(signalName, args);
      return true;
    }
    if (this._parent) {
      _delegateSignal(signalName, this._parent, args);
    } else {
      _delegateSignal(signalName, this._router, args);
    }
  },

  _defaultSignalArgs: function(request) {
    var arg = {route: route};
    if (request)
      arg[request] = request;
    return arg
  }
}
