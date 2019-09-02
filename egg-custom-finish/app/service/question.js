const { Service } = require('../../core');
const { text } = require('../constant');
/**
 * @class PunchService
 */
class PunchService extends Service {
	/**
	 * 查询题目列表
	 *
	 * @param {Object} data
	 * @param {boolean} data.random 随机
	 * @param {boolean} data.limit 条数
	 * @param {number} data.type 类型
	 * @param {number} data.level 难度
	 * @param {number} data.storeId 题库 ID
	 *
	 * @returns User
	 */
	queryQuestionList(data = {}) {
		const { app, ctx, service } = this;
		let storeId = data.storeId;
		let level = data.level;
		return ctx.platformAuditReadWrite.Question.queryList({ level, storeId }, { order: data.random, limit: data.limit });
	}
	/**
	 * 添加试卷
	 *
	 * @param {Object} data
	 * @param {number} data.userId 用户 ID
	 * @param {string} data.correctOptions 参考答案
	 * @param {number} data.model 试题类型
	 *
	 * @returns User
	 */
	addExaminePaper(data) {
		const { app, ctx, service } = this;
		return ctx.platformAuditReadWrite.QuestionExaminePaper.save(data);
	}
	/**
	 * 查询试卷
	 *
	 * @param {number} id 试题 ID
	 *
	 * @returns QuestionExaminePaper
	 */
	queryExaminePaper(id) {
		const { app, ctx, service } = this;
		return ctx.platformAuditReadWrite.QuestionExaminePaper.queryItemById(id);
	}
	/**
	 * 更新试卷
	 *
	 * @param {Object} data
	 * @param {number} data.id 试题 ID
	 * @param {number} data.userId 用户 ID
	 * @param {number} data.correctRate 正确选项
	 * @param {string} data.options 提交答案
	 *
	 * @returns QuestionExaminePaper
	 */
	updateExaminePaper(data) {
		const { app, ctx, service } = this;
		return ctx.platformAuditReadWrite.QuestionExaminePaper.updateItem(
			{
				correctRate: data.correctRate,
				options: data.options
			},
			{
				where: {
					id: data.id,
					userId: data.userId
				}
			}
		);
	}
	/**
	 * 核对答案
	 *
	 * @param {Object} data
	 * @param {number} data.id 试题 ID
	 * @param {string} data.options 提交答案
	 *
	 * @returns QuestionExaminePaper
	 */
	async checkQuestionAnswer(data = {}) {
		const { app, ctx, service } = this;
		let question = await ctx.platformAuditReadWrite.Question.queryItemById(data.id);
		if (!question) {
			throw new Error(text.ERROR.QUESTION_ID);
		}
		let isCorrect = data.options == question.correctOptions;
		let questionAnswerRecord = await ctx.platformAuditReadWrite.QuestionAnswerRecord.queryItem({
			userId: ctx.state.platformUser.id,
			questionId: question.id
		});
		if (questionAnswerRecord) {
			questionAnswerRecord = await ctx.platformAuditReadWrite.QuestionAnswerRecord.updateItem(
				{
					options: data.options,
					isCorrect,
					createTime: new Date()
				},
				{
					where: {
						userId: ctx.state.platformUser.id,
						questionId: question.id
					}
				}
			);
		} else {
			questionAnswerRecord = await ctx.platformAuditReadWrite.QuestionAnswerRecord.save({
				userId: ctx.state.platformUser.id,
				questionId: question.id,
				options: data.options,
				isCorrect
			});
		}

		return isCorrect;
	}
	/**
	 * 添加笔记
	 *
	 * @param {Object} data
	 * @param {number} data.id 试题 ID
	 * @param {string} data.option 提交答案
	 *
	 * @returns QuestionExaminePaper
	 */
	async addNote(data = {}) {
		const { app, ctx, service } = this;
		let questionAnswerRecord = await ctx.platformAuditReadWrite.QuestionAnswerRecord.queryItemById(data.id);
		if (!questionAnswerRecord) {
			throw new Error(text.ERROR.QUESTION_ANSWER_RECORD_ID);
		} else {
			return ctx.platformAuditReadWrite.QuestionAnswerRecord.updateItem(
				{
					note: data.note
				},
				{
					where: {
						id: data.id
					}
				}
			);
		}
	}
	/**
	 * 添加分类
	 *
	 * @param {Object} data
	 * @param {number} data.id 试题 ID
	 * @param {string} data.option 提交答案
	 *
	 * @returns QuestionStore
	 */
	addQuestionStore(data) {
		const { app, ctx, service } = this;
		return ctx.platformAuditReadWrite.QuestionStore.save({
			parentId: data.parentId,
			name: data.name
		});
	}
	/**
	 * 查询分类
	 *
	 * @param {number} parentId 试题 ID
	 *
	 * @returns QuestionStore
	 */
	queryQuestionStoreByParentId(parentId) {
		const { app, ctx, service } = this;
		return ctx.platformAuditReadWrite.QuestionStore.queryList({ parentId });
	}
	/**
	 * 查询答题记录
	 *
	 * @param {number} data.userId 类型
	 * @param {number} data.page 类型
	 * @param {number} data.pageSize 类型
	 *
	 * @returns QuestionStore
	 */
	async queryAnswerRecords(data) {
		const { app, ctx, service } = this;
		let list = await ctx.platformAuditReadWrite.QuestionAnswerRecord.queryList(
			{ isCorrect: data.isCorrect, userId: data.userId },
			{
				page: data.page,
				pageSize: data.pageSize
			}
		);
		let totalCount = await ctx.platformAuditReadWrite.QuestionAnswerRecord.countAll({ isCorrect: data.isCorrect, userId: data.userId });
		return {
			list,
			totalCount
		};
	}
	/**
	 * 查询答题记录
	 *
	 * @returns QuestionStore
	 */
	async queryHightErrorRateAnswerRecords(data) {
		const { app, ctx, service } = this;
		let list = await ctx.platformAuditReadWrite.QuestionAnswerRecord.queryHightErrorRateList({ isCorrect: false });
		return list;
	}
}
module.exports = PunchService;
