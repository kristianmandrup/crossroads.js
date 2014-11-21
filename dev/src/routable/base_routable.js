module.exports = BaseRoutable;

// Add whatever properties/functionality is shared for all Routers and Routes
// Perhaps name
var BaseRoutable = function(name) {
  this._name = name || 'unknown';
};

BaseRoutable.prototype = {
  getName: function() {
    this._name;
  }
};
