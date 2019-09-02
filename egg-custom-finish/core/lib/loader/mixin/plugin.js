const fs = require('fs');
const path = require('path');
const loadFile = require('../../utils').loadFile;

module.exports = {
	loadPlugin() {
		const appPlugins = this.readPluginConfigs(path.join(this.options.baseDir, 'config/plugin.default'));

		const enablePlugins = {};
		for (const name in appPlugins) {
			let plugin = appPlugins[name];
			if (plugin.enable) {
				let pluginPath = path.join(this.options.baseDir, 'core/lib/plugin', plugin.package);
				// let fn = loadFile(pluginPath);
				// fn(this.app);
				plugin.path = pluginPath;
				enablePlugins[plugin.name] = plugin;
			}
		}
		this.plugins = enablePlugins;
	},
	readPluginConfigs(configPaths) {
		if (!Array.isArray(configPaths)) {
			configPaths = [configPaths];
		}

		// Get all plugin configurations
		// plugin.default.js
		// plugin.${scope}.js
		// plugin.${env}.js
		// plugin.${scope}_${env}.js
		const newConfigPaths = [];
		for (const filename of this.getTypeFiles('plugin')) {
			for (let configPath of configPaths) {
				configPath = path.join(path.dirname(configPath), filename);
				newConfigPaths.push(configPath);
			}
		}

		const plugins = {};
		for (const configPath of newConfigPaths) {
			let filepath = this.resolveModule(configPath);

			// let plugin.js compatible
			if (configPath.endsWith('plugin.default') && !filepath) {
				filepath = this.resolveModule(configPath.replace(/plugin\.default$/, 'plugin'));
			}

			if (!filepath) {
				continue;
			}

			const config = loadFile(filepath);

			for (const name in config) {
				this.normalizePluginConfig(config, name, filepath);
			}
			this._extendPlugins(plugins, config);
		}

		return plugins;
	},
	normalizePluginConfig(plugins, name, configPath) {
		const plugin = plugins[name];

		// plugin_name: false
		if (typeof plugin === 'boolean') {
			plugins[name] = {
				name,
				enable: plugin,
				dependencies: [],
				optionalDependencies: [],
				env: [],
				from: configPath
			};
			return;
		}

		if (!('enable' in plugin)) {
			plugin.enable = true;
		}
		plugin.name = name;
		plugin.dependencies = plugin.dependencies || [];
		plugin.optionalDependencies = plugin.optionalDependencies || [];
		plugin.env = plugin.env || [];
		plugin.from = configPath;
		depCompatible(plugin);
	},
	_extendPlugins(target, plugins) {
		if (!plugins) {
			return;
		}
		for (const name in plugins) {
			const plugin = plugins[name];
			let targetPlugin = target[name];
			if (!targetPlugin) {
				targetPlugin = target[name] = {};
			}
			for (const prop in plugin) {
				if (plugin[prop] === undefined) {
					continue;
				}
				targetPlugin[prop] = plugin[prop];
			}
		}
	}
};

function depCompatible(plugin) {
	if (plugin.dep && !(Array.isArray(plugin.dependencies) && plugin.dependencies.length)) {
		plugin.dependencies = plugin.dep;
		delete plugin.dep;
	}
}
