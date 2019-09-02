const log4js = require('log4js');

const appDefaultConf = {
	appenders: {
		out: { type: 'stdout' }
	},
	categories: {
		default: {
			appenders: ['out'],
			level: 'debug'
		}
	}
};
// https://log4js-node.github.io/log4js-node/migration-guide.html
module.exports = config => {
	let logConf = config && config.log4js ? config.log4js : appDefaultConf;
	log4js.configure(logConf);
	return function loggerFactory(categories) {
		return log4js.getLogger(categories);
	};
};
