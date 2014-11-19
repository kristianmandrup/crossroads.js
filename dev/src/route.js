
    // Route --------------
    //=====================

    /**
     * @constructor
     */
    function Route(pattern, callback, priority, router) {
        var isRegexPattern = isRegExp(pattern),
            patternLexer = router.patternLexer;
        this._router = router;
        this._pattern = pattern;
        this._paramsIds = isRegexPattern? null : patternLexer.getParamIds(pattern);
        this._optionalParamsIds = isRegexPattern? null : patternLexer.getOptionalParamsIds(pattern);
        this._matchRegexp = isRegexPattern? pattern : patternLexer.compilePattern(pattern, router.ignoreCase);
        this._matchRegexpHead = isRegexPattern? pattern : patternLexer.compilePattern(pattern, router.ignoreCase, true);


        if (callback) {
            if (typeof callback !== 'function') {
              throw Error("Route callback must be a function, was:" + typeof callback);
            }
            this.matched.add(callback);
            this._handler = callback;
        }
        this._priority = priority || 0;
    }

    Signal.prototype.isActive = function() {
      return this.active && this.getNumListeners() > 0;
    }

    Route.prototype = {

        greedy : false,

        rules : void(0),

        createSignal: function() {
          return new signals.Signal();
        },

        configure: function() {
          this.matched = this.createSignal();;
          this.switched = this.createSignal();

          this.couldntSwitch = this.createSignal();
          this.couldntActivate = this.createSignal();
          this.routeWasAdded = this.createSignal();
        }

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


        match : function (request) {
            request = request || '';
            return this._matchRegexp.test(request) && this._validateParams(request); //validate params even if regexp because of `request_` rule.
        },

        switch: function(request) {
          this.willSwitch(request);
          if (this.canSwitch(request)) {
            this.doSwitch(request);
          } else {
            this.cannotSwitch(request);
          }
        },

        _isSignalDelegate: function(delegate) {
          if (!delegate)
            return false;

          var receiver = delegate._defaultSignalStrategy;
          return receiver && typeof receiver == 'function';
        },

        _delegateSignal: function(signalName, delegate, args) {
          if (_isSignalDelegate(delegate)) {
            delegate._defaultSignalStrategy(signalName, args);
            return true;
          }
          return false;
        },

        _defaultSignalStrategy : function(signalName, request) {
          var args = this._defaultSignalArgs(request)
          if (this._canDispatch(signalName)) {
            this._dispatch(signalName, args);
            return true;
          }
          if (this._parent) {
            _delegateSignal(signalName, this._parent, args);
          } else {
            _delegateSignal(signalName, this._router, args);
          }
        },

        _defaultSignalArgs: function(request) {
          var arg = {route: route};
          if (request)
            arg[request] = request;
          return arg
        },

        willSwitch : function(request) {
        },

        canSwitch: function(request) {
          this._defaultSignalStrategy('couldSwitch', request);
          return true;
        },

        // triggered when not permitted to switch
        cannotSwitch: function(request) {
          this._defaultSignalStrategy('couldntSwitch', request);
        },

        _isActiveSignal: function(signal) {
          return signal && signal.isActive();
        },

        _canDispatch: function(signalName) {
          return this._isActiveSignal(signalName);
        },

        _dispatch: function(signalName /*, args */) {
          if (this._canDispatch(signalName)) {
            var signal = this[signalName];
            var args = [].slice.call(arguments, 1);
            signal.dispatch(args);
          }
        },

        doSwitch: function(request) {
          this.switched.dispatch(request);
          this.didSwitch();
        },

        didSwitch: function(request) {
          this._defaultSignalStrategy('wasSwitched', request);
        },

        activate : function(request) {
          this.willActivate(request);
          if (this.canActivate(request)) {
            return this.doActivate(request);
          } else {
            return this.cannotActivate(request)
          }
        },

        willActivate : function(request) {
        },

        doActivate : function(request) {
          this.active = true;
          this.didActivate(request);
        },

        didActivate: function(request) {
          this._defaultSignalStrategy('wasActivated', request);
        },

        canActivate: function(request) {
          this._defaultSignalStrategy('couldActivate', request);
          return true;
        },

        // triggered when not permitted to activate
        cannotActivate: function(request) {
          this._defaultSignalStrategy('couldntActivate', request);
        },

        // TODO: signal
        deactivate : function() {
          this.deactivated();
        },

        deactivated : function() {
          this.active = false;
          this._defaultSignalStrategy('wasDeactivated', this);
        },

        _validateParams : function (request) {
            var rules = this.rules,
                values = this._getParamsObject(request),
                key;
            for (key in rules) {
                // normalize_ isn't a validation rule... (#39)
                if(key !== 'normalize_' && rules.hasOwnProperty(key) && ! this._isValidParam(request, key, values)){
                    return false;
                }
            }
            return true;
        },

        _isValidParam : function (request, prop, values) {
            var validationRule = this.rules[prop],
                val = values[prop],
                isValid = false,
                isQuery = (prop.indexOf('?') === 0);

            if (val == null && this._optionalParamsIds && arrayIndexOf(this._optionalParamsIds, prop) !== -1) {
                isValid = true;
            }
            else if (isRegExp(validationRule)) {
                if (isQuery) {
                    val = values[prop +'_']; //use raw string
                }
                isValid = validationRule.test(val);
            }
            else if (isArray(validationRule)) {
                if (isQuery) {
                    val = values[prop +'_']; //use raw string
                }
                isValid = this._isValidArrayRule(validationRule, val);
            }
            else if (isFunction(validationRule)) {
                isValid = validationRule(val, request, values);
            }

            return isValid; //fail silently if validationRule is from an unsupported type
        },

        _isValidArrayRule : function (arr, val) {
            if (! this._router.ignoreCase) {
                return arrayIndexOf(arr, val) !== -1;
            }

            if (typeof val === 'string') {
                val = val.toLowerCase();
            }

            var n = arr.length,
                item,
                compareVal;

            while (n--) {
                item = arr[n];
                compareVal = (typeof item === 'string')? item.toLowerCase() : item;
                if (compareVal === val) {
                    return true;
                }
            }
            return false;
        },

        _getParamsObject : function (request) {
            var shouldTypecast = this._router.shouldTypecast,
                values = this._router.patternLexer.getParamValues(request, this._matchRegexpHead, shouldTypecast),
                o = {},
                n = values.length,
                param, val;
            while (n--) {
                val = values[n];
                if (this._paramsIds) {
                    param = this._paramsIds[n];
                    if (param.indexOf('?') === 0 && val) {
                        //make a copy of the original string so array and
                        //RegExp validation can be applied properly
                        o[param +'_'] = val;
                        //update vals_ array as well since it will be used
                        //during dispatch
                        val = decodeQueryString(val, shouldTypecast);
                        values[n] = val;
                    }
                    // IE will capture optional groups as empty strings while other
                    // browsers will capture `undefined` so normalize behavior.
                    // see: #gh-58, #gh-59, #gh-60
                    if ( _hasOptionalGroupBug && val === '' && arrayIndexOf(this._optionalParamsIds, param) !== -1 ) {
                        val = void(0);
                        values[n] = val;
                    }
                    o[param] = val;
                }
                //alias to paths and for RegExp pattern
                o[n] = val;
            }
            o.request_ = shouldTypecast? typecastValue(request) : request;
            o.vals_ = values;
            return o;
        },

        _getParamsArray : function (request) {
            var norm = this.rules? this.rules.normalize_ : null,
                params;
            norm = norm || this._router.normalizeFn; // default normalize
            if (norm && isFunction(norm)) {
                params = norm(request, this._getParamsObject(request));
            } else {
                params = this._getParamsObject(request).vals_;
            }
            return params;
        },

        interpolate : function(replacements) {
            var str = this._router.patternLexer.interpolate(this._pattern, replacements);
            if (! this._validateParams(str) ) {
                throw new Error('Generated string doesn\'t validate against `Route.rules`.');
            }
            return str;
        },

        dispose : function () {
            this._router.removeRoute(this);
        },

        _destroy : function () {
            this.matched.dispose();
            this.switched.dispose();
            this.matched = this.switched = this._pattern = this._matchRegexp = null;
        },

        toString : function () {
            return '[Route pattern:"'+ this._pattern +'", numListeners:'+ this.matched.getNumListeners() +']';
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

        getRoutes: function() {
            return this._routes || [];
        },

        parentRoute: function() {
            return this._parent;
        },

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

    };
