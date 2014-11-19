
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

        this.matched = new signals.Signal();
        this.switched = new signals.Signal();

        this.couldntSwitch = new signals.Signal();
        this.couldntActivate = new signals.Signal();

        if (callback) {
            if (typeof callback !== 'function') {
              throw Error("Route callback must be a function, was:" + typeof callback);
            }
            this.matched.add(callback);
            this._handler = callback;
        }
        this._priority = priority || 0;
    }

    Route.prototype = {

        greedy : false,

        rules : void(0),

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

        _hasActiveSignal: function(signal) {
          return signal && signal.getNumListeners() > 0;
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
          if (_hasActiveSignal(this[signalName])) {
            this[switchName](args);
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
          this._defaultSignalStrategy('couldSwitch', request)
          return true;
        },

        // triggered when not permitted to switch
        cannotSwitch: function(request) {
          this._defaultSignalStrategy('couldntSwitch', request)
        },

        doSwitch: function(request) {
          this.switched.dispatch(request);
          this.didSwitch();
        },

        didSwitch: function(request) {
          this._defaultSignalStrategy('wasSwitched', request)
        },

        activate : function(request) {
          this.willActivate(request);
          if (this.canActivate(request)) {
            this.doActivate(request);
          } else {
            this.cannotActivate(request)
          }
        },

        willActivate : function(request) {
        },

        doActivate : function(request) {
          this.active = true;
          this.didActivate(request);
        },

        didActivate: function(request) {
          this._defaultSignalStrategy('wasActivated', request)
        },

        canActivate: function(request) {
          this._defaultSignalStrategy('couldActivate', request)
          return true;
        },

        // triggered when not permitted to activate
        cannotActivate: function(request) {
          this._defaultSignalStrategy('couldntActivate', request)
        },

        // TODO: signal
        deactivate : function() {
          this.deactivated();
        },

        deactivated : function() {
          this.active = false;
          this._defaultSignalStrategy('wasDeactivated', this)
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

        childRoutes: function() {
            return this._children || [];
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
            this._children = this._children || [];
            this._children.push(route);

            // index routes should be matched together with parent route
            if (!pattern.length || pattern === '/')
                route.greedy = true;

            return route;
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
