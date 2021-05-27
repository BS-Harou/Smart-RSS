/**
 * @module App
 * @submodule models/Group
 */
define(['backbone', 'helpers/unixutc', 'helpers/getWOY', 'modules/Locale'], function (BB, unixutc, getWOY, Locale) {

    /**
     * Date group model
     * @class Group
     * @constructor
     * @extends Backbone.Model
     */
    let Group = BB.Model.extend({
        defaults: {
            /**
             * Title of the date group (Today, Yesterday, 2012, ...)
             * @attribute title
             * @type String
             * @default '<no title>'
             */
            title: '<no title>',

            /**
             * End date of date group (yesterdays date is midnight between yesterday and today) in unix time
             * @attribute date
             * @type Integer
             * @default 0
             */
            date: 0
        },
        idAttribute: 'date'
    });

    /**
     * Gets date group attributes of given date
     * @method getGroup
     * @static
     * @param date {Integer|Date}
     * @return {Object} Object contaning title & date attributes
     */
    Group.getGroup = (function () {
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        let currentDate = null;
        let todayMidnight = null;
        let dct = null;


        return function (date) {
            const dt = new Date(date);
            currentDate = currentDate || new Date();

            const dtt = parseInt(unixutc(dt) / 86400000, 10);
            dct = dct || parseInt(unixutc(currentDate) / 86400000, 10);

            if (!todayMidnight) {
                todayMidnight = new Date(currentDate);
                todayMidnight.setHours(0, 0, 0, 0);
                setTimeout(function () {
                    todayMidnight = null;
                    currentDate = null;
                    dct = null;
                }, 10000);
            }

            const itemMidnight = new Date(dt);
            itemMidnight.setHours(0, 0, 0, 0);

            let group;
            let dtwoy;
            let dcwoy;

            if (dtt >= dct) {
                group = {
                    title: Locale.TODAY.toUpperCase(),
                    date: todayMidnight.getTime() + 86400000 * 5000 // 5000 = make sure "today" is the first element in list
                };
            } else if (dtt + 1 === dct) {
                group = {
                    title: Locale.YESTERDAY.toUpperCase(),
                    date: todayMidnight.getTime()
                };
            } else if ((dtwoy = getWOY(dt)) === (dcwoy = getWOY(currentDate)) && dtt + 7 >= dct) {
                group = {
                    title: Locale[days[dt.getDay()]].toUpperCase(),
                    date: itemMidnight.getTime() + 86400000
                };
            } else if (dtwoy + 1 === dcwoy && dtt + 14 >= dct) {
                group = {
                    title: Locale.LAST_WEEK.toUpperCase(),
                    date: todayMidnight.getTime() - 86400000 * (((todayMidnight.getDay() || 7) - 1) || 1)
                };
            } else if (dt.getMonth() === currentDate.getMonth() && dt.getFullYear() === currentDate.getFullYear()) {
                group = {
                    title: Locale.EARLIER_THIS_MONTH.toUpperCase(),
                    date: todayMidnight.getTime() - 86400000 * ((todayMidnight.getDay() || 7) - 1) - 7 * 86400000
                };
            } else if (dt.getFullYear() === currentDate.getFullYear()) {
                group = {
                    title: Locale[months[dt.getMonth()]].toUpperCase(),
                    date: (new Date(dt.getFullYear(), dt.getMonth() + 1, 1)).getTime()
                };
            } else {
                group = {
                    title: dt.getFullYear(),
                    date: (new Date(dt.getFullYear() + 1, 0, 1)).getTime()
                };
            }
            return group;
        };
    })();

    return Group;
});