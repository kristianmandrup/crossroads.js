piper = require '../../../router/pipe/piper'

describe 'pipe and unpipe' ->

    specify 'should pipe parse calls to multiple routers' ->
        r1 = crossroads.create!
        r2 = crossroads.create!
        r3 = crossroads.create!
        matches = []

        r1.addRoute '{foo}', (f) ->
            matches.push 'r1:'+ f
        
        r2.addRoute '{foo}', (f) ->
            matches.push 'r2:'+ f
        
        r3.addRoute 'bar', (f) ->
            matches.push 'r3:'+ f

        r1.pipe r2
        r1.pipe r3

        r1.parse 'foo'
        r1.parse 'bar'

        r1.unpipe r2
        r1.parse 'dolor'

        expect( matches ).toEqual [
            'r1:foo',
            'r2:foo',
            'r1:bar',
            'r2:bar',
            'r3:undefined',
            'r1:dolor'
        ] 
    


