var router               = require('./router'),
    utils                = require('./util');
    ErrorHandler         = util.ErrorHandler;
    PatternLexer         = util.PatternLexer;

var RouteComposer       = router.RouteComposer,
    RequestParser       = router.RequestParser,
    RouteMatcher        = router.RouteMatcher,
    RouterPiper         = router.RouterPiper,
    RouterSignals       = router.RouterSignals;

var Xtender = utils.Xtender;

module.exports = {
    crossroads: crossroads,
    Crossroads: Crossroads
};

var FullRouter = Xtender.extend(RouteComposer, RequestParser, RouteMatcher, RouterPiper, RouterSignals);
Crossroads.prototype  = Xtender.extend(Crossroads.prototype, FullRouter, ErrorHandler);
Crossroads.prototype.patternLexer = PatternLexer;

// Crossroads --------
//====================

/**
 * @constructor
 */
function Crossroads(name) {
    this._name = name || 'crossroads router';
    this._routes = [];

    this._RouteClass = Route;
    this._RouterClass = Crossroads,

    this._prevRoutes = [];
    this._piped = [];
    if (this._configureSignals) {
        this._configureSignals();
    }
    this.resetState();
}

Crossroads.prototype = {

    greedy : false,

    greedyEnabled : true,

    ignoreCase : true,

    ignoreState : false,

    shouldTypecast : false,

    normalizeFn : null,

    _signals: ['bypasses', 'routed', 'routingError', 'parsingError'],

    resetState : function(){
        this._prevRoutes.length = 0;
        this._prevMatchedRequest = null;
        this._prevBypassedRequest = null;
    },

    create : function (name) {
        return new this._RouterClass(name);
    },

    // TODO: Combine with getRoutesBy().display()
    toString : function () {
        return 'number of routes:' + this.getNumRoutes();
    }
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
