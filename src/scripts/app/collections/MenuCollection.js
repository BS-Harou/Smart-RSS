/**
 * @module App
 * @submodule collections/MenuCollection
 */
define(function (require) {
    const BB = require('backbone');
    const MenuItem = require('models/MenuItem');
    /**
     * Each ContextMenu has its own MenuCollection instance
     * @class MenuCollection
     * @constructor
     * @extends Backbone.Collection
     */
    const MenuCollection = BB.Collection.extend({
        model: MenuItem
    });

    return MenuCollection;
});
