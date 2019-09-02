const { Controller } = require('../../core');
const { text } = require('../constant');

/**
 * @class QuestionController
 *
 * 打卡模块
 */
class QuestionController extends Controller {
	/**
	 * 获取试卷
	 *
	 * @param {Object} ctx.query
	 * @param {boolean} ctx.query.random 随机
	 * @param {boolean} ctx.query.limit 条数
	 * @param {number} ctx.query.storeId 题库 ID
	 * @param {number} ctx.query.model 试题模式
	 * @param {number} ctx.query.level 试题难度
	 */
	async examine() {
		try {
			const { app, ctx, service } = this;
			// let type = ctx.query.type || 0;
			let model = ctx.query.model || 0;
			let level = ctx.query.level || 0;
			let limit = ctx.query.limit;
			if (!limit) {
				limit = model === 0 ? 100 : 10;
			}
			let random = ctx.query.random ? ctx.query.random : false;
			let storeId = ctx.query.storeId;
			let questions = await service.question.queryQuestionList({ level, storeId, limit, random });
			let correctOptions = [];
			for (let item of questions) {
				correctOptions.push(item.correctOptions);
			}
			correctOptions = correctOptions.toString();
			let examination = await service.question.addExaminePaper({
				userId: ctx.state.platformUser.id,
				correctOptions,
				model
			});
			examination = service.util.toJSON(examination);
			examination.questions = service.util.toJSON(questions);
			ctx.body = service.util.responseWrap(examination);
		} catch (err) {
			throw err;
		}
	}
	/**
	 * 提交试卷
	 *
	 * @param {number} ctx.params.id 试题 ID
	 * @param {Object} ctx.request.body
	 * @param {string} ctx.request.body.options 选项
	 */
	async checkExamine() {
		try {
			const { app, ctx, service } = this;
			let request = ctx.request.body;
			let id = ctx.params.id;
			if (!id) {
				throw new Error(text.ERROR.QUESTION_EXAMINE_PAPER_ID);
			}
			if (!request.options) {
				throw new Error(text.ERROR.QUESTION_EXAMINE_PAPER_OPTIONS);
			}
			let paper = await service.question.queryExaminePaper(id);
			if (!paper) {
				throw new Error(text.ERROR.QUESTION_EXAMINE_PAPER_ID);
			}
			// 核对选项
			let correctOptions = paper.correctOptions ? paper.correctOptions.split(',') : [];
			let options = request.options ? request.options.split(',') : [];
			let correctCount = 0;
			for (let i = 0; i < correctOptions.length; i++) {
				if (correctOptions[i] == options[i]) {
					correctCount++;
				}
			}
			let correctRate = Math.round((correctCount / options.length) * 100);
			// 添加打卡记录
			if (paper.model == 1) {
				await service.punch.savePunchRecord({ userId: ctx.state.platformUser.id, isFinish: options.length < correctOptions.length, correctRate });
			}
			await service.question.updateExaminePaper({
				userId: ctx.state.platformUser.id,
				id: paper.id,
				options: options.toString(),
				correctRate
			});
			let answerCount = options.lenth >= correctOptions.length ? correctOptions.length : options.length;
			ctx.body = service.util.responseWrap({ questionExamine: service.util.toJSON(paper) }, { correctCount }, { answerCount });
		} catch (err) {
			throw err;
		}
	}
	/**
	 * 校验每题
	 *
	 * @param {number} ctx.params.id 问题记录 ID
	 * @param {string} ctx.request.body.options 选项
	 */
	async check() {
		try {
			const { app, ctx, service } = this;
			let id = ctx.params.id;
			let options = ctx.request.body.options;
			if (!id) {
				throw new Error(text.ERROR.QUESTION_ID);
			} else if (!options) {
				throw new Error(text.ERROR.QUESTION_OPTION);
			}
			let data = await service.question.checkQuestionAnswer({ id, options });
			if (!data) {
				throw new Error(text.ERROR.QUESTION_CHECK_INCORRECT);
			}
			ctx.body = service.util.responseWrap();
		} catch (err) {
			throw err;
		}
	}

	/**
	 * 添加笔记
	 *
	 * @param {number} ctx.params.id 问题记录 ID
	 * @param {string} ctx.request.body.note 笔记
	 *
	 **/
	async note() {
		try {
			const { app, ctx, service } = this;
			let id = ctx.params.id;
			let note = ctx.request.body.note;
			if (!id) {
				throw new Error(text.ERROR.QUESTION_ANSWER_RECORD_ID);
			}
			if (!note) {
				throw new Error(text.ERROR.QUESTION_NOTE);
			}
			let data = await service.question.addNote({
				id,
				note
			});
			ctx.body = service.util.responseWrap();
		} catch (err) {
			throw err;
		}
	}
	/**
	 * 当前用户答题记录
	 *
	 * @param {boolean} ctx.query.page
	 * @param {boolean} ctx.query.pageSize
	 *
	 **/
	async answerRecord() {
		try {
			const { app, ctx, service } = this;
			let page = ctx.query.page || 1;
			let pageSize = ctx.query.pageSize || 10;
			let data = await service.question.queryAnswerRecords({
				isCorrect: false,
				userId: ctx.state.platformUser.id,
				page,
				pageSize
			});
			ctx.body = service.util.responseWrap(data);
		} catch (err) {
			throw err;
		}
	}

	/**
	 * 全站高错误率答题记录
	 */
	async highErrorRateAnswerRecord() {
		try {
			const { app, ctx, service } = this;
			let data = await service.question.queryHightErrorRateAnswerRecords({
				isCorrect: false
			});
			ctx.body = service.util.responseWrap(data);
		} catch (err) {
			throw err;
		}
	}
}
module.exports = QuestionController;
