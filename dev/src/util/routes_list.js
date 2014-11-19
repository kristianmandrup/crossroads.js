// for iterating and displaying routes
var RoutesList = function () {}
RoutesList.prototype = Array.prototype;
RoutesList.prototype.display = function() {
  return this.map(function(routeInfo) {
    return Object.keys(routeInfo).map(function(key) {
      return key + ': ' + routeInfo[key];
    }).join(', ')
  }).join('\n')
}
