let base;
let routes = {};

let notFoundFn = function(path) {
  throw new Error(`No route matches ${path}`);
}

function matches(pathParts, routeParts) {
  if (pathParts.length !== routeParts.length) {
    return null;
  }

  let params = {};
  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i][0] === ':') {
      params[routeParts[i].slice(1)] = pathParts[i];
    } else if (pathParts[i] !== routeParts[i]) {
      return null;
    }
  }

  return params;
}

function parse(path) {
  let params;
  let pathParts = path.split('/');

  for (let route in routes) {
    if (route === 'else') {
      continue;
    }

    params = matches(pathParts, route.split('/'));
    if (params) {
      return routes[route].bind(null, params);
    }
  }
  return notFoundFn.bind(null, path);
}

function routeChangeHandler() {
  let path = location.pathname;

  if (base) {
    if (path.startsWith(base)) {
      path = path.slice(base.length);
    } else {
      console.warn(`Path ${path} does not start with base ${base}`);
    }
  }

  path = '/' + path;

  parse(path)();
}

function router(_routes) {
  routes = _routes;
  let baseEl = document.querySelector('base');
  if (baseEl) {
    base = baseEl.getAttribute('href');
  }
  if (!base) {
    base = '/';
  }

  if ('else' in routes) {
    notFoundFn = routes.else;
  }

  document.addEventListener('click', function(event) {
    if (event.target.tagName != 'A' || event.ctrlKey || event.metaKey || ('button' in event && event.button != 0)) {
      return;
    }

    let href = event.target.getAttribute('href');
    if (!href || href.startsWith('http') || (href.startsWith('/') && base)) {
      return;
    }

    event.preventDefault();
    router.go(href);
  });

  window.onpopstate = routeChangeHandler;
  // Get the resources for the initial route.
  routeChangeHandler();
}

// Programatically navigate to a route.
router.go = function(route, options) {
  if (route.startsWith('/')) {
    route = route.slice(1);
  }
  route = base + route;

  options || (options = {});
  history[options.replace ? 'replaceState' : 'pushState'](null, '', route);

  // Adding a state entry does not trigger the `popstate` window event.
  routeChangeHandler();
}

export default router;