const path = require('path');
const fs = require('fs');
const { htmlToText } = require('..');

console.log('fromString:');
const text = htmlToText('<h1>Hello World</h1>', {
  wordwrap: 130
});
console.log(text);
console.log();

console.log('fromFile:');

// Callback version
const fromFile = (file) => {
  fs.readFile(file, 'utf8', (err, str) => {
    if (err) {
      throw err;
    }
    console.log(htmlToText(str));
  });
};

fromFile(path.join(__dirname, 'test.html'));
