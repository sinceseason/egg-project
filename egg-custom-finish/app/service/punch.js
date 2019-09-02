const { Service } = require('../../core');
const { text } = require('../constant');
const moment = require('moment');
/**
 * @class PunchService
 */
class PunchService extends Service {
	/**
	 * 更新打卡记录
	 *
	 * @param {Object} data
	 * @param {number} data.id Id
	 * @param {number} data.userId 用户 Id
	 * @param {number} data.currentRate 正确率
	 *
	 * @returns User
	 */
	async updatePunchRecord(data) {
		const { app, ctx, service } = this;
		return ctx.platformAuditReadWrite.PunchRecord.updateItem(
			{ currentRate: data.currentRate },
			{
				id: data.id,
				userId: data.userId
			}
		);
	}
	/**
	 * 新建打卡记录
	 *
	 * @param {Object} data
	 * @param {number} data.userId 用户 Id
	 * @param {number} data.currentRate 正确率
	 *
	 * @returns User
	 */
	async savePunchRecord(data) {
		const { app, ctx, service } = this;
		let punchRecords = await ctx.platformAuditReadWrite.PunchRecord.queryList({
			userId: data.userId
		});
		if (punchRecords && punchRecords.length > 21) {
			throw new Error(text.ERROR.PUNCH_TIME_FULL);
		}
		let now = moment(Date.now()).format('YYYY-MM-DD');
		if (punchRecords && punchRecords.length > 0 && moment(punchRecords[0].punchTime).format('YYYY-MM-DD') == now) {
			throw new Error(text.ERROR.PUNCH_TODAY_DONE);
		}
		return ctx.platformAuditReadWrite.PunchRecord.save(data);
	}
	/**
	 * 查询打卡记录
	 *
	 * @param {Object} data
	 * @param {number} data.id 用户 Id
	 *
	 * @returns User
	 */
	queryPunchRecordsByUserId(userId) {
		const { app, ctx, service } = this;
		return this.ctx.platformAuditReadWrite.PunchRecord.queryList({
			userId: userId
		});
	}
	/**
	 * 清空打卡记录
	 *
	 * @param {Object} data
	 * @param {number} data.id 用户 Id
	 *
	 * @returns sequelize operator result
	 */
	deletePunchRecordsByUserId(id) {
		const { app, ctx, service } = this;
		return this.ctx.platformAuditReadWrite.PunchRecord.delete(id);
	}
	padPunchTime(list = []) {
		if (list.length >= 21) {
			throw new Error('打卡次数已满');
		}
		const { app, ctx, service } = this;
		let punchList = [];
		let addMaxDay = false;
		if (list.length < 2) {
			return list;
		}
		list.reduce((last, before, index) => {
			let lastDay = _getDay(last.punchTime);
			let lastMonth = _getMonth(last.punchTime);
			let beforeDay = _getDay(before.punchTime);
			let beforeMonth = _getMonth(before.punchTime);
			// 两条记录跨月
			if (lastMonth != beforeMonth) {
				_addPunchTime(last);
				let maxDay = service.util.getMonthTotalDays(before.punchTime);
				// 非相邻日，排除 2019-08-31 09:56:42,2019-09-01 09:56:42
				if (beforeDay != maxDay && lastDay != 1) {
					// 当月 2019-09-01 ~ 2019-09-29
					for (let i = lastDay - 1; i >= 1; i--) {
						_addPunchTime(last, i);
					}
				}
			} else {
				let maxDay = service.util.getMonthTotalDays(before.punchTime);
				if (last != maxDay && !addMaxDay) {
					addMaxDay = true;
					// // 上月 2019-08-20 ~ 2019-08-31
					for (let i = maxDay; i > beforeDay; i--) {
						_addPunchTime(before, i);
					}
				}
				_addPunchTime(last);
				// 非相邻日 2019-08-18 ~ 2019-08-20
				if (lastDay != beforeDay + 1) {
					for (let i = lastDay - 1; i > beforeDay; i--) {
						_addPunchTime(before, i);
					}
				}
			}
			if (index + 1 == list.length) {
				_addPunchTime(before);
			}
			return before;
		});
		return punchList;

		function _getDay(timeStr) {
			return Number(moment(timeStr).format('DD'));
		}
		function _getMonth(timeStr) {
			return Number(moment(timeStr).format('MM'));
		}
		function _addPunchTime(punchRecord, day) {
			if (punchList.length > 21) return;
			if (!day) {
				punchList.push(punchRecord);
			}
			// 2019-08-22 09:54:26 ==> 2019-08 ==> 2019-08-(22+1)
			let prefixTime = moment(punchRecord.punchTime).format('YYYY-MM');
			console.log(`${prefixTime}-${day}`);
			punchList.push({
				// 增加一天
				punchTime: moment(`${prefixTime}-${day}`).format('YYYY-MM-DD HH:mm:ss'),
				currentRate: 0,
				isFinish: false
			});
		}
	}
}
module.exports = PunchService;
