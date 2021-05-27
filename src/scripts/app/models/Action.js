/**
 * @module App
 * @submodule models/Action
 */
define(function (require) {
    const BB = require('backbone');

    /**
     * Executable action. Actions are usually executed by shorcuts, buttons or context menus.
     * @class Action
     * @constructor
     * @extends Backbone.Model
     */
    let Action = BB.Model.extend({
        /**
         * @property idAttribute
         * @type String
         * @default name
         */
        idAttribute: 'name',
        defaults: {
            /**
             * @attribute name
             * @type String
             * @default global:default
             */
            name: 'global:default',

            /**
             * Function to be called when action is executed
             * @attribute fn
             * @type function
             */
            fn: function () {
                return function () {
                };
            },

            /**
             * @attribute icon
             * @type String
             * @default unknown.png
             */
            icon: 'unknown.png',

            /**
             * @attribute title
             * @type String
             * @default ''
             */
            title: ''
        }
    });

    return Action;
});
