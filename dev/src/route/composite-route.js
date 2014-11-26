var Xtender         = require('../utils').Xtender;
var RouteContainer  = require('../routable/route_container');
var RouteParser     = require('./route-parser');

var CompRoute = {
  // For nested route only?
  addRoute : function (route_or_pattern, options) {
    var routeObj = new RouteParser().parse(route_or_pattern, options);

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

var CompositeRoute = Xtender.extend(RouteContainer, CompRoute);
module.exports = CompositeRoute;
