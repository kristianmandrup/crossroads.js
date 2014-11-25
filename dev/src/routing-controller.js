module.exports = RoutingController

function RoutingController(router) {
  this.router = router;
}

var RequestParser = require('./router/request-parser');
var RouteMatcher  = require('./router/route-matcher');

RoutingController.prototype = {
  route: function(request) {
    this.request = request;
    this.requestParser().parse(this.router);
  },

  requestParser: function() {
    return new RequestParser(this.request, this.routeMatcher());
  },

  routeMatcher: function() {
    return new RouteMatcher(this.request);
  }
};
