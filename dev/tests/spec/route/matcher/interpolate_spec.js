// Generated by LiveScript 1.2.0
(function(){
  describe('Route.interpolate ', function(){
    afterEach(function(){
      crossroads.resetState();
      return crossroads.removeAllRoutes();
    });
    specify('should replace regular segments', function(){
      var a;
      a = crossroads.addRoute('/{foo}/:bar:');
      expect(a.interpolate({
        foo: 'lorem',
        bar: 'ipsum'
      })).toEqual('/lorem/ipsum');
      return expect(a.interpolate({
        foo: 'dolor-sit'
      })).toEqual('/dolor-sit');
    });
    specify('should allow number as segment (#gh-54)', function(){
      var a;
      a = crossroads.addRoute('/{foo}/:bar:');
      expect(a.interpolate({
        foo: 123,
        bar: 456
      })).toEqual('/123/456');
      return expect(a.interpolate({
        foo: 123
      })).toEqual('/123');
    });
    specify('should replace rest segments', function(){
      var a;
      a = crossroads.addRoute('lorem/{foo*}:bar*:');
      expect(a.interpolate({
        'foo*': 'ipsum/dolor',
        'bar*': 'sit/amet'
      })).toEqual('lorem/ipsum/dolor/sit/amet');
      return expect(a.interpolate({
        'foo*': 'dolor-sit'
      })).toEqual('lorem/dolor-sit');
    });
    specify('should replace multiple optional segments', function(){
      var a;
      a = crossroads.addRoute('lorem/:a::b::c:');
      expect(a.interpolate({
        a: 'ipsum',
        b: 'dolor'
      })).toEqual('lorem/ipsum/dolor');
      expect(a.interpolate({
        a: 'ipsum',
        b: 'dolor',
        c: 'sit'
      })).toEqual('lorem/ipsum/dolor/sit');
      expect(a.interpolate({
        a: 'dolor-sit'
      })).toEqual('lorem/dolor-sit');
      return expect(a.interpolate({})).toEqual('lorem');
    });
    specify('should throw an error if missing required argument', function(){
      var a;
      a = crossroads.addRoute('/{foo}/:bar:');
      return expect(function(){
        return a.interpolate({
          bar: 'ipsum'
        });
      }).toThrow('The segment {foo} is required.');
    });
    specify('should throw an error if string doesn\'t match pattern', function(){
      var a;
      a = crossroads.addRoute('/{foo}/:bar:');
      return expect(function(){
        return a.interpolate({
          foo: 'lorem/ipsum',
          bar: 'dolor'
        });
      }).toThrow('Invalid value "lorem/ipsum" for segment "{foo}".');
    });
    specify('should throw an error if route was created by an RegExp pattern', function(){
      var a;
      a = crossroads.addRoute(/^\w+\/\d+$/);
      return expect(function(){
        return a.interpolate({
          bar: 'ipsum'
        });
      }).toThrow('Route pattern should be a string.');
    });
    specify('should throw an error if generated string doesn\'t validate against rules', function(){
      var a;
      a = crossroads.addRoute('/{foo}/:bar:');
      a.rules = {
        foo: ['lorem', 'news'],
        bar: /^\d+$/
      };
      return expect(function(){
        return a.interpolate({
          foo: 'lorem',
          bar: 'ipsum'
        });
      }).toThrow('Generated string doesn\'t validate against `Route.rules`.');
    });
    return specify('should replace query segments', function(){
      var a, query;
      a = crossroads.addRoute('/{foo}/:?query:');
      query = {
        some: 'test'
      };
      expect(a.interpolate({
        foo: 'lorem',
        query: query
      })).toEqual('/lorem/?some=test');
      query = {
        multiple: 'params',
        works: 'fine'
      };
      return expect(a.interpolate({
        foo: 'dolor-sit',
        query: query
      })).toEqual('/dolor-sit/?multiple=params&works=fine');
    });
  });
}).call(this);
