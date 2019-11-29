const getReady = require('get-ready');
const { Ready } = require('ready-callback');
const { EventEmitter } = require('events');
const utils = require('./utils');

const INIT_READY = Symbol('Lifecycle#initReady');
const DELEGATE_READY_EVENT = Symbol('Lifecycle#delegateReadyEvent');
const REGISTER_BEFORE_CLOSE = Symbol('Lifecycle#registerBeforeClose');
const REGISTER_READY_CALLBACK = Symbol('Lifecycle#registerReadyCallback');
const CLOSE_SET = Symbol('Lifecycle#closeSet');
const IS_CLOSED = Symbol('Lifecycle#isClosed');
const BOOT_HOOKS = Symbol('Lifecycle#bootHooks');
const BOOTS = Symbol('Lifecycle#boots');

class Lifecycle extends EventEmitter {
	/**
	 * @param {object} options - options
	 * @param {String} options.baseDir - the directory of application
	 * @param {EggCore} options.app - Application instance
	 * @param {Function} options.logger - logger
	 */
	constructor(options) {
		super();
		this.options = options;
		this.logger = this.options.loggerFactory('lifecycle');
		this[BOOTS] = [];	// TODO: this[BOOTS]赋值
		getReady.mixin(this);

		const readyTimeoutEnv = Number.parseInt(process.env.REEADY_TIMEOUT_ENV || 10000);
		assert(
			Number.isInteger(readyTimeoutEnv),
			`process.env.EGG_READY_TIMEOUT_ENV ${process.env.REEADY_TIMEOUT_ENV} should be able to parseInt.`
		);
		this.readyTimeout = readyTimeoutEnv;

		this[INIT_READY]();
		this.on('ready_stat', (data) => {
			this.logger.info('[core:ready_stat] end ready task %s, remain %j', data.id, data.remain);
		}).on('ready_timeout', (id) => {
			this.logger.warn(
				'[core:ready_timeout] %s seconds later %s was still unable to finish.',
				this.readyTimeout / 1000,
				id
			);
		});

		this.ready((err) => {
			this.triggerDidReady(err);
		});
	}

	[INIT_READY]() {
		this.loadReady = new Ready({ timeout: this.readyTimeout });
		this[DELEGATE_READY_EVENT](this.loadReady);
		this.loadReady.ready((err) => {
			if (err) {
				this.ready(err);
			} else {
				this.triggerWillReady();
			}
		});

		this.bootReady = new Ready({ timeout: this.readyTimeout, lazyStart: true });
		this[DELEGATE_READY_EVENT](this.bootReady);
		this.bootReady.ready((err) => {
			this.ready(err || true);
		});
	}

	[DELEGATE_READY_EVENT](ready) {
		ready.once('error', (err) => ready.ready(err));
		ready.on('ready_timeout', (id) => this.emit('ready_timeout', id));
		ready.on('ready_stat', (data) => this.emit('ready_stat', data));
		ready.on('error', (err) => this.emit('error', err));
	}

	addFunctionAsBootHook(hook, name) {
		// app.js is exported as a function
		// call this function in configDidLoad
		this[BOOT_HOOKS].push(
			class Hook {
				constructor(app) {
					this.app = app;
					this.name = name;
				}
				configDidLoad() {
					hook(this.app);
				}
			}
		);
	}

	init() {
		this[BOOTS] = this[BOOT_HOOKS].map(t => new t(this.app));
		if (this[BOOTS].length == 0) {
			this.bootReady.ready(true);
		}
	}

	registerBeforeStart(scope, name) {
		this[REGISTER_READY_CALLBACK]({
			scope,
			ready: this.loadReady,
			scopeFullName: name || 'before start',
		});
	}

	triggerConfigWillLoad() {
		for (const boot of this[BOOTS]) {
			if (boot.configWillLoad) {
				boot.configWillLoad();
			}
		}
		this.triggerConfigDidLoad();
	}

	triggerConfigDidLoad() {
		for (const boot of this[BOOTS]) {
			if (boot.configDidLoad) {
				boot.configDidLoad();
			}
		}
		this.triggerDidLoad();
	}

	triggerDidLoad() {
		this.logger.info('register didLoad');
		for (const boot of this[BOOTS]) {
			const didLoad = boot.didLoad && boot.didLoad.bind(boot);
			if (didLoad) {
				this[REGISTER_READY_CALLBACK]({
					scope: didLoad,
					ready: this.loadReady,
					timingKeyPrefix: 'Did Load',
					scopeFullName: boot.fullPath + ':didLoad',
				});
			}
		}
	}

	triggerWillReady() {
		this.logger.info('trigger willReady');
		this.bootReady.start();
		for (const boot of this[BOOTS]) {
			const willReady = boot.willReady && boot.willReady.bind(boot);
			if (willReady) {
				this[REGISTER_READY_CALLBACK]({
					scope: willReady,
					ready: this.bootReady,
					scopeFullName: boot.fullPath + ':willReady'
				});
			}
		}
	}

	triggerDidReady(err) {
		this.logger.info('trigger didReady');
		(async () => {
			for (const boot of this[BOOTS]) {
				if (boot.didReady) {
					try {
						await boot.didReady(err);
					} catch (e) {
						this.emit('error', e);
					}
				}
			}
			this.logger.info('trigger didReady done');
		})();
	}

	[REGISTER_READY_CALLBACK]({ scope, ready, scopeFullName }) {
		if (!is.function(scope)) {
			throw new Error('boot only support function');
		}

		// get filename from stack if scopeFullName is undefined
		const name = scopeFullName;

		const done = ready.readyCallback(name);

		// ensure scope executes after load completed
		process.nextTick(() => {
			utils.callFn(scope).then(
				() => {
					done();
				},
				(err) => {
					done(err);
				}
			);
		});
	}
}

module.exports = Lifecycle;
