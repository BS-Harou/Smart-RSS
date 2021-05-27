/**
 * @module App
 * @submodule collections/Groups
 */
define(function (require) {
    const BB = require('backbone');
    const Group = require('models/Group');

    /**
     * Collection of date groups
     * @class Groups
     * @constructor
     * @extends Backbone.Collection
     */
    const Groups = BB.Collection.extend({
        model: Group
    });

    return Groups;
});
