/*jshint onevar:false */

//for node
var errHandler = require('../../../util/error_handler');
var msgStack   = [];
//end node

describe('ErrorHandler', function(){
  beforeEach(function(){
    errHandler._errorOutput = function(msg) {
      msgStack.push(msg);
    };
  });

  describe('_errorOutput', function(){
    it('should set output to custom sink', function(){
      // TODO
    });
  });

  describe('_logError', function(){
    it('should output error to custom sink', function(){
      errHandler._logError('hello');
      expect(msgStack[0]).toBe('error: hello');
    });
  });
});

