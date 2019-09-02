module.exports = {
	redis: {
		PREFIX_WEBCAT_REGISTER: 'VERIFYCODE:WEBCAT:REGISTER:'
	},
	validator: {
		username: '用户名需以字母开头，包含字母或数字且长度 5-20 位',
		password: '密码需包含字母和数字，且长度 6-16 位',
		telephone: '手机号非法',
		verifyCode: '验证码非法',
		error: '数据非法',
		none: '数据不能为空'
	},
	ERROR: {
		LOGIN: '账号、密码错误',
		NO_LOGIN: '当前用户未登录',
		SERVER: '服务异常，请稍后再试',
		QUESTION_EXAMINE_PAPER_ID: '请选择试题',
		QUESTION_EXAMINE_PAPER_OPTIONS: '请提交选项',
		QUESTION_STORE_NAME: '题库名不能为空',
		QUESTION_ID: '请选择题目',
		QUESTION_ANSWER_RECORD_ID: '请先答题',
		QUESTION_NOTE: '请填写笔记',
		QUESTION_OPTION: '请选择选项',
		QUESTION_CHECK_OPTION: '非法选项',
		PUNCH_TODAY_DONE: '今日已打卡',
		PUNCH_TIME_FULL: '打卡次数已满',
		QUESTION_CHECK_INCORRECT: '答案错误'
	}
};
