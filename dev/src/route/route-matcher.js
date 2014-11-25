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

  compilePattern: function(matchHead) {
    var patternLexer = this.getPatternLexer();
    var pattern = this.getPattern();
    patternLexer.compilePattern(pattern, this.router.ignoreCase, matchHead)
  },

  match : function (request) {
    request = request || '';
    //validate params even if regexp because of `request_` rule.
    return this.getMatchRegexp().test(request) && this._validateParams(request);
  },

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

  isRegexPattern: function() {
    this.isRegExp(this.getPattern())
  }
};

