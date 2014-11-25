module.exports = BaseController;

BaseController = {
  pattern: function() {
    return this.basePattern() + this.route._pattern;
  },

  basePattern: function() {
    return this.router.basePattern();
  },

  patternLexer: function() {
    return this.route.patternLexer;
  },

  isRegexPattern: function() {
    this.isRegExp(this.pattern());
  }
}
