const { Controller } = require('../../core');
const { text } = require('../constant');

/**
 * @class PunchController
 *
 * 打卡模块
 */
class PunchController extends Controller {
	/**
	 * 查询用户打卡记录
	 */
	async records() {
		try {
			const { app, ctx, service } = this;
			let list = await service.punch.queryPunchRecordsByUserId(ctx.state.platformUser.id);
			let data = service.punch.padPunchTime(list);
			ctx.body = service.util.responseWrap(data);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * 清空用户打卡记录
	 */
	async remove() {
		try {
			const { app, ctx, service } = this;
			let data = await service.punch.deletePunchRecordsByUserId(ctx.state.platformUser.id);
			ctx.body = service.util.responseWrap();
		} catch (err) {
			throw err;
		}
	}

	/**
	 * 记录用户打卡
	 */
	async save() {
		try {
			const { app, ctx, service } = this;
			await service.punch.savePunchRecord({ userId: ctx.state.platformUser.id });
			ctx.body = service.util.responseWrap();
		} catch (err) {
			throw err;
		}
	}
}
module.exports = PunchController;
