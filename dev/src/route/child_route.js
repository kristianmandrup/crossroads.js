module.exports = ChildRoute;

var ChildRoute = {
  parentRoute: function() {
    return this._parent;
  }
}
