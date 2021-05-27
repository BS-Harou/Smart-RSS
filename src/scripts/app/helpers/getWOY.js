/**
 * Get week of year
 * @module App
 * @submodule helpers/getWOY
 * @param date {string|Date} Get the week based on this date
 */
define(function () {
    return function (date) {
        const d = new Date(date);
        const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = d.getUTCDay() || 7;
        dt.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
        return Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
    };
});
