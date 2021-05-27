/**
 * @module BgProcess
 * @submodule collections/Sources
 */
define(['backbone', 'models/Source', 'preps/indexeddb'], function (BB, Source) {

    /**
     * Collection of feed modules
     * @class Sources
     * @constructor
     * @extends Backbone.Collection
     */
    return BB.Collection.extend({
        model: Source,
        indexedDB: new Backbone.IndexedDB('sources-backbone'),
        comparator: function (a, b) {
            const t1 = (a.get('title') || '').trim().toLowerCase();
            const t2 = (b.get('title') || '').trim().toLowerCase();
            return t1.localeCompare(t2);
        }
    });
});
