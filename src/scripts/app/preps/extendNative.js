/**
 * Extends prototypes of native objects with various methods.
 * Removes prefixes for some nonstandard functions.
 * @module App
 * @submodule preps/extendNative
 */
define([], function () {

    /**
     * Escapes regexp characters in string
     * @method escape
     * @extends RegExp
     * @static
     * @param text {String} String to be escaped
     * @return {String} Escaped string
     */
    RegExp.escape = function (text) {
        return String(text).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    };
});