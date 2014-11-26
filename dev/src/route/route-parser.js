module.exports = RouteParser;

var Xtender    = require('../utils').Xtender;

function RouteParser() {
}

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
      return this.addRoute(route_or_pattern);
    }
    this.validate(options)
    return options;
  },

  validate: function(options) {
    return true;
  }
};
