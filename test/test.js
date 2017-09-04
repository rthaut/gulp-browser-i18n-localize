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

        it('should replace getMessage() with strings', function (done) {
            var localizer = localize({
                localesDir: testLocalesDir,
                locales: ['en-US']
            });

            file = new File({
                path: 'test/cases/getMessage.js',
                contents: fs.readFileSync('test/cases/getMessage.js')
            });

            check(localizer, done, function (newFile) {
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
                String(newFile.path).should.equal(Path.resolve(__dirname + '/../localized/' + locales[i] + '/getMessage.js'));
                String(newFile.contents).should.equal(fs.readFileSync('test/expected/getMessage.' + locales[i] + '.js', 'utf8'));
                i++;
            });
        });

    });

    describe('streamed input', function () {
        var check, file;

        beforeEach(function () {
            check = function (stream, done, cb) {
                stream.on('data', function (newFile) {
                    newFile.contents.pipe(concatStream({ encoding: 'string' }, function (data) {
                        cb(data);
                    }));
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

            check(localizer, done, function (data) {
                data.should.equal(fs.readFileSync('test/expected/getMessage.js', 'utf8'));
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

            check(localizer, done, function (data) {
                data.should.equal(fs.readFileSync('test/expected/getMessage.en-GB.js', 'utf8'));
            });
        });

        //@TODO does it make sense to check file names for streams? if so, this needs a different solution
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
                data.should.equal(fs.readFileSync('test/expected/getMessage.' + locales[i] + '.js', 'utf8'));
                i++;
            });
        });

    });

});