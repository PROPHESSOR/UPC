/**
 * Copyright (c) 2018 prophessor
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

'use strict';

const fs = require('fs');

const args = process.argv.splice(process.execArgv.length + 2);
const [TYPE, FROM, TO] = args;

if (!(TYPE && FROM)) return console.log('usage: <type> <from> [<to>]');

let Translator;

try {
	Translator = require(`./langs/${TYPE}`);
} catch (e) {
	console.error(e);
	console.error(`\n\n\nUnknown convert type ${TYPE}`);
}

const translator = new Translator(fs.readFileSync(FROM, 'utf8'));

if (TO) fs.writeFileSync(TO, translator.translate(), 'utf8');
else console.log(translator.translate());

console.info('OK!');

return 0;