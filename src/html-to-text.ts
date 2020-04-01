import { includes, trimEnd } from 'lodash';

import { Parser, DefaultHandler } from 'htmlparser2';

import helper from './helper';
import * as defaultFormat from './formatter';

// Which type of tags should not be parsed
const SKIP_TYPES = ['style', 'script'];

function htmlToText(html: string, options: any) {
  options = Object.assign(
    {
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
    },
    options || {}
  );

  const handler = new DefaultHandler();
  new Parser(handler).parseComplete(html);

  options.lineCharCount = 0;

  let result: string = '';
  let baseElements = Array.isArray(options.baseElement)
    ? options.baseElement
    : [options.baseElement];
  for (let idx = 0; idx < baseElements.length; ++idx) {
    result += walk(
      filterBody(handler.dom, options, baseElements[idx]),
      options
    );
  }
  return trimEnd(result);
}

function filterBody(dom: any, options: any, baseElement: any) {
  let result: any = null;

  const splitTag = helper.splitCssSearchTag(baseElement);

  function walk(dom: any) {
    if (result) return;
    dom.forEach(function (elem: any) {
      if (result) return;
      if (elem.name === splitTag.element) {
        const documentClasses =
          elem.attribs && elem.attribs.class
            ? elem.attribs.class.split(' ')
            : [];
        const documentIds =
          elem.attribs && elem.attribs.id ? elem.attribs.id.split(' ') : [];

        if (
          splitTag.classes.every(function (val: any) {
            return documentClasses.indexOf(val) >= 0;
          }) &&
          splitTag.ids.every(function (val: any) {
            return documentIds.indexOf(val) >= 0;
          })
        ) {
          result = [elem];
          return;
        }
      }
      if (elem.children) walk(elem.children);
    });
  }
  walk(dom);
  return options.returnDomByDefault ? result || dom : result;
}

function containsTable(attr: any, tables: any) {
  if (tables === true) return true;

  function removePrefix(key: string) {
    return key.substr(1);
  }
  function checkPrefix(prefix: string) {
    return function (key: string) {
      return key.startsWith(prefix);
    };
  }
  function filterByPrefix(tables: any, prefix: string) {
    return tables.filter(checkPrefix(prefix)).map(removePrefix);
  }
  const classes = filterByPrefix(tables, '.');
  const ids = filterByPrefix(tables, '#');
  return (
    attr && (includes(classes, attr['class']) || includes(ids, attr['id']))
  );
}

function walk(dom: any, options: any, result?: string) {
  if (arguments.length < 3) {
    result = '';
  }
  const whiteSpaceRegex = /\s$/;
  const format = Object.assign({}, defaultFormat, options.format);

  if (!dom) {
    return result;
  }

  dom.forEach(function (elem: any) {
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
        if (!includes(SKIP_TYPES, elem.type)) {
          result = walk(elem.children || [], options, result);
        }
    }

    if (result) {
      options.lineCharCount = result.length - (result.lastIndexOf('\n') + 1);
    }
  });
  return result;
}

function fromString(str: string, options: any) {
  return htmlToText(str, options || {});
}

export { htmlToText, fromString };
