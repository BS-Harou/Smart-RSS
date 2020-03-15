/**
 * @module BgProcess
 */
define([
        'modules/Animation', 'models/Settings', 'models/Info', 'models/Source',
        'collections/Sources', 'collections/Items', 'collections/Folders', 'models/Loader',
        'models/Folder', 'models/Item', 'collections/Toolbars'
    ],
    function (animation, Settings, Info, Source, Sources, Items, Folders, Loader, Folder, Item, Toolbars) {
        /**
         * Messages
         */

        function addSource(address) {
            address = address.replace(/^feed:/i, 'https:');

            const duplicate = sources.findWhere({url: address});

            if (duplicate) {
                duplicate.trigger('change');
                openRSS(false, duplicate.get('id'));
                return;
            }
            const source = sources.create({
                title: address,
                url: address
            }, {wait: true});
            openRSS(false, source.get('id'));

        }


        function onMessage(message, sender, sendResponse) {


            if (!message.hasOwnProperty('action')) {
                return;
            }
            // if (message.action === 'get-tab-id') {
            //     sendResponse({
            //         action: 'response-tab-id',
            //         value: sender.tab.id
            //     });
            //     return;
            // }

            if (message.action === 'new-rss' && message.value) {
                addSource(message.value);
                return;
            }
            if (message.action === 'list-feeds') {
                chrome.contextMenus.removeAll();
                const feeds = message.value;
                if (feeds.length === 0) {
                    animation.handleIconChange();
                    return;
                }
                chrome.browserAction.setIcon({
                    path: '/images/icon19-' + settings.get('sourcesFoundIcon') + '.png'
                });
                chrome.contextMenus.create({
                    id: 'SmartRss',
                    contexts: ['browser_action'],
                    title: 'Subscribe'
                }, function () {
                    feeds.forEach(function (feed) {
                        chrome.contextMenus.create({
                            id: feed.url,
                            title: feed.title,
                            contexts: ['browser_action'],
                            parentId: 'SmartRss',
                            onclick: function () {
                                addSource(feed.url);
                            }
                        });
                    });
                });
                if (settings.get('badgeMode') === 'sources') {
                    chrome.browserAction.setBadgeText({text: feeds.length.toString()});
                }
            }
            if (message.action === 'visibility-lost') {
                animation.handleIconChange();
                chrome.contextMenus.removeAll();
                if (settings.get('badgeMode') === 'sources') {
                    chrome.browserAction.setBadgeText({text: ''});
                }
            }
        }

        chrome.runtime.onMessage.addListener(onMessage);

        function openRSS(closeIfActive, focusSource) {
            let url = chrome.extension.getURL('rss.html');
            chrome.tabs.query({url: url},
                (tabs) => {
                    if (tabs[0]) {
                        if (tabs[0].active && closeIfActive) {
                            chrome.tabs.remove(tabs[0].id);
                            return;
                        }
                        chrome.tabs.update(tabs[0].id, {
                            active: true
                        });
                        if (focusSource) {
                            window.sourceToFocus = focusSource;
                        }
                        return;
                    }
                    window.sourceToFocus = focusSource;
                    if (settings.get('openInNewTab')) {
                        chrome.tabs.create({
                            url: url
                        }, () => {
                        });
                    } else {
                        chrome.tabs.update({url: url});
                    }
                });
        }

        function openInNewTab() {
            chrome.tabs.create({
                url: chrome.extension.getURL('rss.html')
            }, () => {
            });
        }

        window.openRSS = openRSS;

        /**
         * Update animations
         */
        animation.start();

        /**
         * Items
         */
        window.Source = Source;
        window.Item = Item;
        window.Folder = Folder;

        /**
         * DB models
         */
        window.settings = new Settings();
        window.settings.fetch();
        window.info = new Info();
        window.sources = new Sources();
        window.items = new Items();
        window.folders = new Folders();

        /**
         * This is used for when new feed is subscribed and smart rss tab is opened to focus the newly added feed
         */
        window.sourceToFocus = null;

        window.toolbars = new Toolbars();

        window.loader = new Loader();


        function fetchOne(tasks) {
            return new Promise((resolve) => {
                if (tasks.length === 0) {
                    resolve(true);
                    return;
                }
                const oneTask = tasks.shift();
                oneTask.always(function () {
                    resolve(fetchOne(tasks));
                });
            });
        }

        function fetchAll() {
            const tasks = [];
            tasks.push(folders.fetch({silent: true}));
            tasks.push(sources.fetch({silent: true}));
            tasks.push(toolbars.fetch({silent: true}));
            tasks.push(items.fetch({silent: true}));


            return fetchOne(tasks);
        }

        window.fetchAll = fetchAll;
        window.fetchOne = fetchOne;
        window.reloadExt = function () {
            chrome.runtime.reload();
        };


        window.appStarted = new Promise((resolve) => {

            /**
             * Init
             */


            fetchAll().then(function () {
                /**
                 * Load counters for specials
                 */
                info.refreshSpecialCounters();

                /**
                 * Set events
                 */

                sources.on('add', function (source) {
                    loader.download(source);
                });


                sources.on('change:url', function (source) {
                    loader.download(source);
                });

                sources.on('change:title', function (source) {
                    if (!source.get('title')) {
                        loader.download(source);
                    }
                    sources.sort();
                });

                sources.on('change:hasNew', animation.handleIconChange);
                settings.on('change:icon', animation.handleIconChange);

                info.setEvents(sources);


                /**
                 * Init
                 */
                chrome.alarms.create('scheduler', {
                    periodInMinutes: 1
                });

                chrome.alarms.onAlarm.addListener((alarm) => {
                    if (alarm.name === 'scheduler') {
                        if (settings.get('disableAutoUpdate') === true) {
                            return;
                        }
                        loader.downloadAll();
                    }
                });

                /**
                 * onclick:button -> open RSS
                 */
                chrome.browserAction.onClicked.addListener(function (tab, onClickData) {
                    if (typeof onClickData !== 'undefined') {
                        if (onClickData.button === 1) {
                            openInNewTab();
                            return;
                        }
                    }
                    openRSS(true);
                });
                /**
                 * Set icon
                 */

                animation.stop();
                resolve(true);
            });
        });
    });
