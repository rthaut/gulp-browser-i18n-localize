# gulp-browser-i18n-localize [![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url]

[![Greenkeeper badge](https://badges.greenkeeper.io/rthaut/gulp-browser-i18n-localize.svg)](https://greenkeeper.io/)

> A gulp plugin that hardcodes localized messages into files that utilize browser internationalization APIs (`browser.i18n.*` / `chrome.i18n.*`).

## Why?

This gulp plugin was originally written to help convert browser web extensions into legacy userscripts. Proper web extensions support translations, which is easy enough to do with the browser APIs, but those APIs are not available to userscripts. Using this plugin, a web extension with translations can be built into a userscript (or a series of userscripts, for all supported locales) where the API functionality is replaced with the hard-coded translations for each locale.

## Usage

First, install `gulp-browser-i18n-localize` as a development dependency:

```shell
npm install --save-dev gulp-browser-i18n-localize
```

Then, add it to your `gulpfile.js`:

### Basic Configuration

```javascript
var localize = require('gulp-browser-i18n-localize');

gulp.task('templates', function(){
  gulp.src(['file.js'])
    .pipe(localize())
    .pipe(gulp.dest('dist/'));
});
```

### Options

#### localesDir

Type: string

Default: `_locales`

Description: Specifies the path to the root directory for the locales (this path should end in `_locales`), since that is the convention specified for Web Extensions (see [Providing localized strings in \_locales on MDN](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Internationalization#Providing_localized_strings_in__locales)).

#### locales

Type: array

Default: `[]`

Description: Specifies the locales to use. When empty, all available locales (from the \_locales directory) are used.

#### schema

Type: string

Default: `$filename.$locale.$ext`

Description: Specifies the naming schema used for the localized files in the stream/buffer. The default schema inserts the locale name used just before the extension (i.e. `myfile`**`.en-US`**`.js`). To disable renaming, set `schema` to `false`. Note that you should NOT disable renaming if you are using multiple locales, as you will not be able to write out all of the files at the end of your task (since they will all have the same name).

**NOTE**: Empty files are not renamed in the stream/buffer.

| Placeholder   | Description   | Example Value |
| ------------- | ------------- | ------------- |
| $filename | This is the original file name, minus path and extension     | `myfile` |
| $locale   | This is the locale used during processing                    | `en-US`  |
| $ext      | This is the original file's extension (minus leading period) | `js`     |

You could use `/$locale/$filename.$ext` to place all translated files into sub-directories corresponding to their locale.

#### direction

Type: string

Default: `ltr`

Description: Specifies the BIDI direction string to be inserted wherever BIDI methods/messages are used.

#### regexMessages

Type: RegExp

Default: `/__MSG_([\S]+)__/gi`

Description: Specifies the regular expression used to find `__MSG_ + messageName + __` strings. This regular expression should include one capture group that will contain the actual message name.

#### regexMethods

Type: RegExp

Default: `/(?:browser|chrome)\.i18n\.([a-zA-Z]+)\(([^\)]+)?\)/gi`

Description: Specifies the regular expression used to find `browser.i18n.*` and `chrome.i18n.*` methods. This regular expression should include two capture groups: one for the method name, and one for the (optional) arguments supplied to the method.

[travis-url]: http://travis-ci.org/rthaut/gulp-browser-i18n-localize
[travis-image]: https://secure.travis-ci.org/rthaut/gulp-browser-i18n-localize.svg?branch=master
[npm-url]: https://npmjs.org/package/gulp-browser-i18n-localize
[npm-image]: https://badge.fury.io/js/gulp-browser-i18n-localize.svg
