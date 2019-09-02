const path = require('path');
const is = require('is-type-of');
const inspect = require('util').inspect;
const assert = require('assert');
module.exports = {
	loadMiddleware(opt) {
		const app = this.app;
		opt = Object.assign(
			{
				call: false,
				override: true,
				caseStyle: 'lower',
				directory: path.join(this.options.baseDir, 'app/middleware')
			},
			opt
		);
		const middlewarePaths = opt.directory;
		this.loadToApp(middlewarePaths, 'middlewares', opt);

		for (const name in app.middlewares) {
			Object.defineProperty(app.middleware, name, {
				get() {
					return app.middlewares[name];
				},
				enumerable: false,
				configurable: false
			});
		}

		for (const name of app.config.appMiddlewares) {
			const options = app.config[name] || {};
			let mw = app.middlewares[name];
			assert(is.function(mw), `Middleware ${name} must be a function, but actual is ${inspect(mw)}`);
			mw = wrapMiddleware(mw, options, app);
			mw._name = name;
			if (mw) {
				app.use(mw);
			}
		}
	}
};

function wrapMiddleware(mw, options, app) {
	const fn = (ctx, next) => {
		return mw(options, app)(ctx, next);
	};
	return fn;
}
