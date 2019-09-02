const is = require('is-type-of');
module.exports = {
    loadFile(filepath) {
        try {
            return require(filepath);
        } catch (err) {
            throw err;
        }
    },
    async callFn(fn, args, ctx) {
        args = args || [];
        if (!is.function(fn)) return;
        return ctx ? fn.call(ctx, ...args) : fn(...args);
    }
}