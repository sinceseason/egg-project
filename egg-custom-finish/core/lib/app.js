const assert = require('assert');
const fs = require('fs');
const KoaApplication = require('koa');
const Loader = require('./loader/base_loader');
const BaseRouter = require('./router/base_router');
const ROUTER = Symbol('App#router');
const getReady = require('get-ready');
const BaseContextClass = require('./utils/base_context_class');
const { Ready } = require('ready-callback');
const utils = require('./utils');
const logger = require('./utils/logger');
const Lifecycle = require('./lifecycle');
class AppCore extends KoaApplication {
	/**
	 * @class
	 * @param {Object} options
	 * @param {String} [options.baseDir] 应用基础路径，默认项目启动路径
	 */
	constructor(options = {}) {
		options.baseDir = options.baseDir || process.cwd();
		assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string');
		assert(fs.existsSync(options.baseDir), `Directory ${options.baseDir} not exists`);
		assert(fs.statSync(options.baseDir).isDirectory(), `Directory ${options.baseDir} is not a directory`);

		super();

		this.baseDir = options.baseDir;

		this.lifecycle = new Lifecycle({
			baseDir: options.baseDir,
			app: this,
			loggerFactory: logger()
		});

		this.loader = new Loader({
			baseDir: options.baseDir,
			app: this,
			plugins: options.plugins,
			loggerFactory: logger(),
			serverScope: options.serverScope,
			env: options.env
		});

		this.logger = logger(this.config);
		this.BaseContextClass = BaseContextClass;
		this.Controller = this.BaseContextClass;
	}

	/**
	 * @param router app.router
	 */
	get router() {
		if (this[ROUTER]) {
			return this[ROUTER];
		}
		const router = (this[ROUTER] = new BaseRouter(
			{
				sensitive: true
			},
			this
		));
		// register router middleware after new app create
		this.beforeStart(() => {
			this.use(router.middleware());
		}, 'router');
		return router;
	}
	get plugins() {
		return this.loader ? this.loader.plugins : {};
	}

	beforeStart(scope, scopeName) {
		this.lifecycle.registerBeforeStart(scope, scopeName);
	}

	ready(fn) {
		// return this.ready(fn);
		try {
			return this.lifecycle.ready(fn);
		} catch (err) {
			console.log(err);
		}
	}
}

module.exports = AppCore;
