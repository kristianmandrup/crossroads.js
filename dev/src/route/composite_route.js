module.exports = CompositeRoute;

var Xtender = require('../utils').Xtender;

var RouteContainer = require('../routable/route_container');

var CompositeRoute = Xtender.extend(RouteContainer, CompRoute);

var CompRoute = {
  // For nested route only?
  addRoute : function (route_or_pattern, options_or_handler, priority) {
      var isRouteLike = typeof route_or_pattern == 'object' && route_or_pattern._pattern;

      if (isRouteLike) {
        return this.addRoute(route_or_pattern._pattern, route_or_pattern._handler, route_or_pattern._priority);
      }
      var pattern = route_or_pattern;

      var handler = options_or_handler;
      if (options_or_handler && typeof options_or_handler == 'object') {
        handler = options_or_handler.handler;
        priority =  options_or_handler.priority;
      }

      var basePattern = this._pattern,
          route;

      if (!pattern || typeof pattern === 'function') {
          priority = handler;
          handler = pattern;
          pattern = '';
      }

      if (basePattern[basePattern.length-1] === '/')
          basePattern = basePattern.slice(0, -1);
      if (pattern[0] !== '/')
          basePattern = basePattern + '/';

      route = this._router.addRoute(basePattern + pattern, handler, priority);
      route._parent = this;
      this._routes.push(route);

      // index routes should be matched together with parent route
      if (!pattern.length || pattern === '/')
          route.greedy = true;

      this._routeAdded(route);
      return route;
  }
};
