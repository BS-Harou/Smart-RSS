define(function (require) {
    const Special = require('models/Special');
    const contextMenus = require('instances/contextMenus');
    const Locale = require('modules/Locale');
    return {
        trash: new Special({
            title: Locale.TRASH,
            icon: 'trashsource.png',
            filter: {trashed: true, deleted: false},
            position: 'bottom',
            name: 'trash',
            onReady: function () {
                this.contextMenu = contextMenus.get('trash');
            }
        }),
        allFeeds: new Special({
            title: Locale.ALL_FEEDS,
            icon: 'icon16_v2.png',
            filter: {trashed: false},
            position: 'top',
            name: 'all-feeds',
            onReady: function () {
                this.contextMenu = contextMenus.get('allFeeds');
            }
        }),
        pinned: new Special({
            title: Locale.PINNED,
            icon: 'pinsource.png',
            filter: {trashed: false, pinned: true},
            position: 'bottom',
            name: 'pinned'
        })
    };
});
