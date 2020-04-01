"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const exec = require('child_process').exec;
function runWithInputAndExpect(input, args, expectedOutput, done) {
    exec('echo "' + input.replace(/"/g, '\\"') + '" | ts-node src/cli.ts ' + args, function callback(error, stdout, stderr) {
        expect(error).toBeNull();
        expect(stderr).toEqual('');
        expect(stdout).toEqual(expectedOutput + '\n');
        done(error);
    });
}
describe('cli arguments', () => {
    it('should output nothing with empty input', (done) => {
        runWithInputAndExpect('', '', '', done);
    });
    it('should not ignore images by default', (done) => {
        runWithInputAndExpect('Hello <img alt="alt text" src="http://my.img/here.jpg">!', '', 'Hello alt text [http://my.img/here.jpg]!', done);
    });
    it('should ignore images with --ignore-image=true', (done) => {
        runWithInputAndExpect('Hello <img alt="alt text" src="http://my.img/here.jpg">!', '--ignore-image=true', 'Hello !', done);
    });
    it('should not ignore href by default', (done) => {
        runWithInputAndExpect('<a href="http://my.link">test</a>', '', 'test [http://my.link]', done);
    });
    it('should ignore href with --ignore-href=true', (done) => {
        runWithInputAndExpect('<a href="http://my.link">test</a>', '--ignore-href=true', 'test', done);
    });
    it('should wordwrap at 80 characters by default', (done) => {
        runWithInputAndExpect(' 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789', '', ' 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789\n123456789', done);
    });
    it('should wordwrap at 40 with --wordwrap=40', function (done) {
        runWithInputAndExpect(' 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789', '--wordwrap=40', ' 123456789 123456789 123456789 123456789\n123456789 123456789 123456789 123456789\n123456789', done);
    });
    it('should return link with brackets by default', function (done) {
        runWithInputAndExpect('<a href="http://my.link">test</a>', '', 'test [http://my.link]', done);
    });
    it('should return link without brackets with --noLinkBrackets=true', function (done) {
        runWithInputAndExpect('<a href="http://my.link">test</a>', '--noLinkBrackets=true', 'test http://my.link', done);
    });
    it('should support --tables definitions with commas', function (done) {
        const expectedTxt = fs.readFileSync(path.join(__dirname, 'test.txt'), 'utf8');
        function runWithArgs(args, callback) {
            exec(`cat ${path.join(__dirname, 'test.html')} | ts-node src/cli.ts ` + args, callback);
        }
        runWithArgs('--tables=#invoice,.address', function callback(error, stdout, stderr) {
            expect(error).toBeNull();
            expect(stderr).toEqual('');
            expect(stdout).toEqual(expectedTxt + '\n');
            done(error);
        });
    });
});
//# sourceMappingURL=test-cli.js.map