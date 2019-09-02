const moment = require('moment');

module.exports = (app, model) => {
	const { BIGINT, INTEGER, STRING, DATE, Op, BOOLEAN } = app.Sequelize;

	const PunchRecord = app.platformAuditReadWrite.define(
		'punchRecord',
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
			correctRate: {
				type: INTEGER,
				defaultValue: 0
			},
			isFinish: {
				type: BOOLEAN,
				defaultValue: false
			},
			punchTime: {
				type: DATE(6),
				defaultValue: function() {
					return new Date();
				},
				get() {
					return moment(this.getDataValue('punchTime')).format('YYYY-MM-DD HH:mm:ss');
				}
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
			tableName: 'punchRecord'
		}
	);
	PunchRecord.save = async function(punchRecord) {
		return this.create(punchRecord);
	};
	PunchRecord.updateItem = async function(item, options = {}) {
		return this.update(item, options);
	};
	PunchRecord.delete = async function(userId) {
		return this.destroy({
			where: { userId }
		});
	};
	PunchRecord.queryList = async function(filter) {
		return this.findAll({
			where: filter,
			order: [['punchTime', 'DESC']]
		});
		// return this.findAll({
		// 	where: {
		// 		punchTime: {
		// 			[Op.between]: [moment(`${prefixTime} 00:00:00`), moment(`${prefixTime} 23:59:59`)]
		// 		}
		// 	}
		// });
	};
	// include: {
	// 	model: app.platformAuditReadWrite.User
	// }
	PunchRecord.associate = function() {
		app.platformAuditReadWrite.PunchRecord.belongsTo(app.platformAuditReadWrite.User, { foreignKey: 'userId' });
	};

	return PunchRecord;
};
