"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import {} from 'domhandler';
const he_1 = require("he");
const lodash_1 = require("lodash");
const helper_1 = require("./helper");
function formatText(elem, options) {
    let text = elem.data || '';
    text = he_1.decode(text, options.decodeOptions);
    if (options.isInPre) {
        return text;
    }
    else {
        return helper_1.default.wordwrap(elem.trimLeadingSpace ? text.trimLeft() : text, options);
    }
}
exports.text = formatText;
function formatImage(elem, options) {
    if (options.ignoreImage) {
        return '';
    }
    let result = '', attribs = elem.attribs || {};
    if (attribs.alt) {
        result += he_1.decode(attribs.alt, options.decodeOptions);
        if (attribs.src) {
            result += ' ';
        }
    }
    if (attribs.src) {
        result += '[' + attribs.src + ']';
    }
    return result;
}
exports.image = formatImage;
function formatLineBreak(elem, fn, options) {
    return '\n' + fn(elem.children, options);
}
exports.lineBreak = formatLineBreak;
function formatParagraph(elem, fn, options) {
    const paragraph = fn(elem.children, options);
    if (options.singleNewLineParagraphs) {
        return `${paragraph}\n`;
    }
    else {
        return `${paragraph}\n\n`;
    }
}
exports.paragraph = formatParagraph;
function formatHeading(elem, fn, options) {
    let heading = fn(elem.children, options);
    if (options.uppercaseHeadings) {
        heading = heading.toUpperCase();
    }
    return `${heading}\n`;
}
exports.heading = formatHeading;
// If we have both href and anchor text, format it in a useful manner:
// - "anchor text [href]"
// Otherwise if we have only anchor text or an href, we return the part we have:
// - "anchor text" or
// - "href"
function formatAnchor(elem, fn, options) {
    let href = '';
    // Always get the anchor text
    const storedCharCount = options.lineCharCount;
    let text = fn(elem.children || [], options);
    if (!text) {
        text = '';
    }
    let result = elem.trimLeadingSpace ? text.trimLeft() : text;
    if (!options.ignoreHref) {
        // Get the href, if present
        if (elem.attribs && elem.attribs.href) {
            href = elem.attribs.href.replace(/^mailto:/, '');
        }
        if (href) {
            if (!options.noAnchorUrl || (options.noAnchorUrl && href[0] !== '#')) {
                if (options.linkHrefBaseUrl && href.indexOf('/') === 0) {
                    href = options.linkHrefBaseUrl + href;
                }
                if (!options.hideLinkHrefIfSameAsText ||
                    href !== helper_1.default.replaceAll(result, '\n', '')) {
                    if (!options.noLinkBrackets) {
                        result += ' [' + href + ']';
                    }
                    else {
                        result += ' ' + href;
                    }
                }
            }
        }
    }
    options.lineCharCount = storedCharCount;
    return formatText({ data: result || href, trimLeadingSpace: elem.trimLeadingSpace }, options);
}
exports.anchor = formatAnchor;
function formatHorizontalLine(_elem, _fn, options) {
    return '\n' + '-'.repeat(options.wordwrap) + '\n\n';
}
exports.horizontalLine = formatHorizontalLine;
function formatListItem(prefix, elem, fn, options) {
    options = Object.assign({}, options);
    // Reduce the wordwrap for sub elements.
    if (options.wordwrap) {
        options.wordwrap -= prefix.length;
    }
    // Process sub elements.
    let text = fn(elem.children, options);
    // Replace all line breaks with line break + prefix spacing.
    text = text.replace(/\n/g, '\n' + ' '.repeat(prefix.length));
    // Add first prefix and line break at the end.
    return prefix + text + '\n';
}
exports.listItem = formatListItem;
const whiteSpaceRegex = /^\s*$/;
function formatUnorderedList(elem, fn, options) {
    // if this list is a child of a list-item,
    // ensure that an additional line break is inserted
    const parentName = lodash_1.get(elem, 'parent.name');
    let result = parentName === 'li' ? '\n' : '';
    const prefix = options.unorderedListItemPrefix;
    var nonWhiteSpaceChildren = (elem.children || []).filter(function (child) {
        return child.type !== 'text' || !whiteSpaceRegex.test(child.data);
    });
    nonWhiteSpaceChildren.forEach(function (elem) {
        result += formatListItem(prefix, elem, fn, options);
    });
    return result + '\n';
}
exports.unorderedList = formatUnorderedList;
function formatOrderedList(elem, fn, options) {
    const nestedList = lodash_1.get(elem, 'parent.name') === 'li';
    let result = nestedList ? '\n' : '';
    const nonWhiteSpaceChildren = (elem.children || []).filter(function (child) {
        return child.type !== 'text' || !whiteSpaceRegex.test(child.data);
    });
    // Return different functions for different OL types
    const typeFunction = (function () {
        // Determine type
        const olType = elem.attribs.type || '1';
        // TODO Imeplement the other valid types
        //   Fallback to type '1' function for other valid types
        switch (olType) {
            case 'a':
                return function (start, i) {
                    return String.fromCharCode(i + start + 97);
                };
            case 'A':
                return function (start, i) {
                    return String.fromCharCode(i + start + 65);
                };
            case '1':
            default:
                return function (start, i) {
                    return i + 1 + start;
                };
        }
    })();
    // Make sure there are list items present
    if (nonWhiteSpaceChildren.length) {
        // Calculate initial start from ol attribute
        const start = Number(elem.attribs.start || '1') - 1;
        // Calculate the maximum length to i.
        const maxLength = (nonWhiteSpaceChildren.length + start).toString().length;
        nonWhiteSpaceChildren.forEach(function (elem, i) {
            // Use different function depending on type
            const index = typeFunction(start, i);
            // Calculate the needed spacing for nice indentation.
            const spacing = maxLength - index.toString().length;
            const prefix = (nestedList ? '' : ' ') + index + '. ' + ' '.repeat(spacing);
            result += formatListItem(prefix, elem, fn, options);
        });
    }
    return result + '\n';
}
exports.orderedList = formatOrderedList;
function tableToString(table) {
    // Determine space width per column
    // Convert all rows to lengths
    let widths = table.map(function (row) {
        return row.map(function (col) {
            return col.length;
        });
    });
    // Invert rows with colums
    widths = helper_1.default.arrayZip(widths);
    // Determine the max values for each column
    widths = widths.map(function (col) {
        return lodash_1.max(col);
    });
    // Build the table
    let text = '';
    table.forEach(function (row) {
        var i = 0;
        row.forEach(function (col) {
            text += lodash_1.padEnd(col.trim(), widths[i++], ' ') + '   ';
        });
        text += '\n';
    });
    return text + '\n';
}
function formatTable(elem, fn, options) {
    const table = [];
    elem.children.forEach(tryParseRows);
    return tableToString(table);
    function tryParseRows(elem) {
        if (elem.type !== 'tag') {
            return;
        }
        switch (elem.name.toLowerCase()) {
            case 'thead':
            case 'tbody':
            case 'tfoot':
            case 'center':
                elem.children.forEach(tryParseRows);
                return;
            case 'tr':
                let rows = [];
                elem.children.forEach(function (elem) {
                    let tokens, count;
                    if (elem.type === 'tag') {
                        switch (elem.name.toLowerCase()) {
                            case 'th':
                                tokens = formatHeading(elem, fn, options).split('\n');
                                rows.push(lodash_1.compact(tokens));
                                break;
                            case 'td':
                                tokens = fn(elem.children, options).split('\n');
                                rows.push(lodash_1.compact(tokens));
                                // Fill colspans with empty values
                                if (elem.attribs && elem.attribs.colspan) {
                                    count = elem.attribs.colspan - 1 || 0;
                                    lodash_1.times(count, function () {
                                        rows.push(['']);
                                    });
                                }
                                break;
                        }
                    }
                });
                rows = helper_1.default.arrayZip(rows);
                rows.forEach(function (row) {
                    row = row.map(function (col) {
                        return col || '';
                    });
                    table.push(row);
                });
                break;
        }
    }
}
exports.table = formatTable;
function formatBlockquote(elem, fn, options) {
    return '> ' + fn(elem.children, options) + '\n';
}
exports.blockquote = formatBlockquote;
//# sourceMappingURL=formatter.js.map