const isJSON = require('koa-is-json');
const zlib = require('zlib');


module.exports = options => {
    return async function gzip(ctx, next) {
        await next();

        const body = ctx.body;
        if (!body) return;
        if (isJSON(body)) body = JSON.stringify(body);

        // 支持 options.threshold
        if (options.threshold && ctx.length < options.threshold) return;

        // 设置 gzip body，修正响应头
        const stream = zlib.createGzip();
        stream.end(body);
        ctx.body = stream;
        ctx.set('Content-Encoding', 'gzip');
    }
}