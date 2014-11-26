errHandler = require '../../../util/error_handler'
msgStack   = []

describe 'ErrorHandler' ->
  before-each ->
    errHandler._errorOutput = (msg) ->
      msgStack.push msg

  describe '_errorOutput' ->
    specify 'should set output to custom sink' ->

  describe '_logError' ->
    specify 'should output error to custom sink' ->
      errHandler._logError 'hello'
      expect(msgStack[0]).toBe 'error: hello'

