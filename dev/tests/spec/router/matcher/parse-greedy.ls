crossroads = require '../../../crossroads'

describe 'crossroads.parse )' ->

    var _prevTypecast

    before-each ->
        _prevTypecast = crossroads.shouldTypecast

    after-each ->
        crossroads.resetState!
        crossroads.removeAllRoutes!
        crossroads.routed.removeAll!
        crossroads.bypassed.removeAll!
        crossroads.shouldTypecast = _prevTypecast
    
    describe 'greedy routes' ->

        specify 'should match multiple greedy routes' ->

            var t1, t2, t3, t4, t5, t6, t7, t8

            r1 = crossroads.addRoute '/{a}/{b}/', (a,b) ->
                t1 = a
                t2 = b
            
            r1.greedy = false

            r2 = crossroads.addRoute '/bar/{b}/', (a,b) ->
                t3 = a
                t4 = b
            
            r2.greedy = true

            r3 = crossroads.addRoute '/foo/{b}/', (a,b) ->
                t5 = a
                t6 = b

            r3.greedy = true

            r4 = crossroads.addRoute '/{a}/:b:/', (a,b) ->
                t7 = a
                t8 = b

            r4.greedy = true

            crossroads.parse '/foo/lorem'

            expect( t1 ).toEqual  'foo' 
            expect( t2 ).toEqual  'lorem' 
            expect( t3 ).toBeUndefined!
            expect( t4 ).toBeUndefined!
            expect( t5 ).toEqual  'lorem' 
            expect( t6 ).toBeUndefined!
            expect( t7 ).toEqual  'foo' 
            expect( t8 ).toEqual  'lorem' 


        specify 'should allow global greedy setting' ->

            var t1, t2, t3, t4, t5, t6, t7, t8

            crossroads.greedy = true

            r1 = crossroads.addRoute '/{a}/{b}/', (a,b) ->
                t1 = a
                t2 = b


            r2 = crossroads.addRoute '/bar/{b}/', (a,b) ->
                t3 = a
                t4 = b


            r3 = crossroads.addRoute '/foo/{b}/', (a,b) ->
                t5 = a
                t6 = b


            r4 = crossroads.addRoute '/{a}/:b:/', (a,b) ->
                t7 = a
                t8 = b


            crossroads.parse '/foo/lorem'

            expect( t1 ).toEqual  'foo' 
            expect( t2 ).toEqual  'lorem' 
            expect( t3 ).toBeUndefined!
            expect( t4 ).toBeUndefined!
            expect( t5 ).toEqual  'lorem' 
            expect( t6 ).toBeUndefined!
            expect( t7 ).toEqual  'foo' 
            expect( t8 ).toEqual  'lorem' 

            crossroads.greedy = false


        describe 'greedyEnabled' ->

            afterEach ->
                crossroads.greedyEnabled = true

            specify 'should toggle greedy behavior' ->
                crossroads.greedyEnabled = false

                var t1, t2, t3, t4, t5, t6, t7, t8

                r1 = crossroads.addRoute '/{a}/{b}/', (a,b) ->
                    t1 = a
                    t2 = b

                r1.greedy = false

                r2 = crossroads.addRoute '/bar/{b}/', (a,b) ->
                    t3 = a
                    t4 = b

                r2.greedy = true

                r3 = crossroads.addRoute '/foo/{b}/', (a,b) ->
                    t5 = a
                    t6 = b

                r3.greedy = true

                r4 = crossroads.addRoute '/{a}/:b:/', (a,b) ->
                    t7 = a
                    t8 = b

                r4.greedy = true

                crossroads.parse '/foo/lorem'

                expect( t1 ).toEqual  'foo' 
                expect( t2 ).toEqual  'lorem' 
                expect( t3 ).toBeUndefined!
                expect( t4 ).toBeUndefined!
                expect( t5 ).toBeUndefined!
                expect( t6 ).toBeUndefined!
                expect( t7 ).toBeUndefined!
                expect( t8 ).toBeUndefined!

    describe 'default arguments' ->

        specify 'should pass default arguments to all signals' ->

            var t1, t2, t3, t4, t5, t6, t7, t8

            crossroads.addRoute 'foo', (a, b) ->
                t1 = a
                t2 = b
            

            crossroads.bypassed.add (a, b, c) ->
                t3 = a
                t4 = b
                t5 = c
            

            crossroads.routed.add (a, b, c) ->
                t6 = a
                t7 = b
                t8 = c
            

            crossroads.parse 'foo', [123, 'dolor']
            crossroads.parse 'bar', ['ipsum', 123]

            expect( t1 ).toEqual  123 
            expect( t2 ).toEqual  'dolor' 
            expect( t3 ).toEqual  'ipsum' 
            expect( t4 ).toEqual  123 
            expect( t5 ).toEqual  'bar' 
            expect( t6 ).toEqual  123 
            expect( t7 ).toEqual  'dolor' 
            expect( t8 ).toEqual  'foo' 


    describe 'rest params' ->

        specify 'should pass rest as a single argument' ->
            var t1, t2, t3, t4, t5, t6, t7, t8, t9

            r = crossroads.addRoute '{a}/{b}/:c*:'
            r.rules =
                a : ['news', 'article']
                b : /[\-0-9a-zA-Z]+/
                'c*' : ['foo/bar', 'edit', '123/456/789']
            

            r.matched.addOnce (a, b, c) ->
                t1 = a
                t2 = b
                t3 = c
            
            crossroads.parse 'article/333'

            expect( t1 ).toBe 'article' 
            expect( t2 ).toBe '333' 
            expect( t3 ).toBeUndefined!

            r.matched.addOnce (a, b, c) ->
                t4 = a
                t5 = b
                t6 = c
            
            crossroads.parse 'news/456/foo/bar'

            expect( t4 ).toBe 'news' 
            expect( t5 ).toBe '456' 
            expect( t6 ).toBe 'foo/bar' 

            r.matched.addOnce (a, b, c) ->
                t7 = a
                t8 = b
                t9 = c
            
            crossroads.parse 'news/456/123/aaa/bbb'

            expect( t7 ).toBeUndefined!
            expect( t8 ).toBeUndefined!
            expect( t9 ).toBeUndefined!
        

        specify 'should work in the middle of segment as well' ->
            var t1, t2, t3, t4, t5, t6, t7, t8, t9

            # since rest segment is greedy the last segment can't be optional
            r = crossroads.addRoute '{a}/{b*}/{c}'
            r.rules = 
                a : ['news', 'article']
                c : ['add', 'edit']
            

            r.matched.addOnce (a, b, c) ->
                t1 = a
                t2 = b
                t3 = c
            
            crossroads.parse 'article/333/add'

            expect( t1 ).toBe 'article' 
            expect( t2 ).toBe '333' 
            expect( t3 ).toBe 'add' 

            r.matched.addOnce (a, b, c) ->
                t4 = a
                t5 = b
                t6 = c
            
            crossroads.parse 'news/456/foo/bar/edit'

            expect( t4 ).toBe 'news' 
            expect( t5 ).toBe '456/foo/bar' 
            expect( t6 ).toBe 'edit' 

            r.matched.addOnce (a, b, c) ->
                t7 = a
                t8 = b
                t9 = c

            crossroads.parse 'news/456/123/aaa/bbb'

            expect( t7 ).toBeUndefined!
            expect( t8 ).toBeUndefined!
            expect( t9 ).toBeUndefined!


        specify 'should handle multiple rest params even though they dont make sense' ->
            calls = 0

            r = crossroads.addRoute '{a}/{b*}/{c*}/{d}'
            r.rules =
                a : ['news', 'article']

            r.matched.add (a, b, c, d) ->
                expect( c ).toBe 'the' 
                expect( d ).toBe 'end' 
                calls++

            crossroads.parse 'news/456/foo/bar/this/the/end'
            crossroads.parse 'news/456/foo/bar/this/is/crazy/long/the/end'
            crossroads.parse 'article/weather/rain-tomorrow/the/end'

            expect( calls ).toBe 3 

    describe 'query string' ->

        describe 'old syntax' ->
            specify 'should only parse query string if using special capturing group' ->
                r = crossroads.addRoute '{a}?{q}#{hash}'
                var t1, t2, t3
                r.matched.addOnce (a, b, c) ->
                    t1 = a
                    t2 = b
                    t3 = c

                crossroads.parse 'foo.php?foo=bar&lorem=123#bar'

                expect( t1 ).toEqual  'foo.php' 
                expect( t2 ).toEqual  'foo=bar&lorem=123' 
                expect( t3 ).toEqual  'bar' 

        describe 'required query string after required segment' ->
            specify 'should parse query string into an object and typecast vals' ->
                crossroads.shouldTypecast = true

                r = crossroads.addRoute '{a}{?b}'
                var t1, t2
                r.matched.addOnce (a, b) ->
                    t1 = a
                    t2 = b

                crossroads.parse 'foo.php?lorem=ipsum&asd=123&bar=false'

                expect( t1 ).toEqual  'foo.php' 
                expect( t2 ).toEqual  {lorem : 'ipsum', asd : 123, bar : false} 

        describe 'required query string after optional segment' ->
            specify 'should parse query string into an object and typecast vals' ->
                crossroads.shouldTypecast = true

                r = crossroads.addRoute ':a:{?b}'
                var t1, t2
                r.matched.addOnce (a, b) ->
                    t1 = a
                    t2 = b

                crossroads.parse 'foo.php?lorem=ipsum&asd=123&bar=false'

                expect( t1 ).toEqual  'foo.php' 
                expect( t2 ).toEqual  {lorem : 'ipsum', asd : 123, bar : false} 

                var t3, t4
                r.matched.addOnce (a, b) ->
                    t3 = a
                    t4 = b

                crossroads.parse '?lorem=ipsum&asd=123'

                expect( t3 ).toBeUndefined!
                expect( t4 ).toEqual  {lorem : 'ipsum', asd : 123} 

        describe 'optional query string after required segment' ->
            specify 'should parse query string into an object and typecast vals' ->
                crossroads.shouldTypecast = true

                r = crossroads.addRoute '{a}:?b:'
                var t1, t2
                r.matched.addOnce (a, b) ->
                    t1 = a
                    t2 = b

                crossroads.parse 'foo.php?lorem=ipsum&asd=123&bar=false'

                expect( t1 ).toEqual  'foo.php' 
                expect( t2 ).toEqual  {lorem : 'ipsum', asd : 123, bar : false} 

                var t3, t4
                r.matched.addOnce (a, b) ->
                    t3 = a
                    t4 = b

                crossroads.parse 'bar.php'

                expect( t3 ).toEqual  'bar.php' 
                expect( t4 ).toBeUndefined!

        describe 'optional query string after optional segment' ->
            specify 'should parse query string into an object and typecast vals' ->
                crossroads.shouldTypecast = true

                r = crossroads.addRoute ':a::?b:'
                var t1, t2
                r.matched.addOnce (a, b) ->
                    t1 = a
                    t2 = b

                crossroads.parse 'foo.php?lorem=ipsum&asd=123&bar=false'

                expect( t1 ).toEqual  'foo.php' 
                expect( t2 ).toEqual  {lorem : 'ipsum', asd : 123, bar : false} 

                var t3, t4
                r.matched.addOnce (a, b) ->
                    t3 = a
                    t4 = b

                crossroads.parse 'bar.php'

                expect( t3 ).toEqual  'bar.php' 
                expect( t4 ).toBeUndefined!

        describe 'optional query string after required segment without typecasting' ->
            specify 'should parse query string into an object and not typecast vals' ->
                r = crossroads.addRoute '{a}:?b:'
                var t1, t2

                r.matched.addOnce (a, b) ->
                    t1 = a
                    t2 = b

                crossroads.parse 'foo.php?lorem=ipsum&asd=123&bar=false'

                expect( t1 ).toEqual  'foo.php' 
                expect( t2 ).toEqual  {lorem : 'ipsum', asd : '123', bar : 'false'} 
