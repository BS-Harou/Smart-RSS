/**
 * This method should remove all html tags.
 * Copied form underscore.string repo
 * @module App
 * @submodule helpers/stripTags
 * @param string {String} String with html to be removed
 */
define(function () {
    return function (str) {
        if (str == null) {
            return '';
        }
        return String(str).replace(/<\/?[^>]+>/g, '');
    };
});
