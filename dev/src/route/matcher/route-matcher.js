module.exports = RouteMatcher

var utils = require('./utils');

function isRegExp(val) {
  return utils.isKind(val, 'RegExp');
}

function RouteMatcher(router, route) {
  this.route = route;
  this.router = router;
}

RouteMatcher.prototype = {
  matchRegexp: function () {
    return this.isRegexPattern()? this.pattern() : this.compilePattern();
  },

  matchRegexpHead: function() {
    return this.isRegexPattern()? this.pattern() : this.compilePattern(true);
  },

  compilePattern: function(matchHead) {
    this.patternLexer().compilePattern(this.pattern(), this.router.ignoreCase, matchHead)
  },

  match : function (request) {
    request = request || '';
    //validate params even if regexp because of `request_` rule.
    return this.matchRegexp().test(request) && this._validateParams(request);
  }
};

