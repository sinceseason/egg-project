const KoaRouter = require('koa-router');

const METHODS = [ 'head', 'options', 'get', 'put', 'patch', 'post', 'delete' ];

class BaseRouter extends KoaRouter {
	constructor(opts, app) {
		super(opts);
		this.app = app;
		this.patchRouterMethod();
	}

	patchRouterMethod() {
		// patch router methods to support generator function middleware and string controller
		METHODS.concat([ 'all' ]).forEach((method) => {
			this[method] = (...args) => {
				const splited = spliteAndResolveRouterParams({ args, app: this.app });
				// format and rebuild params
				args = splited.prefix.concat(splited.middlewares);
				return super[method](...args);
			};
		});
	}
}

/**
 * 1. split (name, url, ...middleware, controller) to
 * {
 *   prefix: [name, url]
 *   middlewares [...middleware, controller]
 * }
 *
 * 2. resolve controller from string to function
 *
 * @param  {Object} options inputs
 * @param {Object} options.args router params
 * @param {Object} options.app egg application instance
 * @return {Object} prefix and middlewares
 */
function spliteAndResolveRouterParams({ args, app }) {
	let prefix;
	let middlewares;
	if (args.length >= 3 && (is.string(args[1]) || is.regExp(args[1]))) {
		// app.get(name, url, [...middleware], controller)
		prefix = args.slice(0, 2);
		middlewares = args.slice(2);
	} else {
		// app.get(url, [...middleware], controller)
		prefix = args.slice(0, 1);
		middlewares = args.slice(1);
	}
	// resolve controller
	const controller = middlewares.pop();
	middlewares.push(resolveController(controller, app));
	return { prefix, middlewares };
}

/**
 * resolve controller from string to function
 * @param  {String|Function} controller input controller
 * @param  {Application} app application instance
 * @return {Function} controller function
 */
function resolveController(controller, app) {
	if (is.string(controller)) {
		const actions = controller.split('.');
		let obj = app.controller;
		actions.forEach((key) => {
			obj = obj[key];
			if (!obj) throw new Error(`controller '${controller}' not exists`);
		});
		controller = obj;
	}
	// ensure controller is exists
	if (!controller) throw new Error('controller not exists');
	return controller;
}

module.exports = BaseRouter;
