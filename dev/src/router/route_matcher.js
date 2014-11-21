module.exports = RouteMatcher;

var RouteMatcher = {
  _getMatchedRoutes : function (request) {
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
          if (!this._matchRoute(request, res, route)) {
            break;
          }
      }
      return res;
  },


  _matchRoute : function (request, res, route) {
    try {
      return this._attemptMatchRoute(request, res, route);
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

  _attemptMatchRoute: function(request, res, route) {
      if ((!res.length || this.greedy || route.greedy) && route.match(request)) {
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
                  route : route,
                  params : params
              });
          }
      }
      if (!this.greedyEnabled && res.length) {
          return false;
      }
      return true;
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
    return false;
  },


  handlePendingActivation : function(route, result) {
  }
}
