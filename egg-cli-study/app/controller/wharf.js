const Controller = require('egg').Controller;
class WharfController extends Controller {
    async index() {
        const { ctx } = this;
        const allWharf = await ctx.service.wharf.find();
        ctx.body = allWharf;
    }

    async findById() {
        const {ctx} = this;
        let aWharf = await ctx.service.wharf.findById(ctx.params.id);
        ctx.body = aWharf;
    }
}
module.exports = WharfController;