const moment = require('moment');
const uuidv1 = require('uuid/v1');

module.exports = (app, model) => {
	const { BIGINT, STRING, INTEGER, DATE } = app.Sequelize;

	const User = app.platformAuditReadWrite.define(
		'user',
		{
			id: {
				type: BIGINT(11),
				primaryKey: true,
				allowNull: true,
				defaultValue: Date.now()
			},
			uid: {
				type: BIGINT(11)
			},
			platform: {
				type: STRING,
				defaultValue: app.config.platform
			},
			telephone: {
				type: STRING
			},
			realName: {
				type: STRING
			},
			level: {
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
			tableName: 'user'
		}
	);
	User.findUserByUidAndPlatform = async function(user) {
		return await this.findOne({
			where: {
				uid: user.uid,
				platform: user.platform
			}
		});
	};

	return User;
};
