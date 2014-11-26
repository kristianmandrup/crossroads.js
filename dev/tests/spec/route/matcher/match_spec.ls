describe 'Route Match' ->

    _prevTypecast
    _prevCase

    beforeEach ->
        _prevTypecast = crossroads.shouldTypecast
        _prevCase = crossroads.ignoreCase
    

    afterEach ->
        crossroads.removeAllRoutes!
        crossroads.resetState!
        crossroads.shouldTypecast = _prevTypecast
        crossroads.ignoreCase = _prevCase
    

    specify 'should match simple string' ->
        r1 = crossroads.addRoute '/lorem-ipsum'

        expect( r1.match('/lorem-ipsum') ).toBe  true 
        expect( r1.match('/lorem-ipsum/') ).toBe  true 
        expect( r1.match('/lorem-ipsum/dolor') ).toBe  false 
    

    specify 'should ignore trailing slash on pattern' ->
        r1 = crossroads.addRoute '/lorem-ipsum/'

        expect( r1.match('/lorem-ipsum') ).toBe  true 
        expect( r1.match('/lorem-ipsum/') ).toBe  true 
        expect( r1.match('/lorem-ipsum/dolor') ).toBe  false 
    

    specify 'should match params' ->
        s = crossroads.addRoute '/{foo}'

        expect( s.match('/lorem-ipsum') ).toBe  true 
        expect( s.match('/lorem-ipsum/') ).toBe  true 
        expect( s.match('/lorem-ipsum/dolor') ).toBe  false 
        expect( s.match('lorem-ipsum') ).toBe  true 
        expect( s.match('/123') ).toBe  true 
        expect( s.match('/123/') ).toBe  true 
        expect( s.match('123') ).toBe  true 
        expect( s.match('123/45') ).toBe  false 
    

    specify 'should match optional params' ->
        s = crossroads.addRoute ':bar:'
        expect( s.match('lorem-ipsum') ).toBe  true 
        expect( s.match('') ).toBe  true 
        expect( s.match('lorem-ipsum/dolor') ).toBe  false 
        expect( s.match('/lorem-ipsum/') ).toBe  true 
    

    specify 'should match normal params and optional params' ->
        s = crossroads.addRoute '/{foo}/:bar:'
        expect( s.match('/lorem-ipsum') ).toBe  true 
        expect( s.match('/lorem-ipsum/') ).toBe  true 
        expect( s.match('/lorem-ipsum/dolor') ).toBe  true 
        expect( s.match('123/45') ).toBe  true 
    

    specify 'should work even with optional params on the middle of pattern' ->
        a = crossroads.addRoute '/{foo}/:bar:/{ipsum}' #bad use!
        expect( a.match('/123/45/asd') ).toBe  true 
        expect( a.match('/123/asd') ).toBe  true 

        b = crossroads.addRoute '/{foo}:bar:{ipsum}' #bad use!
        expect( b.match('/123/45/asd') ).toBe  true 
        expect( b.match('/123/45') ).toBe  true 

        c = crossroads.addRoute '/{foo}:bar:/ipsum'
        expect( c.match('/123/45/ipsum') ).toBe  true 
        expect( c.match('/123/ipsum') ).toBe  true 

        d = crossroads.addRoute '/{foo}:bar:ipsum' #weird use!
        expect( d.match('/123/ipsum') ).toBe  true 
        expect( d.match('/123/45/ipsum') ).toBe  true 
    

    specify 'should support multiple consecutive optional params' ->
        s = crossroads.addRoute '/123/:bar:/:ipsum:'
        expect( s.match('/123') ).toBe  true 
        expect( s.match('/123/') ).toBe  true 
        expect( s.match('/123/asd') ).toBe  true 
        expect( s.match('/123/asd/45') ).toBe  true 
        expect( s.match('/123/asd/45/') ).toBe  true 
        expect( s.match('/123/asd/45/qwe') ).toBe  false 
    

    specify 'should not be case sensitive by default' ->
        s = crossroads.addRoute 'foo/bar'
        expect( s.match('foo') ).toBe  false 
        expect( s.match('Foo') ).toBe  false 
        expect( s.match('foo/bar') ).toBe  true 
        expect( s.match('Foo/Bar') ).toBe  true 
        expect( s.match('FoO/BAR') ).toBe  true 
    

    specify 'should be allow toggling case sensitivity' ->
        crossroads.ignoreCase = true

        s = crossroads.addRoute 'foo/bar'
        expect( s.match('foo') ).toBe  false 
        expect( s.match('Foo') ).toBe  false 
        expect( s.match('foo/bar') ).toBe  true 
        expect( s.match('Foo/Bar') ).toBe  true 
        expect( s.match('FoO/BAR') ).toBe  true 
    

    describe 'rest params' ->
        specify 'should support rest params' ->
            s = crossroads.addRoute '/123/{bar}/:ipsum*:'
            expect( s.match('/123') ).toBe  false 
            expect( s.match('/123/') ).toBe  false 
            expect( s.match('/123/asd') ).toBe  true 
            expect( s.match('/123/asd/45') ).toBe  true 
            expect( s.match('/123/asd/45/') ).toBe  true 
            expect( s.match('/123/asd/45/qwe') ).toBe  true 
            expect( s.match('/456/asd/45/qwe') ).toBe  false 
        

        specify 'should work even in the middle of pattern' ->
            s = crossroads.addRoute '/foo/:bar*:/edit'
            expect( s.match('/foo') ).toBe  false 
            expect( s.match('/foo/') ).toBe  false 
            expect( s.match('/foo/edit') ).toBe  true 
            expect( s.match('/foo/asd') ).toBe  false 
            expect( s.match('/foo/asd/edit') ).toBe  true 
            expect( s.match('/foo/asd/edit/') ).toBe  true 
            expect( s.match('/foo/asd/123/edit') ).toBe  true 
            expect( s.match('/foo/asd/edit/qwe') ).toBe  false 
        
    

    describe 'query string' ->
        specify 'should match query string as first segment' ->
            r = crossroads.addRoute '{?q}'
            expect( r.match('') ).toBe  false 
            expect( r.match('foo') ).toBe  false 
            expect( r.match('/foo') ).toBe  false 
            expect( r.match('foo/') ).toBe  false 
            expect( r.match('/foo/') ).toBe  false 
            expect( r.match('?foo') ).toBe  true 
            expect( r.match('?foo=bar') ).toBe  true 
            expect( r.match('?foo=bar&lorem=123') ).toBe  true 
        

        specify 'should match optional query string as first segment' ->
            r = crossroads.addRoute ':?q:'
            expect( r.match('') ).toBe  true 
            expect( r.match('foo') ).toBe  false 
            expect( r.match('/foo') ).toBe  false 
            expect( r.match('foo/') ).toBe  false 
            expect( r.match('/foo/') ).toBe  false 
            expect( r.match('?foo') ).toBe  true 
            expect( r.match('?foo=bar') ).toBe  true 
            expect( r.match('?foo=bar&lorem=123') ).toBe  true 
        

        specify 'should match query string as 2nd segment' ->
            r = crossroads.addRoute '{a}{?q}'
            expect( r.match('') ).toBe  false 
            expect( r.match('foo') ).toBe  false 
            expect( r.match('/foo') ).toBe  false 
            expect( r.match('foo/') ).toBe  false 
            expect( r.match('/foo/') ).toBe  false 
            expect( r.match('foo?foo') ).toBe  true 
            expect( r.match('foo?foo=bar') ).toBe  true 
            expect( r.match('foo?foo=bar&lorem=123') ).toBe  true 
        

        specify 'should match optional query string as 2nd segment' ->
            r = crossroads.addRoute '{a}:?q:'
            expect( r.match('') ).toBe  false 
            expect( r.match('foo') ).toBe  true 
            expect( r.match('/foo') ).toBe  true 
            expect( r.match('foo/') ).toBe  true 
            expect( r.match('/foo/') ).toBe  true 
            expect( r.match('foo?foo') ).toBe  true 
            expect( r.match('foo?foo=bar') ).toBe  true 
            expect( r.match('foo?foo=bar&lorem=123') ).toBe  true 
        

        specify 'should match query string as middle segment' ->
            #if hash is required should use the literal "#" to avoid matching
            #the last char of string as a string "foo?foo" shouldn't match
            r = crossroads.addRoute '{a}{?q}#{hash}'
            expect( r.match('') ).toBe  false 
            expect( r.match('foo') ).toBe  false 
            expect( r.match('/foo') ).toBe  false 
            expect( r.match('foo/') ).toBe  false 
            expect( r.match('/foo/') ).toBe  false 
            expect( r.match('foo?foo') ).toBe  false 
            expect( r.match('foo?foo#bar') ).toBe  true 
            expect( r.match('foo?foo=bar#bar') ).toBe  true 
            expect( r.match('foo?foo=bar&lorem=123#bar') ).toBe  true 
        

        specify 'should match optional query string as middle segment' ->
            r = crossroads.addRoute '{a}:?q::hash:'
            expect( r.match('') ).toBe  false 
            expect( r.match('foo') ).toBe  true 
            expect( r.match('/foo') ).toBe  true 
            expect( r.match('foo/') ).toBe  true 
            expect( r.match('/foo/') ).toBe  true 
            expect( r.match('foo?foo') ).toBe  true 
            expect( r.match('foo?foo=bar') ).toBe  true 
            expect( r.match('foo?foo=bar#bar') ).toBe  true 
            expect( r.match('foo?foo=bar&lorem=123') ).toBe  true 
            expect( r.match('foo?foo=bar&lorem=123#bar') ).toBe  true 
        

        specify 'should match query string even if not using the special query syntax' ->
            r = crossroads.addRoute '{a}?{q}#{hash}'
            expect( r.match('') ).toBe  false 
            expect( r.match('foo') ).toBe  false 
            expect( r.match('/foo') ).toBe  false 
            expect( r.match('foo/') ).toBe  false 
            expect( r.match('/foo/') ).toBe  false 
            expect( r.match('foo?foo') ).toBe  false 
            expect( r.match('foo?foo#bar') ).toBe  true 
            expect( r.match('foo?foo=bar#bar') ).toBe  true 
            expect( r.match('foo?foo=bar&lorem=123#bar') ).toBe  true 
        
    


    describe 'slash between params are optional' ->

        describe 'between required params' ->
            specify 'after other param' ->
                a = crossroads.addRoute '{bar}{ipsum}'

                expect( a.match('123') ).toBe  false 
                expect( a.match('123/') ).toBe  false 
                expect( a.match('123/asd') ).toBe  true 
                expect( a.match('123/asd/') ).toBe  true 
                expect( a.match('123/asd/45') ).toBe  false 
                expect( a.match('123/asd/45/') ).toBe  false 
                expect( a.match('123/asd/45/qwe') ).toBe  false 
            
        

        describe 'between optional params' ->
            specify 'optional after other optional param' ->
                a = crossroads.addRoute ':bar::ipsum:'
                expect( a.match('123') ).toBe  true 
                expect( a.match('123/') ).toBe  true 
                expect( a.match('123/asd') ).toBe  true 
                expect( a.match('123/asd/') ).toBe  true 
                expect( a.match('123/asd/45') ).toBe  false 
                expect( a.match('123/asd/45/') ).toBe  false 
                expect( a.match('123/asd/45/qwe') ).toBe  false 
            
        

        describe 'mixed' ->

            specify 'between normal + optional' ->
                a = crossroads.addRoute '/{foo}:bar:'
                expect( a.match('/lorem-ipsum/dolor') ).toBe  true 
            

            specify 'between normal + optional*2' ->
                b = crossroads.addRoute '/{foo}:bar::ipsum:'
                expect( b.match('/123') ).toBe  true 
                expect( b.match('/123/asd') ).toBe  true 
                expect( b.match('/123/asd/') ).toBe  true 
                expect( b.match('/123/asd/qwe') ).toBe  true 
                expect( b.match('/123/asd/qwe/') ).toBe  true 
                expect( b.match('/123/asd/qwe/asd') ).toBe  false 
                expect( b.match('/123/asd/qwe/asd/') ).toBe  false 
            

            specify 'with slashes all' ->
                c = crossroads.addRoute 'bar/{foo}/:bar:/:ipsum:'
                expect( c.match('bar/123') ).toBe  true 
                expect( c.match('bar/123/') ).toBe  true 
                expect( c.match('bar/123/asd') ).toBe  true 
                expect( c.match('bar/123/asd/') ).toBe  true 
                expect( c.match('bar/123/asd/45') ).toBe  true 
                expect( c.match('bar/123/asd/45/') ).toBe  true 
                expect( c.match('bar/123/asd/45/qwe') ).toBe  false 
            

            specify 'required param after \\w/' ->
                a = crossroads.addRoute '/123/{bar}{ipsum}'
                expect( a.match('/123') ).toBe  false 
                expect( a.match('/123/') ).toBe  false 
                expect( a.match('/123/asd') ).toBe  false 
                expect( a.match('/123/asd/') ).toBe  false 
                expect( a.match('/123/asd/45') ).toBe  true 
                expect( a.match('/123/asd/45/') ).toBe  true 
                expect( a.match('/123/asd/45/qwe') ).toBe  false 
            

            specify 'optional params after \\w/' ->
                a = crossroads.addRoute '/123/:bar::ipsum:'
                expect( a.match('/123') ).toBe  true 
                expect( a.match('/123/') ).toBe  true 
                expect( a.match('/123/asd') ).toBe  true 
                expect( a.match('/123/asd/') ).toBe  true 
                expect( a.match('/123/asd/45') ).toBe  true 
                expect( a.match('/123/asd/45/') ).toBe  true 
                expect( a.match('/123/asd/45/qwe') ).toBe  false 
            

        

    


    describe 'slash is required between word and param' ->

        specify 'required param after \\w' ->
            a = crossroads.addRoute '/123{bar}{ipsum}'
            expect( a.match('/123') ).toBe  false 
            expect( a.match('/123/') ).toBe  false 
            expect( a.match('/123/asd') ).toBe  false 
            expect( a.match('/123/asd/') ).toBe  false 
            expect( a.match('/123/asd/45') ).toBe  false 
            expect( a.match('/123/asd/45/') ).toBe  false 
            expect( a.match('/123/asd/45/qwe') ).toBe  false 

            expect( a.match('/123asd') ).toBe  false 
            expect( a.match('/123asd/') ).toBe  false 
            expect( a.match('/123asd/45') ).toBe  true 
            expect( a.match('/123asd/45/') ).toBe  true 
            expect( a.match('/123asd/45/qwe') ).toBe  false 
        

        specify 'optional param after \\w' ->
            a = crossroads.addRoute '/123:bar::ipsum:'
            expect( a.match('/123') ).toBe  true 
            expect( a.match('/123/') ).toBe  true 
            expect( a.match('/123/asd') ).toBe  true 
            expect( a.match('/123/asd/') ).toBe  true 
            expect( a.match('/123/asd/45') ).toBe  false 
            expect( a.match('/123/asd/45/') ).toBe  false 
            expect( a.match('/123/asd/45/qwe') ).toBe  false 

            expect( a.match('/123asd') ).toBe  true 
            expect( a.match('/123asd/') ).toBe  true 
            expect( a.match('/123asd/45') ).toBe  true 
            expect( a.match('/123asd/45/') ).toBe  true 
            expect( a.match('/123asd/45/qwe') ).toBe  false 
        

    


    describe 'strict slash rules' ->

        afterEach ->
            crossroads.patternLexer.loose 
        

        specify 'should only match if traling slashes match the original pattern' ->
            crossroads.patternLexer.strict!

            a = crossroads.addRoute '{foo}'
            expect( a.match('foo') ).toBe  true 
            expect( a.match('/foo') ).toBe  false 
            expect( a.match('foo/') ).toBe  false 
            expect( a.match('/foo/') ).toBe  false 

            b = crossroads.addRoute '/{foo}'
            expect( b.match('foo') ).toBe  false 
            expect( b.match('/foo') ).toBe  true 
            expect( b.match('foo/') ).toBe  false 
            expect( b.match('/foo/') ).toBe  false 

            c = crossroads.addRoute ''
            expect( c.match() ).toBe  true 
            expect( c.match('') ).toBe  true 
            expect( c.match('/') ).toBe  false 
            expect( c.match('foo') ).toBe  false 

            d = crossroads.addRoute '/'
            expect( d.match() ).toBe  false 
            expect( d.match('') ).toBe  false 
            expect( d.match('/') ).toBe  true 
            expect( d.match('foo') ).toBe  false 
        

    


    describe 'loose slash rules' ->

        beforeEach ->
            crossroads.patternLexer.loose 

        specify 'should treat single slash and empty string as same' ->
            c = crossroads.addRoute ''
            expect( c.match() ).toBe  true 
            expect( c.match('') ).toBe  true 
            expect( c.match('/') ).toBe  true 
            expect( c.match('foo') ).toBe  false 

            d = crossroads.addRoute '/'
            expect( d.match() ).toBe  true 
            expect( d.match('') ).toBe  true 
            expect( d.match('/') ).toBe  true 
            expect( d.match('foo') ).toBe  false 
        

    

    describe 'legacy slash rules' ->

        beforeEach ->
            crossroads.patternLexer.legacy!
        

        afterEach ->
            crossroads.patternLexer.loose!
        

        specify 'should treat single slash and empty string as same' ->
            c = crossroads.addRoute ''
            expect( c.match() ).toBe  true 
            expect( c.match('') ).toBe  true 
            expect( c.match('/') ).toBe  true 
            expect( c.match('foo') ).toBe  false 

            d = crossroads.addRoute '/'
            expect( d.match() ).toBe  true 
            expect( d.match('') ).toBe  true 
            expect( d.match('/') ).toBe  true 
            expect( d.match('foo') ).toBe  false 
        

        specify 'slash at end of string is optional' ->
            a = crossroads.addRoute '/foo'
            expect( a.match('/foo') ).toEqual  true 
            expect( a.match('/foo/') ).toEqual  true 
            expect( a.match('/foo/bar') ).toEqual  false 
        

        specify 'slash at begin of string is required' ->
            a = crossroads.addRoute '/foo'
            expect( a.match('/foo') ).toEqual  true 
            expect( a.match('/foo/') ).toEqual  true 
            expect( a.match('foo') ).toEqual  false 
            expect( a.match('foo/') ).toEqual  false 
            expect( a.match('/foo/bar') ).toEqual  false 
        

    


    describe 'rules' ->

        describe 'basic rules' ->

            specify 'should allow array options' ->
                s = crossroads.addRoute '/{foo}/{bar}'
                s.rules = {
                    foo : ['lorem-ipsum', '123'],
                    bar : ['DoLoR', '45']
                }

                expect( s.match('/lorem-ipsum') ).toBe  false 
                expect( s.match('/lorem-ipsum/DoLoR') ).toBe  true 
                expect( s.match('/LoReM-IpSuM/DOLoR') ).toBe  true 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('/123') ).toBe  false 
                expect( s.match('123') ).toBe  false 
                expect( s.match('/123/123') ).toBe  false 
                expect( s.match('/123/45') ).toBe  true 
            

            specify 'should change array validation behavior when ignoreCase is false' ->
                crossroads.ignoreCase = false

                s = crossroads.addRoute '/{foo}/{bar}'

                s.rules = {
                    foo : ['lorem-ipsum', '123'],
                    bar : ['DoLoR', '45']
                }

                expect( s.match('/lorem-ipsum') ).toBe  false 
                expect( s.match('/lorem-ipsum/dolor') ).toBe  false 
                expect( s.match('/lorem-ipsum/DoLoR') ).toBe  true 
                expect( s.match('/LoReM-IpSuM/DOLoR') ).toBe  false 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('/123') ).toBe  false 
                expect( s.match('123') ).toBe  false 
                expect( s.match('/123/123') ).toBe  false 
                expect( s.match('/123/45') ).toBe  true 

            


            specify 'should allow RegExp options' ->
                s = crossroads.addRoute '/{foo}/{bar}'

                s.rules =
                    foo : /(^[a-z0-9\-]+$)/
                    bar : /(.+)/


                expect( s.match('/lorem-ipsum') ).toBe  false 
                expect( s.match('/lorem-ipsum/dolor') ).toBe  true 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('/123') ).toBe  false 
                expect( s.match('123') ).toBe  false 
                expect( s.match('/123/45') ).toBe  true 
            

            specify 'should allow function rule' ->
                s = crossroads.addRoute '/{foo}/{bar}/{ipsum}'
                s.rules =
                    foo : (val, request, params) ->
                        val === 'lorem-ipsum' || val === '123'

                    bar : (val, request, params) ->
                        request !== '/lorem-ipsum'

                    ipsum : (val, request, params) ->
                        (params.bar === 'dolor' && params.ipsum === 'sit-amet') || (params.bar === '45' && params.ipsum === '67')

                expect( s.match('/lorem-ipsum') ).toBe  false 
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe  true 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('/123') ).toBe  false 
                expect( s.match('123') ).toBe  false 
                expect( s.match('/123/44/55') ).toBe  false 
                expect( s.match('/123/45/67') ).toBe  true 
            

            specify 'should work with mixed rules' ->
                s = crossroads.addRoute '/{foo}/{bar}/{ipsum}'
                s.rules =
                    foo : (val, request, params) ->
                        val === 'lorem-ipsum' || val === '123'

                    bar : ['dolor', '45']
                    ipsum : /(sit-amet|67)/


                expect( s.match('/lorem-ipsum') ).toBe  false 
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe  true 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('/123') ).toBe  false 
                expect( s.match('123') ).toBe  false 
                expect( s.match('/123/45/67') ).toBe  true 
            

            specify 'should only check rules of optional segments if param exists' ->

                a = crossroads.addRoute '/123/:a:/:b:/:c:'
                a.rules =
                    a : /^\w+$/
                    b : (val) ->
                        val === 'ipsum'
                    c : ['lorem', 'bar']

                expect( a.match('/123') ).toBe  true 
                expect( a.match('/123/') ).toBe  true 
                expect( a.match('/123/asd') ).toBe  true 
                expect( a.match('/123/asd/') ).toBe  true 
                expect( a.match('/123/asd/ipsum/') ).toBe  true 
                expect( a.match('/123/asd/ipsum/bar') ).toBe  true 

                expect( a.match('/123/asd/45') ).toBe  false 
                expect( a.match('/123/asd/45/qwe') ).toBe  false 
                expect( a.match('/123/as#%d&/ipsum') ).toBe  false 
                expect( a.match('/123/asd/ipsum/nope') ).toBe  false 

            specify 'should work with shouldTypecast=false' ->
                s = crossroads.addRoute '/{foo}/{bar}/{ipsum}'

                crossroads.shouldTypecast = false

                s.rules =
                    foo : (val, request, params) ->
                        val === 'lorem-ipsum' || val === '123'  #only string validates
                    bar : ['dolor', '45'], #only string validates
                    ipsum : /(sit-amet|67)/

                expect( s.match('/lorem-ipsum') ).toBe  false 
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe  true 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('/123') ).toBe  false 
                expect( s.match('123') ).toBe  false 
                expect( s.match('/123/45/67') ).toBe  true 
            

        


        describe 'query string' ->

            specify 'should validate with array' ->
                r = crossroads.addRoute '/foo.php{?query}'
                r.rules = {
                    '?query' : ['lorem=ipsum&dolor=456', 'amet=789']
                }
                expect( r.match('foo.php?bar=123&ipsum=dolor') ).toBe  false 
                expect( r.match('foo.php?lorem=ipsum&dolor=456') ).toBe  true 
                expect( r.match('foo.php?amet=789') ).toBe  true 
            

            specify 'should validate with RegExp' ->
                r = crossroads.addRoute '/foo.php{?query}'
                r.rules = {
                    '?query' : /^lorem=\w+&dolor=\d+$/
                }
                expect( r.match('foo.php?bar=123&ipsum=dolor') ).toBe  false 
                expect( r.match('foo.php?lorem=ipsum&dolor=12345') ).toBe  true 
                expect( r.match('foo.php?lorem=ipsum&dolor=amet') ).toBe  false 
            

            specify 'should validate with Function' ->
                r = crossroads.addRoute '/foo.php{?query}'

                crossroads.shouldTypecast = true

                r.rules =
                    '?query' : (val, req, vals) ->
                        val.lorem === 'ipsum' && typeof val.dolor === 'number'

                expect( r.match('foo.php?bar=123&ipsum=dolor') ).toBe  false
                expect( r.match('foo.php?lorem=ipsum&dolor=12345') ).toBe  true 
                expect( r.match('foo.php?lorem=ipsum&dolor=amet') ).toBe  false 
            

        describe 'path alias' ->

            specify 'should work with string pattern' ->

                s = crossroads.addRoute '/{foo}/{bar}/{ipsum}'

                s.rules =
                    0 : ['lorem-ipsum', '123']
                    1 : (val, request, params) ->
                        request !== '/lorem-ipsum'

                    2 : /^(sit-amet|67)$/

                expect( s.match('/lorem-ipsum') ).toBe  false 
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe  true 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('/123') ).toBe  false 
                expect( s.match('123') ).toBe  false 
                expect( s.match('/123/44/55') ).toBe  false 
                expect( s.match('/123/45/67') ).toBe  true 


            specify 'should work with RegExp pattern' ->

                s = crossroads.addRoute /([\-\w]+)\/([\-\w]+)\/([\-\w]+)/

                s.rules =
                    0 : ['lorem-ipsum', '123']
                    1 : (val, request, params) ->
                        request !== '/lorem-ipsum'

                    2 : /^(sit-amet|67)$/


                expect( s.match('/lorem-ipsum') ).toBe  false 
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe  true 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('/123') ).toBe  false 
                expect( s.match('123') ).toBe  false 
                expect( s.match('/123/44/55') ).toBe  false 
                expect( s.match('/123/45/67') ).toBe  true 


        describe 'request_' ->

            specify 'should validate whole request' ->
                s = crossroads.addRoute /^([a-z0-9]+)$/
                s.rules =
                    request_ : (request) -> #this gets executed after all other validations
                        request !== '555'

                expect( s.match('lorem') ).toBe  true
                expect( s.match('lorem/dolor/sit-amet') ).toBe  false 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('123') ).toBe  true 
                expect( s.match('555') ).toBe  false 
            

            specify 'should execute after other rules' ->
                s = crossroads.addRoute '/{foo}/{bar}/{ipsum}'
                s.rules =
                    foo : (val, request, params) ->
                        val === 'lorem-ipsum' || val === '123'

                    bar : ['dolor', '45']
                    ipsum : /(sit-amet|67|555)/
                    request_ : (request) -> #this gets executed after all other validations
                        request !== '/123/45/555'

                expect( s.match('/lorem-ipsum') ).toBe  false
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe  true 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('/123') ).toBe  false 
                expect( s.match('123') ).toBe  false 
                expect( s.match('/123/45/67') ).toBe  true 
                expect( s.match('/123/45/555') ).toBe  false 
            

            specify 'can be an array' ->
                s = crossroads.addRoute /^([a-z0-9]+)$/
                s.rules =
                    request_ : ['lorem', '123']

                expect( s.match('lorem') ).toBe  true 
                expect( s.match('lorem/dolor/sit-amet') ).toBe  false 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('123') ).toBe  true 
                expect( s.match('555') ).toBe  false 
            

            specify 'can be a RegExp' ->
                s = crossroads.addRoute /^([a-z0-9]+)$/
                s.rules =
                    request_ : /^(lorem|123)$/

                expect( s.match('lorem') ).toBe  true 
                expect( s.match('lorem/dolor/sit-amet') ).toBe  false 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('123') ).toBe  true 
                expect( s.match('555') ).toBe  false 
            

            specify 'should work with optional params' ->
                s = crossroads.addRoute ':foo:'
                s.rules =
                    request_ : /^(lorem|123|)$/ #empty also matches!

                expect( s.match('lorem') ).toBe  true 
                expect( s.match('lorem/dolor/sit-amet') ).toBe  false 
                expect( s.match('lorem-ipsum') ).toBe  false 
                expect( s.match('123') ).toBe  true 
                expect( s.match('555') ).toBe  false 
                expect( s.match('') ).toBe  true 
            


        describe 'normalize_' ->

            specify 'should ignore normalize_ since it isn\'t a validation rule' ->

                calledNormalize = false
                s = crossroads.addRoute '/{foo}/{bar}/{ipsum}'
                s.rules =
                     foo : (val, request, params) ->
                         val === 'lorem-ipsum' or val === '123'

                     bar : ['dolor', '45']
                     ipsum : /(sit-amet|67)/
                     normalize_ : ->
                         calledNormalize = true
                         [true]

                expect( calledNormalize ).toBe  false
                expect( s.match('/lorem-ipsum') ).toBe  false
                expect( s.match('/lorem-ipsum/dolor/sit-amet') ).toBe  true
                expect( s.match('lorem-ipsum') ).toBe  false
                expect( s.match('/123') ).toBe  false
                expect( s.match('123') ).toBe  false
                expect( s.match('/123/45/67') ).toBe  true
