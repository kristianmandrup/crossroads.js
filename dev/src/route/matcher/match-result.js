module.exports = Result

function Result() {
  return {
    add: function(route, params) {
      // Result should be a class
      this.result = this.result || [];
      this.result.push({
        route: route,
        params: params
      });
    },
    get: function() {
      return this.result;
    }
  }
};

