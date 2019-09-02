const jwt = require('jsonwebtoken');
const pathToRegexp = require('path-to-regexp');

module.exports = app => {
	return async function jwtParser(ctx, next) {
		const token = ctx.cookies.get('token');
		try {
			ctx.state.jwtDecode = jwt.verify(token, app.config.jwt.privateKey, {
				algorithm: app.config.jwt.algorithm,
				expiresIn: app.config.jwt.expiresIn
			});
		} catch (err) {
			throw new Error('访问受限，请先登录');
		}
		await next();
	};
};
