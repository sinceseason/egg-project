const join = require('path');
const is = require('is-type-of');
const inspect = require('util').inspect;
const utils = require('../../utils');

module.exports = {
	loadMiddleware(opt) {
		this.logger.info('Load Middleware start');

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

		this.logger.info('Load Middleware stop');
	}
};

function wrapMiddleware(mw, options) {
	// support options.enable
	if (options.enable === false) return null;
  
	const fn = (ctx, next) => {
	  return mw(ctx, next);
	};
	fn._name = mw._name + 'middlewareWrapper';
	return fn;
}
