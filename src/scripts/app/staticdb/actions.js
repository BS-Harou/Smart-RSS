define(['helpers/stripTags', 'modules/Locale', 'controllers/comm'], function (stripTags, Locale, comm) {
    return {
        global: {
            default: {
                title: 'Unknown',
                fn: function () {
                    alert('no action');
                }
            },
            hideOverlays: {
                title: 'Hide Overlays',
                fn: function () {
                    comm.trigger('hide-overlays');
                }
            },
            openOptions: {
                title: 'Options',
                icon: 'options.png',
                fn: function () {
                    chrome.runtime.openOptionsPage();
                }
            }
        },
        feeds: {
            toggleShowOnlyUnread: {
                icon: 'icon16.png',
                title: 'Toggle show only unread',
                fn: function () {
                    const currentUnread = bg.settings.get('showOnlyUnreadSources');
                    bg.settings.save('showOnlyUnreadSources', currentUnread === 'yes' ? 'no' : 'yes');
                    bg.loader.downloadAll(true);
                }
            },
            updateAll: {
                icon: 'reload.png',
                title: Locale.UPDATE_ALL,
                fn: function () {
                    bg.loader.downloadAll(true);
                }
            },
            update: {
                icon: 'reload.png',
                title: Locale.UPDATE,
                fn: function () {
                    const selectedItems = require('views/feedList').selectedItems;
                    if (selectedItems.length) {
                        const models = selectedItems.map((item) => {
                            return item.model;
                        });
                        bg.loader.download(models);
                    }
                }
            },
            stopUpdate: {
                icon: 'stop.png',
                title: 'Stop updating feeds',
                fn: function () {
                    bg.loader.abortDownloading();
                }
            },
            mark: {
                icon: 'read.png',
                title: Locale.MARK_ALL_AS_READ,
                fn: function () {
                    const selectedFeeds = require('views/feedList').getSelectedFeeds();
                    if (!selectedFeeds.length) {
                        return;
                    }

                    bg.items.forEach(function (item) {
                        if (item.get('unread') === true && selectedFeeds.indexOf(item.getSource()) >= 0) {
                            item.save({
                                unread: false,
                                visited: true
                            });
                        }
                    });

                    selectedFeeds.forEach(function (source) {
                        if (source.get('hasNew')) {
                            source.save({hasNew: false});
                        }
                    });
                }
            },
            openHome: {
                title: Locale.OPEN_HOME,
                fn: function () {
                    const selectedFeeds = require('views/feedList').getSelectedFeeds();
                    if (!selectedFeeds.length) {
                        return;
                    }
                    selectedFeeds.forEach((source) => {
                        chrome.tabs.create({
                            'url': source.get('base'),
                            active: false
                        });

                    });
                }
            },
            refetch: {
                title: Locale.REFETCH, /****localization needed****/
                fn: function () {
                    const selectedFeeds = require('views/feedList').getSelectedFeeds();
                    if (!selectedFeeds.length) {
                        return;
                    }
                    selectedFeeds.forEach(function (source) {
                        bg.items.where({sourceID: source.get('id')}).forEach(function (item) {
                            item.destroy();
                        });
                    });
                    app.actions.execute('feeds:update');
                }
            },
            delete: {
                icon: 'delete.png',
                title: Locale.DELETE,
                fn: function () {
                    if (!confirm(Locale.REALLY_DELETE)) {
                        return;
                    }

                    const feeds = require('views/feedList').getSelectedFeeds();
                    const folders = require('views/feedList').getSelectedFolders();

                    feeds.forEach(function (feed) {
                        feed.destroy();
                    });

                    folders.forEach(function (folder) {
                        folder.destroy();
                    });
                }
            },
            scrollIntoView: {
                icon: 'back.png',
                title: 'Scroll into view',
                fn: function () {
                    const folders = require('views/feedList').getSelectedFolders();

                    if (folders.length > 0) {
                        const id = folders[0].get('id');
                        const sourceElement = document.querySelector(`[data-id="${id}"]`);
                        sourceElement.scrollIntoView();
                        return;
                    }

                    const feeds = require('views/feedList').getSelectedFeeds();
                    if (feeds.length > 0) {
                        const id = feeds[0].get('id');
                        const sourceElement = document.querySelector(`[data-id="${id}"]`);
                        sourceElement.scrollIntoView();
                    }
                }
            },
            showProperties: {
                icon: 'properties.png',
                title: Locale.PROPERTIES,
                fn: function () {
                    const properties = app.feeds.properties;
                    const feedList = require('views/feedList');
                    const feeds = feedList.getSelectedFeeds();
                    const folders = feedList.getSelectedFolders();

                    if (feedList.selectedItems.length === 1 && folders.length === 1) {
                        properties.show(folders[0]);
                    } else if (!folders.length && feeds.length === 1) {
                        properties.show(feeds[0]);
                    } else if (feeds.length > 0) {
                        properties.show(feeds);
                    }
                }
            },
            addSource: {
                icon: 'add.png',
                title: Locale.ADD_RSS_SOURCE,
                fn: function () {
                    let url = (prompt(Locale.RSS_FEED_URL) || '').trim();
                    if (!url) {
                        return;
                    }

                    let folderID = '0';
                    const list = require('views/feedList');
                    if (list.selectedItems.length && list.selectedItems[0].el.classList.contains('folder')) {
                        const fid = list.selectedItems[0].model.get('id');
                        // make sure source is not added to folder which is not in db
                        if (bg.folders.get(fid)) {
                            folderID = fid;
                        }
                    }

                    url = app.fixURL(url);
                    const uid = url.replace(/^(.*:)?(\/\/)?(www*?\.)?/, '').replace(/\/$/, '');
                    const duplicate = bg.sources.findWhere({uid: uid});

                    if (!duplicate) {
                        const newFeed = bg.sources.create({
                            title: url,
                            url: url,
                            updateEvery: -1,
                            folderID: folderID
                        }, {wait: true});
                        app.trigger('focus-feed', newFeed.get('id'));
                    } else {
                        app.trigger('focus-feed', duplicate.get('id'));
                    }
                }
            },
            addFolder: {
                icon: 'add_folder.png',
                title: Locale.NEW_FOLDER,
                fn: function () {
                    const title = (prompt(Locale.FOLDER_NAME + ': ') || '').trim();
                    if (!title) {
                        return;
                    }

                    bg.folders.create({
                        title: title
                    }, {wait: true});
                }
            },
            focus: {
                title: 'Focus feeds',
                fn: function () {
                    app.setFocus('feeds');
                }
            },
            selectNext: {
                title: 'Select next',
                fn: function (event) {
                    require('views/feedList').selectNextSelectable(event);
                }
            },
            selectPrevious: {
                title: 'Select previous',
                fn: function (event) {
                    require('views/feedList').selectPrev(event);
                }
            },
            closeFolders: {
                title: 'Close folders',
                fn: function (event) {
                    const folders = Array.from(document.querySelectorAll('.folder.opened'));
                    if (!folders.length) {
                        return;
                    }
                    folders.forEach((folder) => {
                        if (folder.view) {
                            folder.view.handleClickArrow(event);
                        }
                    });
                }
            },
            openFolders: {
                title: 'Open folders',
                fn: function (event) {
                    const folders = Array.from(document.querySelectorAll('.folder:not(.opened)'));
                    folders.forEach((folder) => {
                        if (folder.view) {
                            folder.view.handleClickArrow(event);
                        }
                    });
                }
            },
            toggleFolder: {
                title: 'Toggle folder',
                fn: function (event) {
                    event = event || {};
                    const selectedItems = require('views/feedList').selectedItems;
                    if (selectedItems.length && selectedItems[0].el.classList.contains('folder')) {
                        selectedItems[0].handleClickArrow(event);
                    }
                }
            },
            showArticles: {
                title: 'Show articles',
                fn: function (event = {}) {
                    const target = event.target || {};
                    const feedList = require('views/feedList');
                    const feeds = feedList.getSelectedFeeds();
                    const feedIds = feeds.map((feed) => {
                        return feed.id;
                    });
                    let special = Array.from(document.querySelectorAll('.special.selected'))[0];
                    if (special) {
                        special = special.view.model;
                    }
                    const folder = Array.from(document.querySelectorAll('.folder.selected'))[0];

                    app.trigger('select:' + feedList.el.id, {
                        action: 'new-select',
                        feeds: feedIds,
                        filter: special ? Object.assign({}, special.get('filter')) : null,
                        name: special ? special.get('name') : null,
                        multiple: !!(special || folder),
                        unreadOnly: !!event.altKey || target.className === 'source-counter'
                    });


                    if (special && special.get('name') === 'all-feeds') {
                        bg.sources.forEach((source) => {
                            if (source.get('hasNew')) {
                                source.save({hasNew: false});
                            }
                        });

                    } else if (feedIds.length) {
                        bg.sources.forEach((source) => {
                            if (source.get('hasNew') && feedIds.includes(source.id)) {
                                source.save({hasNew: false});
                            }
                        });
                    }
                }
            },
            showAndFocusArticles: {
                title: 'Show and focus articles',
                fn: function (event) {
                    event = event || {};
                    const selectedItems = require('views/feedList').selectedItems;
                    if (selectedItems.length) {
                        app.actions.execute('feeds:showArticles', event);
                        app.actions.execute('articles:focus');
                    }
                }
            }
        },
        articles: {
            mark: {
                icon: 'read.png',
                title: Locale.MARK_AS_READ,
                fn: function () {
                    require('views/articleList').changeUnreadState();
                }
            },
            update: {
                icon: 'reload.png',
                title: Locale.UPDATE,
                fn: function () {
                    const list = require('views/articleList');
                    if (list.currentData.feeds.length) {
                        list.currentData.feeds.forEach((id) => {
                            bg.loader.download(bg.sources.get(id));
                        });
                    } else {
                        bg.loader.downloadAll(true);
                    }
                }
            },
            delete: {
                icon: 'delete.png',
                title: Locale.DELETE,
                fn: function (event) {
                    const list = require('views/articleList');
                    if (list.currentData.name === 'trash' || event.shiftKey) {
                        if (!confirm('Remove selected items permanently?')) {
                            return;
                        }
                        list.destroyBatch(list.selectedItems, list.removeItemCompletely);
                    } else {
                        list.destroyBatch(list.selectedItems, list.removeItem);
                    }
                }
            },
            undelete: {
                icon: 'undelete.png',
                title: Locale.UNDELETE,
                fn: function () {
                    const articleList = require('views/articleList');
                    if (!articleList.selectedItems || !articleList.selectedItems.length || articleList.currentData.name !== 'trash') {
                        return;
                    }
                    articleList.destroyBatch(articleList.selectedItems, articleList.undeleteItem);
                }
            },
            selectNext: {
                fn: function (event) {
                    require('views/articleList').selectNextSelectable(event);
                }
            },
            selectPrevious: {
                fn: function (event) {
                    require('views/articleList').selectPrev(event);
                }
            },
            search: {
                title: Locale.SEARCH_TIP,
                fn: function (event) {
                    event = event || {currentTarget: document.querySelector('input[type=search]')};
                    let query = event.currentTarget.value || '';
                    const list = require('views/articleList');
                    if (query === '') {
                        [...document.querySelectorAll('.date-group, .articles-list-item')].map((element) => {
                            element.classList.remove('hidden');
                        });
                        return;
                    } else {
                        [...document.querySelectorAll('.date-group')].map((element) => {
                            element.classList.add('hidden');
                        });
                    }

                    let searchInContent = false;
                    if (query[0] && query[0] === ':') {
                        query = query.replace(/^:/, '', query);
                        searchInContent = true;
                    }
                    const expression = new RegExp(RegExp.escape(query), 'i');
                    const selectedSpecial = document.querySelector('.sources-list-item.selected.special');
                    list.views.some(function (view) {
                        if (!view.model) {
                            return false;
                        }
                        const sourceId = view.model.get('sourceID');
                        const sourceItem = document.querySelector('[data-id="' + sourceId + '"]');
                        if (!sourceItem) {
                            return false;
                        }
                        if (!sourceItem.classList.contains('selected')) {
                            const folderId = sourceItem.view.model.get('folderID');
                            const folderItem = document.querySelector('[data-id="' + folderId + '"]');

                            if (!selectedSpecial && !folderItem) {
                                return false;
                            }
                        }
                        const cleanedTitle = view.model.get('title').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const cleanedAuthor = view.model.get('author').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                        const cleanedContent = searchInContent ? view.model.get('content').normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';


                        if (!(expression.test(cleanedTitle) || expression.test(cleanedAuthor) || (searchInContent && expression.test(cleanedContent)))) {
                            view.el.classList.add('hidden');
                        } else {
                            view.el.classList.remove('hidden');
                        }
                    });
                }
            },
            focusSearch: {
                title: 'Focus Search',
                fn: function () {
                    document.querySelector('input[type=search]').focus();
                }
            },
            focus: {
                title: 'Focus Articles',
                fn: function () {
                    app.setFocus('articles');
                }
            },
            fullArticle: {
                title: Locale.FULL_ARTICLE,
                icon: 'full_article.png',
                fn: function (event) {
                    const articleList = app.articles.articleList;
                    if (!articleList.selectedItems || !articleList.selectedItems.length) {
                        return;
                    }
                    if (articleList.selectedItems.length > 10 && bg.settings.get('askOnOpening')) {
                        if (!confirm('Do you really want to open ' + articleList.selectedItems.length + ' articles?')) {
                            return;
                        }
                    }
                    const openNewTab = bg.settings.get('openNewTab');
                    const active = openNewTab === 'background' ? !!event.shiftKey : !event.shiftKey;
                    articleList.selectedItems.forEach(function (item) {

                        chrome.tabs.create({url: stripTags(item.model.get('url')), active: active});
                    });
                }
            },
            oneFullArticle: {
                title: 'One full article',
                fn: function (event) {
                    event = event || {};
                    const articleList = app.articles.articleList;
                    let view;
                    if ('currentTarget' in event) {
                        view = event.currentTarget.view;
                    } else {
                        if (!articleList.selectedItems || !articleList.selectedItems.length) {
                            return;
                        }
                        view = articleList.selectedItems[0];
                    }
                    if (view.model) {
                        const openNewTab = bg.settings.get('openNewTab');
                        const active = openNewTab === 'background' ? !!event.shiftKey : !event.shiftKey;

                        chrome.tabs.create({url: stripTags(view.model.get('url')), active: active});
                    }
                }
            },
            markAndNextUnread: {
                title: Locale.MARK_AND_NEXT_UNREAD,
                icon: 'find_next.png',
                fn: function () {
                    require('views/articleList').changeUnreadState({onlyToRead: true});
                    require('views/articleList').selectNextSelectable({selectUnread: true});
                }
            },
            markAndPrevUnread: {
                title: Locale.MARK_AND_PREV_UNREAD,
                icon: 'find_previous.png',
                fn: function () {
                    require('views/articleList').changeUnreadState({onlyToRead: true});
                    require('views/articleList').selectPrev({selectUnread: true});
                }
            },
            nextUnread: {
                title: Locale.NEXT_UNREAD,
                icon: 'forward.png',
                fn: function () {
                    require('views/articleList').selectNextSelectable({selectUnread: true});
                }
            },
            prevUnread: {
                title: Locale.PREV_UNREAD,
                icon: 'back.png',
                fn: function () {
                    require('views/articleList').selectPrev({selectUnread: true});
                }
            },
            markAllAsRead: {
                title: Locale.MARK_ALL_AS_READ,
                icon: 'read.png',
                fn: function () {
                    const articleList = require('views/articleList');
                    const feeds = articleList.currentData.feeds;
                    var filter = articleList.currentData.filter;
                    if (feeds.length) {
                        (filter ? bg.items.where(articleList.currentData.filter) : bg.items).forEach(function (item) {
                            if (item.get('unread') === true && feeds.indexOf(item.get('sourceID')) >= 0) {
                                item.save({unread: false, visited: true});
                            }
                        });
                    } else if (articleList.currentData.name === 'all-feeds') {
                        if (confirm(Locale.MARK_ALL_QUESTION)) {
                            bg.items.forEach(function (item) {
                                if (item.get('unread') === true) {
                                    item.save({unread: false, visited: true});
                                }
                            });
                        }
                    } else if (articleList.currentData.filter) {
                        bg.items.where(articleList.specialFilter).forEach(function (item) {
                            item.save({unread: false, visited: true});
                        });
                    }
                }
            },
            selectAll: {
                title: 'Select All',
                fn: function () {
                    const articleList = require('views/articleList');
                    [...articleList.el.querySelectorAll('.selected')].forEach((element) => {
                        element.classList.remove('selected');
                    });

                    articleList.selectedItems = [];

                    [...articleList.el.querySelectorAll('.articles-list-item:not(.hidden)')].forEach((element) => {
                        element.view.el.classList.add('selected');
                        articleList.selectedItems.push(element.view);
                    });

                    const lastSelected = articleList.el.querySelector('.last-selected');
                    if (lastSelected) {
                        lastSelected.classList.remove('last-selected');
                    }

                    const lastVisible = articleList.el.querySelector('.articles-list-item:not(.hidden):last-child');
                    if (lastVisible) {
                        lastVisible.classList.add('last-selected');
                    }
                }
            },
            pin: {
                title: Locale.PIN,
                icon: 'pinsource_context.png',
                fn: function () {
                    const articleList = require('views/articleList');
                    if (!articleList.selectedItems || !articleList.selectedItems.length) {
                        return;
                    }
                    const isPinned = !articleList.selectedItems[0].model.get('pinned');
                    articleList.selectedItems.forEach(function (item) {
                        item.model.save({pinned: isPinned});
                    });
                }
            },
            spaceThrough: {
                title: 'Space Through',
                fn: function () {
                    const articleList = require('views/articleList');
                    if (!articleList.selectedItems || !articleList.selectedItems.length) {
                        return;
                    }
                    app.trigger('space-pressed');
                }
            },
            pageUp: {
                title: 'Page up',
                fn: function () {
                    var el = require('views/articleList').el;
                    el.scrollByPages(-1);
                }
            },
            pageDown: {
                title: 'Page down',
                fn: function () {
                    var el = require('views/articleList').el;
                    el.scrollByPages(1);
                }
            },
            scrollToBottom: {
                title: 'Scroll to bottom',
                fn: function () {
                    var el = require('views/articleList').el;
                    el.scrollTop = el.scrollHeight;
                }
            },
            scrollToTop: {
                title: 'Scroll to top',
                fn: function () {
                    var el = require('views/articleList').el;
                    el.scrollTop = 0;
                }
            }
        },
        content: {
            mark: {
                title: Locale.MARK_AS_READ,
                icon: 'read.png',
                fn: function () {
                    var contentView = require('views/contentView');
                    if (!contentView.model) {
                        return;
                    }
                    contentView.model.save({
                        unread: !contentView.model.get('unread'),
                        visited: true
                    });
                }
            },
            delete: {
                title: Locale.DELETE,
                icon: 'delete.png',
                fn: function (e) {
                    const contentView = require('views/contentView');
                    if (!contentView.model) {
                        return;
                    }

                    const askRmPinned = bg.settings.get('askRmPinned');

                    if (e.shiftKey) {
                        if (contentView.model.get('pinned') && askRmPinned && askRmPinned !== 'none') {
                            let conf = confirm(Locale.PIN_QUESTION_A + contentView.model.escape('title') + Locale.PIN_QUESTION_B);
                            if (!conf) {
                                return;
                            }
                        }

                        contentView.model.markAsDeleted();
                    } else {
                        if (contentView.model.get('pinned') && askRmPinned === 'all') {
                            let conf = confirm(Locale.PIN_QUESTION_A + contentView.model.escape('title') + Locale.PIN_QUESTION_B);
                            if (!conf) {
                                return;
                            }
                        }

                        contentView.model.trash();
                    }
                }
            },
            showConfig: {
                title: Locale.SETTINGS,
                icon: 'config.png',
                fn: function () {
                    let url = chrome.extension.getURL('options.html');
                    chrome.tabs.query({
                        url: url
                    }, function (tabs) {
                        if (tabs[0]) {
                            if (tabs[0].active && closeIfActive) {
                                chrome.tabs.remove(tabs[0].id);
                            } else {
                                chrome.tabs.update(tabs[0].id, {
                                    active: true
                                });
                            }
                        } else {
                            chrome.tabs.create({
                                'url': url
                            }, function () {
                            });
                        }
                    });
                }
            },
            focus: {
                title: 'Focus Article',
                fn: function () {
                    app.setFocus('content');
                }
            },
            focusSandbox: {
                title: 'Focus Article',
                fn: function () {
                    app.content.sandbox.el.focus();
                }
            },
            scrollDown: {
                title: 'Scroll down',
                fn: function () {
                    const cw = document.querySelector('iframe').contentWindow;
                    cw.scrollBy(0, 40);
                }
            },
            scrollUp: {
                title: 'Scroll up',
                fn: function () {
                    const cw = document.querySelector('iframe').contentWindow;
                    cw.scrollBy(0, -40);
                }
            },
            spaceThrough: {
                title: 'Space trough',
                fn: function () {
                    require('views/contentView').handleSpace();
                }
            },
            pageUp: {
                title: 'Page up',
                fn: function () {
                    const cw = document.querySelector('iframe').contentWindow;
                    const d = cw.document;
                    cw.scrollBy(0, -d.documentElement.clientHeight * 0.85);
                }
            },
            pageDown: {
                title: 'Page down',
                fn: function () {
                    const cw = document.querySelector('iframe').contentWindow;
                    const d = cw.document;
                    cw.scrollBy(0, d.documentElement.clientHeight * 0.85);
                }
            },
            scrollToBottom: {
                title: 'Scroll to bottom',
                fn: function () {
                    const cw = document.querySelector('iframe').contentWindow;
                    const d = cw.document;
                    cw.scrollTo(0, d.documentElement.offsetHeight);
                }
            },
            scrollToTop: {
                title: 'Scroll to top',
                fn: function () {
                    const cw = document.querySelector('iframe').contentWindow;
                    cw.scrollTo(0, 0);
                }
            }
        }

    };  // end actions object
}); // end define function
