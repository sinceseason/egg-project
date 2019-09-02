const log4js = require('log4js');
const path = require('path');

const defaultLog = {
	appenders: {
        stdout: { type: 'stdout' },
        globalError: {
            type: 'dateFile',
            filename: path.join(__dirname, '../../../logs/error.log'),
            daysToKeep: 1
        },
        error: {
            type: 'logLevelFilter',
            appender: 'globalError',
            level: 'error'
        }
	},
	categories: {
		default: {
			appenders: [ 'stdout' ],
			level: 'debug'
        },
	}
};

module.exports = (config) => {
	let logConf = config && config.log4js ? config.log4js : defaultLog;
	log4js.configure(logConf);
	return function loggerFactory(categories) {
		return log4js.getLogger(categories);
	};
};
