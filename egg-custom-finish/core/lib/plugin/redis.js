const redis = require('redis');

module.exports = app => {
	app.beforeStart(async () => {
		app.redis = await createConnection(app.config.redis);
	}, 'redis-plugin');
};

function createConnection(config) {
	return new Promise((resolve, reject) => {
		let client = redis.createClient(config);
		client.on('error', err => {
			reject(err);
		});
		client.on('connect', err => {
			console.log('redis is connecting ...');
			resolve(client);
		});
	});
}
