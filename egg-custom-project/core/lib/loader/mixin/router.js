const path = require('path');

module.exports = {
	loadRouter() {
		// 加载 router.js
		this.loadFile(path.join(this.options.baseDir, 'app/router'));
	}
};
