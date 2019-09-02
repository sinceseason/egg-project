const moment = require('moment');
const uuidv1 = require('uuid/v1');

module.exports = (app, model) => {
	const { BIGINT, STRING, INTEGER, DATE } = app.Sequelize;

	const QuestionExaminePaper = app.platformAuditReadWrite.define(
		'questionExaminePaper',
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
			correctOptions: {
				type: STRING
			},
			options: {
				type: STRING
			},
			correctRate: {
				type: INTEGER
			},
			model: {
				type: INTEGER
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
			tableName: 'questionExaminePaper'
		}
	);
	QuestionExaminePaper.save = async function(item) {
		return this.create(item);
	};
	QuestionExaminePaper.queryItemById = async function(id) {
		return this.findOne({
			where: { id }
		});
	};
	QuestionExaminePaper.updateItem = async function(item, options = {}) {
		return this.update(item, options);
	};
	return QuestionExaminePaper;
};
