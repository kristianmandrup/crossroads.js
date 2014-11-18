
    // Crossroads --------
    //====================

    /**
     * @constructor
     */
    function Crossroads(name) {
        this.bypassed = new signals.Signal();
        this.routed = new signals.Signal();
        this.routingError = new signals.Signal();
        this.parsingError = new signals.Signal();
        this._name = name || 'crossroads router';
        this._routes = [];
        this._prevRoutes = [];
        this._piped = [];
        this.resetState();
    }

    Crossroads.prototype = {

        greedy : false,

        greedyEnabled : true,

        ignoreCase : true,

        ignoreState : false,

        shouldTypecast : false,

        normalizeFn : null,

        resetState : function(){
            this._prevRoutes.length = 0;
            this._prevMatchedRequest = null;
            this._prevBypassedRequest = null;
        },

        create : function (name) {
            return new Crossroads(name);
        },

        addRoute : function (route_or_pattern, options_or_handler, priority) {
            var isRouteLike = typeof route_or_pattern == 'object' && route_or_pattern._pattern;

            if (isRouteLike) {
              return this.addRoute(route_or_pattern._pattern, route_or_pattern._handler, route_or_pattern._priority);
            }
            var pattern = route_or_pattern;
            var callback = options_or_handler;
            if (options_or_handler && typeof options_or_handler == 'object') {
              console.log('options_or_handler', options_or_handler);
              callback = options_or_handler.handler;
              priority =  options_or_handler.priority;
            }

            // if (!(callback && typeof callback == 'function')) {
            //   throw Error "Route constructor requires a callback function"
            // }

            var route = new Route(pattern, callback, priority, this);
            this._sortedInsert(route);
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

        removeRoute : function (route) {
            arrayRemove(this._routes, route);
            route._destroy();
        },

        removeAllRoutes : function () {
            var n = this.getNumRoutes();
            while (n--) {
                this._routes[n]._destroy();
            }
            this._routes.length = 0;
        },

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

        getNumRoutes : function () {
            return this.getRoutes().length;
        },


        parse : function (request, defaultArgs) {
          request = request || '';
          defaultArgs = defaultArgs || [];
          try {
            return this._attemptParse(request, defaultArgs);
          }
          // if an error occurs during routing, we fire the routingError signal on this route
          catch (error) {
            this._logError('Parsing error', error);
            this.parsingError.dispatch(this.parsingError, defaultArgs.concat([{request: request, error: error}]));
          }
        },

        _attemptParse : function (request, defaultArgs) {
            // should only care about different requests if ignoreState isn't true
            if ( !this.ignoreState &&
                (request === this._prevMatchedRequest ||
                 request === this._prevBypassedRequest) ) {
                return;
            }

            var routes = this._getMatchedRoutes(request),
                i = 0,
                n = routes.length,
                cur;

            if (n) {
                this._prevMatchedRequest = request;

                this._switchPrevRoutes(request);
                this._prevRoutes = routes;
                //should be incremental loop, execute routes in order
                while (i < n) {
                    cur = routes[i];
                    cur.route.matched.dispatch.apply(cur.route.matched, defaultArgs.concat(cur.params));
                    cur.isFirst = !i;
                    this.routed.dispatch.apply(this.routed, defaultArgs.concat([request, cur]));
                    i += 1;
                }
            } else {
                this._prevBypassedRequest = request;
                this.bypassed.dispatch.apply(this.bypassed, defaultArgs.concat([request]));
            }

            this._pipeParse(request, defaultArgs);
        },

        _switchPrevRoutes : function(request) {
            var i = 0, prev;
            while (prev = this._prevRoutes[i++]) {
                //check if switched exist since route may be disposed
                if(prev.route.switched && !prev.route.active) {
                    prev.route.switch(request);
                }
            }
        },

        _pipeParse : function(request, defaultArgs) {
            var i = 0, route;
            while (route = this._piped[i++]) {
                route.parse(request, defaultArgs);
            }
        },


        _sortedInsert : function (route) {
            //simplified insertion sort
            var routes = this._routes,
                n = routes.length;
            do { --n; } while (routes[n] && route._priority <= routes[n]._priority);
            routes.splice(n+1, 0, route);
        },

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
                    route.activate(request);
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


        pipe : function (otherRouter) {
            this._piped.push(otherRouter);
        },

        unpipe : function (otherRouter) {
            arrayRemove(this._piped, otherRouter);
        },

        // TODO: Combine with getRoutesBy().display()
        toString : function () {
            return '[crossroads numRoutes:'+ this.getNumRoutes() +']';
        },

        // override to customize where/how errors are logged
        _logError : function (msg, error) {
          var errMsg = msg + ': ' + error.toString();
          console.log(errMsg)
          // console.error(errMsg);

        },
    };

    //"static" instance
    crossroads = new Crossroads();
    crossroads.VERSION = '::VERSION_NUMBER::';

    crossroads.NORM_AS_ARRAY = function (req, vals) {
        return [vals.vals_];
    };

    crossroads.NORM_AS_OBJECT = function (req, vals) {
        return [vals];
    };


    // for iterating and displaying routes
    function RoutesList() {}
    RoutesList.prototype = Array.prototype;
    RoutesList.prototype.display = function() {
      return this.map(function(routeInfo) {
        return Object.keys(routeInfo).map(function(key) {
          return key + ': ' + routeInfo[key];
        }).join(', ')
      }).join('\n')
    }

    if (!Object.create) {
      Object.create = function(proto) {
          function F(){}
          F.prototype = proto;
          return new F;
      }
    }
