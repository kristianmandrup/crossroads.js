var arrayRemove = require('../utils').arrayRemove;

module.exports = Piper;

function Piper(router, pipedRouter) {
  this.router = router;
  this.pipedRouter = pipedRouter;
}

Piper.prototype = {
  pipe : function () {
    this._piped.push(this.pipedRouter);
    this.pipedRouter._parent = this;
  },

  unpipe : function () {
    arrayRemove(this._piped, this.pipedRouter);
    delete this.pipedRouter._parent;
  }
};