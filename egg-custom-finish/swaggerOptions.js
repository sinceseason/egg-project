module.exports = {
	info: {
		title: 'platform audit swagger',
		version: '1.0.0',
		description: 'API'
	},
	schemes: ['http'],
	consumes: ['application/x-www-form-urlencoded'],
	produces: ['application/json'],
	apis: ['./swagger/*.js'],
	basePath: '/sapi'
};
