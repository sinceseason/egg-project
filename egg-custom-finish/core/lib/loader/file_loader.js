const path = require('path');
const fs = require('fs');
const assert = require('assert');
const globby = require('globby');
const is = require('is-type-of');
const utils = require('../utils');
const FULLPATH = Symbol('EGG_LOADER_ITEM_FULLPATH');
const EXPORTS = Symbol('EGG_LOADER_ITEM_EXPORTS');

const defaults = {
	directory: null,
	target: null,
	match: undefined,
	ignore: undefined,
	lowercaseFirst: false,
	caseStyle: 'camel',
	initializer: null,
	call: true,
	override: false,
	inject: undefined,
	filter: null
};

class FileLoader {
	/**
	 *
	 * @param {Object} options
	 * @param {String} options.directory
	 * @param {String} options.target
	 */
	constructor(options) {
		assert(options.directory, 'options.directory is required');
		assert(options.target, 'options.target is required');
		this.options = Object.assign({}, defaults, options);
		this.logger = this.options.logger;
	}

	load() {
		const items = this.parse();
		const target = this.options.target;
		for (const item of items) {
			// item { properties: [ 'a', 'b', 'c'], exports }
			// => target.a.b.c = exports
			item.properties.reduce((target, property, index) => {
				let obj;
				const properties = item.properties.slice(0, index + 1).join('.');
				if (index === item.properties.length - 1) {
					if (property in target) {
						if (!this.options.override) throw new Error(`can't overwrite property '${properties}' from ${target[property][FULLPATH]} by ${item.fullpath}`);
					}
					obj = item.exports;
					if (obj && !is.primitive(obj)) {
						obj[FULLPATH] = item.fullpath;
						obj[EXPORTS] = true;
					}
				} else {
					obj = target[property] || {};
				}
				target[property] = obj;

				// this.logger.debug(`loaded ${this.options.property} ${property}`, item.fullpath);
				this.logger.debug(`loaded ${this.options.property.toString()} ${property}`, item.fullpath);
				return obj;
			}, target);
		}
		return target;
	}

	parse() {
		// 准备需匹配文件
		let files = this.options.match;
		if (!files) {
			files = ['**/*.js'];
		} else {
			files = Array.isArray(files) ? files : [files];
		}

		let ignore = this.options.ignore;
		if (ignore) {
			ignore = Array.isArray(ignore) ? ignore : [ignore];
			ignore = ignore.filter(f => !!f).map(f => '!' + f);
			files = files.concat(ignore);
		}

		let directories = this.options.directory;
		if (!Array.isArray(directories)) {
			directories = [directories];
		}

		const filter = is.function(this.options.filter) ? this.options.filter : null;
		const items = [];

		for (const directory of directories) {
			const filepaths = globby.sync(files, {
				cwd: directory
			});
			for (const filepath of filepaths) {
				const fullpath = path.join(directory, filepath);
				if (!fs.statSync(fullpath).isFile()) continue;
				// get properties
				// app/service/foo/bar.js => [ 'foo', 'bar' ]
				const properties = getProperties(filepath, this.options);
				// app/service/foo/bar.js => service.foo.bar
				const pathName = directory.split(/[/\\]/).slice(-1) + '.' + properties.join('.');
				// get exports from the file
				const exports = getExports(fullpath, this.options, pathName);

				// ignore exports when it's null or false returned by filter function
				if (exports == null || (filter && filter(exports) === false)) continue;

				// set properties of class
				if (is.class(exports)) {
					exports.prototype.pathName = pathName;
					exports.prototype.fullPath = fullpath;
				}

				items.push({
					fullpath,
					properties,
					exports
				});
			}
		}
		return items;
	}
}

// convert file path to an array of properties
// a/b/c.js => ['a', 'b', 'c']
function getProperties(filepath, { caseStyle }) {
	// if caseStyle is function, return the result of function
	if (is.function(caseStyle)) {
		const result = caseStyle(filepath);
		assert(is.array(result), `caseStyle expect an array, but got ${result}`);
		return result;
	}
	// use default camelize
	return defaultCamelize(filepath, caseStyle);
}

function defaultCamelize(filepath, caseStyle) {
	const properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
	return properties.map(property => {
		if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
			throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
		}

		// use default camelize, will capitalize the first letter
		// foo_bar.js > FooBar
		// fooBar.js  > FooBar
		// FooBar.js  > FooBar
		// FooBar.js  > FooBar
		// FooBar.js  > fooBar (if lowercaseFirst is true)
		property = property.replace(/[_-][a-z]/gi, s => s.substring(1).toUpperCase());
		let first = property[0];
		switch (caseStyle) {
			case 'lower':
				first = first.toLowerCase();
				break;
			case 'upper':
				first = first.toUpperCase();
				break;
			case 'camel':
			default:
		}
		return first + property.substring(1);
	});
}

// Get exports from filepath
// If exports is null/undefined, it will be ignored
function getExports(fullpath, { initializer, call, inject }, pathName) {
	let exports = utils.loadFile(fullpath);
	// process exports as you like
	if (initializer) {
		exports = initializer(exports, {
			path: fullpath,
			pathName
		});
	}

	// return exports when it's a class or generator
	//
	// module.exports = class Service {};
	// or
	// module.exports = function*() {}
	if (is.class(exports) || is.generatorFunction(exports) || is.asyncFunction(exports)) {
		return exports;
	}

	// return exports after call when it's a function
	//
	// module.exports = function(app) {
	//   return {};
	// }
	if (call && is.function(exports)) {
		exports = exports(inject);
		if (exports != null) {
			return exports;
		}
	}

	// return exports what is
	return exports;
}

module.exports = FileLoader;
module.exports.EXPORTS = EXPORTS;
module.exports.FULLPATH = FULLPATH;
