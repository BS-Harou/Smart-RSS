/**
 * @module App
 * @submodule models/Special
 */
define(function (require) {
    const BB = require('backbone');
    /**
     * Model for special items in feed list like all-feeds, pinned and trash
     * @class Special
     * @constructor
     * @extends Backbone.Model
     */
    let Special = BB.Model.extend({
        defaults: {
            /**
             * Visible title of special. Chnages with localization.
             * @attribute title
             * @type String
             * @default All feeds
             */
            title: 'All feeds',

            /**
             * @attribute icon
             * @type String
             * @default icon16_v2.png
             */
            icon: 'icon16_v2.png',

            /**
             * Name of the special. It is always the same for one special.
             * @attribute name
             * @type String
             * @default ''
             */
            name: '',

            /**
             * Filter used in 'where' function of items collection
             * @attribute filter
             * @type Object
             * @default {}
             * @example { unread: true, trashed: false }
             */
            filter: {},

            /**
             * Should the special be above or below feed sources?
             * @attribute position
             * @type String
             * @default top
             */
            position: 'top',

            /**
             * Function to be called when specials view is initialized
             * @attribute onReady
             * @type function
             * @default null
             */
            onReady: null
        }
    });

    return Special;
});
