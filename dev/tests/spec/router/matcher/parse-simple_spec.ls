describe 'crossroads parse' ->

  var _prevTypecast


  beforeEach ->
      _prevTypecast = crossroads.shouldTypecast



  afterEach ->
      crossroads.resetState!
      crossroads.removeAllRoutes!
      crossroads.routed.removeAll!
      crossroads.bypassed.removeAll!
      crossroads.shouldTypecast = _prevTypecast

  describe 'parse' ->

    var _prevTypecast
  
  
    beforeEach ->
        _prevTypecast = crossroads.shouldTypecast
    
  
  
    afterEach ->
        crossroads.resetState!
        crossroads.removeAllRoutes!
        crossroads.routed.removeAll!
        crossroads.bypassed.removeAll!
        crossroads.shouldTypecast = _prevTypecast
    
  
    describe 'simple string route' ->

      specify 'shold route basic strings' ->
        t1 = 0

        crossroads.addRoute '/foo',  (a) ->
            t1++

        crossroads.parse '/bar'
        crossroads.parse '/foo'
        crossroads.parse 'foo'

        expect( t1 ).toBe 2


        specify 'should pass params and allow multiple routes' ->
          var t1, t2, t3

          crossroads.addRoute '/{foo}',  (foo) ->
              t1 = foo

          crossroads.addRoute '/{foo}/{bar}',  (foo, bar) ->
              t2 = foo
              t3 = bar

          crossroads.parse '/lorem_ipsum'
          crossroads.parse '/maecennas/ullamcor'

          expect( t1 ).toBe 'lorem_ipsum'
          expect( t2 ).toBe 'maecennas'
          expect( t3 ).toBe 'ullamcor'


          specify 'should dispatch matched signal' ->
            var t1, t2, t3

            a = crossroads.addRoute '/{foo}'
            a.matched.add (foo) ->
                t1 = foo


            b = crossroads.addRoute '/{foo}/{bar}'
            b.matched.add (foo, bar) ->
                t2 = foo
                t3 = bar


            crossroads.parse '/lorem_ipsum'
            crossroads.parse '/maecennas/ullamcor'

            expect( t1 ).toBe 'lorem_ipsum'
            expect( t2 ).toBe 'maecennas'
            expect( t3 ).toBe 'ullamcor'


        specify 'should handle a word separator that isn\'t necessarily /' ->
          var t1, t2, t3, t4

          a = crossroads.addRoute '/{foo}_{bar}'
          a.matched.add (foo, bar) ->
              t1 = foo
              t2 = bar


          b = crossroads.addRoute '/{foo}-{bar}'
          b.matched.add (foo, bar) ->
              t3 = foo
              t4 = bar


          crossroads.parse '/lorem_ipsum'
          crossroads.parse '/maecennas-ullamcor'

          expect( t1 ).toBe 'lorem'
          expect( t2 ).toBe 'ipsum'
          expect( t3 ).toBe 'maecennas'
          expect( t4 ).toBe 'ullamcor'


        specify 'should handle empty routes' ->
          calls = 0

          a = crossroads.addRoute!
          a.matched.add (foo, bar) ->
              expect( foo ).toBeUndefined!
              expect( bar ).toBeUndefined!
              calls++


          crossroads.parse '/123/456'
          crossroads.parse '/maecennas/ullamcor'
          crossroads.parse ''

          expect( calls ).toBe 1


        specify 'should handle empty strings' ->
          calls = 0

          a = crossroads.addRoute ''
          a.matched.add (foo, bar) ->
              expect( foo ).toBeUndefined!
              expect( bar ).toBeUndefined!
              calls++


          crossroads.parse '/123/456'
          crossroads.parse '/maecennas/ullamcor'
          crossroads.parse ''

          expect( calls ).toBe 1


        specify 'should route `null` as empty string' ->
          calls = 0

          a = crossroads.addRoute ''
          a.matched.add (foo, bar) ->
              expect( foo ).toBeUndefined!
              expect( bar ).toBeUndefined!
              calls++


          crossroads.parse '/123/456'
          crossroads.parse '/maecennas/ullamcor'
          crossroads.parse!

          expect( calls ).toBe 1

    describe 'simple string route' ->

      specify 'shold route basic strings' ->
        t1 = 0

        crossroads.addRoute '/foo', (a) ->
            t1++

        crossroads.parse '/bar'
        crossroads.parse '/foo'
        crossroads.parse 'foo'

        expect( t1 ).toBe 2


      specify 'should pass params and allow multiple routes' ->
        var t1, t2, t3

        crossroads.addRoute '/{foo}',  (foo) ->
            t1 = foo

        crossroads.addRoute '/{foo}/{bar}',  (foo, bar) ->
            t2 = foo
            t3 = bar

        crossroads.parse '/lorem_ipsum'
        crossroads.parse '/maecennas/ullamcor'

        expect( t1 ).toBe 'lorem_ipsum'
        expect( t2 ).toBe 'maecennas'
        expect( t3 ).toBe 'ullamcor'


      specify 'should dispatch matched signal' ->
        var t1, t2, t3

        a = crossroads.addRoute '/{foo}'
        a.matched.add (foo) ->
            t1 = foo


        b = crossroads.addRoute '/{foo}/{bar}'
        b.matched.add (foo, bar) ->
            t2 = foo
            t3 = bar


        crossroads.parse '/lorem_ipsum'
        crossroads.parse '/maecennas/ullamcor'

        expect( t1 ).toBe 'lorem_ipsum'
        expect( t2 ).toBe 'maecennas'
        expect( t3 ).toBe 'ullamcor'


      specify 'should handle a word separator that isn\'t necessarily /' ->
        var t1, t2, t3, t4

        a = crossroads.addRoute '/{foo}_{bar}'
        a.matched.add (foo, bar) ->
            t1 = foo
            t2 = bar


        b = crossroads.addRoute '/{foo}-{bar}'
        b.matched.add (foo, bar) ->
            t3 = foo
            t4 = bar


        crossroads.parse '/lorem_ipsum'
        crossroads.parse '/maecennas-ullamcor'

        expect( t1 ).toBe 'lorem'
        expect( t2 ).toBe 'ipsum'
        expect( t3 ).toBe 'maecennas'
        expect( t4 ).toBe 'ullamcor'


      specify 'should handle empty routes' ->
        calls = 0

        a = crossroads.addRoute!
        a.matched.add (foo, bar) ->
            expect( foo ).toBeUndefined!
            expect( bar ).toBeUndefined!
            calls++


        crossroads.parse '/123/456'
        crossroads.parse '/maecennas/ullamcor'
        crossroads.parse ''

        expect( calls ).toBe 1


      specify 'should handle empty strings' ->
        calls = 0

        a = crossroads.addRoute ''
        a.matched.add (foo, bar) ->
            expect( foo ).toBeUndefined!
            expect( bar ).toBeUndefined!
            calls++


        crossroads.parse '/123/456'
        crossroads.parse '/maecennas/ullamcor'
        crossroads.parse ''

        expect( calls ).toBe 1


      specify 'should route `null` as empty string' ->
        calls = 0

        a = crossroads.addRoute ''
        a.matched.add (foo, bar) ->
            expect( foo ).toBeUndefined!
            expect( bar ).toBeUndefined!
            calls++


        crossroads.parse '/123/456'
        crossroads.parse '/maecennas/ullamcor'
        crossroads.parse!

        expect( calls ).toBe 1



