'use strict';

var extend = require('extend');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');

var requireDir = require('require-dir');
var rs = require('replacestream');
var through = require('through2');

var PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-browser-i18n-localize';

module.exports = function (options) {
    var options = extend(true, {}, {
        localesDir: '_locales',
        locales: [],
        schema: '$filename.$locale.$ext',
        direction: 'ltr',
        regexMessages: new RegExp(/__MSG_([\S]+)__/gi),
        regexMethods: new RegExp(/(?:browser|chrome)\.i18n\.([a-zA-Z]+)\(([^\)]+)?\)/gi)
    }, options);

    // load the localized messages from JSON files into a single dictionary object
    var _dictionary;
    try {
        var localesDir = path.resolve(process.cwd(), options.localesDir);
        fs.accessSync(localesDir);
        _dictionary = requireDir(localesDir, { recurse: true });
    } catch (e) {
        throw new PluginError(PLUGIN_NAME, `Locale directory ('${options.localesDir}') not found`);
    }

    var _locale;
    if (!options.locales || !options.locales.length) {
        options.locales = Object.keys(_dictionary);
    } else if (options.locales && !Array.isArray(options.locales)) {
        options.locales = [options.locales];
    }

    /**
     * Replaces calls to the i18n methods with code to simulate the original method's return
     * @param {string} match
     * @param {string} func
     * @param {string} args
     * @param {integer} offset
     * @param {string} string
     */
    function i18nMethodReplacer(match, func, args, offset, string) {
        switch (func) {
            // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n/detectLanguage
            case 'detectLanguage':
                return `new Promise( function(resolve, reject) { resolve({ isReliable: false, languages: { language: ${_locale}, percentage: 0 } }); } )`;

            // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n/getAcceptLanguages
            case 'getAcceptLanguages':
                return `new Promise( function(resolve, reject) { resolve(${_locale}); } )`;

            // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n/getMessage
            case 'getMessage':
                args = args.split(',').map(e => e.trim());
                if (args.length < 1) {
                    throw new PluginError(PLUGIN_NAME, `No argument(s) supplied to 'i18n.getMessage()'`);
                }

                var msgName = args[0];
                var subsitutions = args.slice(1);

                // ensure i18n.getMessage() was called with a string (instead of a variable)
                var regex = new RegExp(/(^\"|\'|\`)|(\"|\'|\`$)/g);
                if (regex.test(msgName)) {
                    msgName = msgName.replace(regex, '');
                } else {
                    throw new PluginError(PLUGIN_NAME, `Cannot retrieve message from variable '${msgName}'`);
                }

                var message = getMessage(msgName, _dictionary, _locale);

                if (message.indexOf('$') !== -1) {
                    throw new PluginError(PLUGIN_NAME, `Substitutions in messages are not currently supported`);

                    // this has to return code that does a search and replace on the msg.message
                    // using the substituions supplied as arguments to the original i18n.getMessage() call
                    // https://dxr.mozilla.org/mozilla-central/source/toolkit/components/extensions/ExtensionCommon.jsm#1359

                }

                // the message must be returned as a string
                //@TODO should the character used to wrap the message be configurable?
                return `"${message}"`;

            // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/i18n/getUILanguage
            case 'getUILanguage':
                return `"${_locale.split('-')[0]}"`;
        }

        // fallback to just returning the original code
        //@TODO should this throw an error instead? Maybe make the error suppressable?
        return match;
    }

    /**
     * Replaces __MSG_{msgName}__ strings with the localized string value
     * @param {string} match
     * @param {string} msgName
     * @param {integer} offset
     * @param {string} string
     */
    function i18nMSGReplacer(match, msgName, offset, string) {
        return getMessage(msgName, _dictionary, _locale);
    }

    /**
     * Returns the specified message content (with named placeholders replaced with the content)
     * @param {string} message name of the message
     * @param {object} dictionary global dictionary object
     * @param {string} locale global locale string
     */
    function getMessage(message, dictionary, locale) {
        if (/^@@/.test(message)) {
            // handle the predefined messages (they all currently start with @@)
            // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Internationalization#Predefined_messages
            switch (message) {
                case '@@ui_locale':
                    return locale;
                case '@@bidi_dir':
                    return options.direction;
                case '@@bidi_reversed_dir':
                    return options.direction === 'ltr' ? 'rtl' : 'ltr';
                case '@@bidi_start_edge':
                    return options.direction === 'ltr' ? 'left' : 'right';
                case '@@bidi_end_edge':
                    return options.direction === 'ltr' ? 'right' : 'left';
                default:
                    throw new PluginError(PLUGIN_NAME, `Message '${message}' is not supported`);
            }
        }

        if (!dictionary) {
            throw new PluginError(PLUGIN_NAME, `Missing dictionary data`);
        }

        var locale = locale.replace('-', '_');

        // generate the list of locales that will be checked
        // (https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Internationalization#Localized_string_selection)
        var locales = [locale];
        if (locale.indexOf("_") !== -1) {
            locales.push(locale.split('_')[0]);
        }

        var msg = null;
        for (var i = 0; i < locales.length; i++) {
            if (dictionary[locales[i]] && dictionary[locales[i]].messages[message]) {
                var msg = dictionary[locales[i]].messages[message];
                break;
            }
        }

        if (msg === null) {
            return "";
        }

        var str = msg.message;

        // if the message has any named placeholders, swap them out for their values
        // the values can either be indexed replacement placeholders ($1, $2, etc) OR hard-coded string values
        if (msg.placeholders) {
            for (var placeholder in msg.placeholders) {
                str = str.replace(`$${placeholder.toUpperCase()}$`, msg.placeholders[placeholder].content);
            }
        }

        return str;
    }

    return through.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        var locales = options.locales.slice(0);
        var newFile;
        while (locales.length) {
            _locale = locales.shift();
            newFile = file.clone();

            if (options.schema) {
                var newPath = options.schema
                    .replace('$locale', _locale)
                    .replace('$filename', path.basename(newFile.path, path.extname(newFile.path)))
                    .replace('$ext', path.extname(newFile.path).replace(/(^\.)/, ''));
                newFile.path = path.join(newFile.base, newPath);
            }

            try {
                if (newFile.isStream()) {
                    newFile.contents = newFile.contents
                        .pipe(rs(options.regexMessages, i18nMSGReplacer))
                        .pipe(rs(options.regexMethods, i18nMethodReplacer));
                } else if (newFile.isBuffer()) {
                    newFile.contents = new Buffer(String(newFile.contents)
                        .replace(options.regexMessages, i18nMSGReplacer)
                        .replace(options.regexMethods, i18nMethodReplacer));
                }
            } catch (e) {
                return callback(new PluginError(PLUGIN_NAME, e));
            }

            this.push(newFile);
        }
        return callback();
    });

}
