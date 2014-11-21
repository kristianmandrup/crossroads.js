var BaseRoutable = function() {
}

BaseRoutable.prototype = {
}

var ChildRoute = {
  parentRoute: function() {
      return this._parent;
  }
}
