[![Build Status](https://secure.travis-ci.org/millermedeiros/crossroads.js.png)](https://travis-ci.org/millermedeiros/crossroads.js)

---

![Crossroads - JavaScript Routes](https://github.com/millermedeiros/crossroads.js/raw/master/_assets/crossroads_logo.png)


## Introduction ##

Crossroads.js is a routing library inspired by URL Route/Dispatch utilities present on frameworks like Rails, Pyramid, Django, CakePHP, CodeIgniter, etc...
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
you to compose your Router and Route APIs from composable blocks.

### Build

This project uses [webpack](https://github.com/webpack/webpack) as the package tool, in order to support:

- CommonJS
- RequireJS

[Gulp](http://gulpjs.com/) used to build the distribution file in `dist/crossroads.js`

### Prototype design

Base functionality for Router and Route is defined in `BaseRoute`
Any Route/Router which can add routes to itself is a `CompositeRoute`.
Here is an illustration of the basic Prototype (class) hierarchy.

```
Route < BaseRoute
Router < CompositeRoute < BaseRoute
```

`Xtender.extend` is used to extend an Object (uses `xtend` by default).
You can override this function to provide your own extension mechanism.

```js
Xtender.extend(Route.prototype, BaseRoutable.prototype);
Xtender.extend(Route.prototype, RouteApi);

var RouteApi = {
  // Route specific methods...
}

Xtender.extend(CompositeRoutable.prototype, BaseRoutable.prototype);

// ...

Xtender.extend(Route.prototype, CompositeRoutable.prototype;

Xtender.extend(Router.prototype, RouterApi);

var RouterApi = {
  // Route specific methods...
}
```

A `CompositeRoutable` can add any object which has `BaseRoutable` in its `prototype` path as a nested route.


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

If you have a collaborative/multiuser app, a particular user might be able to control what other users will see, and that even/action could be fed into the router. Your imagination is the only limit ;)

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
This allows you to esily create a custom `Route` class where you extend the base `Route` and have the router use this custom class whenever you add a route via `addRoute` or `addRoutes`. Splendid!

TODO: We need a mixin for this, so we can reuse the same logic for Route and Router :)

### Authenticating and Authorizing routes

The route methods `canActivate:boolean` and `canSwitch:boolean` can be used to guard the route from activation and/or switching (redirect). Add any auth logic you like here.
You can also centralize the logic at a higher level, such as a parent route or root route or even on the router using the same methods.

## Links ##

 - [Project page and documentation](http://millermedeiros.github.com/crossroads.js/)
 - [Usage examples](https://github.com/millermedeiros/crossroads.js/wiki/Examples)
 - [Changelog](https://github.com/millermedeiros/crossroads.js/blob/master/CHANGELOG.md)



## Dependencies ##

**This library requires [JS-Signals](http://millermedeiros.github.com/js-signals/) to work.**



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
