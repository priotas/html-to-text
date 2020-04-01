#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseArgs = require("minimist");
const html_to_text_1 = require("./html-to-text");
const argv = parseArgs(process.argv.slice(2), {
    string: ['tables'],
    boolean: ['noLinkBrackets', 'ignoreHref', 'ignoreImage'],
    alias: {
        'ignore-href': 'ignoreHref',
        'ignore-image': 'ignoreImage'
    },
    default: {
        wordwrap: 80
    }
});
argv.tables = interpretTables(argv.tables);
let text = '';
process.title = 'html-to-text';
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function data(data) {
    text += data;
});
process.stdin.on('end', function end() {
    text = html_to_text_1.htmlToText(text, argv);
    process.stdout.write(text + '\n', 'utf-8');
});
function interpretTables(tables) {
    if (!tables || tables === '' || tables === 'false') {
        return [];
    }
    return tables === 'true' || tables.split(',');
}
//# sourceMappingURL=cli.js.map