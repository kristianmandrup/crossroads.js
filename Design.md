# Router Design

This router implements the Composite pattern. The basic idea is that it should be easy to compose a Router
 from simple building blocks and allow routers and routes to be reused across
 an application or even multiple applications.

### Composites

- Route
- Router

### Router

A router normally has the following main responsibilities:

- Contain a list of routes in prioritized order
- Allow piping to other routers
- Perform routing:
  - traverse through registered routes (and piped routers)
  - match request on each route
  - find the first (or all) matching routes
  - activate matching route(s)

### Route

A `Route` normally has the following main responsibilities:

- Register:
  - name
  - route pattern
  - priority
  - activation callback
  - custom properties...

- Contain nested routes
- Attempt match activation
  - match request
  - activate if matched
  - execute activation callback

### Routables

A `Routable` is any component that can be matched on a request to activate one or more routes.

- Router
- Nested route
- Route

### Piping Routers

During route matching, a `Router` can `pipe` to the list of piped routers,
who will do their own route matching given the current request.

### Mountables

A `Mountable` is a Routable that can act as a Mount target for other Routables

### Mounting Routables

A Mountable uses the `pattern` of the Mount target as `basePattern`.
When the Mountable is being matched with a `request`, each route will dynamically
calculate its `pattern` by prefixing with the `basePattern`. This is done recursively up the mounting tree.
A Mountable can either be mounted directly or have a mounting pattern which acts as a prefix to all nested Routables
on the Mountable.

Mounting Routables makes it possible to easily reuse a set of routes in different context. Here we will show how a
PostsRouter can be reused in different scopes/namespaces to easily form a complex router.

In the following example, we assume we have a `ResourceRoutes` constructor available which returns a
set of REST like Resource routes by some convention.

```js
var sessionRoutes = new SessionRoutes(enter: 'login', exit: 'logout')
var postResourceRoutes = new ResourceRoutes('posts', {id: 'name'});
postsRouter = new Router(name: 'postsRouter');
postsRouter.addRoutes(postResourceRoutes, ...);
postsRouter.addRoutes(sessionRoutes, ...);

// alternatively
postsRouter = new Router(name: 'posts', routes: [postResourceRoutes, ...]);
```

This will create a Router structure with routes as follows. Note that `: posts.many` indicates the name of the node
in the tree. For resource routes we assume the `ResourceRoutes` names them by some convention.
Same applies for `SessionRoutes`.

```
+ / : posts
  + posts (list) : posts.many
  + posts/new (create) : posts.create
  + posts/:name (view/edit) : posts.one
  + login : session.login
  + logout : session.logout
```

```js
App.router.mount(postsRouter);
App.router.mount(postsRouter, {on: 'admin', clone: true});
```

The `PostsRouter` is mounted both on the root and as `admin`.
All routes of the `admin` mounted router are dynamically prefixed with `admin`
when matched so that `posts/:id` becomes `admin/posts/:id`

```
+ /
  + posts (list)
  + posts/new (create)
  + posts/:name (view/edit)
  + admin (mounted router)
    + posts
    + posts/:name
    ...
```

Since the routers are mounted by reference, changing any aspect of `postsRouter` will
immediately affect everywhere it is mounted to act the same. In cases you want to reuse the routes
but have the mounted set of routes act "independently", you can use the `clone:true` option.
Alternatively you can use `addRoutes`, but then you loose the ability to act on that set of routes as a whole.

### Add route

To add a route, to a Route container you have to call `addRoute` with sufficient arguments to build a new route.
If the route can be built from these arguments the route will be added to the route container.

If you call `addRoute` with a Routable instance, it will instead mount that Routable.
You can either mount a cloned Routable (via `clone:true` option) or a reference to the Routable itself.

### Add routes

Multiple routes can be added by passing a list of routes. If a Router is passed as argument to`AddRoutes`, all its top-level routes are
added to the Route container as a list of routes, just like passing a normal list of routes.

### Route matching

Given that we have a complex composite model of nested Routers and routes, the classic way of doing route matching becomes
somewhat problematic.

If a Route or Router can be mounted by reference multiple places in the graph, we cannot say (in isolation)
for which router it is being matched unless we pass the "active" router (being matched on) by reference to the route.
If we do this however, it would pollute (and bloat) the Route matching methods with logic that is not really core
to the Route or Router itself.

Instead a much better approach is to extract the Route Matching to a seperate entity which controls this flow.
This way Routes and Routers can be stupid structural containers and we can control and change the flow dynamics externally,
 a much moe flexible design/architecture.

### Routing Controller

The `RoutingController` will ...