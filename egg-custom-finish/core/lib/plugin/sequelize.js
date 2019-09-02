const path = require('path');
const Sequelize = require('sequelize');
module.exports = app => {
	const config = app.config.mysql;
	app.Sequelize = Sequelize;
	const databases = [];
	if (!config.datasources) {
		databases.push(loadDatabase(config));
	} else {
		config.datasources.forEach(datasource => {
			databases.push(loadDatabase(datasource));
		});
	}
	app.beforeStart(async () => {
		await Promise.all(databases.map(database => authenticate(database)));
	}, 'mysql check');
	function loadDatabase(config = {}) {
		const sequelize = new app.Sequelize(config.database, config.username, config.password, config);

		const delegate = config.delegate; //.split('.');
		// const len = delegate.length;

		// let model = app;
		let context = app.context;
		// for (let i = 0; i < len - 1; i++) {
		//   model = model[delegate[i]] = model[delegate[i]] || {};
		//   context = context[delegate[i]] = context[delegate[i]] || {};
		// }
		// model = model[delegate] = model[delegate] || {};

		let model = {};
		context = context[delegate] = context[delegate] || {};

		Object.defineProperty(model, delegate, {
			value: sequelize,
			writable: true,
			configurable: true
		});
		app[delegate] = model[delegate];
		const DELEGATE = Symbol(`context#sequelize_${config.delegate}`);
		Object.defineProperty(app.context, delegate, {
			get() {
				// context.model is different with app.model
				// so we can change the properties of ctx.model.xxx
				if (!this[DELEGATE]) {
					this[DELEGATE] = Object.create(model[delegate]);
					this[DELEGATE].ctx = this;
				}
				return this[DELEGATE];
			},
			configurable: true
		});

		const modelDir = path.join(app.baseDir, 'app/model');

		const models = [];
		const target = Symbol(config.delegate);
		app.loader.loadToApp(modelDir, target, {
			caseStyle: 'upper',
			ignore: config.exclude,
			filter(model) {
				if (!model || !model.sequelize) return false;
				models.push(model);
				return true;
			},
			initializer(factory) {
				if (typeof factory === 'function') {
					return factory(app, sequelize);
				}
			}
		});

		Object.assign(model[delegate], app[target]);
		models.forEach(model => {
			typeof model.associate === 'function' && model.associate();
		});

		return model[delegate];
	}

	async function authenticate(database) {
		await database.authenticate();
	}
};
