var utils = require('./utils');
var route = require('./route');
var BaseRoutable = require('./routable/base_routable');

var Xtender = utils.Xtender;

Route.prototype = BaseRoutable.prototype;

Route.prototype = Xtender.extend(Route.prototype, RouteApi, route.RouteRequestParser, route.RouteValidation);

var NestedRoute  = Xtender.extend(Route.prototype, route.CompositeRoute, route.ChildRoute);
var CompositeRoute  = Xtender.extend(Route.prototype, route.CompositeRoute);
var ChildRoute  = Xtender.extend(Route.prototype, route.ChildRoute);

function isRegExp(val) {
  return isKind(val, 'RegExp');
}

var SignalRoute = Xtender.extend(
  Route.prototype,
  route.RouteActivator,
  route.RouteSwitcher,
  route.RouteSignals
);

module.exports = {
  SignalRoute: SignalRoute,
  NestedRoute: NestedRoute,
  CompositeRoute: CompositeRoute,
  ChildRoute: ChildRoute,
  Route: Route
};

/**
 * @constructor
 */

 // TODO: better API, use options object as 2nd argument!!
function Route(pattern, callback, priority, router, name) {
    this._router = router;
    this._name = name || 'unknown';
    this._pattern = pattern;
    this._priority = priority || 0;

    this._lexPattern();

    if (this._configureSignals) {
      this._configureSignals(callback);
    }
}

var RouteApi = {

    greedy : false,

    rules : void(0),

    _lexPattern: function() {
      var isRegexPattern = isRegExp(this._pattern),
          patternLexer = this._router.patternLexer,
          pattern = this._pattern,
          router = this.router;


      this._paramsIds = isRegexPattern? null : patternLexer.getParamIds(pattern);
      this._optionalParamsIds = isRegexPattern? null : patternLexer.getOptionalParamsIds(pattern);
      this._matchRegexp = isRegexPattern? pattern : patternLexer.compilePattern(pattern, router.ignoreCase);
      this._matchRegexpHead = isRegexPattern? pattern : patternLexer.compilePattern(pattern, router.ignoreCase, true);
    },

    match : function (request) {
        request = request || '';
        //validate params even if regexp because of `request_` rule.
        return this._matchRegexp.test(request) && this._validateParams(request);
    },

    interpolate : function(replacements) {
        var str = this._router.patternLexer.interpolate(this._pattern, replacements);
        if (! this._validateParams(str) ) {
          this._throwError('Generated string doesn\'t validate against `Route.rules`.')
        }
        return str;
    },

    _throwError: function(msg) {
      throw new Error(msg);
    },

    dispose : function () {
        this._router.removeRoute(this);
    },

    _destroy : function () {
        this.matched.dispose();
        this.switched.dispose();
        this.matched = this.switched = this._pattern = this._matchRegexp = null;
    },

    _matchListeners: function() {
      return this.matched.getNumListeners();
    },

    toString : function () {
      var properties = [].slice.call(arguments);
      if (properties.length === 0) {
        properties = ['name', 'pattern', 'priority', 'matchListeners'];
      }
      var self = this;
      return properties.map(function(prop) {
        var val = this['_' + prop];
        return val ? (prop + ': ' + val) : '';
      })
    }
};
