const { text } = require('../constant');

module.exports = app => {
	return async function checkLogin(ctx, next) {
		try {
			let { service } = ctx;
			let user = await service.user.fetchUser();
			if (user) {
				let platformUser = await service.user.queryUser({ platform: app.config.platform, uid: user.member.id });
				if (!platformUser) {
					platformUser = await service.user.saveUser({
						uid: user.member.id,
						realName: user.member.realName,
						telephone: user.member.telephone,
						level: user.member.level,
						platform: app.config.platform
					});
				}
				// 全局使用
				ctx.state.platformUser = platformUser;
			} else {
				throw new Error(text.ERROR.NO_LOGIN);
			}
		} catch (err) {
			throw err;
		}
		await next();
	};
};
