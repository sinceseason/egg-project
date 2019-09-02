const { Controller } = require('../../core');
const { text } = require('../constant');

/**
 * 题库
 */
class QuestionStoreController extends Controller {
	/**
	 * 添加题目分类
	 *
	 * @param {object} ctx.request.body
	 * @param {string} ctx.request.body.name 名称
	 * @param {number} ctx.request.body.parentId 父级 ID
	 *
	 **/
	async create() {
		try {
			const { app, ctx, service } = this;
			let name = ctx.request.body.name;
			if (!name) {
				throw new Error(text.ERROR.QUESTION_STORE_NAME);
			}
			let parentId = ctx.request.body.parentId;
			let data = await service.question.addQuestionStore({ name: name, parentId });

			ctx.body = service.util.responseWrap(data);
		} catch (err) {
			throw err;
		}
	}
	/**
	 * 查询题目分类
	 *
	 * @param {number} ctx.request.query.parentId 父级 ID
	 */
	async index() {
		try {
			const { app, ctx, service } = this;
			let parentId = ctx.query.parentId;
			let data = await service.question.queryQuestionStoreByParentId(parentId);

			ctx.body = service.util.responseWrap(data);
		} catch (err) {
			throw err;
		}
	}
}
module.exports = QuestionStoreController;
