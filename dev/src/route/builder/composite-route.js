var Xtender         = require('../../utils').Xtender;
var RouteContainer  = require('../../routable/route_container');
var RouteParser     = require('./route-parser');
PatternNormalizer   = require('../../utils').PatternNormalizer;

module.exports = Xtender.extend(RouteContainer, RouteComposer.prototype);

function RouteComposer(router) {
  this.router = router;
}

RouteComposer.prototype = {
  // For nested route only?
  addRoute : function (route_or_pattern, options) {
    var routeObj = new RouteParser(this).parse(route_or_pattern, options);
    routeObj.pattern = this.fullPattern();
    return this._addRoute(this.addRouteToRouter(routeObj));
  },

  addRouteToRouter: function(routeObj) {
    return this._router.addRoute(routeObj);
  },

  _addRoute: function(route) {
    route._parent = this;
    this._routes.push(route);

    // index routes should be matched together with parent route
    if (!route.pattern.length || route.pattern === '/')
      route.greedy = true;

    this._routeAdded(route);
  },


  fullPattern: function() {
    return this.basePattern() + this.pattern;
  },

  basePattern: function() {
    return new PatternNormalizer(this.basePattern()).normalize();
  }
};
