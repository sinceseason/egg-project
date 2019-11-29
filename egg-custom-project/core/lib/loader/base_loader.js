const ContextLoader = require('./context_loader');
const is = require('is-type-of');
const utils = require('../utils');
const FileLoader = require('./file_loader');

class BaseLoader {
	/**
	 * @class
	 * @param {Object} options - options
	 * @param {String} options.baseDir - the directory of application
     * @param {Core} options.app - Application instance
     * @param {Function} options.logger - function
     * @param {Object} [options.plugins] - custom plugins
     * @param {String} options.serverScope - TODO:
     * @param {String} options.env - TODO:
	 */
	constructor(options) {
		this.options = options;

		this.logger = options.loggerFactory('base_loader');
		this.logger.info('Base_Loader Start');

		this.app = this.options.app;
		this.lifecycle = this.app.lifecycle;
		this.serverEnv = this.getServerEnv();

		this.logger.info('Base_loader End');
	}

	/**
     * process.env.SERVER_ENV 提供环境变量, **it's not NODE_ENV**
     * 
     * 1. from SERVER_ENV
     * 2. from NODE_ENV
     * 
     * env | description
     * ---      | ---
     * test     | system integration testing
     * prod     | production
     * local    | local on your own computer
     * unittest | unit test
     * 
     * @returns {String} env
     */
	getServerEnv() {
		let serverEnv = this.options.env || process.env.SERVER_ENV;
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

	loadToApp(directory, property, opt) {
		const target = (this.app[property] = {});
		opt = Object.assign(
			{},
			{
				directory,
				target,
				inject: this.app
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
				inject: this.app
			},
			opt
		);

		new ContextLoader(opt).load();
	}

	getTypeFiles(filename) {
		const files = [ `${filename}.default` ];
		if (this.serverEnv === 'default') return files;
		files.push(`${filename}.${this.serverEnv}`);
		return files;
	}

	loadFile(filepath, ...inject) {
		filepath = filepath && this.resolveModule(filepath);
		if (!filepath) {
			return null;
		}

		// function(arg1, args, ...) {}
		if (inject.length === 0) inject = [ this.app ];

		let ret = this.requireFile(filepath);
		if (is.function(ret) && !is.class(ret)) {
			ret = ret(...inject);
		}
		return ret;
	}

	requireFile(filepath) {
		const ret = utils.loadFile(filepath);
		return ret;
	}

	getLoadUnits() {
		if (this.dirs) {
			return this.dirs;
		}

		const dirs = (this.dirs = []);

		if (this.plugins) {
			for (const plugin of this.plugins) {
				dirs.push({
					path: plugin.path,
					type: 'plugin'
				});
			}
		}
		return dirs;
	}

	resolveModule(filepath) {
		let fullPath;
		try {
			fullPath = require.resolve(filepath);
		} catch (e) {
			return undefined;
		}

		return fullPath;
	}
}

const loaders = [
	require('./mixin/controller'),
	require('./mixin/service'),
	require('./mixin/router'),
	require('./mixin/config'),
	require('./mixin/plugin'),
	require('./mixin/middleware'),
	require('./mixin/custom'),
];

for (const loader of loaders) {
	Object.assign(BaseLoader.prototype, loader);
}

module.exports = BaseLoader;
