describe('Route.dispose()' ->

    afterEach(function(){
        crossroads.resetState!
        crossroads.removeAllRoutes!
    


    it('should dispose route' ->
        var count = 0;

        var a = crossroads.addRoute('{foo}/{bar}');
        a.matched.add(function(foo, bar){
            count++;
        

        crossroads.parse('foo/bar');
        a.dispose!
        crossroads.parse('dolor/amet');
        expect( count ).toBe( 1 );
    


