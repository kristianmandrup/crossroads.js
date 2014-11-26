module.exports = Context;

function Context(request, router, route) {
  this.request = request;
  this.route = route;
  this.router = router;
}
