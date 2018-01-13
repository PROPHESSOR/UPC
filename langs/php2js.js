/*
 * Самописный переводчик с PHP на JS
 */

'use strict';

const fs = require('fs');

// region api
const API = `
//PHP API for JS
const array_sum = x => {
	let sum=0;
	for(let i = 0; i < x.length; i++){
		sum+=x[i];
	}
	return sum;
};
const count = x => x.length;
const round = (x, y) => x.toFixed(y);
const strtolower = x => x.toLowerCase();
		
const stripos = ( f_haystack, f_needle, f_offset=0) => {
	let haystack = f_haystack.toLowerCase();
	let needle = f_needle.toLowerCase();
	let index = 0;
	if((index = haystack.indexOf(needle, f_offset)) > -1) {
		return index;
	}
	return false;
}
const trim = x => x.trim();`;
// endregion api

// Class

class Translator {
	constructor(data) {
		this.data = data;
	}

	translate() {
		this.data = this.data
			.replace(/\./g, '+') // Гребанная пхпшная конкатенация строк
			// FIXME: Может испортить точки в строках
			.replace(/->/g, '.') // Параметры
			.replace(/::/g, '.') // Статические параметры
			.replace(/\$/g, '')
			// Бездолларовые переменные
			.replace(/use /g, '//import ')
			// Шпора для импортов
			.replace(/namespace /g, '//extends ')
			// У нас будет объектная структура, как в JsOS
			.replace(/declare\(strict_types=1\);/g, '"use strict";')
			// Строгий режим
			.replace(/ : (int|bool|string|float|array|void|\?\w*)/g, '')
			// У нас динамическая типизация
			.replace(/(<\?php|\?>|<\?)/g, '')
			// Это уже не PHP
			// Поехали херить классы...
			// TODO: Константы в начале нужно ручками запихнуть в конструктор и под this
			.replace(/public /g, '')
			// Нинада
			.replace(/private /g, '_')
			// underscore
			.replace(/const /g, '')
			// Тоже нинада
			.replace(/(int|float|bool|string|array) /g, '')
			// TODO: Увы, кастомные типы я не буду сюда пихать
			// Убираем типизацию
			.replace(/min\(/g, 'Math.min(')
			.replace(/max\(/g, 'Math.max(')
			.replace(/exp\(/g, 'Math.exp(')
			// Mathermatika
			.replace(/class /g, '//TODO: Оберни константы в конструктор!\nclass ')
			// Лучше ещё раз напомнить
			.replace(/foreach\((\w+) as (\w+) => (\w+)\){/g, 'for(let $2 in $1){\nconst $3 = $1[$2]')
			.replace(/foreach\((\w+)\s+as\s+(\w+)\)/g, 'for(const $2 of $1)')
			// Переработка циклов
			.replace(/throw new .+\(/g, 'throw new Error(')
			// Нам и одного типа ошибок хватит
			.replace(/\((int|float)\) (.+)\s+([:|;?<>=!,.^%+-/*&~])/g, 'Number($2) $3')
			// По-любому какой-то символ не доглядел
			// Заменяет (int) her на Number(her)
			.replace(/\((string)\) (.+)\s+([:|;?<>=!,.^%+-/*&~])/g, 'String($2) $3')
			// (string) her -> String(her)
			.replace(/\(bool\) /g, '!!')
			// (bool) her -> !!her
			.replace(/ or /g, ' || '
				.replace(/ and /g, ' && ')
				.replace(/ \?\? /g, ' || ')) // her || null
			// Логические операторы прямиком из Basic'а
			.replace(/catch\((.+) (\w+)\)/g, 'catch($2)')
			// Убирает всякие \Throwable и прочее
			.replace(/Binary\./g, 'Buffer.')
			// Думаю, в тексте никто не будет писать с большой буквы перед точкой
			.replace(/_static /g, '/* Static */ _') // underscore fix
			.replace(/static /g, '/* static */ ')
			// Комментируем static
			.replace(/self\./g, '/*static*/ this.')
			// Никаких self
			.replace(/\((\w+) (\w+)(,|\))/g, '($2 /*$1*/$3'
				.replace(/, (\w+) (\w+)(,|\))/g, ', $2 /*$1*/ $3'))
			// Избавляемся от кастомных типов, но оставляем подсказки
			.replace(/#/g, '//')
			// Ещё один вид комментариев
			.replace(/=>/g, ':'); //eslint-disable-line
		// В объектах
		return API + this.data;
	}

	save(name) {
		fs.writeFileSync(name, this.translate(), 'utf8');
	}
}

module.exports = Translator;