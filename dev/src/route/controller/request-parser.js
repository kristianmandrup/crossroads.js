module.exports = RouteRequestParser;

var util = require('../../utils');

// IE 7-8 capture optional groups as empty strings while other browsers
// capture as `undefined`
var _hasOptionalGroupBug = (/t(.+)?/).exec('t')[1] === '';

function RouteRequestParser(context) {
  this.request = context.request;
  this.router  = context.router;
}

RouteRequestParser.prototype = {

  patternLexer: function() {
    return this.router.patternLexer;
  },

  paramsIds: function() {
    return this.isRegexPattern() ? null : this.patternLexer().getParamIds(this.pattern());
  },

  optionalParamsIds: function() {
    return this.isRegexPattern() ? null : this.patternLexer().getOptionalParamsIds(this.pattern());
  },

  shouldTypecast: function() {
    return this.router.shouldTypecast;
  },

  getParamsObject : function () {
    var request = this.context.request;
    var router = this.context.router;


    var values = this.patternLexer().getParamValues(request, this.matchRegexpHead(), this.shouldTypecast()),
      o = {},
      n = values.length;

    var valuesObj = {values: values, o: o};
    while (n--) {
      valuesObj.val = values[n];
      var paramIds = this.paramsIds();
      valuesObj = this.extractParamValues(valuesObj, paramIds, valuesObj.val, n);
      //alias to paths and for RegExp pattern
      valuesObj.o[n] = valuesObj.val;
    }
    valuesObj.o.request_ = this.shouldTypecast() ? util.typecastValue(request) : request;
    valuesObj.o.vals_ = valuesObj.values;
    return valuesObj.o;
  },

  extractParamValues: function(valuesObj, paramIds, val, n) {
    if (!paramIds) {
      return valuesObj;
    }
    var param = paramIds[n];

    if (param.indexOf('?') === 0 && val) {
      //make a copy of the original string so array and
      //RegExp validation can be applied properly
      valuesObj.o[param +'_'] = val;
      //update vals_ array as well since it will be used
      //during dispatch
      valuesObj.val = util.decodeQueryString(val, shouldTypecast);
      valuesObj.values[n] = val;
    }
    // IE will capture optional groups as empty strings while other
    // browsers will capture `undefined` so normalize behavior.
    // see: #gh-58, #gh-59, #gh-60
    if ( _hasOptionalGroupBug && val === '' && util.arrayIndexOf(this.optionalParamsIds(), param) !== -1 ) {
      valuesObj.val = void(0);
      valuesObj.values[n] = val;
    }
    valuesObj.o[param] = val;
    return valuesObj;
  },

  getParamsArray : function () {
    var norm = this.rules() ? this.rules().normalize() : null;
    norm = norm || this.context.router.normalizeFn; // default normalize

    return (norm && isFunction(norm)) ? this.normalizedParams(norm) : this.getParamsObject().values();
  },

  normalizedParams: function(norm) {
    return norm(this.request, this.getParamsObject());
  }
};
