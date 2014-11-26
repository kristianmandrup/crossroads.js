function PatternNormalizer(pattern) {
  this.pattern = pattern;
}

PatternNormalizer.prototype = {
  normalize: function() {
    if (this.lastIsDash())
      return this.pattern.slice(0, -1);
    if (this.firstIsDash())
      return this.pattern + '/';
    return this.pattern

  },

  lastIsDash: function() {
    return pattern[pattern.length - 1] === '/';
  },
  firstIsDash: function() {
    return pattern[0] === '/'
  }
};