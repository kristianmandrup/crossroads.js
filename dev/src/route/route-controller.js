module.exports = RouteController;

function RouteController(router, route) {
  this.router = router;
  this.route = route;
}

var RequestParser = require('./router/request-parser');
var RouteMatcher  = require('./router/route-matcher');

RoutingController.prototype = {

  match: function(request) {
    var router = this.router;

    if ((!res.length || router.greedy || route.greedy) && matchRoute(request)) {
      var allParams = route._getParamsArray(request),
        ancestors = route._selfAndAncestors();

      var i = ancestors.length;
      while (route = ancestors[--i]) {
        var consume = route._getParamsArray(request, true).length;
        var params = allParams.splice(0, consume);
        if (route.active) {
          continue;
        }

        route.active = true;
        var activateResult = route.activate(request);
        if (this._isPending(activateResult)) {
          this.handlePendingActivation(route, activateResult);
        }

        res.push({
          route: route,
          params: params
        });
      }
      return res;
    }
  },

  matchRoute: function(request) {
    this.routeMatcher(request).match();
  },

  requestParser: function() {
    return new RequestParser(this.request, this.routeMatcher());
  },

  routeMatcher: function() {
    return new RouteMatcher(this.request);
  }
};

