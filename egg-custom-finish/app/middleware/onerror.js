module.exports = options => {
	return async function notfound(ctx, next) {
		try {
			await next();
		} catch (err) {
			err.message = err.resultMsg || err.message || '服务器异常，请稍后再试';
			ctx.status = 200;
			if (_acceptJSON(ctx)) {
				ctx.body = {
					data: err.message,
					success: false
				};
			} else {
				const serverErrorHtml = '<h1>500 Server Error</h1>';
				ctx.body = `${serverErrorHtml}<p><pre><code>${err.message}</code></pre><p>${err.stack}</p></p>`;
			}
			return;
		}

		function _acceptJSON(ctx) {
			if (ctx.path.endsWith('.json')) return true;
			if (ctx.response.type && ctx.response.type.indexOf('json') >= 0) return true;
			if (ctx.accepts('html', 'text', 'json') === 'json') return true;
			if (ctx.headers && ctx.headers['content-type'] == 'application/x-www-form-urlencoded') return true;
			return false;
		}
	};
};
