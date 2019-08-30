const KoaApplication = require('koa');
const Lifecycle = require('./lifecycle');

class MainCore extends KoaApplication {
	constructor(options = {}) {
		options.baseDir = options.baseDir || process.cwd();
		assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string');
		assert(fs.existsSync(options.baseDir), `Directory ${options.baseDir} not exists`);
		assert(fs.statSync(options.baseDir).isDirectory(), `Directory ${options.baseDir} is not a directory`);

		super();

		/**
		 * 生命周期
		 */
		this.lifecycle = new Lifecycle({
			baseDir: options.baseDir,
			app: this,
		});
		this.lifecycle.on('error', err => this.emit('error', err));
		this.lifecycle.on('ready_timeout', id => this.emit('ready_timeout', id));
		this.lifecycle.on('ready_stat', data => this.emit('ready_stat', data));
	}
}

module.exports = MainCore;