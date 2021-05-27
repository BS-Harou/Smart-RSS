/**
 * Returns formatted date string
 * @module App
 * @submodule helpers/formatDate
 * @param date {Number|Date} Date to be formatted
 * @param formatString {String} String consisting of special characters
 * @example formatDate(new Date, 'YYYY-MM-DD hh:mm');
 */
define(function (require) {
    let _date;
    const zeroPad = function (num) {
        if (num < 10) {
            num = '0' + num;
        }
        return num;
    };
    const toTwelveHoursFormat = function (n, z) {
        return n % z;
    };

    const getWOY = require('helpers/getWOY');

    const getDOY = function () {
        const dt = new Date(_date);
        dt.setHours(0, 0, 0);
        const start = new Date(dt.getFullYear(), 0, 0);
        const diff = (dt - start) + ((start.getTimezoneOffset() - dt.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    };

    const dateVal = function (all, found) {
        switch (found) {
            case 'DD':
                return zeroPad(_date.getDate());
            case 'D':
                return _date.getDate();
            case 'MM':
                return zeroPad(_date.getMonth() + 1);
            case 'M':
                return _date.getMonth() + 1;
            case 'YYYY':
                return _date.getFullYear();
            case 'YY':
                return _date.getFullYear().toString().substr(2, 2);
            case 'hh':
                return zeroPad(_date.getHours());
            case 'h':
                return _date.getHours();
            case 'HH':
                return zeroPad(toTwelveHoursFormat(_date.getHours(), 12));
            case 'H':
                return toTwelveHoursFormat(_date.getHours(), 12);
            case 'mm':
                return zeroPad(_date.getMinutes());
            case 'm':
                return _date.getMinutes();
            case 'ss':
                return zeroPad(_date.getSeconds());
            case 's':
                return _date.getSeconds();
            case 'u':
                return _date.getMilliseconds();
            case 'U':
                return _date.getTime();
            case 'T':
                return _date.getTime() - _date.getTimezoneOffset() * 60000;
            case 'W':
                return _date.getDay();
            case 'y':
                return getDOY();
            case 'w':
                return getWOY();
            case 'G':
                return _date.getTimezoneOffset();
            case 'a':
                return _date.getHours() > 12 ? 'PM' : 'AM';
            default:
                return '';
        }
    };

    return function (date, str) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        _date = date;
        str = str.replace(/(DD|D|MM|M|YYYY|YY|hh|h|HH|H|mm|m|ss|s|u|U|W|y|w|G|a|T)/g, dateVal);
        return str;
    };
});
