/**
 * @module App
 * @submodule views/GroupView
 */
define(['backbone'], function (BB) {

    /**
     * View for Date Groups in list of articles
     * @class GroupView
     * @constructor
     * @extends Backbone.View
     */
    let GroupView = BB.View.extend({

        /**
         * Tag name of date group element
         * @property tagName
         * @default 'div'
         * @type String
         */
        tagName: 'div',

        /**
         * Class name of date group element
         * @property className
         * @default 'date-group'
         * @type String
         */
        className: 'date-group',

        /**
         * Initializations (*constructor*)
         * @method initialize
         * @param model {models/Group} Date group model
         * @param groups {Backbone.View} Reference to collection of groups
         */
        initialize: function (model, groups) {
            this.el.view = this;
            this.listenTo(groups, 'reset', this.handleReset);
            this.listenTo(groups, 'remove', this.handleRemove);
        },

        /**
         * Renders date group view
         * @method render
         */
        render: function () {
            this.el.textContent = this.model.get('title');
            return this;
        },

        /**
         * If date group model is removed from collection of groups remove the DOM object
         * @method handleRemove
         * @triggered when any date group is removed from list of groups
         * @param model {models/Group} Model removed from list of groups
         */
        handleRemove: function (model) {
            if (model === this.model) {
                this.handleReset();
            }
        },

        /**
         * If the reset model (that removes all models from collection) is called, removed DOM object of this date group
         * and stop listening to any events of group collection.
         * @method handleRemove
         * @triggered when on reset
         * @param model {models/Group} Model removed from list of groups
         */
        handleReset: function () {
            this.stopListening();
            this.el.parentNode.removeChild(this.el);
        }
    });

    return GroupView;
});