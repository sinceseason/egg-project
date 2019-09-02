const { Service } = require('../../core');

/**
 * @class UserService
 */
class UserService extends Service {
	/**
	 * 抓取用户
	 *
	 * @description 向主营业务平台获取用户
	 */
	fetchUser() {
		const { app, ctx, service } = this;
		return service.http.request({
			url: '/user/getbalance'
		});
	}
	/**
	 * 查询用户
	 *
	 * @param {Object} data
	 * @param {number} data.uid 平台用户 Id
	 * @param {string} data.platform 平台信息（cfniu、niu100...）
	 *
	 * @returns User
	 */
	queryUser(data) {
		const { app, ctx, service } = this;
		return ctx.platformAuditReadWrite.User.findUserByUidAndPlatform({
			uid: data.uid,
			platform: data.platform
		});
	}
	/**
	 * 查询用户
	 *
	 * @param {Object} user
	 *
	 * @returns User
	 */
	saveUser(user) {
		const { app, ctx, service } = this;
		return ctx.platformAuditReadWrite.User.create(user);
	}
}
module.exports = UserService;
