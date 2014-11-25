module.exports = MountedRoutable;

// _pipeParse(request, defaultArgs), pipe(otherRouter), unpipe(otherRouter), getPipedRouters()

var MountedRoutable = {
  _mountedParse : function(request, defaultArgs) {
    var i = 0, route;
    while (route = this._mounted[i++]) {
      route.parse(request, defaultArgs);
    }
  },

  activeRouter: function() {
    return this._activeRouter || this._router;
  },

  // Routers mounted on this Routable
  getMountedRouters: function() {
    return this._mounted;
  },

  mount : function (routable) {
    this._mounted.push(routable);
    routable._mountedAt = routable._mountedAt || [];
    routable._mountedAt.push(this);
  },

  unpipe : function (routable) {
    arrayRemove(this._mountedAt, routable);
    arrayRemove(otherRouter._mounted, this);
  },

  // Routables where this router is currently mounted
  getMountedAt: function() {
    return this._mountedAt;
  }
};

