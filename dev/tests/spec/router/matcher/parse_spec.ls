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

    describe 'optional params' ->
        specify 'should capture optional params' ->
            calls = 0

            a = crossroads.addRoute 'foo/:lorem:/:ipsum:/:dolor:/:sit:'
            a.matched.add (a, b, c, d) ->
                expect( a ).toBe 'lorem' 
                expect( b ).toBe '123' 
                expect( c ).toBe 'true' 
                expect( d ).toBe 'false' 
                calls++

            crossroads.parse 'foo/lorem/123/true/false'
            expect( calls ).toBe 1 


        specify 'should only pass matched params' ->
            calls = 0

            a = crossroads.addRoute 'foo/:lorem:/:ipsum:/:dolor:/:sit:'
            a.matched.add (a, b, c, d) ->
                expect( a ).toBe 'lorem' 
                expect( b ).toBe '123' 
                expect( c ).toBeUndefined!
                expect( d ).toBeUndefined!
                calls++

            crossroads.parse 'foo/lorem/123'

            expect( calls ).toBe 1 

    describe 'regex route' ->

        specify 'should capture groups' ->
            calls = 0
            a = crossroads.addRoute /^\/[0-9]+\/([0-9]+)$/ #capturing groups becomes params
            a.matched.add (foo, bar) ->
                expect( foo ).toBe '456'
                expect( bar ).toBeUndefined!
                calls++

            crossroads.parse '/123/456'
            crossroads.parse '/maecennas/ullamcor'
            expect( calls ).toBe 1

        specify 'should capture even empty groups' ->
            calls = 0

            a = crossroads.addRoute /^\/()\/([0-9]+)$/ #capturing groups becomes params
            a.matched.add (foo, bar) ->
                expect( foo ).toBe ''
                expect( bar ).toBe '456'
                calls++

            crossroads.parse '#456'
            expect( calls ).toBe 1


    describe 'typecast values' ->

        specify 'should typecast values if shouldTypecast is set to true' ->
            crossroads.shouldTypecast = true

            calls = 0

            a = crossroads.addRoute '{a}/{b}/{c}/{d}/{e}/{f}'
            a.matched.add (a, b, c, d, e, f) ->
                expect( a ).toBe 'lorem'
                expect( b ).toBe 123
                expect( c ).toBe true
                expect( d ).toBe false
                expect( e ).toBe null
                expect( f ).toBe undefined
                calls++


            crossroads.parse 'lorem/123/true/false/null/undefined'

            expect( calls ).toBe 1

        specify 'should not typecast if shouldTypecast is set to false' ->
            crossroads.shouldTypecast = false

            calls = 0

            a = crossroads.addRoute '{lorem}/{ipsum}/{dolor}/{sit}'
            a.matched.add (a, b, c, d) ->
                expect( a ).toBe 'lorem' 
                expect( b ).toBe '123' 
                expect( c ).toBe 'true' 
                expect( d ).toBe 'false' 
                calls++

            crossroads.parse 'lorem/123/true/false'

            expect( calls ).toBe 1 

    describe 'rules.normalize_' ->

        specify 'should normalize params before dispatching signal' ->

            var t1, t2, t3, t4, t5, t6, t7, t8

            #based on: https:#github.com/millermedeiros/crossroads.js/issues/21

            myRoute = crossroads.addRoute '{a}/{b}/:c:/:d:'
            myRoute.rules =
                a : ['news', 'article']
                b : /[\-0-9a-zA-Z]+/
                request_ : /\/[0-9]+\/|$/
                normalize_ : (request, vals) ->
                    var id
                    idRegex = /^[0-9]+$/
                    if vals.a === 'article'
                        id = vals.c
                    else
                        if idRegex.test(vals.b)
                            id = vals.b
                        else if idRegex.test(vals.c)
                            id = vals.c

                    return ['news', id] #return params

            myRoute.matched.addOnce (a, b) ->
                t1 = a
                t2 = b

            crossroads.parse 'news/111/lorem-ipsum'

            myRoute.matched.addOnce (a, b) ->
                t3 = a
                t4 = b

            crossroads.parse 'news/foo/222/lorem-ipsum'

            myRoute.matched.addOnce (a, b) ->
                t5 = a
                t6 = b
            
            crossroads.parse 'news/333'

            myRoute.matched.addOnce (a, b) ->
                t7 = a
                t8 = b

            crossroads.parse 'article/news/444'

            expect( t1 ).toBe 'news' 
            expect( t2 ).toBe '111' 
            expect( t3 ).toBe 'news' 
            expect( t4 ).toBe '222' 
            expect( t5 ).toBe 'news' 
            expect( t6 ).toBe '333' 
            expect( t7 ).toBe 'news' 
            expect( t8 ).toBe '444' 

    describe 'crossroads.normalizeFn' ->
        var prevNorm

        before-each ->
            prevNorm = crossroads.normalizeFn

        afterEach ->
            crossroads.normalizeFn = prevNorm

        specify 'should work as a default normalize_' ->
            var t1, t2, t3, t4, t5, t6, t7, t8

            crossroads.normalizeFn = (request, vals) ->
                var id
                idRegex = /^[0-9]+$/
                if vals.a === 'article'
                    id = vals.c
                else
                    if idRegex.test(vals.b)
                        id = vals.b
                    else if idRegex.test(vals.c)
                        id = vals.c

                ['news', id] #return params
            

            route1 = crossroads.addRoute 'news/{b}/:c:/:d:'
            route1.matched.addOnce (a, b) ->
                t1 = a
                t2 = b
            
            crossroads.parse 'news/111/lorem-ipsum'

            route2 = crossroads.addRoute '{a}/{b}/:c:/:d:'
            route2.rules =
                a : ['news', 'article']
                b : /[\-0-9a-zA-Z]+/
                request_ : /\/[0-9]+\/|$/
                normalize_ :  (req, vals) ->
                    ['foo', vals.b]

            route2.matched.addOnce (a, b) ->
                t3 = a
                t4 = b
                
            crossroads.parse 'article/333'

            expect( t1 ).toBe 'news' 
            expect( t2 ).toBe '111' 
            expect( t3 ).toBe 'foo' 
            expect( t4 ).toBe '333'

        specify 'should receive all values as an array on the special property `vals_`' ->

            var t1, t2

            crossroads.normalizeFn = (request, vals) ->
                #convert params into an array..
                [vals.vals_]
            

            crossroads.addRoute '/{a}/{b}', (params) ->
                t1 = params
            
            crossroads.addRoute '/{a}', (params) ->
                t2 = params
            

            crossroads.parse '/foo/bar'
            crossroads.parse '/foo'

            expect( t1.join '' ).toEqual ['foo', 'bar'].join ''
            expect( t2.join '' ).toEqual ['foo'].join ''


        describe 'NORM_AS_ARRAY' ->

            specify 'should pass array' ->
                var arg

                crossroads.normalizeFn = crossroads.NORM_AS_ARRAY
                crossroads.addRoute '/{a}/{b}', (a) ->
                    arg = a
                
                crossroads.parse '/foo/bar'

                expect( {}.toString.call arg ).toEqual '[object Array]' 
                expect( arg[0] ).toEqual 'foo' 
                expect( arg[1] ).toEqual 'bar' 

        describe 'NORM_AS_OBJECT' ->

            specify 'should pass object' ->
                var arg

                crossroads.normalizeFn = crossroads.NORM_AS_OBJECT
                crossroads.addRoute '/{a}/{b}', (a) ->
                    arg = a
                
                crossroads.parse '/foo/bar'

                expect( arg.a ).toEqual 'foo' 
                expect( arg.b ).toEqual 'bar' 

        describe 'normalizeFn = null' ->

            specify 'should pass multiple args' ->
                var arg1, arg2

                crossroads.normalizeFn = null
                crossroads.addRoute '/{a}/{b}', (a, b) ->
                    arg1 = a
                    arg2 = b

                crossroads.parse '/foo/bar'

                expect( arg1 ).toEqual  'foo' 
                expect( arg2 ).toEqual  'bar' 

    describe 'priority' ->

        specify 'should enforce match order' ->
            calls = 0

            a = crossroads.addRoute '/{foo}/{bar}'
            a.matched.add (foo, bar) ->
                throw new Error 'shouldn\'t match but matched ' + foo + ' ' + bar


            b = crossroads.addRoute '/{foo}/{bar}', null, 1
            b.matched.add (foo, bar) ->
                expect( foo ).toBe '123' 
                expect( bar ).toBe '456' 
                calls++

            crossroads.parse '/123/456'
            expect( calls ).toBe 1 


        specify 'shouldnt matter if there is a gap between priorities' ->
            calls = 0

            fun = (foo, bar) ->
                throw new Error 'shouldn\'t match but matched ' + foo + ' ' + bar

            a = crossroads.addRoute '/{foo}/{bar}', fun, 4

            fun2 = (foo, bar) ->
                expect( foo ).toBe '123'
                expect( bar ).toBe '456'
                calls++

            b = crossroads.addRoute '/{foo}/{bar}', fun2, 999

            crossroads.parse '/123/456'

            expect( calls ).toBe 1 


    describe 'validate params before dispatch' ->

        specify 'should ignore routes that don\'t validate' ->
            calls = ''

            pattern = '{foo}-{bar}'

            a = crossroads.addRoute pattern
            a.matched.add (foo, bar) ->
                expect( foo ).toBe 'lorem' 
                expect( bar ).toBe '123' 
                calls += 'a'

            a.rules =
                foo : /\w+/
                bar : (value, request, matches) ->
                    request === 'lorem-123'

            b = crossroads.addRoute pattern
            b.matched.add (foo, bar) ->
                expect( foo ).toBe '123' 
                expect( bar ).toBe 'ullamcor' 
                calls += 'b'

            b.rules =
                foo : ['123', '456', '567', '2']
                bar : /ullamcor/

            crossroads.parse '45-ullamcor' #first so we make sure it bypassed route `a`
            crossroads.parse '123-ullamcor'
            crossroads.parse 'lorem-123'
            crossroads.parse 'lorem-555'

            expect( calls ).toBe 'ba' 


        specify 'should consider invalid rules as not matching' ->
            pattern = '{foo}-{bar}'

            a = crossroads.addRoute pattern
            a.matched.add (foo, bar) ->
                throw new Error 'first route was matched when it should not have been'

            a.rules =
                foo : 'lorem'
                bar : 123

            b = crossroads.addRoute pattern
            b.matched.add (foo, bar) ->
                throw new Error 'second route was matched when it should not have been'

            b.rules =
                foo : false
                bar : void

            crossroads.parse '45-ullamcor'
            crossroads.parse 'lorem-123'
