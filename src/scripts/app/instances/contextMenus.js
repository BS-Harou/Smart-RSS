define(function (require) {
    const BB = require('backbone');
    const ContextMenu = require('views/ContextMenu');
    const Locale = require('modules/Locale');

    const sourceContextMenu = new ContextMenu([
        {
            title: Locale.UPDATE,
            icon: 'reload.png',
            action: function () {
                app.actions.execute('feeds:update');
            }
        },
        {
            title: Locale.MARK_ALL_AS_READ,
            icon: 'read.png',
            action: function () {
                app.actions.execute('feeds:mark');
            }
        },
        {
            title: Locale.DELETE,
            icon: 'delete.png',
            action: function () {
                app.actions.execute('feeds:delete');
            }
        },
        {
            title: Locale.REFETCH, /**** Localization needed****/
            icon: 'save.png',
            action: function () {
                app.actions.execute('feeds:refetch');
            }
        },
        {
            title: Locale.OPENHOME,
            action: function () {
                app.actions.execute('feeds:openHome');
            }
        },
        {
            title: Locale.PROPERTIES,
            icon: 'properties.png',
            action: function () {
                app.actions.execute('feeds:showProperties');
            }
        }
    ]);

    const trashContextMenu = new ContextMenu([
        {
            title: Locale.MARK_ALL_AS_READ,
            icon: 'read.png',
            action: function () {
                bg.items.where({trashed: true, deleted: false}).forEach(function (item) {
                    if (item.get('unread') === true) {
                        item.save({
                            unread: false,
                            visited: true
                        });
                    }
                });
            }
        },
        {
            title: Locale.EMPTY_TRASH,
            icon: 'delete.png',
            action: function () {
                if (confirm(Locale.REALLY_EMPTY_TRASH)) {
                    bg.items.where({trashed: true, deleted: false}).forEach(function (item) {
                        item.markAsDeleted();
                    });
                }
            }
        }
    ]);

    const allFeedsContextMenu = new ContextMenu([
        {
            title: Locale.UPDATE_ALL,
            icon: 'reload.png',
            action: function () {
                app.actions.execute('feeds:updateAll');
            }
        },
        {
            title: Locale.MARK_ALL_AS_READ,
            icon: 'read.png',
            action: function () {
                if (confirm(Locale.MARK_ALL_QUESTION)) {
                    bg.items.forEach(function (item) {
                        item.save({unread: false, visited: true});
                    });
                }
            }
        },
        {
            title: Locale.DELETE_ALL_ARTICLES,
            icon: 'delete.png',
            action: function () {
                if (confirm(Locale.DELETE_ALL_Q)) {
                    bg.items.forEach(function (item) {
                        if (item.get('deleted') === true) {
                            return;
                        }
                        item.markAsDeleted();
                    });
                }
            }
        }
    ]);

    const folderContextMenu = new ContextMenu([
        {
            title: Locale.UPDATE,
            icon: 'reload.png',
            action: function () {
                app.actions.execute('feeds:update');
            }
        },
        {
            title: Locale.MARK_ALL_AS_READ,
            icon: 'read.png',
            action: function () {
                app.actions.execute('feeds:mark');
            }
        },
        {
            title: Locale.DELETE,
            icon: 'delete.png',
            action: function () {
                app.actions.execute('feeds:delete');
            }
        },
        {
            title: Locale.PROPERTIES,
            icon: 'properties.png',
            action: function () {
                app.actions.execute('feeds:showProperties');
            }
        }
    ]);

    const itemsContextMenu = new ContextMenu([
        {
            title: Locale.NEXT_UNREAD + ' (H)',
            icon: 'forward.png',
            action: function () {
                app.actions.execute('articles:nextUnread');
            }
        },
        {
            title: Locale.PREV_UNREAD + ' (Y)',
            icon: 'back.png',
            action: function () {
                app.actions.execute('articles:prevUnread');
            }
        },
        {
            title: Locale.MARK_AS_READ + ' (K)',
            icon: 'read.png',
            action: function () {
                app.actions.execute('articles:mark');
            }
        },
        {
            title: Locale.MARK_AND_NEXT_UNREAD + ' (G)',
            icon: 'find_next.png',
            action: function () {
                app.actions.execute('articles:markAndNextUnread');
            }
        },
        {
            title: Locale.MARK_AND_PREV_UNREAD + ' (T)',
            icon: 'find_previous.png',
            action: function () {
                app.actions.execute('articles:markAndPrevUnread');
            }
        },
        {
            title: Locale.FULL_ARTICLE,
            icon: 'full_article.png',
            action: function (e) {
                app.actions.execute('articles:fullArticle', e);
            }
        },
        {
            title: Locale.PIN + ' (P)',
            icon: 'pinsource_context.png',
            action: function () {
                app.actions.execute('articles:pin');
            }
        },
        {
            title: Locale.DELETE + ' (D)',
            icon: 'delete.png',
            action: function (e) {
                app.actions.execute('articles:delete', e);
            }
        },
        {
            title: Locale.UNDELETE + ' (N)',
            id: 'context-undelete',
            icon: 'undelete.png',
            action: function () {
                app.actions.execute('articles:undelete');
            }
        }
    ]);

    return new (BB.View.extend({
        list: {},
        initialize: function () {
            this.list = {
                source: sourceContextMenu,
                trash: trashContextMenu,
                folder: folderContextMenu,
                allFeeds: allFeedsContextMenu,
                items: itemsContextMenu
            };
        },
        get: function (name) {
            if (name in this.list) {
                return this.list[name];
            }
            return null;
        }
    }));
});
