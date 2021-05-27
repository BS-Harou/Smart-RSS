/**
 * @module BgProcess
 * @submodule collections/Items
 */
define(['backbone', 'models/Item', 'preps/indexeddb'], function (BB, Item) {

    function getS(val) {
        return String(val).toLowerCase();
    }

    /**
     * Collection of feed modules
     * @class Items
     * @constructor
     * @extends Backbone.Collection
     */
    let Items = BB.Collection.extend({
        model: Item,
        batch: false,
        indexedDB: new Backbone.IndexedDB('items-backbone'),
        spaceship: function spaceship(val1, val2) {
            if ((val1 === null || val2 === null) || (typeof val1 !== typeof val2)) {
                return null;
            }
            if (typeof val1 === 'string') {
                return (val1).localeCompare(val2);
            } else {
                if (val1 > val2) {
                    return 1;
                } else if (val1 < val2) {
                    return -1;
                }
                return 0;
            }
        },
        comparator: function (a, b, sorting) {
            const sortBy = sorting ? settings.get('sortBy2') : settings.get('sortBy');
            const sortOrder = sorting ? settings.get('sortOrder2') : settings.get('sortOrder');

            const aVal = getS(a.get(sortBy));
            const bVal = getS(b.get(sortBy));

            const val = this.spaceship(aVal, bVal);

            if (val === 0) {
                return sorting ? 0 :  this.comparator(a, b, true);
            }

            if (sortOrder === 'desc') {
                return -val;
            }
            return val;

        },
        initialize: function () {
            this.listenTo(settings, 'change:sortOrder', this.sort);
            this.listenTo(settings, 'change:sortOrder2', this.sort);
            this.listenTo(settings, 'change:sortBy', this.sort);
            this.listenTo(settings, 'change:sortBy2', this.sort);
        }
    });


    return Items;

});
