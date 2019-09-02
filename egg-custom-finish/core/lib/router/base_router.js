const KoaRouter = require('koa-router');
const is = require('is-type-of');
const utils = require('./utils');
const METHODS = ['head', 'options', 'get', 'put', 'patch', 'post', 'delete'];

class BaseRouter extends KoaRouter {
    /**
     * 
     * @param {Object} opt koa options
     * @param {AppCore} app this
     */
    constructor(opt, app) {
        super(opt);
        this.app = app;
        this.patchRouterMethod();
    }

    patchRouterMethod() {
        METHODS.concat(['all']).forEach(method => {
            this[method] = (...args) => {
                const splited = spliteAndResolveRouterParams({
                    args,
                    app: this.app
                });
                // format and rebuild params
                args = splited.prefix.concat(splited.middlewares);
                return super[method](...args);
            };
        });
    }
    register(path, methods, middlewares, opts) {
        // patch register to support generator function middleware and string controller
        middlewares = Array.isArray(middlewares) ? middlewares : [middlewares];
        middlewares = convertMiddlewares(middlewares, this.app);
        path = Array.isArray(path) ? path : [path];
        path.forEach(p => super.register(p, methods, middlewares, opts));
        return this;
    }
}

function spliteAndResolveRouterParams({
    args,
    app
}) {
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
    return {
        prefix,
        middlewares
    };
}

function resolveController(controller, app) {
    if (is.string(controller)) {
        const actions = controller.split('.');
        let obj = app.controller;
        actions.forEach(key => {
            obj = obj[key];
            if (!obj) throw new Error(`controller '${controller}' not exists`);
        });
        controller = obj;
    }
    // ensure controller is exists
    if (!controller) throw new Error('controller not exists');
    return controller;
}

function convertMiddlewares(middlewares, app) {
    // ensure controller is resolved
    const controller = resolveController(middlewares.pop(), app);
    // make middleware support generator function
    // middlewares = middlewares.map(utils.middleware);
    const wrappedController = (ctx, next) => {
        return utils.callFn(controller, [ctx, next], ctx);
    };
    return middlewares.concat([wrappedController]);
}

module.exports = BaseRouter;