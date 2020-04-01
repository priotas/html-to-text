#!/usr/bin/env node

import * as parseArgs from 'minimist';

import { htmlToText } from './html-to-text';

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
  text = htmlToText(text, argv);
  process.stdout.write(text + '\n', 'utf-8');
});

function interpretTables(tables: any) {
  if (!tables || tables === '' || tables === 'false') {
    return [];
  }
  return tables === 'true' || tables.split(',');
}
