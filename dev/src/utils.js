var UNDEF;

// Helpers -----------
//====================
var Xtender = {
    extend: require("xtend")
};

// TODO: move utility function to where they are used if possible
module.exports = {
    arrayIndexOf: arrayIndexOf,
    arrayRemove: arrayRemove,
    isKind: isKind,
    isArray: isArray,
    isFunction: isFunction,
    typecastValue: typecastValue,
    typecastArrayValues: typecastArrayValues,
    decodeQueryString: decodeQueryString,
    Xtender: Xtender
};


if (!Object.create) {
  Object.create = function(proto) {
      function F(){}
      F.prototype = proto;
      return new F;
  }
}

function arrayIndexOf(arr, val) {
    if (arr.indexOf) {
        return arr.indexOf(val);
    } else {
        //Array.indexOf doesn't work on IE 6-7
        var n = arr.length;
        while (n--) {
            if (arr[n] === val) {
                return n;
            }
        }
        return -1;
    }
}

function arrayRemove(arr, item) {
    var i = arrayIndexOf(arr, item);
    if (i !== -1) {
        arr.splice(i, 1);
    }
}

function isKind(val, kind) {
    return '[object '+ kind +']' === Object.prototype.toString.call(val);
}

function isArray(val) {
    return isKind(val, 'Array');
}

function isFunction(val) {
    return typeof val === 'function';
}

//borrowed from AMD-utils
function typecastValue(val) {
    var r;
    if (val === null || val === 'null') {
        r = null;
    } else if (val === 'true') {
        r = true;
    } else if (val === 'false') {
        r = false;
    } else if (val === UNDEF || val === 'undefined') {
        r = UNDEF;
    } else if (val === '' || isNaN(val)) {
        //isNaN('') returns false
        r = val;
    } else {
        //parseFloat(null || '') returns NaN
        r = parseFloat(val);
    }
    return r;
}

function typecastArrayValues(values) {
    var n = values.length,
        result = [];
    while (n--) {
        result[n] = typecastValue(values[n]);
    }
    return result;
}

//borrowed from AMD-Utils
function decodeQueryString(str, shouldTypecast) {
    var queryArr = (str || '').replace('?', '').split('&'),
        n = queryArr.length,
        obj = {},
        item, val;
    while (n--) {
        item = queryArr[n].split('=');
        val = shouldTypecast ? typecastValue(item[1]) : item[1];
        obj[item[0]] = (typeof val === 'string')? decodeURIComponent(val) : val;
    }
    return obj;
}
