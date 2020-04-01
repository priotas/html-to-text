"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const htmlparser2_1 = require("htmlparser2");
const lodash_1 = require("lodash");
const defaultFormat = require("./formatter");
const helper_1 = require("./helper");
// Which type of tags should not be parsed
const SKIP_TYPES = ['style', 'script'];
function htmlToText(html, _options) {
    const finalOptions = Object.assign({
        wordwrap: 80,
        tables: [],
        preserveNewlines: false,
        uppercaseHeadings: true,
        singleNewLineParagraphs: false,
        hideLinkHrefIfSameAsText: false,
        linkHrefBaseUrl: null,
        noLinkBrackets: false,
        noAnchorUrl: true,
        baseElement: 'body',
        returnDomByDefault: true,
        format: {},
        decodeOptions: {
            isAttributeValue: false,
            strict: false
        },
        longWordSplit: {
            wrapCharacters: [],
            forceWrapOnLimit: false
        },
        unorderedListItemPrefix: ' * '
    }, _options || {});
    const handler = new htmlparser2_1.DefaultHandler();
    new htmlparser2_1.Parser(handler).parseComplete(html);
    finalOptions.lineCharCount = 0;
    let result = '';
    let baseElements = Array.isArray(finalOptions.baseElement)
        ? finalOptions.baseElement
        : [finalOptions.baseElement];
    for (let idx = 0; idx < baseElements.length; ++idx) {
        result += walk(filterBody(handler.dom, finalOptions, baseElements[idx]), finalOptions);
    }
    return lodash_1.trimEnd(result);
}
exports.htmlToText = htmlToText;
function filterBody(dom, options, baseElement) {
    let result = null;
    const splitTag = helper_1.default.splitCssSearchTag(baseElement);
    function walk(dom) {
        if (result) {
            return;
        }
        dom.forEach(function (elem) {
            if (result) {
                return;
            }
            if (elem.name === splitTag.element) {
                const documentClasses = elem.attribs && elem.attribs.class
                    ? elem.attribs.class.split(' ')
                    : [];
                const documentIds = elem.attribs && elem.attribs.id ? elem.attribs.id.split(' ') : [];
                if (splitTag.classes.every(function (val) {
                    return documentClasses.indexOf(val) >= 0;
                }) &&
                    splitTag.ids.every(function (val) {
                        return documentIds.indexOf(val) >= 0;
                    })) {
                    result = [elem];
                    return;
                }
            }
            if (elem.children) {
                walk(elem.children);
            }
        });
    }
    walk(dom);
    return options.returnDomByDefault ? result || dom : result;
}
function containsTable(attr, tables) {
    if (tables === true) {
        return true;
    }
    function removePrefix(key) {
        return key.substr(1);
    }
    function checkPrefix(prefix) {
        return function (key) {
            return key.startsWith(prefix);
        };
    }
    function filterByPrefix(tables, prefix) {
        return tables.filter(checkPrefix(prefix)).map(removePrefix);
    }
    const classes = filterByPrefix(tables, '.');
    const ids = filterByPrefix(tables, '#');
    return (attr && (lodash_1.includes(classes, attr['class']) || lodash_1.includes(ids, attr['id'])));
}
function walk(dom, options, result) {
    if (arguments.length < 3) {
        result = '';
    }
    const whiteSpaceRegex = /\s$/;
    const format = Object.assign({}, defaultFormat, options.format);
    if (!dom) {
        return result;
    }
    dom.forEach(function (elem) {
        switch (elem.type) {
            case 'tag':
                switch (elem.name.toLowerCase()) {
                    case 'img':
                        result += format.image(elem, options);
                        break;
                    case 'a':
                        // Inline element needs its leading space to be trimmed if `result`
                        // currently ends with whitespace
                        elem.trimLeadingSpace = whiteSpaceRegex.test(result || '');
                        result += format.anchor(elem, walk, options);
                        break;
                    case 'p':
                        result += format.paragraph(elem, walk, options);
                        break;
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        result += format.heading(elem, walk, options);
                        break;
                    case 'br':
                        result += format.lineBreak(elem, walk, options);
                        break;
                    case 'hr':
                        result += format.horizontalLine(elem, walk, options);
                        break;
                    case 'ul':
                        result += format.unorderedList(elem, walk, options);
                        break;
                    case 'ol':
                        result += format.orderedList(elem, walk, options);
                        break;
                    case 'pre':
                        const newOptions = Object.assign({}, options);
                        newOptions.isInPre = true;
                        result += format.paragraph(elem, walk, newOptions);
                        break;
                    case 'table':
                        result = containsTable(elem.attribs, options.tables)
                            ? result + format.table(elem, walk, options)
                            : walk(elem.children || [], options, result);
                        break;
                    case 'blockquote':
                        result += format.blockquote(elem, walk, options);
                        break;
                    default:
                        result = walk(elem.children || [], options, result);
                }
                break;
            case 'text':
                if (elem.data !== '\r\n') {
                    // Text needs its leading space to be trimmed if `result`
                    // currently ends with whitespace
                    elem.trimLeadingSpace = whiteSpaceRegex.test(result || '');
                    result += format.text(elem, options);
                }
                break;
            default:
                if (!lodash_1.includes(SKIP_TYPES, elem.type)) {
                    result = walk(elem.children || [], options, result);
                }
        }
        if (result) {
            options.lineCharCount = result.length - (result.lastIndexOf('\n') + 1);
        }
    });
    return result;
}
//# sourceMappingURL=html-to-text.js.map