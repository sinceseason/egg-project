const is = require('is-type-of');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
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
	constructor(options) {
		assert(options.logger, 'options.logger is required');
		this.options = Object.assign({}, defaults, options);
		this.logger = this.options.logger;
	}

	/**
     * attach items to target object. Mapping the directory to properties.
     * `app/controller/group/repository.js` => `target.group.repository`
     * @return {Object} target
     */
	load() {
		const items = this.parse();
		const target = this.options.target;
		for (const item of items) {
			this.logger.debug('loading item %j', item);
			// item { properties: [ 'a', 'b', 'c'], exports }
			// => target.a.b.c = exports
			item.properties.reduce((target, property, index) => {
				let obj;
				const properties = item.properties.slice(0, index + 1).join('.');
				if (index === item.properties.length - 1) {
					if (property in target) {
						if (!this.options.override)
							throw new Error(
								`can't overwrite property '${properties}' from ${target[property][
									FULLPATH
								]} by ${item.fullpath}`
							);
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
				this.logger.debug('loaded %s', properties);
				return obj;
			}, target);
		}
		return target;
	}

	parse() {
		let files = this.options.match;
		if (!files) {
			files = [ '**/*.js' ];
		} else {
			files = Array.isArray(files) ? files : [ files ];
		}
		let ignore = this.options.ignore;
		if (ignore) {
			ignore = Array.isArray(ignore) ? ignore : [ ignore ];
			ignore = ignore.filter((f) => !!f).map((f) => '!' + f);
			files = files.concat(ignore);
		}

		let directories = this.options.directory;
		if (!Array.isArray(directories)) {
			directories = [ directories ];
		}

		const filter = is.function(this.options.filter) ? this.options.filter : null;
		const items = [];
		this.logger.debug('parsing %j', directories);
		for (const directory of directories) {
			const filepaths = globby.sync(files, { cwd: directory });
			for (const filepath of filepaths) {
				const fullpath = path.join(directory, filepath);
				if (!fs.statSync(fullpath).isFile()) continue;
				const properties = getProperties(filepath, this.options);
				const pathName = directory.split(/[/\\]/).slice(-1) + '.' + properties.join('.');
				const exports = getExports(fullpath, this.options, pathName);

				if (exports == null || (filter && filter(exports) === false)) continue;

				if (is.class(exports)) {
					exports.prototype.pathName = pathName;
					exports.prototype.fullPath = fullpath;
				}

				items.push({ fullpath, properties, exports });
				this.logger.debug('parse %s, properties %j, export %j', fullpath, properties, exports);
			}
		}

		return items;
	}
}

function getProperties(filepath, { caseStyle }) {
	if (is.function(caseStyle)) {
		const result = caseStyle(filepath);
		return result;
	}
	return defaultCamelize(filepath, caseStyle);
}

function getExports(fullpath, { initializer, call, inject }, pathName) {
	let exports = utils.loadFile(fullpath);
	if (initializer) {
		exports = initializer(exports, { path: fullpath, pathName });
	}
	if (is.class(exports) || is.generatorFunction(exports) || is.asyncFunction(exports)) {
		return exports;
	}
	if (call && is.function(exports)) {
		exports = exports(inject);
		if (exports != null) {
			return exports;
		}
	}

	return exports;
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
	  property = property.replace(/[_-][a-z]/ig, s => s.substring(1).toUpperCase());
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

module.exports = FileLoader;
module.exports.EXPORTS = EXPORTS;
module.exports.FULLPATH = FULLPATH;
