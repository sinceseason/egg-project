const Service = require('egg').Service;
class WharfService extends Service {
    async find() {
        const allWharf = await this.app.mysql.select('wharf');
        return {allWharf};
    }
    async findById(id) {
        let wharf = await this.app.mysql.get('wharf', {id: id});
        return {wharf};
    }
}

module.exports = WharfService;