const is = require('is-type-of');
const path = require('path');
const LOAD_BOOT_HOOK = Symbol('Loader#loadBootHook');

module.exports = {
	loadCustomApp() {
		this[LOAD_BOOT_HOOK]('app');
		this.lifecycle.triggerConfigWillLoad();
	},

	[LOAD_BOOT_HOOK](fileName) {
		for (const unit of this.getLoadUnits()) {
			const bootFilePath = this.resolveModule(path.join(unit.path));
			if (!bootFilePath) {
				continue;
			}
			const bootHook = this.requireFile(bootFilePath);
			this.lifecycle.addFunctionAsBootHook(bootHook, unit.name);
		}
		this.lifecycle.init();
	}
};
