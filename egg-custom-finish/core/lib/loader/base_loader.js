const assert = require('assert');
const fs = require('fs');
const is = require('is-type-of');
const utils = require('../utils');
const FileLoader = require('./file_loader');
const ContextLoader = require('./context_loader');
class BaseLoader {
	constructor(options = {}) {
		this.options = options;
		assert(fs.existsSync(this.options.baseDir), `${this.options.baseDir} not exists`);
		assert(this.options.loggerFactory, 'options.loggerFactory is required');

		this.logger = options.loggerFactory('loader');
		this.logger.debug(`Loader start`);

		this.app = this.options.app;
		this.lifecycle = this.app.lifecycle;
		this.serverEnv = this.getServerEnv();

		// this.loadConfig();
		// this.loadPlugin();
		// this.loadCustomApp();
		// this.loadMiddleware();
		// this.loadService();
		// this.loadController();
		// this.loadRouter();
		this.logger.debug(`Loader end`);
	}

	/**
	 * 根据 process.env.NODE_ENV 置换 app 内置环境变量
	 * @returns {String} env
	 * @private
	 */
	getServerEnv() {
		let serverEnv = this.options.env || process.env.CONFIG_ENV;
		if (!serverEnv) {
			if (process.env.NODE_ENV === 'test') {
				serverEnv = 'unittest';
			} else if (process.env.NODE_ENV === 'production') {
				serverEnv = 'prod';
			} else {
				serverEnv = 'local';
			}
		} else {
			serverEnv = serverEnv.trim();
		}

		return serverEnv;
	}

	/**
	 * 判断路径是否存在，返回全路径
	 * @param {String} filepath
	 */
	resolveModule(filepath) {
		let fullPath;
		try {
			fullPath = require.resolve(filepath);
		} catch (e) {
			return undefined;
		}

		return fullPath;
	}

	requireFile(filepath) {
		const ret = utils.loadFile(filepath);
		return ret;
	}

	loadFile(filepath, ...inject) {
		filepath = filepath && this.resolveModule(filepath);
		if (!filepath) {
			return null;
		}

		// function(arg1, args, ...) {}
		if (inject.length === 0) inject = [this.app];

		let ret = this.requireFile(filepath);
		if (is.function(ret) && !is.class(ret)) {
			ret = ret(...inject);
		}
		return ret;
	}

	loadToApp(directory, property, opt) {
		const target = (this.app[property] = {});
		opt = Object.assign(
			{},
			{
				directory,
				target,
				property,
				inject: this.app,
				logger: this.logger
			},
			opt
		);
		new FileLoader(opt).load();
	}

	loadToContext(directory, property, opt) {
		opt = Object.assign(
			{},
			{
				directory,
				property,
				inject: this.app,
				logger: this.logger
			},
			opt
		);

		new ContextLoader(opt).load();
	}

	getTypeFiles(filename) {
		const files = [`${filename}.default`];
		// if (this.serverScope) files.push(`${filename}.${this.serverScope}`);
		if (this.serverEnv === 'default') return files;

		files.push(`${filename}.${this.serverEnv}`);
		// if (this.serverScope) files.push(`${filename}.${this.serverScope}_${this.serverEnv}`);
		return files;
	}

	getLoadUnits() {
		if (this.dirs) {
			return this.dirs;
		}

		const dirs = (this.dirs = []);

		if (this.plugins) {
			for (const key in this.plugins) {
				let plugin = this.plugins[key];
				dirs.push({
					name: key,
					path: plugin.path,
					type: 'plugin'
				});
			}
		}
		return dirs;
	}
}

const loaders = [require('./mixin/config'), require('./mixin/middleware'), require('./mixin/controller'), require('./mixin/service'), require('./mixin/router'), require('./mixin/plugin'), require('./mixin/custom')];

for (const loader of loaders) {
	Object.assign(BaseLoader.prototype, loader);
}
module.exports = BaseLoader;
