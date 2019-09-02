module.exports = {
	port: 4000,
	api: {
		cfniuApi: 'http://bg.cfniu.com.cn'
	},
	platform: 'cfniu',
	middleware: ['onerror', 'bodyParser'],
	mysql: {
		datasources: [
			{
				delegate: 'platformAuditReadWrite',
				database: 'platform_audit',
				username: 'root',
				password: 'root',
				host: '192.168.1.60',
				port: '3306',
				dialect: 'mysql',
				logging: data => {
					console.log(`sql`, data);
				},
				timezone: '+08:00'
			}
		]
	}
};
