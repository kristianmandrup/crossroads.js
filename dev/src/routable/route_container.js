module.export = RouteContainer;

// Can be used by any class which contains routes, such as a composite route or a router

// getRoutes(), getNumRoutes(), getRoutesBy(properties), addRoutes(routeContainer, options)

var RoutesList = require('../util').RoutesList;

var RouteContainer = {

  _routeSignals: ['routeWasAdded', 'routeWasRemoved'],

  getRoutes: function() {
    return this._routes || [];
  },

  getNumRoutes : function () {
    return this.getRoutes().length;
  },

  getRoutesBy : function (properties) {
    properties = properties || ['name', 'pattern', 'priority', 'greedy', 'paramsIds', 'optionalParamsIds'];
    if (typeof properties == 'string') {
      properties = [properties];
    }
    if (arguments.length > 1)
      properties = [].slice.call(arguments);

    var routesList = new RoutesList(this.getRoutes());
    return routesList.map(function(route) {
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
  addRoutes : function (routeContainer, options) {
    options = options || {};
    var transformer = options.transformer;
    var self = this;
    var routes = [];
    if (typeof routeContainer.getRoutes == 'function') {
      routes = routeContainer.getRoutes();
    }
    var arrayLike = typeof routeContainer == 'object' && routeContainer.length;
    if (routeContainer instanceof Array || arrayLike) {
      routes = routeContainer;
    }
    routes = typeof transformer == 'function' ? transformer(routes) : routes;

    routes.forEach(function(route) {
      var clonedRoute = Object.create(route);
      self.addRoute(clonedRoute);
    });
    return routes;
  },

  removeRoute : function (route) {
    arrayRemove(this._routes, route);
    route._destroy();
    this._routeRemoved(route);
  },

  removeAllRoutes : function () {
    var n = this.getNumRoutes();
    while (n--) {
      this._routes[n]._destroy();
    }
    this._routes.length = 0;
  },

  // here you can do some extra stuff
  // You could f.ex always mount a loading route on the route...
  // or whatever you please
  _routeAdded:  function(route) {
    this._dispatch('routeWasAdded', route);
  },

  _routeRemoved:  function(route) {
    this._dispatch('routeWasRemoved', route);
  }
};
