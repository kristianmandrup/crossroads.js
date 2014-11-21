module.exports = RouterPiper;

// _pipeParse(request, defaultArgs), pipe(otherRouter), unpipe(otherRouter)

var RouterPiper = {
  _pipeParse : function(request, defaultArgs) {
      var i = 0, route;
      while (route = this._piped[i++]) {
          route.parse(request, defaultArgs);
      }
  },

  getPipedRouters: function() {
    return this._piped;
  },

  pipe : function (otherRouter) {
      this._piped.push(otherRouter);
  },

  unpipe : function (otherRouter) {
      arrayRemove(this._piped, otherRouter);
  }
};
