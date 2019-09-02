const moment = require('moment');
const uuidv1 = require('uuid/v1');

module.exports = (app, model) => {
	const { BIGINT, STRING, INTEGER, Op } = app.Sequelize;

	const QuestionStore = app.platformAuditReadWrite.define(
		'questionStore',
		{
			id: {
				type: BIGINT(11),
				primaryKey: true,
				allowNull: true,
				defaultValue: function() {
					return Number(Date.now() + '' + parseInt(Math.random() * 1000));
				}
			},
			iconPath: {
				type: STRING
			},
			name: {
				type: STRING
			},
			parentId: {
				type: BIGINT(11)
			}
		},
		{
			timestamps: false,
			tableName: 'questionStore'
		}
	);
	QuestionStore.save = async function(item) {
		return this.create(item);
	};
	QuestionStore.queryList = async function(filter) {
		if (!filter.parentId) {
			filter.parentId = {
				[Op.eq]: null
			};
		}
		return this.findAll({
			where: filter
		});
	};
	return QuestionStore;
};
