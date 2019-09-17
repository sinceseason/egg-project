const path = require('path');
const loadFile = require('../../utils').loadFile;

module.exports = {
	loadPlugin() {
		const appPlugins = this.readPluginConfigs(path.join(this.options.baseDir, 'config/plugin.default'));
        this.logger.debug('Loaded app plugins: %j', Object.keys(appPlugins));
        
        const enablePlugins = {};
        for (const name in appPlugins) {
            let plugin = appPlugins[name];
            if (plugin.enable) {
                plugin.path = path.join(this.options.baseDir, 'core/lib/plugin', plugin.package);
                enablePlugins[plugin.name] = plugin;
            }
        }
        this.plugins = enablePlugins;
	},

	readPluginConfigs(pluginPaths) {
		if (!Array.isArray(pluginPaths)) {
			pluginPaths = [ pluginPaths ];
		}

		const newConfigPaths = [];
		for (const filename of this.getTypeFiles('plugin')) {
			for (let configPath of pluginPaths) {
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
			if (plugin.path || plugin.package) {
				delete targetPlugin.path;
				delete targetPlugin.package;
			}
			for (const prop in plugin) {
				if (plugin[prop] === undefined) {
					continue;
				}
				if (targetPlugin[prop] && Array.isArray(plugin[prop]) && !plugin[prop].length) {
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
