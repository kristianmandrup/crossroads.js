module.exports = RouteRequestParser;

// _getParamsObject(request), _getParamsArray(request)

var util = require('../utils');

// IE 7-8 capture optional groups as empty strings while other browsers
// capture as `undefined`
var _hasOptionalGroupBug = (/t(.+)?/).exec('t')[1] === '';

function RouteRequestParser(request) {
    this.request = request;
}

RouteRequestParser.prototype = {
    _getParamsObject : function () {
        var request = this.request;
        var router = this.activeRouter;

        var shouldTypecast = router.shouldTypecast,
            values = router.patternLexer.getParamValues(request, this._matchRegexpHead, shouldTypecast),
            o = {},
            n = values.length,
            param, val;
        while (n--) {
            val = values[n];
            if (this._paramsIds) {
                param = this._paramsIds[n];
                if (param.indexOf('?') === 0 && val) {
                    //make a copy of the original string so array and
                    //RegExp validation can be applied properly
                    o[param +'_'] = val;
                    //update vals_ array as well since it will be used
                    //during dispatch
                    val = util.decodeQueryString(val, shouldTypecast);
                    values[n] = val;
                }
                // IE will capture optional groups as empty strings while other
                // browsers will capture `undefined` so normalize behavior.
                // see: #gh-58, #gh-59, #gh-60
                if ( _hasOptionalGroupBug && val === '' && util.arrayIndexOf(this._optionalParamsIds, param) !== -1 ) {
                    val = void(0);
                    values[n] = val;
                }
                o[param] = val;
            }
            //alias to paths and for RegExp pattern
            o[n] = val;
        }
        o.request_ = shouldTypecast? util.typecastValue(request) : request;
        o.vals_ = values;
        return o;
    },

    _getParamsArray : function (request) {
        var norm = this.rules? this.rules.normalize_ : null,
            params;
        norm = norm || this._router.normalizeFn; // default normalize
        if (norm && isFunction(norm)) {
            params = norm(request, this._getParamsObject(request));
        } else {
            params = this._getParamsObject(request).vals_;
        }
        return params;
    }
}
