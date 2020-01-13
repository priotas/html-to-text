"use strict";
/* eslint max-len: "off" */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const html_to_text_1 = require("../html-to-text");
describe('html-to-text', () => {
    describe('.htmlToText()', () => {
        describe('wordwrap option', () => {
            let longStr;
            beforeEach(() => {
                longStr =
                    '111111111 222222222 333333333 444444444 555555555 666666666 777777777 888888888 999999999';
            });
            it('should wordwrap at 80 characters by default', () => {
                expect(html_to_text_1.htmlToText(longStr)).toEqual('111111111 222222222 333333333 444444444 555555555 666666666 777777777 888888888\n999999999');
            });
            it('should wordwrap at given amount of characters when give a number', () => {
                expect(html_to_text_1.htmlToText(longStr, { wordwrap: 20 })).toEqual('111111111 222222222\n333333333 444444444\n555555555 666666666\n777777777 888888888\n999999999');
                expect(html_to_text_1.htmlToText(longStr, { wordwrap: 50 })).toEqual('111111111 222222222 333333333 444444444 555555555\n666666666 777777777 888888888 999999999');
                expect(html_to_text_1.htmlToText(longStr, { wordwrap: 70 })).toEqual('111111111 222222222 333333333 444444444 555555555 666666666 777777777\n888888888 999999999');
            });
            it('should not wordwrap when given null', () => {
                expect(html_to_text_1.htmlToText(longStr, { wordwrap: null })).toEqual(longStr);
            });
            it('should not wordwrap when given false', () => {
                expect(html_to_text_1.htmlToText(longStr, { wordwrap: false })).toEqual(longStr);
            });
            it('should not exceed the line width when processing embedded format tags', () => {
                const testString = "<p><strong>This text isn't counted</strong> when calculating where to break a string for 80 character line lengths.</p>";
                expect(html_to_text_1.htmlToText(testString, {})).toEqual("This text isn't counted when calculating where to break a string for 80\ncharacter line lengths.");
            });
            it('should work with a long string containing line feeds', () => {
                const testString = '<p>If a word with a line feed exists over the line feed boundary then\nyou\nmust\nrespect it.</p>';
                expect(html_to_text_1.htmlToText(testString, {})).toEqual('If a word with a line feed exists over the line feed boundary then you must\nrespect it.');
            });
            it('should not wrongly truncate lines when processing embedded format tags', () => {
                const testString = "<p><strong>This text isn't counted</strong> when calculating where to break a string for 80 character line lengths.  However it can affect where the next line breaks and this could lead to having an early line break</p>";
                expect(html_to_text_1.htmlToText(testString, {})).toEqual("This text isn't counted when calculating where to break a string for 80\ncharacter line lengths. However it can affect where the next line breaks and\nthis could lead to having an early line break");
            });
            it('should not exceed the line width when processing anchor tags', () => {
                const testString = '<p>We appreciate your business. And we hope you\'ll check out our <a href="http://example.com/">new products</a>!</p>';
                expect(html_to_text_1.htmlToText(testString, {})).toEqual("We appreciate your business. And we hope you'll check out our new products\n[http://example.com/]!");
            });
            it('should honour line feeds from a long word across the wrap, where the line feed is before the wrap', () => {
                const testString = '<p>This string is meant to test if a string is split properly across a\nnewlineandlongword with following text.</p>';
                expect(html_to_text_1.htmlToText(testString, {})).toEqual('This string is meant to test if a string is split properly across a\nnewlineandlongword with following text.');
            });
            it('should remove line feeds from a long word across the wrap, where the line feed is after the wrap', () => {
                const testString = '<p>This string is meant to test if a string is split properly across anewlineandlong\nword with following text.</p>';
                expect(html_to_text_1.htmlToText(testString, {})).toEqual('This string is meant to test if a string is split properly across\nanewlineandlong word with following text.');
            });
        });
        describe('preserveNewlines option', () => {
            let newlineStr;
            beforeEach(() => {
                newlineStr = '<p\n>One\nTwo\nThree</p>';
            });
            it('should not preserve newlines by default', () => {
                expect(html_to_text_1.htmlToText(newlineStr)).not.toContain('\n');
            });
            it('should preserve newlines when provided with a truthy value', () => {
                expect(html_to_text_1.htmlToText(newlineStr, { preserveNewlines: true })).toContain('\n');
            });
            it('should not preserve newlines in the tags themselves', () => {
                var output_text = html_to_text_1.htmlToText(newlineStr, {
                    preserveNewlines: true
                });
                expect(output_text.slice(0, 1)).toEqual('O');
            });
            it('should preserve line feeds in a long wrapping string containing line feeds', () => {
                const testString = '<p>If a word with a line feed exists over the line feed boundary then\nyou\nmust\nrespect it.</p>';
                expect(html_to_text_1.htmlToText(testString, { preserveNewlines: true })).toEqual('If a word with a line feed exists over the line feed boundary then\nyou\nmust\nrespect it.');
            });
            it('should preserve line feeds in a long string containing line feeds across the wrap', () => {
                const testString = '<p>If a word with a line feed exists over the line feed boundary then\nyou must respect it.</p>';
                expect(html_to_text_1.htmlToText(testString, { preserveNewlines: true })).toEqual('If a word with a line feed exists over the line feed boundary then\nyou must respect it.');
            });
            it('should preserve line feeds in a long string containing line feeds across the wrap with a line feed before 80 chars', () => {
                const testString = '<p>This string is meant to test if a string is split properly across a\nnewlineandlongword with following text.</p>';
                expect(html_to_text_1.htmlToText(testString, { preserveNewlines: true })).toEqual('This string is meant to test if a string is split properly across a\nnewlineandlongword with following text.');
            });
            it('should preserve line feeds in a long string containing line feeds across the wrap with a line feed after 80 chars', () => {
                const testString = '<p>This string is meant to test if a string is split properly across anewlineandlong\nword with following text.</p>';
                expect(html_to_text_1.htmlToText(testString, { preserveNewlines: true })).toEqual('This string is meant to test if a string is split properly across\nanewlineandlong\nword with following text.');
            });
            it('should split long lines', () => {
                const testString = '<p>If a word with a line feed exists over the line feed boundary then you must respect it.</p>';
                expect(html_to_text_1.htmlToText(testString, { preserveNewlines: true })).toEqual('If a word with a line feed exists over the line feed boundary then you must\nrespect it.');
            });
        });
        describe('single line paragraph option', () => {
            let paragraphsString;
            beforeEach(() => {
                paragraphsString = '<p>First</p><p>Second</p>';
            });
            it('should not use single new line when given null', () => {
                expect(html_to_text_1.htmlToText(paragraphsString, {
                    singleNewLineParagraphs: null
                })).toEqual('First\n\nSecond');
            });
            it('should not use single new line when given false', () => {
                expect(html_to_text_1.htmlToText(paragraphsString, {
                    singleNewLineParagraphs: false
                })).toEqual('First\n\nSecond');
            });
            it('should use single new line when given true', () => {
                expect(html_to_text_1.htmlToText(paragraphsString, {
                    singleNewLineParagraphs: true
                })).toEqual('First\nSecond');
            });
        });
    });
    describe('tables', () => {
        it('does not process tables with uppercase tags / does not process tables with center tag', () => {
            var html = 'Good morning Jacob, \
        <TABLE> \
        <CENTER> \
        <TBODY> \
        <TR> \
        <TD>Lorem ipsum dolor sit amet.</TD> \
        </TR> \
        </CENTER> \
        </TBODY> \
        </TABLE> \
      ';
            var resultExpected = 'Good morning Jacob, Lorem ipsum dolor sit amet.';
            const result = html_to_text_1.htmlToText(html, { tables: true });
            expect(result).toEqual(resultExpected);
        });
        it('does handle non-integer colspan on td element gracefully', () => {
            var html = 'Good morning Jacob, \
        <TABLE> \
        <CENTER> \
        <TBODY> \
        <TR> \
        <TD colspan="abc">Lorem ipsum dolor sit amet.</TD> \
        </TR> \
        </CENTER> \
        </TBODY> \
        </TABLE> \
      ';
            var resultExpected = 'Good morning Jacob, Lorem ipsum dolor sit amet.';
            const result = html_to_text_1.htmlToText(html, { tables: true });
            expect(result).toEqual(resultExpected);
        });
    });
    describe('a', () => {
        it('should decode html attribute entities from href', () => {
            const result = html_to_text_1.htmlToText('<a href="/foo?a&#x3D;b">test</a>');
            expect(result).toEqual('test [/foo?a=b]');
        });
        it('should strip mailto: from email links', () => {
            const result = html_to_text_1.htmlToText('<a href="mailto:foo@example.com">email me</a>');
            expect(result).toEqual('email me [foo@example.com]');
        });
        it('should return link with brackets', () => {
            const result = html_to_text_1.htmlToText('<a href="http://my.link">test</a>');
            expect(result).toEqual('test [http://my.link]');
        });
        it('should return link without brackets', () => {
            const result = html_to_text_1.htmlToText('<a href="http://my.link">test</a>', {
                noLinkBrackets: true
            });
            expect(result).toEqual('test http://my.link');
        });
        it('should not return link for anchor if noAnchorUrl is set to true', () => {
            const result = html_to_text_1.htmlToText('<a href="#link">test</a>', {
                noAnchorUrl: true
            });
            expect(result).toEqual('test');
        });
        it('should return link for anchor if noAnchorUrl is set to false', () => {
            const result = html_to_text_1.htmlToText('<a href="#link">test</a>', {
                noAnchorUrl: false
            });
            expect(result).toEqual('test [#link]');
        });
    });
    describe('lists', () => {
        describe('ul', () => {
            it('should handle empty unordered lists', () => {
                const testString = '<ul></ul>';
                expect(html_to_text_1.htmlToText(testString)).toEqual('');
            });
            it('should handle an unordered list with multiple elements', () => {
                const testString = '<ul><li>foo</li><li>bar</li></ul>';
                expect(html_to_text_1.htmlToText(testString)).toEqual(' * foo\n * bar');
            });
            it('should handle an unordered list prefix option', () => {
                const testString = '<ul><li>foo</li><li>bar</li></ul>';
                const options = { unorderedListItemPrefix: ' test ' };
                expect(html_to_text_1.htmlToText(testString, options)).toEqual(' test foo\n test bar');
            });
            it('should handle nested ul correctly', () => {
                const testString = '<ul><li>foo<ul><li>bar<ul><li>baz.1</li><li>baz.2</li></ul></li></ul></li></ul>';
                expect(html_to_text_1.htmlToText(testString)).toEqual(' * foo\n    * bar\n       * baz.1\n       * baz.2');
            });
        });
        describe('ol', () => {
            it('should handle empty ordered lists', () => {
                const testString = '<ol></ol>';
                expect(html_to_text_1.htmlToText(testString)).toEqual('');
            });
            it('should handle an ordered list with multiple elements', () => {
                const testString = '<ol><li>foo</li><li>bar</li></ol>';
                expect(html_to_text_1.htmlToText(testString)).toEqual(' 1. foo\n 2. bar');
            });
            it('should support the ordered list type="1" attribute', () => {
                const testString = '<ol type="1"><li>foo</li><li>bar</li></ol>';
                expect(html_to_text_1.htmlToText(testString)).toEqual(' 1. foo\n 2. bar');
            });
            it('should fallback to type="!" behavior if type attribute is invalid', () => {
                const testString = '<ol type="1"><li>foo</li><li>bar</li></ol>';
                expect(html_to_text_1.htmlToText(testString)).toEqual(' 1. foo\n 2. bar');
            });
            it('should support the ordered list type="a" attribute', () => {
                const testString = '<ol type="a"><li>foo</li><li>bar</li></ol>';
                expect(html_to_text_1.htmlToText(testString)).toEqual(' a. foo\n b. bar');
            });
            it('should support the ordered list type="A" attribute', () => {
                const testString = '<ol type="A"><li>foo</li><li>bar</li></ol>';
                expect(html_to_text_1.htmlToText(testString)).toEqual(' A. foo\n B. bar');
            });
            it('should support the ordered list type="i" attribute by falling back to type="1"', () => {
                const testString = '<ol type="i"><li>foo</li><li>bar</li></ol>';
                // TODO Implement lowercase roman numerals
                // expect(htmlToText(testString)).toEqual('i. foo\nii. bar');
                expect(html_to_text_1.htmlToText(testString)).toEqual(' 1. foo\n 2. bar');
            });
            it('should support the ordered list type="I" attribute by falling back to type="1"', () => {
                const testString = '<ol type="I"><li>foo</li><li>bar</li></ol>';
                // TODO Implement uppercase roman numerals
                // expect(htmlToText(testString)).toEqual('I. foo\nII. bar');
                expect(html_to_text_1.htmlToText(testString)).toEqual(' 1. foo\n 2. bar');
            });
            it('should support the ordered list start attribute', () => {
                const testString = '<ol start="2"><li>foo</li><li>bar</li></ol>';
                expect(html_to_text_1.htmlToText(testString)).toEqual(' 2. foo\n 3. bar');
            });
            it('should handle nested ol correctly', () => {
                const testString = '<ol><li>foo<ol><li>bar<ol><li>baz</li><li>baz</li></ol></li></ol></li></ol>';
                expect(html_to_text_1.htmlToText(testString)).toEqual(' 1. foo\n    1. bar\n       1. baz\n       2. baz');
            });
            /*
             * Currently failing tests for continuing to fill out the specification
             *  Spec: https://html.spec.whatwg.org/multipage/semantics.html#the-ol-element
             *
            it('should support the ordered list type="a" attribute past 26 characters', function() {
              const testString = '<ol start="26" type="a"><li>foo</li><li>bar</li></ol>';
              expect(htmlToText(testString)).toEqual('z. foo\naa. bar');
            });
      
            it('should support the ordered list type="A" attribute past 26 characters', function() {
              const testString = '<ol start="26" type="A"><li>foo</li><li>bar</li></ol>';
              expect(htmlToText(testString)).toEqual('Z. foo\nAA. bar');
            });
            */
        });
        it('doesnt wrap li if wordwrap isnt', () => {
            const html = 'Good morning Jacob, \
        <p>Lorem ipsum dolor sit amet</p> \
        <p><strong>Lorem ipsum dolor sit amet.</strong></p> \
        <ul> \
          <li>run in the park <span style="color:#888888;">(in progress)</span></li> \
        </ul> \
      ';
            const resultExpected = 'Good morning Jacob, Lorem ipsum dolor sit amet\n\nLorem ipsum dolor sit amet.\n\n * run in the park (in progress)';
            const result = html_to_text_1.htmlToText(html, { wordwrap: false });
            expect(result).toEqual(resultExpected);
        });
    });
    describe('entities', () => {
        it('does not insert null bytes', () => {
            const html = '<a href="some-url?a=b&amp;b=c">Testing &amp; Done</a>';
            const result = html_to_text_1.htmlToText(html);
            expect(result).toEqual('Testing & Done [some-url?a=b&b=c]');
        });
        it('should replace entities inside `alt` attributes of images', () => {
            const html = '<img src="test.png" alt="&quot;Awesome&quot;">';
            const result = html_to_text_1.htmlToText(html);
            expect(result).toEqual('"Awesome" [test.png]');
        });
    });
    describe('unicode support', () => {
        it('should decode &#128514; to 😂', () => {
            const result = html_to_text_1.htmlToText('&#128514;');
            expect(result).toEqual('😂');
        });
    });
    describe('disable uppercaseHeadings', () => {
        [1, 2, 3, 4, 5, 6].forEach((i) => {
            it('should return h' + i + ' in lowercase', () => {
                const result = html_to_text_1.htmlToText('<h' + i + '>test</h' + i + '>', {
                    uppercaseHeadings: false
                });
                expect(result).toEqual('test');
            });
        });
    });
    describe('custom formatting', () => {
        it('should allow to pass custom formatting functions', () => {
            const result = html_to_text_1.htmlToText('<h1>TeSt</h1>', {
                format: {
                    heading: function (elem, fn, options) {
                        var h = fn(elem.children, options);
                        return '====\n' + h.toLowerCase() + '\n====';
                    }
                }
            });
            expect(result).toEqual('====\ntest\n====');
        });
    });
    describe('Base element', () => {
        it('should retrieve and convert the entire document under `body` by default', () => {
            const htmlFile = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');
            const txtFile = fs.readFileSync(path.join(__dirname, 'test.txt'), 'utf8');
            const options = {
                tables: ['#invoice', '.address']
            };
            const text = html_to_text_1.htmlToText(htmlFile, options);
            expect(text).toEqual(txtFile);
        });
        it('should only retrieve and convert content under the specified base element if found', () => {
            const htmlFile = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');
            const txtFile = fs.readFileSync(path.join(__dirname, 'test-address.txt'), 'utf8');
            const options = {
                tables: ['.address'],
                baseElement: 'table.address'
            };
            const text = html_to_text_1.htmlToText(htmlFile, options);
            expect(text).toEqual(txtFile);
        });
        it('should retrieve and convert content under multiple base elements', () => {
            const htmlFile = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');
            const txtFile = fs.readFileSync(path.join(__dirname, 'test-address-dup.txt'), 'utf8');
            const options = {
                tables: ['.address'],
                baseElement: ['table.address', 'table.address']
            };
            const text = html_to_text_1.htmlToText(htmlFile, options);
            expect(text).toEqual(txtFile);
        });
        it('should retrieve and convert content under multiple base elements in any order', () => {
            const htmlFile = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');
            const txtFile = fs.readFileSync(path.join(__dirname, 'test-any-order.txt'), 'utf8');
            const options = {
                tables: ['.address'],
                baseElement: ['table.address', 'p.normal-space', 'table.address']
            };
            const text = html_to_text_1.htmlToText(htmlFile, options);
            expect(text).toEqual(txtFile);
        });
        it('should process the first base element found when multiple exist', () => {
            const htmlFile = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');
            const txtFile = fs.readFileSync(path.join(__dirname, 'test-first-element.txt'), 'utf8');
            const options = {
                tables: ['.address'],
                baseElement: 'p.normal-space'
            };
            const text = html_to_text_1.htmlToText(htmlFile, options);
            expect(text).toEqual(txtFile);
        });
        it('should retrieve and convert the entire document by default if no base element is found', () => {
            const htmlFile = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');
            const txtFile = fs.readFileSync(path.join(__dirname, 'test.txt'), 'utf8');
            const options = {
                tables: ['#invoice', '.address'],
                baseElement: 'table.notthere'
            };
            const text = html_to_text_1.htmlToText(htmlFile, options);
            expect(text).toEqual(txtFile);
        });
        it("should return null if the base element isn't found and we're not returning the DOM by default", () => {
            const htmlFile = fs.readFileSync(path.join(__dirname, 'test.html'), 'utf8');
            const expectedTxt = '';
            const options = {
                tables: ['#invoice', '.address'],
                baseElement: 'table.notthere',
                returnDomByDefault: false
            };
            const text = html_to_text_1.htmlToText(htmlFile, options);
            expect(text).toEqual(expectedTxt);
        });
    });
    describe('Long words', () => {
        it('should split long words if forceWrapOnLimit is set, existing linefeeds converted to space', () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: { wrapCharacters: ['/'], forceWrapOnLimit: true }
            })).toEqual('_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlo\nng word_with_following_text.');
        });
        it('should not wrap a string if longWordSplit is not set', () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlongword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, {})).toEqual('_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlongword_with_following_text.');
        });
        it('should not wrap a string if not wrapCharacters are found and forceWrapOnLimit is not set', () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: { wrapCharacters: ['/'], forceWrapOnLimit: false }
            })).toEqual('_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.');
        });
        it('should not wrap a string if no wrapCharacters are set and forceWrapOnLimit is not set', () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: { wrapCharacters: [], forceWrapOnLimit: false }
            })).toEqual('_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.');
        });
        it('should wrap on the last instance of a wrap character before the wordwrap limit.', () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: { wrapCharacters: ['/', '_'], forceWrapOnLimit: false }
            })).toEqual('_This_string_is_meant_to_test_if_a_string_is_split_properly_across_\nanewlineandlong word_with_following_text.');
        });
        it("should wrap on the last instance of a wrap character before the wordwrap limit. Content of wrapCharacters shouldn't matter.", () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: {
                    wrapCharacters: ['/', '-', '_'],
                    forceWrapOnLimit: false
                }
            })).toEqual('_This_string_is_meant_to_test_if_a_string_is_split_properly_across_\nanewlineandlong word_with_following_text.');
        });
        it("should wrap on the last instance of a wrap character before the wordwrap limit. Order of wrapCharacters shouldn't matter.", () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: { wrapCharacters: ['_', '/'], forceWrapOnLimit: false }
            })).toEqual('_This_string_is_meant_to_test_if_a_string_is_split_properly_across_\nanewlineandlong word_with_following_text.');
        });
        it('should wrap on the last instance of a wrap character before the wordwrap limit. Should preference wrapCharacters in order', () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split-properly_across_anewlineandlong\nword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: {
                    wrapCharacters: ['-', '_', '/'],
                    forceWrapOnLimit: false
                }
            })).toEqual('_This_string_is_meant_to_test_if_a_string_is_split-\nproperly_across_anewlineandlong word_with_following_text.');
        });
        it('should not wrap a string that is too short', () => {
            const testString = '<p>https://github.com/werk85/node-html-to-text/blob/master/lib/html-to-text.js</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: { wrapCharacters: ['/', '-'], forceWrapOnLimit: false }
            })).toEqual('https://github.com/werk85/node-html-to-text/blob/master/lib/html-to-text.js');
        });
        it("should wrap a url string using '/'", () => {
            const testString = '<p>https://github.com/AndrewFinlay/node-html-to-text/commit/64836a5bd97294a672b24c26cb8a3ccdace41001</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: { wrapCharacters: ['/', '-'], forceWrapOnLimit: false }
            })).toEqual('https://github.com/AndrewFinlay/node-html-to-text/commit/\n64836a5bd97294a672b24c26cb8a3ccdace41001');
        });
        it("should wrap very long url strings using '/'", () => {
            const testString = '<p>https://github.com/werk85/node-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/html-to-text.js</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: { wrapCharacters: ['/', '-'], forceWrapOnLimit: false }
            })).toEqual('https://github.com/werk85/node-html-to-text/blob/master/lib/werk85/\nnode-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/\nwerk85/node-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/\nlib/html-to-text.js');
        });
        it('should wrap very long url strings using limit', () => {
            const testString = '<p>https://github.com/werk85/node-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/html-to-text.js</p>';
            expect(html_to_text_1.htmlToText(testString, {
                longWordSplit: { wrapCharacters: [], forceWrapOnLimit: true }
            })).toEqual('https://github.com/werk85/node-html-to-text/blob/master/lib/werk85/node-html-to-\ntext/blob/master/lib/werk85/node-html-to-text/blob/master/lib/werk85/node-html-t\no-text/blob/master/lib/werk85/node-html-to-text/blob/master/lib/html-to-text.js');
        });
        it('should honour preserveNewlines and split long words', () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, {
                preserveNewlines: true,
                longWordSplit: { wrapCharacters: ['/', '_'], forceWrapOnLimit: false }
            })).toEqual('_This_string_is_meant_to_test_if_a_string_is_split_properly_across_\nanewlineandlong\nword_with_following_text.');
        });
        it('should not put in extra linefeeds if the end of the untouched long string coincides with a preserved line feed', () => {
            const testString = '<p>_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.</p>';
            expect(html_to_text_1.htmlToText(testString, { preserveNewlines: true })).toEqual('_This_string_is_meant_to_test_if_a_string_is_split_properly_across_anewlineandlong\nword_with_following_text.');
        });
        it('should split long strings buried in links and hide the href', () => {
            const testString = '<a href="http://images.fb.com/2015/12/21/ivete-sangalo-launches-360-music-video-on-facebook/">http://images.fb.com/2015/12/21/ivete-sangalo-launches-360-music-video-on-facebook/</a>';
            expect(html_to_text_1.htmlToText(testString, {
                hideLinkHrefIfSameAsText: true,
                longWordSplit: { wrapCharacters: ['/', '_'], forceWrapOnLimit: false }
            })).toEqual('http://images.fb.com/2015/12/21/\nivete-sangalo-launches-360-music-video-on-facebook/');
        });
        it('should split long strings buried in links and show the href', () => {
            const testString = '<a href="http://images.fb.com/2015/12/21/ivete-sangalo-launches-360-music-video-on-facebook/">http://images.fb.com/2015/12/21/ivete-sangalo-launches-360-music-video-on-facebook/</a>';
            expect(html_to_text_1.htmlToText(testString, {
                hideLinkHrefIfSameAsText: false,
                longWordSplit: { wrapCharacters: ['/', '_'], forceWrapOnLimit: false }
            })).toEqual('http://images.fb.com/2015/12/21/\nivete-sangalo-launches-360-music-video-on-facebook/\n[http://images.fb.com/2015/12/21/\nivete-sangalo-launches-360-music-video-on-facebook/]');
        });
    });
    describe('whitespace', () => {
        it('should not be ignored inside a whitespace-only node', () => {
            const testString = 'foo<span> </span>bar';
            expect(html_to_text_1.htmlToText(testString)).toEqual('foo bar');
        });
        it('should not add additional whitespace after <sup>', () => {
            const testString = '<p>This text contains <sup>superscript</sup> text.</p>';
            const options = { preserveNewlines: true };
            expect(html_to_text_1.htmlToText(testString, options)).toEqual('This text contains superscript text.');
        });
    });
    describe('wbr', () => {
        it('should handle a large number of wbr tags w/o stack overflow', () => {
            let testString = '<!DOCTYPE html><html><head></head><body>\n';
            let expectedResult = '';
            for (var i = 0; i < 1000; i++) {
                if (i !== 0 && i % 80 === 0) {
                    expectedResult += '\n';
                }
                expectedResult += 'n';
                testString += '<wbr>n';
            }
            testString += '</body></html>';
            expect(html_to_text_1.htmlToText(testString)).toEqual(expectedResult);
        });
    });
    describe('blockquote', () => {
        it('should handle format blockquote', () => {
            const testString = 'foo<blockquote>test</blockquote>bar';
            const expectedResult = 'foo> test\nbar';
            expect(html_to_text_1.htmlToText(testString)).toEqual(expectedResult);
        });
    });
});
//# sourceMappingURL=html-to-text.test.js.map