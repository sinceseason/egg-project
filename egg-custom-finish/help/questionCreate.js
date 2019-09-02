const XLSX = require('xlsx');
const fs = require('fs');
const buf = fs.readFileSync('./证券基础知识考试题库.xlsx');
// const buf = fs.readFileSync('./test.xlsx');
let data = XLSX.read(buf, { type: 'buffer' });

let list = [];
let Sheets = data.Sheets;
if (Sheets) {
	for (let sheetKey in Sheets) {
		let sheetContent = Sheets[sheetKey];
		let questionMap = ['topType', 'secondType', 'content', 'options', 'options', 'correctOptions'];
		for (let cell in sheetContent) {
			let cellData = sheetContent[cell];
			if (cell && cell == '!ref') {
				maxRowCol = calTotalColRow(cellData);
			} else if (cell && cell !== '!margins') {
				let item = createItem(cell);
				let letterColIndex = findIndex(cell.substring(0, 1));
				if (letterColIndex < 3) {
					item[questionMap[letterColIndex]] = cellData['v'];
				} else {
					if (letterColIndex % 2 !== 0) {
						item['options'] = item['options'] || [];
						item['options'].push(cellData['v']);
					} else {
						item['correctOptions'] = item['correctOptions'] || [];
						if (cellData['v'].indexOf('对') !== -1) {
							item['correctOptions'].push(1);
						} else {
							item['correctOptions'].push(0);
						}
					}
				}
			}
		}
	}
}
let type = {};
for (let item of list) {
	if (item) {
		item.options = item.options.toString();
		item.correctOptions = item.correctOptions.toString();
		if (!type[item.topType]) {
			type[item.topType] = [item.secondType];
		}
		if (type[item.topType].indexOf(item.secondType) == -1) {
			type[item.topType].push(item.secondType);
		}
	}
}
function createItem(cell) {
	let index = cell.substring(1);
	if (!list[index]) {
		list[index] = {};
	}
	return list[index];
}

function calTotalColRow(ref) {
	let data = ref.split(':');
	let rightData = data[1];
	let alphabet = 'abcdefghijklmnopqrstuvwxyz';
	let maxCol = 0; //列（字母列）
	for (let i = 1; i <= alphabet.length; i++) {
		let currentLetter = alphabet[i].toUpperCase();
		if (currentLetter == rightData.substring(0, 1)) {
			maxCol = currentLetter;
			break;
		}
	}
	let maxRow = Number(rightData.substring(1, 2));
	return { maxCol, maxRow };
}

function findIndex(letter) {
	let alphabet = 'abcdefghijklmnopqrstuvwxyz';
	for (let i = 0; i < alphabet.length; i++) {
		let currentLetter = alphabet[i].toUpperCase();
		if (currentLetter == letter) {
			return i;
		}
	}
}

exports.type = type;
exports.list = list;
