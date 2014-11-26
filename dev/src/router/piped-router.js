module.exports = PipedRouter;

// _pipeParse(request, defaultArgs), pipe(otherRouter), unpipe(otherRouter), getPipedRouters()

function PipedRouter(router) {
  this.router = router;
  this._piped = router._piped;
}

PipedRouter.prototype = {
  _pipeParse : function(request, defaultArgs) {
    var i = 0, route;
    while (route = this._piped[i++]) {
      route.parse(request, defaultArgs);
    }
  },

  getPipedRouters: function() {
    return this._piped;
  },

  // parent router where the Router is piped from
  getParent: function() {
    return this.router._parent;
  }
};



