module.exports = RouteComposer;

var RouteComposer = {

  addRoute : function (route_or_pattern, options_or_handler, priority) {
      var isRouteLike = typeof route_or_pattern == 'object' && route_or_pattern._pattern;

      if (isRouteLike) {
        return this.addRoute(route_or_pattern._pattern, route_or_pattern._handler, route_or_pattern._priority);
      }
      var pattern = route_or_pattern;
      var callback = options_or_handler;
      if (options_or_handler && typeof options_or_handler == 'object') {
        callback = options_or_handler.handler;
        priority =  options_or_handler.priority;
      }

      var route = new RouteClass(pattern, callback, priority, this);
      this._sortedInsert(route);
      this._routeAdded(route);
      return route;
  },

  // can be used to add all routes of a Router or an Array of routes
  // Note: Routes can be added in reverse order!
  addRoutes : function (routable, options) {
      options = options || {reverse: true}
      var self = this;
      var routes = [];
      if (typeof routable.getRoutes == 'function') {
          routes = routable.getRoutes();
      }
      var arrayLike = typeof routable == 'object' && routable.length;
      if (routable instanceof Array || arrayLike) {
        routes = routable;
      }
      routesClone = Array.prototype.slice.call(routes);
      routes = options.reverse ? routesClone.reverse() : routesClone;
      routes.forEach(function(route) {
        var clonedRoute = Object.create(route);
        self.addRoute(clonedRoute);
      });
      return routes;
  },

  _sortedInsert : function (route) {
      //simplified insertion sort
      var routes = this._routes,
          n = routes.length;
      do { --n; } while (routes[n] && route._priority <= routes[n]._priority);
      routes.splice(n+1, 0, route);
  }
}
