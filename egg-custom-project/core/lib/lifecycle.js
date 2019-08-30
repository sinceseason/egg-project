const getReady = require('get-ready');
const {Ready} = require('ready-callback');
const {EventEmitter} = require('events');

class Lifecycle extends EventEmitter {
	/**
	 * @param {object} options - options
	 * @param {String} options.baseDir - the directory of application
	 * @param {EggCore} options.app - Application instance
	 */
	constructor(options) {
		super();
		this.options = options;
		getReady.mixin(this);

		const readyTimeoutEnv = Number.parseInt(process.env.REEADY_TIMEOUT_ENV || 10000);
		assert(
			Number.isInteger(readyTimeoutEnv),
			`process.env.EGG_READY_TIMEOUT_ENV ${process.env.REEADY_TIMEOUT_ENV} should be able to parseInt.`);
		this.readyTimeout = readyTimeoutEnv;
	}
}

module.exports = Lifecycle;