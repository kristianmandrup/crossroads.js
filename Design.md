# Router Design

This router implements the Composite pattern. The basic idea is that it should be easy to compose a Router
 from simple building blocks and allow routers and routes to be reused across
 an application or even multiple applications.

### Composites

- Route
- Router

### Routables

A routable is any component that can be matched on a request to activate one or more routes.

- Router
- Nested route
- Route

### Piping Routers

A router can pipe request matching to any routers in its pipe.

### Mountables

### Mounting routes

A route can be mounted on a Route to create a nested route.
When mounted it will use the mount target as the base name for calculating its full pattern for itself and any
 composite it contains.

### Mounting routers

A router can be mounted on a Routable such as another router.
When mounted it will use the mount target as the base name for calculating its full pattern for itself and any
 composite it contains.

### Adding routes

A route added to another route will mount that route. You can either choose to add a cloned route
or a reference to the route itself.

Multiple routes can be added by passing a list of routes. If a Router is added this way, all its top-level routes are
added to the Route container as a list.

