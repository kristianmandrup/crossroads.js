module.exports = Context;

function Context(request, routable) {
  this.request = request;
  if (routable) {
    this.push(routable);
  }
}

Context.prototype = {
  push: function(routable) {
    this.contextStack.push(routable);
  },
  pop: function() {
    this.contextStack.pop();
  }
};
