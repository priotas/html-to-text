//import {} from 'domhandler';
import { decode } from 'he';
import { compact, get, max, padEnd, times, trimStart } from 'lodash';

import helper from './helper';

function formatText(elem: any, options: any) {
  let text = elem.data || '';
  text = decode(text, options.decodeOptions);

  if (options.isInPre) {
    return text;
  } else {
    return helper.wordwrap(
      elem.trimLeadingSpace ? trimStart(text) : text,
      options
    );
  }
}

function formatImage(elem: any, options: any) {
  if (options.ignoreImage) {
    return '';
  }

  let result = '',
    attribs = elem.attribs || {};
  if (attribs.alt) {
    result += decode(attribs.alt, options.decodeOptions);
    if (attribs.src) {
      result += ' ';
    }
  }
  if (attribs.src) {
    result += '[' + attribs.src + ']';
  }
  return result;
}

function formatLineBreak(elem: any, fn: Function, options: any) {
  return '\n' + fn(elem.children, options);
}

function formatParagraph(elem: any, fn: Function, options: any) {
  const paragraph = fn(elem.children, options);
  if (options.singleNewLineParagraphs) {
    return `${paragraph}\n`;
  } else {
    return `${paragraph}\n\n`;
  }
}

function formatHeading(elem: any, fn: Function, options: any) {
  let heading = fn(elem.children, options);
  if (options.uppercaseHeadings) {
    heading = heading.toUpperCase();
  }
  return `${heading}\n`;
}

// If we have both href and anchor text, format it in a useful manner:
// - "anchor text [href]"
// Otherwise if we have only anchor text or an href, we return the part we have:
// - "anchor text" or
// - "href"
function formatAnchor(elem: any, fn: Function, options: any) {
  let href = '';
  // Always get the anchor text
  const storedCharCount = options.lineCharCount;
  let text = fn(elem.children || [], options);
  if (!text) {
    text = '';
  }

  let result = elem.trimLeadingSpace ? trimStart(text) : text;

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
        if (
          !options.hideLinkHrefIfSameAsText ||
          href !== helper.replaceAll(result, '\n', '')
        ) {
          if (!options.noLinkBrackets) {
            result += ' [' + href + ']';
          } else {
            result += ' ' + href;
          }
        }
      }
    }
  }

  options.lineCharCount = storedCharCount;

  return formatText(
    { data: result || href, trimLeadingSpace: elem.trimLeadingSpace },
    options
  );
}

function formatHorizontalLine(_elem: any, _fn: Function, options: any) {
  return '\n' + '-'.repeat(options.wordwrap) + '\n\n';
}

function formatListItem(prefix: string, elem: any, fn: Function, options: any) {
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

const whiteSpaceRegex = /^\s*$/;

function formatUnorderedList(elem: any, fn: Function, options: any) {
  // if this list is a child of a list-item,
  // ensure that an additional line break is inserted
  const parentName = get(elem, 'parent.name');
  let result = parentName === 'li' ? '\n' : '';
  const prefix = options.unorderedListItemPrefix;
  var nonWhiteSpaceChildren = (elem.children || []).filter(function (
    child: any
  ) {
    return child.type !== 'text' || !whiteSpaceRegex.test(child.data);
  });
  nonWhiteSpaceChildren.forEach(function (elem: any) {
    result += formatListItem(prefix, elem, fn, options);
  });
  return result + '\n';
}

function formatOrderedList(elem: any, fn: Function, options: any) {
  const nestedList = get(elem, 'parent.name') === 'li';
  let result = nestedList ? '\n' : '';
  const nonWhiteSpaceChildren = (elem.children || []).filter(function (
    child: any
  ) {
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
        return function (start: number, i: number) {
          return String.fromCharCode(i + start + 97);
        };
      case 'A':
        return function (start: number, i: number) {
          return String.fromCharCode(i + start + 65);
        };
      case '1':
      default:
        return function (start: number, i: number) {
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
    nonWhiteSpaceChildren.forEach(function (elem: any, i: number) {
      // Use different function depending on type
      const index = typeFunction(start, i);
      // Calculate the needed spacing for nice indentation.
      const spacing = maxLength - index.toString().length;
      const prefix =
        (nestedList ? '' : ' ') + index + '. ' + ' '.repeat(spacing);
      result += formatListItem(prefix, elem, fn, options);
    });
  }
  return result + '\n';
}

function tableToString(table: any) {
  // Determine space width per column
  // Convert all rows to lengths
  let widths = table.map(function (row: any) {
    return row.map(function (col: any) {
      return col.length;
    });
  });
  // Invert rows with colums
  widths = helper.arrayZip(widths);
  // Determine the max values for each column
  widths = widths.map(function (col: any) {
    return max(col);
  });

  // Build the table
  let text = '';
  table.forEach(function (row: any) {
    var i = 0;
    row.forEach(function (col: any) {
      text += padEnd(col.trim(), widths[i++], ' ') + '   ';
    });
    text += '\n';
  });
  return text + '\n';
}

function formatTable(elem: any, fn: Function, options: any) {
  const table: any[] = [];
  elem.children.forEach(tryParseRows);
  return tableToString(table);

  function tryParseRows(elem: any) {
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
        let rows: any = [];
        elem.children.forEach(function (elem: any) {
          let tokens, count;
          if (elem.type === 'tag') {
            switch (elem.name.toLowerCase()) {
              case 'th':
                tokens = formatHeading(elem, fn, options).split('\n');
                rows.push(compact(tokens));
                break;

              case 'td':
                tokens = fn(elem.children, options).split('\n');
                rows.push(compact(tokens));
                // Fill colspans with empty values
                if (elem.attribs && elem.attribs.colspan) {
                  count = elem.attribs.colspan - 1 || 0;
                  times(count, function () {
                    rows.push(['']);
                  });
                }
                break;
            }
          }
        });
        rows = helper.arrayZip(rows);
        rows.forEach(function (row: any) {
          row = row.map(function (col: any) {
            return col || '';
          });
          table.push(row);
        });
        break;
    }
  }
}

function formatBlockquote(elem: any, fn: Function, options: any) {
  return '> ' + fn(elem.children, options) + '\n';
}

export {
  formatAnchor as anchor,
  formatBlockquote as blockquote,
  formatHeading as heading,
  formatHorizontalLine as horizontalLine,
  formatImage as image,
  formatLineBreak as lineBreak,
  formatListItem as listItem,
  formatOrderedList as orderedList,
  formatParagraph as paragraph,
  formatTable as table,
  formatText as text,
  formatUnorderedList as unorderedList
};
