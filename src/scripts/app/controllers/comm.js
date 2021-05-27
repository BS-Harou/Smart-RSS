/**
 * Application messages. Returns instance of Backbone.Events.
 * @module App
 * @submodule controllers/comm
 */
define(function (require) {
    const BB = require('backbone');
    return Object.create(BB.Events);
});
