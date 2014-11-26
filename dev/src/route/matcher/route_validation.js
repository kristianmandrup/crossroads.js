module.exports = RouteValidation;

// _validateParams(request), _isValidParam(request, prop, values), _isValidArrayRule(arr, val),

var util = require('../../utils');

var RouteValidation = {
  _validateParams : function (request) {
      var rules = this.rules,
          values = this._getParamsObject(request),
          key;
      for (key in rules) {
          // normalize_ isn't a validation rule... (#39)
          if(key !== 'normalize_' && rules.hasOwnProperty(key) && ! this._isValidParam(request, key, values)){
              return false;
          }
      }
      return true;
  },

  _isValidParam : function (request, prop, values) {
      var validationRule = this.rules[prop],
          val = values[prop],
          isValid = false,
          isQuery = (prop.indexOf('?') === 0);

      if (val == null && this._optionalParamsIds && util.arrayIndexOf(this._optionalParamsIds, prop) !== -1) {
          isValid = true;
      }
      else if (isRegExp(validationRule)) {
          if (isQuery) {
              val = values[prop +'_']; //use raw string
          }
          isValid = validationRule.test(val);
      }
      else if (isArray(validationRule)) {
          if (isQuery) {
              val = values[prop +'_']; //use raw string
          }
          isValid = this._isValidArrayRule(validationRule, val);
      }
      else if (isFunction(validationRule)) {
          isValid = validationRule(val, request, values);
      }

      return isValid; //fail silently if validationRule is from an unsupported type
  },

  _isValidArrayRule : function (arr, val) {
      if (! this._router.ignoreCase) {
          return util.arrayIndexOf(arr, val) !== -1;
      }

      if (typeof val === 'string') {
          val = val.toLowerCase();
      }

      var n = arr.length,
          item,
          compareVal;

      while (n--) {
          item = arr[n];
          compareVal = (typeof item === 'string')? item.toLowerCase() : item;
          if (compareVal === val) {
              return true;
          }
      }
      return false;
  }
};
