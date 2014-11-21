module.exports = RouteSwitcher;

var RouteSwitcher = {
  switch: function(request) {
    this.willSwitch(request);
    if (this.canSwitch(request)) {
      this.doSwitch(request);
    } else {
      this.cannotSwitch(request);
    }
  },

  willSwitch : function(request) {
  },

  canSwitch: function(request) {
    this._defaultSignalStrategy('couldSwitch', request);
    return true;
  },

  doSwitch: function(request) {
    this.switched.dispatch(request);
    this.didSwitch();
  },

  // triggered when not permitted to switch
  cannotSwitch: function(request) {
    this._defaultSignalStrategy('couldntSwitch', request);
  },

  didSwitch: function(request) {
    this._defaultSignalStrategy('wasSwitched', request);
  }
}
