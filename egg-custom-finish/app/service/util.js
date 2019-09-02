const { Service } = require('../../core');
const { text, rule } = require('../constant');
const moment = require('moment');
const extend = require('extend2');
class UtilService extends Service {
	getMonthTotalDays(timeStr) {
		return timeStr ? moment(timeStr).daysInMonth() : moment().daysInMonth();
	}
	toJSON(data) {
		if (data) {
			return JSON.parse(JSON.stringify(data));
		} else {
			return {};
		}
	}
	responseWrap(...args) {
		if (args.length == 1) {
			return {
				success: true,
				data: [...args][0]
			};
		}
		return {
			success: true,
			data: extend({}, ...args)
		};
	}
	validate(obj, arr) {
		let result = {
			status: false,
			msg: ''
		};
		const validator = text.validator;
		if (arr && arr.length > 0) {
			for (let key of arr) {
				if (obj) {
					let existRule = rule[key];
					let val = obj[key];
					if (!existRule) {
						if (!val) {
							result.msg = validator.none;
							throw new Error(result.msg);
						} else {
							result.status = true;
						}
					} else {
						if (!existRule.test(val)) {
							result.msg = validator[key] || validator.error;
							throw new Error(result.msg);
						} else {
							result.status = true;
						}
					}
				} else {
					result.msg = validator.error;
					throw new Error(result.msg);
				}
			}
		} else {
			result.msg = validator.error;
			throw new Error(result.msg);
		}
	}
}
module.exports = UtilService;
