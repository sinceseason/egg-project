'use strict';

// const Controller = require('egg').Controller;
const Controller = require('../core/base_controller');

class SearchController extends Controller {
  async index() {
    const { ctx } = this;
    // ctx.body = `search: ${ctx.query.name}`;
    this.success(`search: ${ctx.query.name}`);
  }
}

module.exports = SearchController;