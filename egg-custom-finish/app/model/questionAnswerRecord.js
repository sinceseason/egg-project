const moment = require('moment');
const uuidv1 = require('uuid/v1');

module.exports = (app, model) => {
	const { BIGINT, STRING, INTEGER, DATE, BOOLEAN } = app.Sequelize;

	const QuestionAnswerRecord = app.platformAuditReadWrite.define(
		'questionAnswerRecord',
		{
			id: {
				type: BIGINT(11),
				primaryKey: true,
				allowNull: true,
				defaultValue: function() {
					return Number(Date.now() + '' + parseInt(Math.random() * 1000));
				}
			},
			userId: {
				type: BIGINT(11)
			},
			questionId: {
				type: BIGINT(11)
			},
			options: {
				type: STRING
			},
			note: {
				type: STRING
			},
			isCorrect: {
				type: BOOLEAN
			},
			createTime: {
				type: DATE(6),
				defaultValue: function() {
					return new Date();
				},
				get() {
					return moment(this.getDataValue('punchTime')).format('YYYY-MM-DD HH:mm:ss');
				}
			}
		},
		{
			timestamps: false,
			tableName: 'questionAnswerRecord'
		}
	);
	QuestionAnswerRecord.save = async function(filter) {
		return this.create(filter);
	};
	QuestionAnswerRecord.queryItem = async function(filter) {
		return this.findOne({
			where: filter
		});
	};
	QuestionAnswerRecord.queryList = async function(filter, options) {
		let offset;
		let limit;
		if (options.pageSize && options.page) {
			offset = options.pageSize * (options.page - 1);
			limit = options.pageSize;
		}
		return this.findAll({
			where: filter,
			offset,
			limit,
			include: {
				model: app.platformAuditReadWrite.Question
			}
		});
	};
	/**
	 * SELECT
	 *   count(`questionAnswerRecord`.`id`) AS `questionCount`,
	 *   questionAnswerRecord.*,
	 *   quesion.*
	 * FROM
	 *   `questionAnswerRecord` AS `questionAnswerRecord`
	 * LEFT OUTER JOIN `question` AS `quesion` ON `questionAnswerRecord`.`questionId` = `quesion`.`id`
	 * WHERE
	 *   `questionAnswerRecord`.`isCorrect` = FALSE
	 * GROUP BY
	 *   `questionId`
	 * ORDER BY
	 *   count(`questionAnswerRecord`.`id`) DESC
	 * LIMIT 10;
	 */
	QuestionAnswerRecord.queryHightErrorRateList = async function(filter, options) {
		return this.findAll({
			group: 'questionId',
			where: filter,
			limit: 10,
			order: [[app.platformAuditReadWrite.fn('count', app.platformAuditReadWrite.col('questionAnswerRecord.id')), 'DESC']],
			attributes: {
				include: [[app.platformAuditReadWrite.fn('count', app.platformAuditReadWrite.col('questionAnswerRecord.id')), 'questionCount']]
			},
			include: {
				model: app.platformAuditReadWrite.Question
			}
		});
	};
	QuestionAnswerRecord.countAll = async function(filter, options) {
		return this.count({
			where: filter
		});
	};
	QuestionAnswerRecord.updateItem = async function(item, options = {}) {
		return this.update(item, options);
	};
	QuestionAnswerRecord.queryItemById = async function(id) {
		return this.findOne({
			where: { id }
		});
	};

	QuestionAnswerRecord.associate = function() {
		app.platformAuditReadWrite.QuestionAnswerRecord.belongsTo(app.platformAuditReadWrite.Question, { foreignKey: 'questionId' });
	};
	return QuestionAnswerRecord;
};
