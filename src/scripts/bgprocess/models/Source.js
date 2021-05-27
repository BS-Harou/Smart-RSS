/**
 * @module BgProcess
 * @submodule models/Source
 */
define(['backbone'], function (BB) {

    /**
     * Feed module
     * @class Source
     * @constructor
     * @extends Backbone.Model
     */
    let Source = BB.Model.extend({
        defaults: {
            title: '',
            url: '',
            base: '',
            updateEvery: -1, // in minutes, -1 to use global default
            lastChecked: 0,
            lastUpdate: 0,
            count: 0, // unread
            countAll: 0,
            username: '',
            password: '',
            hasNew: false,
            isLoading: false,
            autoremove: -1, // in days
            autoremovesetting: 'USE_GLOBAL',
            proxyThroughFeedly: false,
            favicon: '/images/feed.png',
            faviconExpires: 0,
            errorCount: 0,
            lastArticle: 0,
            uid: '',
            openEnclosure: 'global',
            folderID: '0',
        },

        initialize: function () {
            this.set('isLoading', false);
        },

        getPass: function () {
            const str = this.get('password');
            if (str.indexOf('enc:') !== 0) {
                return str;
            }

            let dec = '';
            for (let i = 4; i < str.length; i++) {
                dec += String.fromCharCode(str.charCodeAt(i) - 13);
            }
            return dec;
        },
        setPass: function (str) {
            if (!str) {
                this.save('password', '');
                return;
            }

            let enc = 'enc:';
            for (let i = 0; i < str.length; i++) {
                enc += String.fromCharCode(str.charCodeAt(i) + 13);
            }
            this.set('password', enc);
        }

    });

    return Source;
});
