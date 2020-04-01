"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
// Split a long word up to fit within the word wrap limit.  Use either a
// character to split looking back from the word wrap limit, or
// truncate to the word wrap limit.
function splitLongWord(word, options) {
    const wrapCharacters = options.longWordSplit.wrapCharacters || [];
    const forceWrapOnLimit = options.longWordSplit.forceWrapOnLimit || false;
    const max = options.wordwrap;
    const fuseWord = [];
    let idx = 0;
    while (word.length > max) {
        const firstLine = word.substr(0, max);
        const remainingChars = word.substr(max);
        const splitIndex = firstLine.lastIndexOf(wrapCharacters[idx]);
        if (splitIndex > -1) {
            // We've found a character to split on, store before the split then check if we
            // need to split again
            word = firstLine.substr(splitIndex + 1) + remainingChars;
            fuseWord.push(firstLine.substr(0, splitIndex + 1));
        }
        else {
            idx++;
            if (idx >= wrapCharacters.length) {
                // Cannot split on character, so either split at 'max' or preserve length
                if (forceWrapOnLimit) {
                    fuseWord.push(firstLine);
                    word = remainingChars;
                    if (word.length > max) {
                        continue;
                    }
                }
                else {
                    word = firstLine + remainingChars;
                    console.log(options);
                    if (!options.preserveNewlines) {
                        word += '\n';
                    }
                }
                break;
            }
            else {
                word = firstLine + remainingChars;
            }
        }
    }
    fuseWord.push(word);
    return fuseWord.join('\n');
}
const helper = {};
helper.wordwrap = function wordwrap(text, options) {
    const max = options.wordwrap;
    const preserveNewlines = options.preserveNewlines;
    let length = options.lineCharCount;
    // Preserve leading space
    let result = text.startsWith(' ') ? ' ' : '';
    length += result.length;
    const buffer = [];
    // Split the text into words, decide to preserve new lines or not.
    const words = preserveNewlines
        ? text.trim().replace(/\n/g, '\n ').split(/\ +/)
        : text.trim().split(/\s+/);
    // Determine where to end line word by word.
    words.forEach(function (word) {
        // Add buffer to result if we can't fit any more words in the buffer.
        if ((max || max === 0) &&
            length > 0 &&
            (length + word.length > max || length + word.indexOf('\n') > max)) {
            // Concat buffer and add it to the result
            result += buffer.join(' ') + '\n';
            // Reset buffer and length
            buffer.length = length = 0;
        }
        // Check if the current word is long enough to be wrapped
        if ((max || max === 0) && options.longWordSplit && word.length > max) {
            word = splitLongWord(word, options);
        }
        buffer.push(word);
        // If the word contains a newline then restart the count and add the buffer to the result
        if (word.indexOf('\n') !== -1) {
            result += buffer.join(' ');
            // Reset the buffer, let the length include any characters after the last newline
            buffer.length = 0;
            length = word.length - (word.lastIndexOf('\n') + 1);
            // If there are characters after the newline, add a space and increase the length by 1
            if (length) {
                result += ' ';
                length++;
            }
        }
        else {
            // Add word length + one whitespace
            length += word.length + 1;
        }
    });
    // Add the rest to the result.
    result += buffer.join(' ');
    // Preserve trailing space
    if (!text.endsWith(' ')) {
        result = lodash_1.trimEnd(result);
    }
    else if (!result.endsWith(' ')) {
        result = result + ' ';
    }
    return result;
};
helper.arrayZip = function arrayZip(array) {
    return lodash_1.zip.apply(null, array);
};
helper.splitCssSearchTag = function splitCssSearchTag(tagString) {
    function getParams(re, string) {
        var captures = [], found;
        while ((found = re.exec(string)) !== null) {
            captures.push(found[1]);
        }
        return captures;
    }
    const splitTag = {};
    const elementRe = /(^\w*)/g;
    const element = elementRe.exec(tagString);
    splitTag.element = element && element[1];
    splitTag.classes = getParams(/\.([\d\w-]*)/g, tagString);
    splitTag.ids = getParams(/#([\d\w-]*)/g, tagString);
    return splitTag;
};
helper.replaceAll = function replaceAll(str, find, replace) {
    const reg = new RegExp(find, 'g');
    return str.replace(reg, replace);
};
exports.default = helper;
//# sourceMappingURL=helper.js.map