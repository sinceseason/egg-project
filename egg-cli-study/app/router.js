'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/search', controller.search.index);
  router.post('createPost', '/api/posts', controller.post.create);
  router.get('/wharf', controller.wharf.index);
  router.get('/wharf/:id', controller.wharf.findById);
  router.get('/user', controller.user.index);
};
