const assert = require('assert');
const path = require('path');
const mongoose = require('mongoose');

module.exports = app => {
	app.beforeStart(async () => {
		app.mongoose = mongoose;
		await createConnection(app.config.mongoose);
		loadModelToApp(app);
	}, 'mongoose-plugin');
};

function createConnection(config) {
	return new Promise((resolve, reject) => {
		mongoose.connect(config.uri, {
			useNewUrlParser: true,
			user: config.user,
			pass: config.pass,
			dbName: config.dbName
		});
		let client = mongoose.connection;
		client.on('error', err => {
			reject(err);
		});
		client.on('open', err => {
			console.log('mongo is connecting ...');
			resolve(true);
		});
	});
}

function loadModelToApp(app) {
	const modelDir = path.join(app.baseDir, 'app/model');
	app.loader.loadToApp(modelDir, 'model', {
		inject: app,
		caseStyle: 'upper'
	});
}
