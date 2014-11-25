[![Build Status](https://secure.travis-ci.org/millermedeiros/crossroads.js.png)](https://travis-ci.org/millermedeiros/crossroads.js)

---

![Crossroads - JavaScript Routes](https://github.com/millermedeiros/crossroads.js/raw/master/_assets/crossroads_logo.png)


## Introduction ##

*Crossroads.js* is a routing library inspired by URL Route/Dispatch utilities present on frameworks like Rails, Pyramid, Django, CakePHP, CodeIgniter, etc...
It parses a string input and decides which action should be executed by matching the string against multiple patterns.

If used properly it can reduce code complexity by decoupling objects and also by abstracting navigation paths.

See [project page](http://millermedeiros.github.com/crossroads.js/) for documentation and more details.


## Design

- See [crossroads.js API](http://millermedeiros.github.io/crossroads.js/) for an overview of the main API (v.0.12)

This fork offers the following extra features:

Router and Route have been split up into several small grouped API objects, to be found in `/src`:

- `/routable` : Base prototypes (classes)
- `/route` : Route APIs and helpers
- `/router` : Router APIs and helpers
- `/signal` : Signal APIs and helpers
- `/util` : Utility APIs

The idea is to not force you in to having to use all the "bells & whistles", but instead allow
you to compose your Router and Route APIs from some "sane" building blocks.
Feel free to come with ideas for improvements on the design.

### Build

This project uses [webpack](https://github.com/webpack/webpack) as the package tool, in order to support:

- CommonJS
- RequireJS

[Gulp](http://gulpjs.com/) used to build the distribution file in `dist/crossroads.js`

Build:

`gulp webpack`

Will use `dev/src/crossroads.js` as the entry point and follow the `require` paths to create a dependency graph, which will be resolved in order
 to find the best way to concatenate the files into one. Webpack then creates a bundled file which
 is output to `dist/crossroads.js`

### Prototype design

Base functionality for Router and Route is defined in `BaseRoute`
Any Route/Router which can add routes to itself is a `CompositeRoute`.
Here is an illustration of the basic Prototype (class) hierarchy.

```
var MyNestedRoute < extend(Route, CompositeRoute, ChildRoute)

var FullRouter = Xtender.extend(RouteComposer, RequestParser, RouteMatcher, RouterPiper, RouterSignals);
Crossroads.prototype  = Xtender.extend(Crossroads.prototype, FullRouter, ErrorHandler);
```

`Xtender.extend` is used to extend an Object (uses `xtend` by default).
You can override this function to provide your own extension mechanism.

Here an example of composing your own prototypes:

```js
Xtender.extend(Route.prototype, BaseRoutable.prototype);
Xtender.extend(Route.prototype, RouteApi);

var RouteApi = {
  // Route specific methods...
}

Xtender.extend(CompositeRoute.prototype, BaseRoutable.prototype);
Xtender.extend(Route.prototype, CompositeRoute.prototype;
Xtender.extend(Router.prototype, RouterApi);

var RouterApi = {
  // Route specific methods...
}
```

### Route nesting

The Goal is to use the Composite pattern. Both Router and Roue are Composites, since a Route
can have nested routes mounted. A router can pipe to another route if no routes were activated
on that router.

### Adding or mounting multiple routes

The method `addRoutes` has been added to both the Router and the Route, to allow for an array of routes to be added or even adding/attaching/mounting all the routes of a Router.

### Routes information

`getRoutesBy` can be used to retrieve information about the routes registered on a given Router or Route. Example: `router.getRoutesBy('pattern', 'priority')`.

You can also have this info displayed as a string by chaining a `display()` call: `router.getRoutesBy().display()`

`parentRoute()` will get the parent route of a mounted/nested route. `getRoutes()` will get all the routes of a Router or all the child routes mounted on a Route. Note: It does not return all the routes in the nested sub-tree.

### Custom request transformations

The Router contains a method `_buildRequest(request)` which is called by `parse` to allow you to transform the request before parsing it. This can be useful if you want to allow the Router to
be routed from other data providers than the URL. An example could be to route using some user settings or some incoming data that affects what the user should see etc.

If you have a collaborative app, a particular user might be able to control what other users will see, and that even/action could be fed into the router.
Your imagination is the only limit ;)

### Pending activation

When a route has been successfully activated it can return a status indicating it is performing a "long-running operation". If this is the case the Router will call `handlePendingActivation(route)`.
You can override this function to provide custom handling of some sort, such as showing a loading status, progress bar etc.

To determine if the activation is pending, you can override the `_isPending(activateResult)` function on the router (by default it currently always returns false).

### Signals

The Route has the following default Signal strategy:

```js
_defaultSignalStrategy : function(signalName, request) {
  if (_hasActiveSignal(this[signalName])) {
    this[switchName](request);
    return true;
  }
  var args = this._defaultSignalArgs(request)
  if (this._parent) {
    _delegateSignal(signalName, this._parent, args);
  } else {
    _delegateSignal(signalName, this._router, args);
  }
},
```

It will pass any signal or delegate a hash with the route that activated and the incoming request.
The strategy first checks if the route itself has a listener for that signal. If so it will use that signal and return. Otherwise it will delegate to the parent route if it is delegatable and finally fallback to calling the router itself to take care of handling the signal.

The signals are:

Activation:
- couldActivate
- wasActivated
- couldntActivate

Switching:
- couldSwitch
- wasSwitched
- couldntSwitch

Deactivation:
- wasDeactivated

Methods you can override for custom functionality:

- willSwitch (when switch is called)
- canSwitch:boolean
- cannotSwitch:void
- didSwitch (after switching has been initiated)

- willActivate
- canActivate:boolean
- cannotActivate:void
- didActivate

- deactivate (extend)
- deactivated (extend)

You can set the `Route` constructor "class" on the Router via `router._RouteClass = MyRoute`
This allows you to easily create a custom `Route` class where you extend the base `Route` and have the router use this custom class whenever you add a route via `addRoute` or `addRoutes`. Splendid!

### Piped routers

A router can contain one or more piped routers.
If no routes match for a given request, the router will try each of the piped
 routes in succession until one of them matches.

A piped router has access to its parent via `getParent()`.
Should we should support a router having multiple parents? I think for now it is better to limit to one parent only.

A router can have a base route. when routes are added they should not know about the base route,
but when evaluated as part of match, they should calculate their full route pattern by applying
`baseRoute()` up the parent hierarchy. This way you can mount/dismount Routers easily without having to recalculate
routes each time. I guess the full route name could be cached on first match attempt?
Then clean cache when dismounted or remounted...

In order to achieve this, we need to "operate" on the route matching lv.

```js
function Route(pattern, callback, priority, router, name) {
    this._router = router;
    this._name = name || 'unknown';
    this._pattern = pattern;
    this._priority = priority || 0;

    this._lexPattern();

_lexPattern: function() {
  var isRegexPattern = isRegExp(this._pattern),
      patternLexer = this._router.patternLexer,
      pattern = this._pattern,
      router = this.router;


  this._paramsIds = isRegexPattern? null : patternLexer.getParamIds(pattern);
  this._optionalParamsIds = isRegexPattern? null : patternLexer.getOptionalParamsIds(pattern);
  this._matchRegexp = isRegexPattern? pattern : patternLexer.compilePattern(pattern, router.ignoreCase);
  this._matchRegexpHead = isRegexPattern? pattern : patternLexer.compilePattern(pattern, router.ignoreCase, true);
},
```

It turns out that `_matchRegexp` are ilk are defined on route creation. If we want it to take into consideration
the base route pattern where the route is mounted, we need to instead lazily evaluate on match.
Here we assume we have a `getPattern()` method on the route which `return this.baseRoute() + this._pattern;`

However, going down this path, we would have to pass the router context around to all route methods.
Not exactly elegant or maintainable.

```js
isRegexPattern: function(router) {
  router = router || this._router;
  isRegExp(this.getPattern(router))
},

getMatchRegexp: function (router) {
  router = router || this._router;
  var pattern = this.getPattern(router);
  return isRegexPattern(router)? pattern : router.patternLexer.compilePattern(pattern, router.ignoreCase);
},
```

If we allow a route to be mounted on multiple different routers, we need to pass in the
current context, ie. the current router instance we are matching for.
The `match` function then becomes something like...

```js
  // pass in router for which we are matching
  match : function (request, router) {
      request = request || '';
      //validate params even if regexp because of `request_` rule.
      return this.getMatchRegexp(router).test(request) && this._validateParams(request);
  },
```

Another, more sensible approach would be to have another class be the controller for the matching of routes.
We could call it `RoutingController`. As it matches routes on a Router and calls `route.match()`, it should
do it as a "transaction" such that `route._activeRouter` is set to the current router just before it starts and
set back to `null` when done. In fact, to support these kinds of mechanics we need a thorough refactoring,
which should be possible using the current fragmented design.

It could look sth like this. A much more flexible design than "inlining" the
routing functionality inside the Router and Route themselves.

```js
function RoutingController(router) {
  this.router = router;
}

RoutingController.prototype = {
  route: function(request) {
    this.requestParser(request).parse(this.router);
  },

  requestParser: function(request) {
    return new RequestParser(request, this.routeMatcher(request));
  },

  routeMatcher: function(request) {
    return new RouteMatcher(request);
  }
};
```

Another question with regards to mounting, is whether we should mount the original instance or mount a clone.
If we always mount a clone, we would simplify it a lot and be able to finetune the route on each mounted note
without affecting the other mounted instances. This makes a lot of sense!
However in other cases there might be good reason to be able to have one re-configuration of a route have
the same effect in multiple places it is used. So for good measure, we should allow both approaches.
The default should be not to [clone](https://www.npmjs.org/package/clone) however!

`router.mount(route, clone: true)`

### Authenticating and Authorizing routes

The route methods `canActivate:boolean` and `canSwitch:boolean` can be used to guard the route from activation and/or switching (redirect). Add any auth logic you like here.
You can also centralize the logic at a higher level, such as a parent route or root route or even on the router using the same methods.
Use the `_defaultSignalStrategy` for this.

You might consider using [permit-authorize](https://github.com/kristianmandrup/permit-authorize) to provide the Authorization logic (guards) for your routes. We recommend using
either a centralized approach (routes delegating to the router) or a decorator approach (decorating routes with individual auth logic).

## Links ##

 - [Project page and documentation](http://millermedeiros.github.com/crossroads.js/)
 - [Usage examples](https://github.com/millermedeiros/crossroads.js/wiki/Examples)
 - [Changelog](https://github.com/millermedeiros/crossroads.js/blob/master/CHANGELOG.md)

## Dependencies ##

**This library requires [JS-Signals](http://millermedeiros.github.com/js-signals/) to work.**

However it has been now been re-designed to make it super easy to decouple it from JS-Signals, to provide your own
messaging mechanism.

## License ##

[MIT License](http://www.opensource.org/licenses/mit-license.php)



## Distribution Files ##

Files inside `dist` folder.

 * crossroads.js : Uncompressed source code with comments.
 * crossroads.min.js : Compressed code.

You can install Crossroads on Node.js using [NPM](http://npmjs.org/)

    npm install crossroads



## Repository Structure ##

### Folder Structure ###

    dev       ->  development files
    |- lib          ->  3rd-party libraries
    |- src          ->  source files
    |- tests        ->  unit tests
    dist      ->  distribution files

### Branches ###

    master      ->  always contain code from the latest stable version
    release-**  ->  code canditate for the next stable version (alpha/beta)
    dev         ->  main development branch (nightly)
    gh-pages    ->  project page
    **other**   ->  features/hotfixes/experimental, probably non-stable code



## Building your own ##

This project uses [Node.js](http://nodejs.org/) for the build process. If for some reason you need to build a custom version install Node.js and run:

    node build

This will delete all JS files inside the `dist` folder, merge/update/compress source files and copy the output to the `dist` folder.

**IMPORTANT:** `dist` folder always contain the latest version, regular users should **not** need to run build task.



## Running unit tests ##

### On the browser ###

Open `dev/tests/spec_runner-dist.html` on your browser.

`spec_runner-dist` tests `dist/crossroads.js` and `spec_runner-dev` tests files inside
`dev/src` - they all run the same specs.


### On Node.js ###

Install [npm](http://npmjs.org) and run:

```
npm install --dev
npm test
```

Each time you run `npm test` the files inside the `dist` folder will be updated
(it executes `node build` as a `pretest` script).
