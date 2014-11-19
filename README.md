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

TODO!!!

### Route nesting

TODO!!!

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
