const is = require('is-type-of');
const assert = require('assert');
const { EventEmitter } = require('events');
const getReady = require('get-ready');
const { Ready } = require('ready-callback');
const INIT_READY = Symbol('Lifecycle#initReady');
const utils = require('./utils');
const DELEGATE_READY_EVENT = Symbol('Lifecycle#delegateReadyEvent');
const REGISTER_BEFORE_CLOSE = Symbol('Lifecycle#registerBeforeClose');
const REGISTER_READY_CALLBACK = Symbol('Lifecycle#registerReadyCallback');
const BOOT_HOOKS = Symbol('Lifecycle#bootHooks');
const BOOTS = Symbol('Lifecycle#boots');
class Lifecycle extends EventEmitter {
	constructor(options = {}) {
		super();
		this.options = options;
		this[BOOT_HOOKS] = [];
		this[BOOTS] = [];
		this.logger = this.options.loggerFactory('lifecycle');
		getReady.mixin(this);
		this.app = this.options.app;
		this.readyTimeout = 10 * 1000;
		this[INIT_READY]();
	}
	/**
	 * 生命周期初始化
	 */
	[INIT_READY]() {
		this.loadReady = new Ready({ timeout: this.readyTimeout });
		this[DELEGATE_READY_EVENT](this.loadReady);
		this.loadReady.ready(err => {
			this.logger.debug('loadReady all done, ready to start');
			if (err) {
				this.ready(err);
			} else {
				this.triggerWillReady();
				// this.ready(true);
			}
		});
		this.bootReady = new Ready({ timeout: this.readyTimeout, lazyStart: true });
		this[DELEGATE_READY_EVENT](this.bootReady);
		this.bootReady.ready(err => {
			this.ready(err || true);
		});
	}

	[DELEGATE_READY_EVENT](ready) {
		ready.once('error', err => {
			console.log(err);
			ready.ready(err);
		});
		ready.on('ready_timeout', id => this.emit('ready_timeout', id));
		ready.on('ready_stat', data => this.emit('ready_stat', data));
		ready.on('error', err => this.emit('error', err));
	}

	registerBeforeStart(scope, scopeName) {
		this[REGISTER_READY_CALLBACK]({
			scope,
			ready: this.loadReady,
			scopeFullName: scopeName
		});
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
		for (const boot of this[BOOTS]) {
			this[REGISTER_READY_CALLBACK]({
				scope: function() {},
				ready: this.loadReady,
				scopeFullName: boot.name
			});
		}
	}

	triggerWillReady() {
		this.bootReady.start();
	}
	[REGISTER_READY_CALLBACK]({ scope, ready, scopeFullName }) {
		if (!is.function(scope)) {
			throw new Error('boot only support function');
		}
		this.logger.debug(`ready start`, scopeFullName);
		// get filename from stack if scopeFullName is undefined
		const name = scopeFullName;

		const done = ready.readyCallback(name);

		// ensure scope executes after load completed
		process.nextTick(() => {
			utils.callFn(scope).then(
				() => {
					this.logger.debug(`ready end`, scopeFullName, 'end');
					done();
				},
				err => {
					done(err);
				}
			);
		});
	}
}

module.exports = Lifecycle;
