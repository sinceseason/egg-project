module.exports = {
	verifyCode: /\w{6}/,
	telephone: /\d{11}/,
	username: /[^[a-zA-Z]+\w{5,19}]/,
	password: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/
};
