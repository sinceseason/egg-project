const { Service } = require('../../core');

class RedisService extends Service {
	async set(key, val, options) {
		const { app } = this;
		return await app.redis.set(key, val, options.type, options.expire);
	}
	async get(key) {
		const { app } = this;
		return new Promise((resolve, reject) => {
			app.redis.get(key, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}
	async del(key) {
		const { app } = this;
		return new Promise((resolve, reject) => {
			app.redis.del(key, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}
	async isExist(key) {
		const { app } = this;
		return app.redis.get(key);
	}
}
module.exports = RedisService;
