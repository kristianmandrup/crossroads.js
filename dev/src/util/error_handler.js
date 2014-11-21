module.exports = ErrorHandler;

var ErrorHandler = {
  _errorOutput: console.error,

  // override to customize where/how errors are logged
  _logError : function (msg, error) {
    var errMsg = msg + ': ' + error.toString();
    this._errorOutput(errMsg);
  }
};

