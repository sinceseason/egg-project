const { Controller } = require('../../core');
const { text } = require('../constant');

/**
 * @class UserController
 *
 * 用户模块
 */
class UserController extends Controller {
	/**
	 * 获取用户信息
	 */
	async index() {
		try {
			const { app, ctx, service } = this;
			ctx.body = await service.util.responseWrap(ctx.state.platformUser);
		} catch (err) {
			throw err;
		}
	}
}
module.exports = UserController;
