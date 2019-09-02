const { Service } = require('../../core');
const axios = require('axios');
const qs = require('qs');
const { text } = require('../constant');

class HttpService extends Service {
	request(options = {}) {
		const { app, ctx } = this;
		let method = options.method ? options.method.toLowerCase() : 'get';
		let config = {
			baseURL: options.baseUrl || app.config.api.cfniuApi,
			method,
			timeout: 1000 * 30,
			headers: {
				Cookie: ctx.headers['cookie'] || '',
				Host: ctx.headers['host'] || ctx.headers['Host'] || '',
				token: ctx.headers['token'] || '',
				'X-Requested-With': 'XMLHttpRequest'
			},
			responseType: !options.responseType ? 'json' : 'stream'
		};
		let instance = axios.create(config);
		instance.interceptors.request.use(function(config) {
			if (!config.headers['Content-Type']) {
				config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			}
			if (config.method == 'get') {
				config.params = config.data || ctx.query;
				config.data = null;
			} else {
				config.data || ctx.request.body;
				if (config.headers['Content-Type'] == 'application/x-www-form-urlencoded') {
					config.data = qs.stringify(config.data || ctx.request.body);
				}
			}
			return config;
		});
		instance.interceptors.response.use(
			function(response) {
				return new Promise((resolve, reject) => {
					try {
						if (instance.defaults.responseType == 'stream') {
							resolve(response);
							return;
						}
						if (response.status == 200) {
							// 业务逻辑
							let data = response.data;
							if (data.success || data.status == 'true') {
								data.success = !data.success ? true : data.success;
								data.status = data.status ? data.status : 'true';
								resolve(data);
							} else {
								reject(new Error(data.resultMsg || ''));
							}
						} else {
							reject(new Error(text.ERROR.SERVER));
						}
					} catch (err) {
						reject(new Error(text.ERROR.SERVER));
					}
				});
			},
			function(err) {
				throw err;
			}
		);
		return instance.request(options);
	}
}
module.exports = HttpService;
