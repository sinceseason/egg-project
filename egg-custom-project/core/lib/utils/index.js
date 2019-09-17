const is = require('is-type-of');
const co = require('co');
const path = require('path');
const fs = require('fs');
const BuiltinModule = require('module');

const Module =
	module.constructor.length > 1
		? module.constructor
		: /* istanbul ignore next */
			BuiltinModule;

module.exports = {
	async callFn(fn, args, ctx) {
		args = args || [];
		if (!is.function(fn)) return;
		if (is.generatorFunction(fn)) fn = co.wrap(fn);
		return ctx ? fn.call(ctx, ...args) : fn(...args);
	},

	loadFile(filepath) {
		try {
			const extname = path.extname(filepath);
			if (extname && !Module._extensions[extname]) {
				return fs.readFileSync(filepath);
			}
			const obj = require(filepath);
			if (!obj) return obj;
			if (obj.__esModule) return 'default' in obj ? obj.default : obj;
			return obj;
		} catch (error) {
			err.message = `[main] load file: ${filepath}, error: ${err.message}`;
			throw err;
		}
	}
};
