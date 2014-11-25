module.exports = RequestParser;

// _buildRequest(request), parse(request, defaultArgs), _attemptParse(request, defaultArgs)
// _switchPrevRoutes(request)

// Signals: parsingError, bypassed

// TODO: use general dispatch method

var RequestParser = function(request, defaultArgs) {
  this._buildRequest(requst, defaultArgs);
};

RequestParser.prototype = {
  _buildRequest: function(request, defaultArgs) {
    this.request = request || '';
    this.defaultArgs = defaultArgs || [];
  },

  transaction: function(router, mainLoop) {
    this.activeRouter = router;
    mainLoop();
    this.activeRouter = null;
  },

  parse : function (router) {
    var request = this.request;
    var defaultArgs = this.defaultArgs;

    try {
      this.transaction(router, _attemptParse);
    }
    // if an error occurs during routing, we fire the routingError signal on this route
    catch (error) {
      this._logError('Parsing error', error);
      // TODO: use general dispatch method
      this.parsingError.dispatch(this.parsingError, defaultArgs.concat([{request: request, error: error}]));
    }
  },

  _attemptParse : function () {
    var request = this.request;
    var defaultArgs = this.defaultArgs;

    // should only care about different requests if ignoreState isn't true
    if ( !this.ignoreState &&
        (request === this._prevMatchedRequest ||
         request === this._prevBypassedRequest) ) {
        return;
    }

    var routes = this._getMatchedRoutes(),
        i = 0,
        n = routes.length,
        cur;

    if (n) {
        this._prevMatchedRequest = request;

        this._switchPrevRoutes();
        this._prevRoutes = routes;
        //should be incremental loop, execute routes in order
        while (i < n) {
            cur = routes[i];
            cur.route.matched.dispatch.apply(cur.route.matched, defaultArgs.concat(cur.params));
            cur.isFirst = !i;
            this.routed.dispatch.apply(this.routed, defaultArgs.concat([request, cur]));
            i += 1;
        }
    } else {
        this._prevBypassedRequest = request;
        // TODO: use general dispatch method
        this.bypassed.dispatch.apply(this.bypassed, defaultArgs.concat([request]));
    }

    // pipe request to next router if this is a piping router
    if (typeof this._pipeParse == 'function') {
      this._pipeParse(request, defaultArgs);
    }
  },

  _switchPrevRoutes : function() {
    var request = this.request;
    var defaultArgs = this.defaultArgs;

    var i = 0, prev;
    while (prev = this._prevRoutes[i++]) {
        //check if switched exist since route may be disposed
        if(prev.route.switched && !prev.route.active) {
            prev.route.switch(request);
        }
    }
  }
};
