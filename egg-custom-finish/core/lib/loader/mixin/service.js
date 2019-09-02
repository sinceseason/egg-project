const path = require('path');
module.exports = {
	loadService(opt) {
		opt = Object.assign(
			{
				call: true,
				caseStyle: 'lower',
				fieldClass: 'serviceClasses',
				directory: path.join(this.options.baseDir, 'app/service'),
				logger: this.logger
			},
			opt
		);
		const servicePaths = opt.directory;
		this.loadToContext(servicePaths, 'service', opt);
	}
};
