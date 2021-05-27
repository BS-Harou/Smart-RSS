/**
 * Escapes following characters: &, <, >, ", '
 * @module App
 * @submodule helpers/escapeHtml
 * @param string {String} String with html to be escaped
 */
define(function () {
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#39;',
        '/': '&#x2F;'
    };

    return function (str) {
        str = String(str).replace(/[&<>"']/gm, function (s) {
            return entityMap[s];
        });
        str = str.replace(/\s/, function (f) {
            if (f === ' ') {
                return ' ';
            }
            return '';
        });
        return str;
    };
});
