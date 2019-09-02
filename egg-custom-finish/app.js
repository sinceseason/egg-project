const { AppCore } = require('./core');
const app = new AppCore();

let loader = app.loader;

loader.loadConfig();
loader.loadPlugin();
loader.loadCustomApp();
loader.loadService();
loader.loadController();
loader.loadMiddleware();
loader.loadRouter();

app.ready(() => {
	app.listen(app.config.port);
	app.logger('application').debug('server is start,port', app.config.port);
});
