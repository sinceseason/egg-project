const join = require('path');
const is = require('is-type-of');
const inspect = require('util').inspect;
const utils = require('../../utils');

module.exports = {
	loadMiddleware(opt) {
		this.logger.info('Load Middleware start');

		const app = this.app;
		opt = Object.assign(
			{
				call: false,
				override: true,
				caseStyle: 'lower',
				directory: path.join(this.options.baseDir, 'app/middleware')
			},
			opt
		);
		const middlewarePaths = opt.directory;
		this.loadToApp(middlewarePaths, 'middlewares', opt);

		this.logger.info('Load Middleware stop');
	}
};
