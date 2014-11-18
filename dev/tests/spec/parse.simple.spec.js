var crossroads = crossroads || require('../../../dist/crossroads');
//end node


describe('crossroads.parse()', function(){

  var _prevTypecast;


  beforeEach(function(){
      _prevTypecast = crossroads.shouldTypecast;
  });


  afterEach(function(){
      crossroads.resetState();
      crossroads.removeAllRoutes();
      crossroads.routed.removeAll();
      crossroads.bypassed.removeAll();
      crossroads.shouldTypecast = _prevTypecast;
  });

  describe('simple string route', function(){

    it('shold route basic strings', function(){
        var t1 = 0;

        crossroads.addRoute('/foo', function(a){
            t1++;
        });
        crossroads.parse('/bar');
        crossroads.parse('/foo');
        crossroads.parse('foo');

        expect( t1 ).toBe( 2 );
    });

    it('should pass params and allow multiple routes', function(){
        var t1, t2, t3;

        crossroads.addRoute('/{foo}', function(foo){
            t1 = foo;
        });
        crossroads.addRoute('/{foo}/{bar}', function(foo, bar){
            t2 = foo;
            t3 = bar;
        });
        crossroads.parse('/lorem_ipsum');
        crossroads.parse('/maecennas/ullamcor');

        expect( t1 ).toBe( 'lorem_ipsum' );
        expect( t2 ).toBe( 'maecennas' );
        expect( t3 ).toBe( 'ullamcor' );
    });

    it('should dispatch matched signal', function(){
        var t1, t2, t3;

        var a = crossroads.addRoute('/{foo}');
        a.matched.add(function(foo){
            t1 = foo;
        });

        var b = crossroads.addRoute('/{foo}/{bar}');
        b.matched.add(function(foo, bar){
            t2 = foo;
            t3 = bar;
        });

        crossroads.parse('/lorem_ipsum');
        crossroads.parse('/maecennas/ullamcor');

        expect( t1 ).toBe( 'lorem_ipsum' );
        expect( t2 ).toBe( 'maecennas' );
        expect( t3 ).toBe( 'ullamcor' );
    });

    it('should handle a word separator that isn\'t necessarily /', function(){
        var t1, t2, t3, t4;

        var a = crossroads.addRoute('/{foo}_{bar}');
        a.matched.add(function(foo, bar){
            t1 = foo;
            t2 = bar;
        });

        var b = crossroads.addRoute('/{foo}-{bar}');
        b.matched.add(function(foo, bar){
            t3 = foo;
            t4 = bar;
        });

        crossroads.parse('/lorem_ipsum');
        crossroads.parse('/maecennas-ullamcor');

        expect( t1 ).toBe( 'lorem' );
        expect( t2 ).toBe( 'ipsum' );
        expect( t3 ).toBe( 'maecennas' );
        expect( t4 ).toBe( 'ullamcor' );
    });

    it('should handle empty routes', function(){
        var calls = 0;

        var a = crossroads.addRoute();
        a.matched.add(function(foo, bar){
            expect( foo ).toBeUndefined();
            expect( bar ).toBeUndefined();
            calls++;
        });

        crossroads.parse('/123/456');
        crossroads.parse('/maecennas/ullamcor');
        crossroads.parse('');

        expect( calls ).toBe( 1 );
    });

    it('should handle empty strings', function(){
        var calls = 0;

        var a = crossroads.addRoute('');
        a.matched.add(function(foo, bar){
            expect( foo ).toBeUndefined();
            expect( bar ).toBeUndefined();
            calls++;
        });

        crossroads.parse('/123/456');
        crossroads.parse('/maecennas/ullamcor');
        crossroads.parse('');

        expect( calls ).toBe( 1 );
    });

    it('should route `null` as empty string', function(){
        var calls = 0;

        var a = crossroads.addRoute('');
        a.matched.add(function(foo, bar){
            expect( foo ).toBeUndefined();
            expect( bar ).toBeUndefined();
            calls++;
        });

        crossroads.parse('/123/456');
        crossroads.parse('/maecennas/ullamcor');
        crossroads.parse();

        expect( calls ).toBe( 1 );
    });
  });
});
