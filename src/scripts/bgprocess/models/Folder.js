/**
 * @module BgProcess
 * @submodule models/Folder
 */
define(['backbone'], function (BB) {

    /**
     * Model for feed folders
     * @class Folder
     * @constructor
     * @extends Backbone.Model
     */
    return BB.Model.extend({
        defaults: {
            title: '<no title>',
            opened: false,
            count: 0, // unread
            countAll: 0
        }
    });
});