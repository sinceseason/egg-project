const KoaApplication = require('koa');
const Lifecycle = require('./lifecycle');
const Loader = require('./loader/base_loader');
const logger = require('./utils/logger');
const BaseContextClass = require('./utils/base_context_class');
const Router = require('./router');

const ROUTER = Symbol('core#router');
const BASE_LOADER = Symbol.for('core#base_loader');

class MainCore extends KoaApplication {
	constructor(options = {}) {
		options.baseDir = options.baseDir || process.cwd();
		assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string');
		assert(fs.existsSync(options.baseDir), `Directory ${options.baseDir} not exists`);
		assert(fs.statSync(options.baseDir).isDirectory(), `Directory ${options.baseDir} is not a directory`);

		super();

		this.baseDir = options.baseDir;
		this.BaseContextClass = BaseContextClass;
		this.Controller = this.BaseContextClass;
		this.Service = this.BaseContextClass;

		/**
		 * 生命周期
		 * @param {object} options 
		 * @param {String} options.baseDir
		 * @param {Function} logger - function loggerFactory(categories) {
		 *	 return log4js.getLogger(categories);
		 *	}}
		 */
		this.lifecycle = new Lifecycle({
			baseDir: options.baseDir,
			app: this,
			logger: logger()
		});

		this.loader = new Loader({
			baseDir: options.baseDir,
			app: this,
			plugins: options.plugins,
			logger: logger(),
			serverScope: options.serverScope,
			env: options.env
		});
	}

	/**
	 * TODO:
	 * For plugin development, we should use `didLoad` instead.
	 * For application development, we should use `willReady` instead.
	 * 
	 * @param {Function|GeneratorFunction|AsyncFunction} scope 
	 * @param {String} name
	 */
	beforeStart(scope, name) {
		this.lifecycle.registerBeforeStart(scope, name);
	}

	get router() {
		if (this[ROUTER]) {
			return this[ROUTER];
		}
		const router = (this[ROUTER] = new Router({ sensitive: true }, this));
		this.beforeStart(() => {
			this.use(router.middleware());
		}, 'router');
		return router;
	}

	get [BASE_LOADER]() {
		return require('./loader/base_loader');
	}
}

module.exports = MainCore;
