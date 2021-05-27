/**
 * @module App
 * @submodule models/MenuItem
 */
define(function (require) {
    const BB = require('backbone');

    /**
     * Context menu item
     * @class MenuItem
     * @constructor
     * @extends Backbone.Model
     */
    let MenuItem = BB.Model.extend({
        defaults: {

            /**
             * @attribute title
             * @type String
             * @default '<no title>'
             */
            'title': '<no title>',

            /**
             * Function to be called when user selects this item
             * @attribute action
             * @type function
             * @default null
             */
            'action': null
        }
    });

    return MenuItem;
});
