'use strict';

var localize = require('../');

var concatStream = require('concat-stream');
var fs = require('fs');
var should = require('should');
var File = require('vinyl');
var Path = require('path');

let testLocalesDir = 'test/_locales';


describe('gulp-browser-i18n-localize', function () {

    describe('buffered input', function () {
        var check, file;

        beforeEach(function () {
            check = function (stream, done, cb) {
                stream.on('data', function (newFile) {
                    cb(newFile);
                });

                stream.on('finish', function () {
                    done();
                });

                stream.write(file);
                stream.end();
            };

        });

        it('should replace getMessage() with strings using en-US locale', function (done) {
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: ['en-US']
            });

            file = new File({
                path: 'test/cases/getMessage.js',
                contents: fs.readFileSync('test/cases/getMessage.js')
            });

            check(localizer, done, function (newFile) {
                String(newFile.path).should.equal(Path.resolve(__dirname + '/../getMessage.en-US.js'));
                String(newFile.contents).should.equal(fs.readFileSync('test/expected/getMessage.js', 'utf8'));
            });
        });

        it('should replace getMessage() with strings using en-GB locale', function (done) {
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: ['en-GB']
            });

            file = new File({
                path: 'test/cases/getMessage.js',
                contents: fs.readFileSync('test/cases/getMessage.locale.js')
            });

            check(localizer, done, function (newFile) {
                String(newFile.path).should.equal(Path.resolve(__dirname + '/../getMessage.en-GB.js'));
                String(newFile.contents).should.equal(fs.readFileSync('test/expected/getMessage.en-GB.js', 'utf8'));
            });
        });

        it('should replace getMessage() with strings using en-US, en-GB, and fr locales', function (done) {
            var locales = ['en-US', 'en-GB', 'fr'];
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: locales
            });

            file = new File({
                path: 'test/cases/getMessage.js',
                contents: fs.readFileSync('test/cases/getMessage.locale.js')
            });

            var i = 0;
            check(localizer, done, function (newFile) {
                String(newFile.path).should.equal(Path.resolve(__dirname + '/../getMessage.' + locales[i] + '.js'));
                String(newFile.contents).should.equal(fs.readFileSync('test/expected/getMessage.' + locales[i] + '.js', 'utf8'));
                i++;
            });
        });

        it('should replace predefined __MSG_*__ locale and bidi placeholders for English', function (done) {
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: ['en'],
                direction: "ltr"
            });

            file = new File({
                path: 'test/cases/bidi.css',
                contents: fs.readFileSync('test/cases/bidi.css')
            });

            check(localizer, done, function (newFile) {
                String(newFile.path).should.equal(Path.resolve(__dirname + '/../bidi.en.css'));
                String(newFile.contents).should.equal(fs.readFileSync('test/expected/bidi.en.css', 'utf8'));
            });
        });

        it('should replace predefined __MSG_*__ locale and bidi placeholders for Hebrew', function (done) {
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: ['iw'],
                direction: "rtl"
            });

            file = new File({
                path: 'test/cases/bidi.css',
                contents: fs.readFileSync('test/cases/bidi.css')
            });

            check(localizer, done, function (newFile) {
                String(newFile.path).should.equal(Path.resolve(__dirname + '/../bidi.iw.css'));
                String(newFile.contents).should.equal(fs.readFileSync('test/expected/bidi.iw.css', 'utf8'));
            });
        });

    });

    describe('streamed input', function () {
        var check, file;

        beforeEach(function () {
            check = function (stream, done, cb) {
                stream.on('data', function (newFile) {
                    cb(newFile);
                });

                stream.on('finish', function () {
                    done();
                });

                stream.write(file);
                stream.end();
            };
        });

        it('should replace getMessage() with strings', function (done) {
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: ['en-US']
            });

            file = new File({
                base: 'test/cases/',
                path: 'test/cases/getMessage.js',
                contents: fs.createReadStream('test/cases/getMessage.js')
            });

            check(localizer, done, function (newFile) {
                newFile.contents.pipe(concatStream({ encoding: 'string' }, function (data) {
                    newFile.path.should.equal(Path.normalize('test/cases/getMessage.en-US.js'));
                    data.should.equal(fs.readFileSync('test/expected/getMessage.en-US.js', 'utf8'));
                }));
            });
        });

        it('should replace getMessage() with strings using en-GB locale', function (done) {
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: ['en-GB']
            });

            file = new File({
                base: 'test/cases/',
                path: 'test/cases/getMessage.js',
                contents: fs.createReadStream('test/cases/getMessage.locale.js')
            });

            check(localizer, done, function (newFile) {
                newFile.contents.pipe(concatStream({ encoding: 'string' }, function (data) {
                    newFile.path.should.equal(Path.normalize('test/cases/getMessage.en-GB.js'));
                    data.should.equal(fs.readFileSync('test/expected/getMessage.en-GB.js', 'utf8'));
                }));
            });
        });

        it('should replace getMessage() with strings using en-US, en-GB, and fr locales', function (done) {
            var locales = ['en-US', 'en-GB', 'fr'];
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: locales
            });

            file = new File({
                base: 'test/cases/',
                path: 'test/cases/getMessage.js',
                contents: fs.createReadStream('test/cases/getMessage.locale.js')
            });

            var i = 0;
            check(localizer, done, function (newFile) {
                newFile.contents.pipe(concatStream({ encoding: 'string' }, function (data) {
                    newFile.path.should.equal(Path.normalize('test/cases/getMessage.' + locales[i] + '.js'));
                    data.should.equal(fs.readFileSync('test/expected/getMessage.' + locales[i] + '.js', 'utf8'));
                    i++;
                }));
            });
        });

        it('should replace predefined __MSG_*__ locale and bidi placeholders for English', function (done) {
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: ['en'],
                direction: "ltr"
            });

            file = new File({
                base: 'test/cases/',
                path: 'test/cases/bidi.css',
                contents: fs.createReadStream('test/cases/bidi.css')
            });

            check(localizer, done, function (newFile) {
                newFile.contents.pipe(concatStream({ encoding: 'string' }, function (data) {
                    newFile.path.should.equal(Path.normalize('test/cases/bidi.en.css'));
                    data.should.equal(fs.readFileSync('test/expected/bidi.en.css', 'utf8'));
                }));
            });
        });

        it('should replace predefined __MSG_*__ locale and bidi placeholders for Hebrew', function (done) {
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: ['iw'],
                direction: "rtl"
            });

            file = new File({
                base: 'test/cases/',
                path: 'test/cases/bidi.css',
                contents: fs.createReadStream('test/cases/bidi.css')
            });

            check(localizer, done, function (newFile) {
                newFile.contents.pipe(concatStream({ encoding: 'string' }, function (data) {
                    newFile.path.should.equal(Path.normalize('test/cases/bidi.iw.css'));
                    data.should.equal(fs.readFileSync('test/expected/bidi.iw.css', 'utf8'));
                }));    
            });
        });

    });

});