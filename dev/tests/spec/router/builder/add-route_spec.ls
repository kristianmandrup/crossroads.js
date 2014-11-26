describe 'crossroads.addRoute' ->

    beforeEach ->
        # specs are run out of order since we check the amount of routes
        # added we need to make sure other tests won't mess up these results
        # otherwise we might spend time trying to debug the wrong issues
        crossroads.removeAllRoutes!
        crossroads.resetState!
    

    afterEach ->
        crossroads.removeAllRoutes!
        crossroads.resetState!
    


    specify 'should return a route and attach it to crossroads' ->

        var s = crossroads.addRoute '/{foo}'

        expect( s ).toBeDefined!
        expect( s.rules ).toBeUndefined!
        expect( crossroads.getNumRoutes() ).toBe( 1 
        expect( s.matched.getNumListeners() ).toBe( 0 

    

    specify 'should add listener to matched if provided' ->

        var s = crossroads.addRoute '/{foo}' ->
            expect().toBe('shouldnt be called'
        

        expect( s ).toBeDefined!
        expect( s.rules ).toBeUndefined!
        expect( crossroads.getNumRoutes() ).toBe( 1 
        expect( s.matched.getNumListeners() ).toBe( 1 

    

    specify 'should accept RegExp' ->

        var s = crossroads.addRoute /^foo\/([a-z]+)$/ ->
            expect().toBe('shouldnt be called'
        

        expect( s ).toBeDefined!
        expect( s.rules ).toBeUndefined!
        expect( crossroads.getNumRoutes() ).toBe( 1 
        expect( s.matched.getNumListeners() ).toBe( 1 

    

    specify 'should increment num routes' ->

        var s1 = crossroads.addRoute /^foo\/([a-z]+)$/ ->
            expect().toBe('shouldnt be called'
        

        var s2 = crossroads.addRoute '/{foo}' ->
            expect().toBe('shouldnt be called'
        

        expect( s1 ).toBeDefined!
        expect( s2 ).toBeDefined!
        expect( s1.rules ).toBeUndefined!
        expect( s2.rules ).toBeUndefined!
        expect( crossroads.getNumRoutes() ).toBe( 2 
        expect( s1.matched.getNumListeners() ).toBe( 1 
        expect( s2.matched.getNumListeners() ).toBe( 1 

    

    specify 'should work on multiple instances' ->

        var s1 = crossroads.addRoute '/bar'
        var cr = crossroads.create!
        var s2 = cr.addRoute '/ipsum'

        expect( s1 ).toBeDefined!
        expect( s2 ).toBeDefined!
        expect( s1.rules ).toBeUndefined!
        expect( s2.rules ).toBeUndefined!
        expect( crossroads.getNumRoutes() ).toBe( 1 
        expect( cr.getNumRoutes() ).toBe( 1 
        expect( s1.matched.getNumListeners() ).toBe( 0 
        expect( s2.matched.getNumListeners() ).toBe( 0 

    

    specify 'should add all routes from another router' ->
      var s1 = crossroads.addRoute '/foo'
      var s2 = crossroads.addRoute '/bar'
      var cr = crossroads.create('other'
      # var a1 = cr.addRoute '/ipsum', {priority: 1
      var a1 = cr.addRoute '/ipsum'
      var a2 = cr.addRoute '/lorum'

      expect( crossroads.getNumRoutes() ).toBe( 2 

      expect( crossroads.getRoutes()[0]._pattern ).toBe( s2._pattern 

      expect( s1._router._name ).toBe( 'crossroads router' 
      expect( a1._router._name ).toBe( 'other' 

      crossroads.addRoutes(cr
      # console.log(crossroads.getRoutesBy('pattern', 'priority').display()
      # console.log(cr.getRoutesBy()

      expect( crossroads.getRoutes()[0]._pattern ).toBe( a2._pattern 
      expect( crossroads.getRoutes()[1]._pattern ).toBe( a1._pattern 
      expect( crossroads.getRoutes()[1]._router._name ).toBe( 'crossroads router' 

      # console.log(cr.getRoutePatterns()
      expect( cr.getRoutes()[0]._pattern ).toBe( a2._pattern 
      expect( cr.getRoutes()[1]._pattern ).toBe( a1._pattern 
    


  specify 'should add a route from another router' ->
    var s1 = crossroads.addRoute '/foo'
    var cr = crossroads.create!
    var a1 = cr.addRoute '/ipsum'

    expect( crossroads.getNumRoutes() ).toBe( 1 
    # console.log(crossroads.getRoutePatterns()
    expect( crossroads.getRoutes()[0]._pattern ).toBe( s1._pattern 

    crossroads.addRoute a1
    expect( crossroads.getNumRoutes() ).toBe( 2 
    # console.log(crossroads.getRoutePatterns()

    expect( crossroads.getRoutes()[0]._pattern ).toBe( a1._pattern 
    expect( crossroads.getRoutes()[1]._pattern ).toBe( s1._pattern 
  


