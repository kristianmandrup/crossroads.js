signals = require '../../../signal/signals'
signal-producer = {}

describe 'Signals' ->
  after-each ->
    signal-producer.bypassed.removeAll!
    signal-producer.routed.removeAll!

  specify 'should dispatch routed/bypassed/matched twice for same request if calling resetState() in between' ->
    bypassed = []
    routed = []
    matched = []
    switched = []

    a = crossroads.addRoute '/{foo}_{bar}'
    a.matched.add (a, b) ->
      matched.push a, b

    a.switched.add (req) ->
      switched.push req

    b = crossroads.addRoute '/maecennas'
    b.matched.add ->
      matched.push 'maecennas'

    b.switched.add (req) ->
      switched.push req

    crossroads.bypassed.add (req) ->
      bypassed.push req

    crossroads.routed.add (req, data) ->
      routed.push req

    crossroads.parse '/lorem/ipsum' # bypass
    crossroads.parse '/foo_bar' # match

    crossroads.resetState!

    crossroads.parse '/foo_bar' # routed/matched
    crossroads.parse '/lorem_ipsum' # match
    crossroads.parse '/dolor' # bypass

    crossroads.resetState!

    crossroads.parse '/dolor' # bypass

    crossroads.parse '/lorem_ipsum' # routed/matched
    crossroads.parse '/maecennas' # routed/matched/switched
    crossroads.parse '/lorem_ipsum' # routed/matched
    crossroads.parse '/lorem_ipsum' # this shouldn't trigger routed/matched

    # it should skip duplicates only if didn't called resetState in
    # between
    expect( routed ).toEqual [
      '/foo_bar',
      '/foo_bar',
      '/lorem_ipsum',
      '/lorem_ipsum',
      '/maecennas',
      '/lorem_ipsum'
    ]
    expect( bypassed ).toEqual [
      '/lorem/ipsum',
      '/dolor',
      '/dolor'
    ]
    expect( switched ).toEqual [
      '/maecennas',
      '/lorem_ipsum'
    ] 
    expect( matched ).toEqual [
      'foo',
      'bar',
      'foo',
      'bar',
      'lorem',
      'ipsum',
      'lorem',
      'ipsum',
      'maecennas',
      'lorem',
      'ipsum'
    ]

  specify 'should dispatch routed/bypassed/matched multiple times for same request if ignoreState == true' ->
    bypassed = []
    routed = []
    matched = []
    switched = []

    # toggle behavior
    crossroads.ignoreState = true

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
    crossroads.parse '/foo_bar' # routed/matched
    crossroads.parse '/foo_bar' # routed/matched
    crossroads.parse '/lorem_ipsum' # routed/matched
    crossroads.parse '/dolor' # bypass
    crossroads.parse '/dolor' # bypass
    crossroads.parse '/lorem_ipsum' # routed/matched
    crossroads.parse '/lorem_ipsum' # routed/matched

    # it should skip duplicates
    expect( routed ).toEqual [
      '/foo_bar',
      '/foo_bar',
      '/lorem_ipsum',
      '/lorem_ipsum',
      '/lorem_ipsum'
    ]
    expect( bypassed ).toEqual [
      '/lorem/ipsum',
      '/dolor',
      '/dolor'
    ]
    expect( switched ).toEqual [] 
    expect( matched ).toEqual [
      'foo',
      'bar',
      'foo',
      'bar',
      'lorem',
      'ipsum',
      'lorem',
      'ipsum',
      'lorem',
      'ipsum'
    ]

  specify 'isFirst should be false on greedy matches' ->
    count = 0
    firsts = []

    crossroads.routed.add (req, data) ->
      count += 1
      firsts.push data.isFirst

    # anti-pattern!
    crossroads.addRoute '/{a}/{b}'
    crossroads.addRoute '/{a}/{b}' .greedy = true
    crossroads.addRoute '/{a}/{b}' .greedy = true

    crossroads.parse '/foo/bar'

    expect( count ).toEqual 3
    expect( firsts[0] ).toEqual true
    expect( firsts[1] ).toEqual false
    expect( firsts[2] ).toEqual false


  specify 'should dispatch `switched` when matching another route' ->
    count = 0
    vals = []
    var req

    r1 = crossroads.addRoute '/{a}', (a) ->
      vals.push a
      count += 1

    r1.switched.add (r) ->
      vals.push 'SWITCH' # make sure happened before next matched
      req = r
      count += 1

    r2 = crossroads.addRoute '/foo/{a}', (a) ->
      vals.push a
      count += 1

    # matching same route twice shouldn't trigger a switched signal (#50)
    crossroads.parse '/foo'
    crossroads.parse '/dolor'

    crossroads.parse '/foo/bar'

    expect( count ).toBe 4
    expect( vals ).toEqual ['foo', 'dolor', 'SWITCH', 'bar'] 
    expect( req ).toEqual '/foo/bar'
