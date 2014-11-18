/** @license
 * crossroads <http://millermedeiros.github.com/crossroads.js/>
 * Author: Miller Medeiros | MIT License
 * v0.12.0 (2014/11/18 23:12)
 */

(function () {
var factory = function (signals) {

    var crossroads,
        _hasOptionalGroupBug,
        UNDEF;

    // Helpers -----------
    //====================

    // IE 7-8 capture optional groups as empty strings while other browsers
    // capture as `undefined`
    _hasOptionalGroupBug = (/t(.+)?/).exec('t')[1] === '';

    function arrayIndexOf(arr, val) {
        if (arr.indexOf) {
            return arr.indexOf(val);
        } else {
            //Array.indexOf doesn't work on IE 6-7
            var n = arr.length;
            while (n--) {
                if (arr[n] === val) {
                    return n;
                }
            }
            return -1;
        }
    }

    function arrayRemove(arr, item) {
        var i = arrayIndexOf(arr, item);
        if (i !== -1) {
            arr.splice(i, 1);
        }
    }

    function isKind(val, kind) {
        return '[object '+ kind +']' === Object.prototype.toString.call(val);
    }

    function isRegExp(val) {
        return isKind(val, 'RegExp');
    }

    function isArray(val) {
        return isKind(val, 'Array');
    }

    function isFunction(val) {
        return typeof val === 'function';
    }

    //borrowed from AMD-utils
    function typecastValue(val) {
        var r;
        if (val === null || val === 'null') {
            r = null;
        } else if (val === 'true') {
            r = true;
        } else if (val === 'false') {
            r = false;
        } else if (val === UNDEF || val === 'undefined') {
            r = UNDEF;
        } else if (val === '' || isNaN(val)) {
            //isNaN('') returns false
            r = val;
        } else {
            //parseFloat(null || '') returns NaN
            r = parseFloat(val);
        }
        return r;
    }

    function typecastArrayValues(values) {
        var n = values.length,
            result = [];
        while (n--) {
            result[n] = typecastValue(values[n]);
        }
        return result;
    }

    //borrowed from AMD-Utils
    function decodeQueryString(str, shouldTypecast) {
        var queryArr = (str || '').replace('?', '').split('&'),
            n = queryArr.length,
            obj = {},
            item, val;
        while (n--) {
            item = queryArr[n].split('=');
            val = shouldTypecast ? typecastValue(item[1]) : item[1];
            obj[item[0]] = (typeof val === 'string')? decodeURIComponent(val) : val;
        }
        return obj;
    }


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
    crossroads.VERSION = '0.12.0';

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

        _defaultSwitchStrategy : function(switchName) {
          var args = [].slice.call(arguments, 1)
          if (this._parent) {
            this._parent[switchName](args);
          } else {
            this._router[switchName](args);
          }
        },

        // TODO: signal
        willSwitch : function(request) {
          this._defaultSwitchStrategy('willSwitch', request)
        },

        canSwitch: function(request) {
          this._defaultSwitchStrategy('canSwitch', request)
        },

        // triggered when not permitted to switch
        cannotSwitch: function(request) {
          this.couldntSwitch.dispatch(request);
          this._defaultSwitchStrategy('cannotSwitch', request)
        },

        doSwitch: function(request) {
          this.switched.dispatch(request);
          this.wasSwitched();
        },

        wasSwitched: function(request) {
          this._defaultSwitchStrategy('wasSwitched', request)
        },

        activate : function(request) {
          this.willActivate(request);
          if (this.canActivate(request)) {
            this.doActivate(request);
          } else {
            this.cannotActivate(request)
          }
        },

        // TODO: signal
        willActivate : function(request) {
          this._defaultSwitchStrategy('willActivate', request)
        },

        // TODO: signal
        doActivate : function(request) {
          this.active = true;
          this.wasActivated(request);
        },

        wasActivated: function(request) {
          this._defaultSwitchStrategy('wasActivated', request)
        },

        canActivate: function(request) {
          this._defaultSwitchStrategy('canActivate', request)
        },

        // triggered when not permitted to activate
        cannotActivate: function(request) {
          this.couldntActivate.dispatch(request);
          this._defaultSwitchStrategy('cannotActivate', request)
        },

        // TODO: signal
        deactivate : function() {
          this.deactivated();
        },

        deactivated : function() {
          this.active = false;
          this._defaultSwitchStrategy('wasDeactivated', this)
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


    // Pattern Lexer ------
    //=====================

    Crossroads.prototype.patternLexer = (function () {

        var
            //match chars that should be escaped on string regexp
            ESCAPE_CHARS_REGEXP = /[\\.+*?\^$\[\](){}\/'#]/g,

            //trailing slashes (begin/end of string)
            LOOSE_SLASHES_REGEXP = /^\/|\/$/g,
            LEGACY_SLASHES_REGEXP = /\/$/g,

            //params - everything between `{ }` or `: :`
            PARAMS_REGEXP = /(?:\{|:)([^}:]+)(?:\}|:)/g,

            //used to save params during compile (avoid escaping things that
            //shouldn't be escaped).
            TOKENS = {
                'OS' : {
                    //optional slashes
                    //slash between `::` or `}:` or `\w:` or `:{?` or `}{?` or `\w{?`
                    rgx : /([:}]|\w(?=\/))\/?(:|(?:\{\?))/g,
                    save : '$1{{id}}$2',
                    res : '\\/?'
                },
                'RS' : {
                    //required slashes
                    //used to insert slash between `:{` and `}{`
                    rgx : /([:}])\/?(\{)/g,
                    save : '$1{{id}}$2',
                    res : '\\/'
                },
                'RQ' : {
                    //required query string - everything in between `{? }`
                    rgx : /\{\?([^}]+)\}/g,
                    //everything from `?` till `#` or end of string
                    res : '\\?([^#]+)'
                },
                'OQ' : {
                    //optional query string - everything in between `:? :`
                    rgx : /:\?([^:]+):/g,
                    //everything from `?` till `#` or end of string
                    res : '(?:\\?([^#]*))?'
                },
                'OR' : {
                    //optional rest - everything in between `: *:`
                    rgx : /:([^:]+)\*:/g,
                    res : '(.*)?' // optional group to avoid passing empty string as captured
                },
                'RR' : {
                    //rest param - everything in between `{ *}`
                    rgx : /\{([^}]+)\*\}/g,
                    res : '(.+)'
                },
                // required/optional params should come after rest segments
                'RP' : {
                    //required params - everything between `{ }`
                    rgx : /\{([^}]+)\}/g,
                    res : '([^\\/?]+)'
                },
                'OP' : {
                    //optional params - everything between `: :`
                    rgx : /:([^:]+):/g,
                    res : '([^\\/?]+)?\/?'
                }
            },

            LOOSE_SLASH = 1,
            STRICT_SLASH = 2,
            LEGACY_SLASH = 3,

            _slashMode = LOOSE_SLASH;


        function precompileTokens(){
            var key, cur;
            for (key in TOKENS) {
                if (TOKENS.hasOwnProperty(key)) {
                    cur = TOKENS[key];
                    cur.id = '__CR_'+ key +'__';
                    cur.save = ('save' in cur)? cur.save.replace('{{id}}', cur.id) : cur.id;
                    cur.rRestore = new RegExp(cur.id, 'g');
                }
            }
        }
        precompileTokens();


        function captureVals(regex, pattern) {
            var vals = [], match;
            // very important to reset lastIndex since RegExp can have "g" flag
            // and multiple runs might affect the result, specially if matching
            // same string multiple times on IE 7-8
            regex.lastIndex = 0;
            while (match = regex.exec(pattern)) {
                vals.push(match[1]);
            }
            return vals;
        }

        function getParamIds(pattern) {
            return captureVals(PARAMS_REGEXP, pattern);
        }

        function getOptionalParamsIds(pattern) {
            return captureVals(TOKENS.OP.rgx, pattern);
        }

        function compilePattern(pattern, ignoreCase, matchHead) {
            pattern = pattern || '';

            if(pattern){
                if (_slashMode === LOOSE_SLASH) {
                    pattern = pattern.replace(LOOSE_SLASHES_REGEXP, '');
                }
                else if (_slashMode === LEGACY_SLASH) {
                    pattern = pattern.replace(LEGACY_SLASHES_REGEXP, '');
                }

                //save tokens
                pattern = replaceTokens(pattern, 'rgx', 'save');
                //regexp escape
                pattern = pattern.replace(ESCAPE_CHARS_REGEXP, '\\$&');
                //restore tokens
                pattern = replaceTokens(pattern, 'rRestore', 'res');

                if (_slashMode === LOOSE_SLASH) {
                    pattern = '\\/?'+ pattern;
                }
            }

            if (_slashMode !== STRICT_SLASH) {
                //single slash is treated as empty and end slash is optional
                pattern += '\\/?';
            }
            if (!matchHead) {
                pattern += '$';
            }
            return new RegExp('^'+ pattern, ignoreCase? 'i' : '');
        }

        function replaceTokens(pattern, regexpName, replaceName) {
            var cur, key;
            for (key in TOKENS) {
                if (TOKENS.hasOwnProperty(key)) {
                    cur = TOKENS[key];
                    pattern = pattern.replace(cur[regexpName], cur[replaceName]);
                }
            }
            return pattern;
        }

        function getParamValues(request, regexp, shouldTypecast) {
            var vals = regexp.exec(request);
            if (vals) {
                vals.shift();
                if (shouldTypecast) {
                    vals = typecastArrayValues(vals);
                }
            }
            return vals;
        }

        function interpolate(pattern, replacements) {
            if (typeof pattern !== 'string') {
                throw new Error('Route pattern should be a string.');
            }

            var replaceFn = function(match, prop){
                    var val;
                    prop = (prop.substr(0, 1) === '?')? prop.substr(1) : prop;
                    if (replacements[prop] != null) {
                        if (typeof replacements[prop] === 'object') {
                            var queryParts = [];
                            for(var key in replacements[prop]) {
                                queryParts.push(encodeURI(key + '=' + replacements[prop][key]));
                            }
                            val = '?' + queryParts.join('&');
                        } else {
                            // make sure value is a string see #gh-54
                            val = String(replacements[prop]);
                        }

                        if (match.indexOf('*') === -1 && val.indexOf('/') !== -1) {
                            throw new Error('Invalid value "'+ val +'" for segment "'+ match +'".');
                        }
                    }
                    else if (match.indexOf('{') !== -1) {
                        throw new Error('The segment '+ match +' is required.');
                    }
                    else {
                        val = '';
                    }
                    return val;
                };

            if (! TOKENS.OS.trail) {
                TOKENS.OS.trail = new RegExp('(?:'+ TOKENS.OS.id +')+$');
            }

            return pattern
                        .replace(TOKENS.OS.rgx, TOKENS.OS.save)
                        .replace(PARAMS_REGEXP, replaceFn)
                        .replace(TOKENS.OS.trail, '') // remove trailing
                        .replace(TOKENS.OS.rRestore, '/'); // add slash between segments
        }

        //API
        return {
            strict : function(){
                _slashMode = STRICT_SLASH;
            },
            loose : function(){
                _slashMode = LOOSE_SLASH;
            },
            legacy : function(){
                _slashMode = LEGACY_SLASH;
            },
            getParamIds : getParamIds,
            getOptionalParamsIds : getOptionalParamsIds,
            getParamValues : getParamValues,
            compilePattern : compilePattern,
            interpolate : interpolate
        };

    }());


    return crossroads;
};

if (typeof define === 'function' && define.amd) {
    define(['signals'], factory);
} else if (typeof module !== 'undefined' && module.exports) { //Node
    module.exports = factory(require('signals'));
} else {
    /*jshint sub:true */
    window['crossroads'] = factory(window['signals']);
}

}());

