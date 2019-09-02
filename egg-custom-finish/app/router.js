module.exports = app => {
	const { router } = app;
	// 用户信息
	router.get('/user', app.middleware.checkLogin(app), app.controller.user.index);

	// 获取用户打卡信息
	router.get('/punch/record', app.middleware.checkLogin(app), app.controller.punch.records);
	// 清空打卡信息
	router.delete('/punch/record', app.middleware.checkLogin(app), app.controller.punch.remove);

	// router.get('/question', app.middleware.checkLogin(app), app.controller.question.index);
	// 试题查询
	router.get('/question/examine', app.middleware.checkLogin(app), app.controller.question.examine);
	// 提交/校验试题
	router.post('/question/examine/:id', app.middleware.checkLogin(app), app.controller.question.checkExamine);
	// 单题校验
	router.post('/question/check/:id', app.middleware.checkLogin(app), app.controller.question.check);
	// 单题记录笔记
	router.post('/question/note/:id', app.middleware.checkLogin(app), app.controller.question.note);
	// 错题查询
	router.get('/question/answerRecord', app.middleware.checkLogin(app), app.controller.question.answerRecord);
	router.get('/question/highErrorRateAnswerRecord', app.middleware.checkLogin(app), app.controller.question.highErrorRateAnswerRecord);

	// 题库维护
	router.post('/question/store', app.middleware.checkLogin(app), app.controller.questionStore.create);
	// 题库查询
	router.get('/question/store', app.middleware.checkLogin(app), app.controller.questionStore.index);
};
