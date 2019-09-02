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
}

const loaders = [
    require('./mixin/controller'),
]

for (const loader of loaders) {
    Object.assign(BaseLoader.prototype, loader);
}

module.exports = BaseLoader;
