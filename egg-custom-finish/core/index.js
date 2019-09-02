const AppCore = require('./lib/app');
const BaseContextClass = require('./lib/utils/base_context_class');
module.exports = {
	AppCore,
	Controller: BaseContextClass,
	Service: BaseContextClass
};
