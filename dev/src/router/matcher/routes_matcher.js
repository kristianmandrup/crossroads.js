module.exports = RouteMatcher;

// _getMatchedRoutes(request), _matchRoute(request, res, route), _attemptMatchRoute(request, res, route)
// _isPending(activateResult), handlePendingActivation(route, result)

// depends on RequestParser

var RequestParser = require('./request_parser');
var Xtender = require('../../utils').Xtender;

RouteMatcher = Xtender.extend(RequestParser, RouteMatcher);

function RouteMatcher(request) {
  this.request = request;
}

RouteMatcher.prototype = {
  transaction: function(router, mainLoop) {
    this.activeRouter = router;
    mainLoop();
    this.activeRouter = null;
  },

  _getMatchedRoutes : function () {
    var res = [],
        routes = this._routes,
        n = routes.length,
        route;

    while (route = routes[--n]) {
        route.active = false;
    }

    //should be decrement loop since higher priorities are added at the end of array
    n = routes.length;
    while (route = routes[--n]) {
        if (!this._matchRoute(res, route)) {
          break;
        }
    }
    return res;
  },


  _matchRoute : function (res, route) {
    try {
      return this._attemptMatchRoute(res, route);
    }
    // if an error occurs during routing, we fire the routingError signal on this route
    catch (error) {
      // The routingError handler will be called with:
      // - the request being routed on
      // - route where routing error occurred
      // - error object

      // Error handling Strategies:
      // if the route is a nested route..
      // The error handler can choose to call routingError handlers
      // up the hierarchy of parent routes
      // who can then choose to do whatever, such as setting some error state which triggers
      // the view/component to indicate the error
      this._logError('Parsing error', error);
      this.routingError.dispatch(this.routingError, {request: request, route: route, error: error});
    }
  },

  _attemptMatchRoute: function(res, route) {
    var request = this.request;
    // pass in current router for route.match so it can use the router.baseRoute
    // run as transaction inside RouteController
    var res = new RouteController(route).match(request);
    return (!this.greedyEnabled && res.length) ? false : true;
  },

  _selfAndAncestors : function() {
    var parent = this;
    var collect = [this];
    while (parent = parent._parent) {
      collect.push(parent);
    }
    return collect;
  },

  _isPending: function (activateResult) {
    if (typeof activateResult === 'object') {
      return activateResult.pending ? true : false;
    }
    return false;
  },

  handlePendingActivation : function(route, result) {
    console.log('Pending route activation:', route.name, result);
  }
}
