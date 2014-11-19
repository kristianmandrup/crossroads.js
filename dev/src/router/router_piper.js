var RouterPiper = {
  _pipeParse : function(request, defaultArgs) {
      var i = 0, route;
      while (route = this._piped[i++]) {
          route.parse(request, defaultArgs);
      }
  },

  pipe : function (otherRouter) {
      this._piped.push(otherRouter);
  },

  unpipe : function (otherRouter) {
      arrayRemove(this._piped, otherRouter);
  }
}
