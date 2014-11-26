module.exports = RouteController;

function RouteController(router, route) {
  this.router = router;
  this.route = route;
}

var RequestParser = require('./router/request-parser');
var RouteMatcher  = require('./router/route-matcher');


RouteController.prototype = {
  getParamsArray: function(x) {
    return this.route.getParamsArray(this.request, x);
  },

  isPending: function() {

  },

  handlePendingActivation: function() {

  },

  isGreedy: function() {
    return this.router.greedy || this.route.greedy;
  },

  matchesRoute: function() {
    return (!res.length || this.isGreedy()) && this.matchRoute();
  },

  match: function(request) {
    // TODO: pass result!?
    this.request = request;
    var router = this.router;

    if (this.matchesRoute()) {
      return this.xyz();
    }
  },

  xyz: function() {
    var route = this.route;
    var i = this.ancestors().length;
    // TODO: better loop
    while (this.route = this.ancestors()[--i]) {
      if (route.isActive()) {
        continue;
      }

      var activateResult = this.activateRoute();
      if (this.isPending(activateResult)) {
        this.handlePendingActivation(route, activateResult);
      }
      result.add(route, params);
    }
  },

  ancestors: function() {
    return this.route._selfAndAncestors();
  },

  params: function() {
    return this.getParamsArray().splice(0, this.consume());
  },

  consume: function() {
    return this.getParamsArray(true).length;
  },


  activateRoute: function() {
    this.route.active = true; // WHY!?
    this.route.activate(this.request)
  },


  addResult: function(route, params) {
  },


  matchRoute: function() {
    this.routeMatcher(this.request).match();
  },

  requestParser: function() {
    return new RequestParser(this.request, this.routeMatcher());
  },

  routeMatcher: function() {
    return new RouteMatcher(this.request);
  }
};

var baseController = require('./base-controller');

RouteController.prototype = extend(RouteController.prototype, baseController);