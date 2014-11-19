var RouteActivator = {
  activate : function(request) {
    this.willActivate(request);
    if (this.canActivate(request)) {
      return this.doActivate(request);
    } else {
      return this.cannotActivate(request)
    }
  },

  willActivate : function(request) {
  },

  doActivate : function(request) {
    this.active = true;
    this.didActivate(request);
  },

  didActivate: function(request) {
    this._defaultSignalStrategy('wasActivated', request);
  },

  canActivate: function(request) {
    this._defaultSignalStrategy('couldActivate', request);
    return true;
  },

  // triggered when not permitted to activate
  cannotActivate: function(request) {
    this._defaultSignalStrategy('couldntActivate', request);
  },

  // TODO: signal
  deactivate : function() {
    this.deactivated();
  },

  deactivated : function() {
    this.active = false;
    this._defaultSignalStrategy('wasDeactivated', this);
  }
}
