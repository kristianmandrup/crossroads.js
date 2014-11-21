module.export = RouteContainer;

// Can be used by any class which contains routes, such as a composite route or a router

var RouteContainer = {

  getRoutes : function () {
    return this._routes;
  },

  getRoutesBy : function (properties) {
    properties = properties || ['pattern', 'priority', 'greedy', 'paramsIds', 'optionalParamsIds'];
    if (typeof properties == 'string') {
      properties = [properties];
    }
    if (arguments.length > 1)
      properties = [].slice.call(arguments);

    return this.getRoutes().map(function(route) {
      var routeObj = {};
      properties.forEach(function(prop) {
        var propVal = route['_' + prop];
        if (!!propVal && !(propVal instanceof Array && propVal.length === 0))
          routeObj[prop] = propVal;
      });
      return routeObj;
    });

  },

  // can be used to add all routes of a Router or an Array of routes
  // Note: Routes can be transformed before being added!
  addRoutes : function (routable, transformer, options) {
    var self = this;
    var routes = [];
    if (typeof routable.getRoutes == 'function') {
      routes = routable.getRoutes();
    }
    var arrayLike = typeof routable == 'object' && routable.length;
    if (routable instanceof Array || arrayLike) {
      routes = routable;
    }
    routes = typeof transformer == 'function' ? transformer(routes) : routes;

    routes.forEach(function(route) {
      var clonedRoute = Object.create(route);
      self.addRoute(clonedRoute);
    });
    return routes;
  },

  getRoutes: function() {
    return this._routes || [];
  }
};
