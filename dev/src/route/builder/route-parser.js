module.exports = RouteParser;

var Xtender    = require('../../utils').Xtender;

function RouteParser(ctx) {
  this.ctx = ctx;
}

// Utility class used to parse arguments to be used for constructing a new route
RouteParser.prototype = {
  // TODO: should always use Object hash
  // (route)
  // (object)
  // (pattern, object)
  parse: function(route_or_pattern, options) {
    options = options || {};

    // (pattern, object)
    if (typeof route_or_pattern === 'string') {
      var obj = Xtender.extend(options, {pattern: route_or_pattern});
      return this.parse(obj);
    }
    // (route)
    if (this.isRouteLike(route_or_pattern)) {
      return this.ctx.addRoute(route_or_pattern);
    }
    return this.validated(options);
  },

  validated: function(options) {
    if (!this.validPattern(options.pattern)) {
      throw Error("Route pattern must be a String or RegExp, was: " + typeof(options.pattern));
    }
    if (!this.validPriority(options.priority)) {
      throw Error("Route priority must be an Integer, was: " + typeof(options.priority));
    }

    if (!this.validCallback(options.callback)) {
      throw Error("Route callback must be a Function, was: " + typeof(options.callback));
    }

    return options;
  },

  // is Route like if it is an Object with either:
  // - a pattern
  // - an addRoute function
  isRouteLike: function(route) {
    return typeof route == 'object' || typeof route.pattern === 'string' || typeof route.addRoute === 'function';
  },

  validPattern: function(pattern) {
    return typeof pattern == 'string' || pattern instanceof RegExp;
  },

  validPriority: function(priority) {
    return typeof priority == 'number' || callback === undefined;
  },

  validCallback: function(callback) {
    return typeof callback == 'function' || callback === undefined;
  }
};
