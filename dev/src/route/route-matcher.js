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

  getPattern: function() {
    return this.getBasePattern() + this._pattern;
  },

  getBasePattern: function() {
    return this.router.getBasePattern();
  },

  getMatchRegexp: function () {
    return this.isRegexPattern()? pattern : this.compilePattern();
  },

  matchRegexpHead: function() {
    return this.isRegexPattern()? pattern : this.compilePattern(true);
  },

  getPatternLexer: function() {
    return this.route.patternLexer;
  },

  compilePattern: function(matchHead) {
    this.getPatternLexer().compilePattern(this.getPattern(), this.router.ignoreCase, matchHead)
  },

  match : function (request) {
    request = request || '';
    //validate params even if regexp because of `request_` rule.
    return this.getMatchRegexp().test(request) && this._validateParams(request);
  },

  paramsIds: function() {
    return this.isRegexPattern() ? null : this.getPatternLexer().getParamIds(this.getPattern());
  },

  optionalParamsIds: function() {
    this.isRegexPattern ? null : this.getPatternLexer().getOptionalParamsIds(this.getPattern());
  },

  isRegexPattern: function() {
    this.isRegExp(this.getPattern())
  }
};

