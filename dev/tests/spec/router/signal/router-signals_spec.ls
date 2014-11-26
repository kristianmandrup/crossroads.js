signals = require '../../../signal/signals'

signal-producer = {}

describe 'Signals' ->
  after-each ->
    signal-producer.bypassed.removeAll!
    signal-producer.routed.removeAll!

  specify 'should dispatch bypassed if don\'t match any route' ->
    count = 0
    requests = []

    a = crossroads.addRoute '/{foo}_{bar}'

    a.matched.add (foo, bar) ->
      expect(null).toEqual 'fail: shouldn\'t match'

    crossroads.bypassed.add (request) ->
      requests.push request
      count++

    crossroads.parse '/lorem/ipsum'
    crossroads.parse '/foo/bar'

    expect( requests[0] ).toBe '/lorem/ipsum'
    expect( requests[1] ).toBe '/foo/bar'
    expect( count ).toBe 2

  specify 'should dispatch routed at each match' ->
    count = 0
    requests = []
    count2 = 0
    var routed
    var first

    a = crossroads.addRoute '/{foo}_{bar}'
    a.matched.add (foo, bar) ->
      count++

    crossroads.bypassed.add (request) ->
      requests.push request
      count2++

    crossroads.routed.add (request, data) ->
      requests.push request
      count++

      expect( request ).toBe '/foo_bar'
      expect( data.route ).toBe a
      expect( data.params[0] ).toEqual 'foo'
      expect( data.params[1] ).toEqual 'bar'
      routed = true
      first = data.isFirst

    crossroads.parse '/lorem/ipsum'
    crossroads.parse '/foo_bar'

    expect( requests[0] ).toBe '/lorem/ipsum'
    expect( requests[1] ).toBe '/foo_bar'
    expect( count ).toBe 2
    expect( count2 ).toBe 1
    expect( routed ).toEqual true
    expect( first ).toEqual true

  specify 'should not dispatch routed/bypassed/matched twice for same request multiple times in a row' ->
    bypassed = []
    routed = []
    matched = []
    switched = []

    a = crossroads.addRoute '/{foo}_{bar}'
    a.matched.add (a, b) ->
      matched.push a, b

    a.switched.add (req) ->
      switched.push req

    crossroads.bypassed.add (req) ->
      bypassed.push req

    crossroads.routed.add (req, data) ->
      routed.push req
      expect( data.route ).toBe a

    crossroads.parse '/lorem/ipsum' # bypass
    crossroads.parse '/foo_bar' # match
    crossroads.parse '/foo_bar' # this shouldn't trigger routed/matched
    crossroads.parse '/lorem_ipsum' # match
    crossroads.parse '/dolor' # bypass
    crossroads.parse '/dolor' # this shouldn't trigger bypassed
    crossroads.parse '/lorem_ipsum' # this shouldn't trigger routed/matched
    crossroads.parse '/lorem_ipsum' # this shouldn't trigger routed/matched
    crossroads.parse '/lorem_ipsum' # this shouldn't trigger routed/matched

    # it should skip duplicates
    expect( routed ).toEqual [
      '/foo_bar',
      '/lorem_ipsum'
    ]

    expect( bypassed ).toEqual [
      '/lorem/ipsum',
      '/dolor'
    ]

    expect( switched ).toEqual []
    expect( matched ).toEqual [
      'foo',
      'bar',
      'lorem',
      'ipsum'
    ]