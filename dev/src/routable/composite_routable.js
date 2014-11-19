var CompositeRoutable = function() {
}

CompositeRoutable.prototype = {
  // TODO: put in base class or mixin (Composite pattern)
  getRoutes : function () {
      return this._routes;
  },

  // TODO: put in base class or mixin (Composite pattern)
  getRoutesBy : function (properties) {
      properties = properties || ['pattern', 'priority', 'greedy', 'paramsIds', 'optionalParamsIds'];
      if (typeof properties == 'string') {
        properties = [properties];
      }
      if (arguments.length > 1)
        properties = [].slice.call(arguments);

      var routes = this.getRoutes().map(function(route) {
        var routeObj = {}
        properties.forEach(function(prop) {
          var propVal = route['_' + prop]
          if (!!propVal && !(propVal instanceof Array && propVal.length === 0))
            routeObj[prop] = propVal;
        })
        return routeObj;
      });

      return routes;
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
      routes = if typeof transformer == 'function' ? transformer(routes) : routes;

      routes.forEach(function(route) {
        var clonedRoute = Object.create(route);
        self.addRoute(clonedRoute);
      });
      return routes;
  },

  getRoutes: function() {
      return this._routes || [];
  },

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
      this.routes = this._routes || [];
      this._routes.push(route);

      // index routes should be matched together with parent route
      if (!pattern.length || pattern === '/')
          route.greedy = true;

      this.routeAdded(route);
      return route;
  },

  // here you can do some extra stuff
  // You could f.ex always mount a loading route on the route...
  // or whatever you please
  routeAdded: : function(route) {
    this.routeWasAdded.dispatch(route);
  },

  _selfAndAncestors : function() {
      var parent = this;
      var collect = [this];
      while (parent = parent._parent) {
          collect.push(parent);
      }
      return collect;
  }
}
