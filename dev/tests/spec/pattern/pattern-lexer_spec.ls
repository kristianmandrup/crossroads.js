describe 'patternLexer' ->


    describe 'getParamIds()' ->

        specify 'should return an Array with the ids' ->
            ids = crossroads.patternLexer.getParamIds '/lorem/{ipsum}/{dolor}'
            expect( ids[0] ).toEqual  'ipsum' 
            expect( ids[1] ).toEqual  'dolor'

    describe 'compilePattern )' ->

        specify 'should create RegExp from string which should match pattern' ->
            pattern = '/lorem/{ipsum}/{dolor}'
            regex = crossroads.patternLexer.compilePattern pattern
            expect( regex.test(pattern) ).toEqual  true 


        specify 'should work with special chars' ->
            pattern = '/lo[rem](ipsum)/{ipsum}/{dolor}'
            regex = crossroads.patternLexer.compilePattern pattern
            expect( regex.test(pattern) ).toEqual  true 


        specify 'should work with optional params' ->
            pattern = '/lo[rem](ipsum)/{ipsum}/{dolor}:foo::bar:/:blah:/maecennas'
            regex = crossroads.patternLexer.compilePattern pattern
            expect( regex.test(pattern) ).toEqual  true 


        specify 'should support rest params' ->
            pattern = '/lo[rem](ipsum)/{ipsum*}/{dolor}:foo::bar*:/:blah:/maecennas'
            regex = crossroads.patternLexer.compilePattern pattern
            expect( regex.test(pattern) ).toEqual true


    describe 'getParamValues()' ->
        specify 'should return pattern params' ->
            pattern = '/lorem/{ipsum}/{dolor}'
            regex = crossroads.patternLexer.compilePattern pattern
            params = crossroads.patternLexer.getParamValues '/lorem/foo/bar', regex

            expect( params[0] ).toEqual 'foo'
            expect( params[1] ).toEqual 'bar'
