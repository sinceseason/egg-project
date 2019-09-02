const fs = require('fs');
const { type, list } = require('./questionCreate');

let subMap = {};
let sqls = '';
let index = 0;
for (let item in type) {
	index++;
	let parentId = index;
	let sql = buildSql(parentId, item);
	sqls = sqls + sql;
	for (let i = 0; i < type[item].length; i++) {
		index++;
		let subItem = type[item][i];
		sql = buildSql(index, subItem, parentId);
		subMap[subItem] = index;
		sqls = sqls + sql;
	}
}

function buildSql(id, name, parentId) {
	return `
    INSERT INTO platform_audit.questionstore (id, iconPath, name, parentId)
    VALUES (${id}, NULL, '${name}', ${parentId ? parentId : 'NULL'});
    `;
}

fs.writeFileSync('./questionStore.txt', sqls);

index = 0;
let sqls2 = '';
for (let item of list) {
	index++;
	if (item) {
		let storeId = subMap[item.secondType];
		sqls2 = sqls2 + buildSql2(index, item.content, item.options, item.correctOptions, 0, 0, storeId, '暂无');
	}
}
fs.writeFileSync('./question.txt', sqls2);

function buildSql2(id, content, options, correctOptions, level, type, storeId, analysis) {
	return `
        INSERT INTO platform_audit.question 
        (id, content, options, correctOptions, level, type, storeId, analysis) 
        VALUES (${id}, '${content}', '${options}', '${correctOptions}', 0, 0, ${storeId}, '暂无');
    `;
}
