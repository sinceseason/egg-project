const path = require('path');
const extend = require('extend2');
const assert = require('assert');

module.exports = {
	loadConfig() {
		let target = {};
		const appConfig = this._preloadAppConfig();

		target = this.app.config = appConfig;

		target.appMiddleware = target.appMiddlewares = target.middleware || [];
	},
	/**
	 * 预加载 app config
	 * @example /config/config.env.js
	 */
	_preloadAppConfig() {
		const names = ['config.default', `config.${this.serverEnv}`];
		const target = {};
		for (const filename of names) {
			const config = this._loadConfig(this.options.baseDir, filename, undefined, 'app');
			extend(true, target, config);
		}
		return target;
	},
	/**
	 * 读取文件对象内容
	 * @param {String} dirpath
	 * @param {String} filename
	 * @param {String} extraInject
	 * @param {String} type
	 */
	_loadConfig(dirpath, filename, extraInject, type) {
		let filepath = this.resolveModule(path.join(dirpath, 'config', filename));
		const config = this.loadFile(filepath, this.appInfo, extraInject);
		if (!config) return null;

		this.logger.debug(`loaded env`, filepath);
		return config;
	}
};
