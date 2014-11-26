describe 'Route.interpolate ' ->

    afterEach ->
        crossroads.resetState!
        crossroads.removeAllRoutes!
    
    specify 'should replace regular segments' ->
        a = crossroads.addRoute '/{foo}/:bar:'
        expect( a.interpolate foo: 'lorem', bar: 'ipsum' ).toEqual  '/lorem/ipsum'
        expect( a.interpolate foo: 'dolor-sit' ).toEqual  '/dolor-sit'
    

    specify 'should allow number as segment (#gh-54)' ->
        a = crossroads.addRoute '/{foo}/:bar:'
        expect( a.interpolate foo: 123, bar: 456 ).toEqual  '/123/456'
        expect( a.interpolate foo: 123 ).toEqual  '/123'
    

    specify 'should replace rest segments' ->
        a = crossroads.addRoute 'lorem/{foo*}:bar*:'
        expect( a.interpolate 'foo*': 'ipsum/dolor', 'bar*': 'sit/amet' ).toEqual  'lorem/ipsum/dolor/sit/amet'
        expect( a.interpolate 'foo*': 'dolor-sit' ).toEqual  'lorem/dolor-sit'
    

    specify 'should replace multiple optional segments' ->
        a = crossroads.addRoute 'lorem/:a::b::c:'
        expect( a.interpolate a: 'ipsum', b: 'dolor' ).toEqual  'lorem/ipsum/dolor'
        expect( a.interpolate a: 'ipsum', b: 'dolor', c : 'sit' ).toEqual  'lorem/ipsum/dolor/sit'
        expect( a.interpolate a: 'dolor-sit' ).toEqual  'lorem/dolor-sit'
        expect( a.interpolate {} ).toEqual  'lorem'
    

    specify 'should throw an error if missing required argument' ->
        a = crossroads.addRoute '/{foo}/:bar:'
        expect( ->
            a.interpolate bar: 'ipsum'
        ).toThrow 'The segment {foo} is required.'
    

    specify 'should throw an error if string doesn\'t match pattern' ->
        a = crossroads.addRoute '/{foo}/:bar:'
        expect( ->
            a.interpolate foo: 'lorem/ipsum', bar: 'dolor'
        ).toThrow 'Invalid value "lorem/ipsum" for segment "{foo}".'
    

    specify 'should throw an error if route was created by an RegExp pattern' ->
        a = crossroads.addRoute /^\w+\/\d+$/
        expect( ->
            a.interpolate bar: 'ipsum'
        ).toThrow 'Route pattern should be a string.'
    

    specify 'should throw an error if generated string doesn\'t validate against rules' ->
        a = crossroads.addRoute '/{foo}/:bar:'
        a.rules =
            foo : ['lorem', 'news']
            bar : /^\d+$/
        expect( ->
            a.interpolate foo: 'lorem', bar: 'ipsum'
        ).toThrow 'Generated string doesn\'t validate against `Route.rules`.'
    

    specify 'should replace query segments' ->
        a = crossroads.addRoute '/{foo}/:?query:'
        query = {some: 'test'}
        expect( a.interpolate foo: 'lorem', query: query ).toEqual '/lorem/?some=test'
        query = {multiple: 'params', works: 'fine'}
        expect( a.interpolate foo: 'dolor-sit', query: query ).toEqual '/dolor-sit/?multiple=params&works=fine'