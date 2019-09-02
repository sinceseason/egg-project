const moment = require('moment');
const uuidv1 = require('uuid/v1');

module.exports = (app, model) => {
	const { BIGINT, STRING, INTEGER } = app.Sequelize;

	const Question = app.platformAuditReadWrite.define(
		'quesion',
		{
			id: {
				type: BIGINT(11),
				primaryKey: true,
				allowNull: true,
				defaultValue: function() {
					return Number(Date.now() + '' + parseInt(Math.random() * 1000));
				}
			},
			content: {
				type: STRING
			},
			options: {
				type: STRING
			},
			correctOptions: {
				type: STRING
			},
			level: {
				type: INTEGER
			},
			type: {
				type: INTEGER
			},
			storeId: {
				type: BIGINT(11)
			},
			analysis: {
				type: STRING
			}
		},
		{
			timestamps: false,
			tableName: 'question'
		}
	);
	Question.queryList = async function(filter = {}, options = {}) {
		if (!filter.storeId) {
			delete filter.storeId;
		}
		return this.findAll({
			where: filter,
			order: options.random ? [app.platformAuditReadWrite.random()] : ['id'],
			limit: options.limit || 10
		});
	};

	Question.queryItemById = async function(id) {
		return this.findOne({ where: { id } });
	};
	return Question;
};
