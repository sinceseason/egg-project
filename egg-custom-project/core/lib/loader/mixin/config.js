const path = require('path');
const extend = require('extend2');

module.exports = {
	loadConfig() {
		let target = {};
		const appConfig = this._preloadAppConfig();
		extend(true, target, appConfig);
		target.appMiddleware = target.appMiddlewares = target.middleware || [];
		this.config = this.app.config = target;
	},

	_preloadAppConfig() {
		const names = [ 'config.default', `config.${this.serverEnv}` ];
		const target = {};
		for (let filename of names) {
			const config = this._loadConfig(this.options.baseDir, filename, undefined, 'app');
			extend(true, target, config);
		}
		return target;
	},

	_loadConfig(dirpath, filename, extraInject, type) {
		let filepath = this.resolveModule(path.join(dirpath, 'config', filename));
		// let config.js compatible
		if (filename === 'config.default' && !filepath) {
			filepath = this.resolveModule(path.join(dirpath, 'config/config'));
		}
		const config = this.loadFile(filepath, this.appInfo, extraInject);

		if (!config) return null;
		return config;
	}
};
