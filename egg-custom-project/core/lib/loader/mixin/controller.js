module.exports = {
    loadController(opt) {
        opt = Object.assign({
            caseStyle: 'lower',
      directory: path.join(this.options.baseDir, 'app/controller'),
        }, opt)
    }
}