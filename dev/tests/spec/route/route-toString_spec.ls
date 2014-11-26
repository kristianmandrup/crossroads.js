describe 'route.toString()' ->
    afterEach ->
        crossroads.resetState!
        crossroads.removeAllRoutes!

    specify 'should help debugging' ->
        count = 0
        requests = []
        a = crossroads.addRoute '/{foo}_{bar}'
        a.matched.add (foo, bar) ->
            expect(null).toEqual 'fail: not a trigger test'

        expect( a.toString! ).toBe '[Route pattern:"/{foo}_{bar}", numListeners:1]'
