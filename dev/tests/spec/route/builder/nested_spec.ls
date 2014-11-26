describe 'nested routes' ->

    var baseRoute, childRoute

    beforeEach ->
        # specs are run out of order since we check the amount of routes
        # added we need to make sure other tests won't mess up these results
        # otherwise we might spend time trying to debug the wrong issues
        crossroads.removeAllRoutes!
        crossroads.resetState!

        baseRoute = crossroads.addRoute '/base/{foo}'
        childRoute = baseRoute.addRoute 'child/{bar}'
        baseRoute.addRoute '/another/child'

    afterEach ->
        crossroads.removeAllRoutes!
        crossroads.resetState!
    


    describe 'parse child' ->
        specify 'should match the child route' ->
            childMatched = jasmine.createSpy!
            childRoute.matched.add childMatched

            crossroads.parse '/base/foo/child/bar'
            expect(childMatched).toHaveBeenCalledWith 'bar'
       
        specify 'should not match unkown children' ->
            bypassed = jasmine.createSpy!
            crossroads.bypassed.add bypassed

            crossroads.parse '/base/foo/unkown'
            expect(bypassed).toHaveBeenCalled!
        
        specify 'should match the ancestor route' ->
            ancestorMatched = jasmine.createSpy!
            baseRoute.matched.add ancestorMatched

            crossroads.parse '/base/foo/child/bar'
            expect(ancestorMatched).toHaveBeenCalledWith 'foo'

        specify 'should switch the child route' ->
            childSwitched = jasmine.createSpy!
            childRoute.switched.add childSwitched

            crossroads.parse '/base/foo/child/bar'
            crossroads.parse '/base/foo/another/child'
            expect(childSwitched).toHaveBeenCalled!

        

        specify 'should not switch the ancestor route' ->
            ancestorSwitched = jasmine.createSpy!
            baseRoute.switched.add ancestorSwitched

            crossroads.parse '/base/foo/child/bar'
            crossroads.parse '/base/foo/another/child'
            expect(ancestorSwitched.calls.length).toEqual 0

        

        specify 'should match the index route' ->

            indexMatched = jasmine.createSpy!
            indexRoute = baseRoute.addRoute indexMatched

            crossroads.parse '/base/foo'
            expect(indexMatched).toHaveBeenCalled!

    describe 'parse multiple children' ->
        var anotherChild

        beforeEach ->
            crossroads.greedy = true
            anotherChild = baseRoute.addRoute '/{child}/bar'
        
        afterEach ->
            crossroads.greedy = false
        
        specify 'should match both children' ->
            childMatched = jasmine.createSpy!
            childRoute.matched.add childMatched
            anotherChild.matched.add childMatched

            crossroads.parse '/base/foo/child/bar'
            expect(childMatched.calls.length).toEqual 2

        

        specify 'should match ancestors only once' ->
            parentMatched = jasmine.createSpy!
            baseRoute.matched.add parentMatched

            crossroads.parse '/base/foo/child/bar'
            expect(parentMatched.calls.length).toEqual 1
        

    describe 'parse different bases' ->
        beforeEach ->
            crossroads.addRoute '/another'

        specify 'should switch the child route' ->
            childSwitched = jasmine.createSpy!
            childRoute.switched.add childSwitched

            crossroads.parse '/base/foo/child/bar'
            crossroads.parse '/another'
            expect(childSwitched).toHaveBeenCalled!

        specify 'should switch the ancestor route' ->
            ancestorSwitched = jasmine.createSpy!
            baseRoute.switched.add ancestorSwitched

            crossroads.parse '/base/foo/child/bar'
            crossroads.parse '/another'
            expect(ancestorSwitched).toHaveBeenCalled!

        specify 'should match only parent' ->
            childMatched = jasmine.createSpy!
            parentMatched = jasmine.createSpy!
            childRoute.matched.add childMatched
            baseRoute.matched.add parentMatched

            crossroads.parse '/base/foo'
            expect(childMatched.calls.length).toEqual 0
            expect(parentMatched).toHaveBeenCalled!

        

    

