
    // Crossroads --------
    //====================

    /**
     * @constructor
     */
    function Crossroads(name) {
        this.bypassed = this.createSignal();
        this.routed = this.createSignal();
        this.routingError = this.createSignal();
        this.parsingError = this.createSignal();
        this._name = name || 'crossroads router';
        this._routes = [];
        this._RouteClass = Route;
        this._prevRoutes = [];
        this._piped = [];
        this.resetState();
    }

    Crossroads.prototype = {

        greedy : false,

        greedyEnabled : true,

        ignoreCase : true,

        ignoreState : false,

        shouldTypecast : false,

        normalizeFn : null,

        resetState : function(){
            this._prevRoutes.length = 0;
            this._prevMatchedRequest = null;
            this._prevBypassedRequest = null;
        },

        create : function (name) {
            return new Crossroads(name);
        },


        _switchPrevRoutes : function(request) {
            var i = 0, prev;
            while (prev = this._prevRoutes[i++]) {
                //check if switched exist since route may be disposed
                if(prev.route.switched && !prev.route.active) {
                    prev.route.switch(request);
                }
            }
        },

        // TODO: Combine with getRoutesBy().display()
        toString : function () {
            return 'number of routes:'+ this.getNumRoutes();
        },

        // override to customize where/how errors are logged
        _logError : function (msg, error) {
          var errMsg = msg + ': ' + error.toString();
          console.log(errMsg)
          // console.error(errMsg);

        },
    };

    //"static" instance
    crossroads = new Crossroads();
    crossroads.VERSION = '::VERSION_NUMBER::';

    crossroads.NORM_AS_ARRAY = function (req, vals) {
        return [vals.vals_];
    };

    crossroads.NORM_AS_OBJECT = function (req, vals) {
        return [vals];
    };


    // for iterating and displaying routes
    function RoutesList() {}
    RoutesList.prototype = Array.prototype;
    RoutesList.prototype.display = function() {
      return this.map(function(routeInfo) {
        return Object.keys(routeInfo).map(function(key) {
          return key + ': ' + routeInfo[key];
        }).join(', ')
      }).join('\n')
    }

    if (!Object.create) {
      Object.create = function(proto) {
          function F(){}
          F.prototype = proto;
          return new F;
      }
    }
