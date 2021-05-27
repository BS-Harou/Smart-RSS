const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;'
};


const keys = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    //16: 'shift',
    //17: 'ctrl',
    20: 'capslock',
    27: 'esc',
    32: 'space',
    33: 'pgup',
    34: 'pgdown',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    45: 'insert',
    46: 'del'
};


function escapeHtml(string) {
    return String(string).replace(/[&<>"']/gm, (s) => {
        return entityMap[s];
    }).replace(/\s/, (f) => {
        return f === ' ' ? ' ' : '';
    });
}

function decodeHTML(str = '') {
    let map = {'gt': '>', 'lt': '<', 'amp': '&', 'quot': '"'};
    return str.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gmi, function ($0, $1) {
        if ($1[0] === '#') {
            return String.fromCharCode($1[1].toLowerCase() === 'x' ? parseInt($1.substr(2), 16) : parseInt($1.substr(1), 10));
        } else {
            return map.hasOwnProperty($1) ? map[$1] : $0;
        }
    });
}


JSON.safeParse = function (str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
};

chrome.runtime.getBackgroundPage((bg) => {
    const documentReady = () => {
        if (typeof browser === 'undefined') {
            const warning = document.querySelector('.ff-warning');
            warning.parentNode.removeChild(warning);
        }
        document.querySelector('#version').textContent = chrome.runtime.getManifest().version;
        if (typeof browser !== 'undefined') {
            browser.runtime.getBrowserInfo().then((info) => {
                document.querySelector('#browser-info').textContent = `${info.vendor} ${info.name} ${info.version} ${info.buildID}`;
            });
        }

        [...document.querySelectorAll('select[id], input[type=number], input[type=range], textarea')].forEach((item) => {
            item.value = bg.settings.get(item.id);
            if (item.type === 'number') {
                item.addEventListener('input', handleChange);
            } else {
                item.addEventListener('change', handleChange);
            }
        });

        [...document.querySelectorAll('input[type=checkbox]')].forEach((item) => {
            item.checked = !!bg.settings.get(item.id);
            item.addEventListener('change', handleCheck);
        });

        document.querySelector('#useSound').addEventListener('change', () => {
            bg.loader.playNotificationSound();
        });

        document.querySelector('#default-sound').addEventListener('change', handleDefaultSound);
        document.querySelector('#suggest-style').addEventListener('click', handleSuggestStyle);
        document.querySelector('#reset-style').addEventListener('click', handleResetStyle);
        document.querySelector('#export-settings').addEventListener('click', handleExportSettings);
        document.querySelector('#export-smart').addEventListener('click', handleExportSmart);
        document.querySelector('#export-opml').addEventListener('click', handleExportOPML);
        document.querySelector('#clear-settings').addEventListener('click', handleClearSettings);
        document.querySelector('#clear-data').addEventListener('click', handleClearData);
        document.querySelector('#clear-removed-storage').addEventListener('click', handleClearDeletedStorage);
        document.querySelector('#clear-favicons').addEventListener('click', handleClearFavicons);
        document.querySelector('#import-settings').addEventListener('change', handleImportSettings);
        document.querySelector('#import-smart').addEventListener('change', handleImportSmart);
        document.querySelector('#import-opml').addEventListener('change', handleImportOPML);
        document.querySelector('[name="queries"]').value = bg.settings.get('queries').join(',');

        document.querySelector('[name="queries"]').addEventListener('change', handleChangeQueries);


        function handleChangeQueries(event) {
            const queries = event.target.value.split(',');
            bg.settings.save('queries', queries);
        }


        [...document.querySelectorAll('input[type=image]')].forEach((element) => {
            element.addEventListener('click', handleLayoutChangeClick);
        });

        const hotkeysElement = document.querySelector('#hotkeys');
        const hotkeys = bg.settings.get('hotkeys');
        for (const region in hotkeys) {
            if (hotkeys.hasOwnProperty(region)) {
                const regionElement = document.createElement('h3');
                regionElement.insertAdjacentText('afterbegin', region);
                hotkeysElement.insertAdjacentElement('beforeend', regionElement);

                const regionHotkeys = hotkeys[region];
                for (const regionHotkey in regionHotkeys) {
                    if (regionHotkeys.hasOwnProperty(regionHotkey)) {

                        const label = document.createElement('label');
                        label.classList.add('web-content-select-label');

                        const hotkey = document.createElement('input');
                        hotkey.setAttribute('disabled', true);
                        hotkey.classList.add('selectLabel');
                        hotkey.value = regionHotkey;

                        const action = document.createElement('input');
                        action.setAttribute('disabled', true);
                        action.value = regionHotkeys[regionHotkey];

                        label.insertAdjacentElement('beforeend', hotkey);
                        label.insertAdjacentElement('beforeend', action);
                        hotkeysElement.insertAdjacentElement('beforeend', label);
                    }
                }
            }
        }

        handleLayoutChange(bg.settings.get('layout'));
    };


    if (document.readyState !== 'loading') {
        documentReady();
    } else {
        document.addEventListener('DOMContentLoaded', documentReady);
    }


    function handleLayoutChangeClick(event) {
        const layout = event.currentTarget.value;
        handleLayoutChange(layout);
        bg.settings.save('layout', layout);
    }

    function handleLayoutChange(layout) {
        if (layout === 'vertical') {
            document.querySelector('input[value=horizontal]').setAttribute('src', '/images/layout_horizontal.png');
            document.querySelector('input[value=vertical]').setAttribute('src', '/images/layout_vertical_selected.png');
        } else {
            document.querySelector('input[value=horizontal]').setAttribute('src', '/images/layout_horizontal_selected.png');
            document.querySelector('input[value=vertical]').setAttribute('src', '/images/layout_vertical.png');
        }
    }

    function handleResetStyle() {
        if (!confirm('Do you really want to reset style to default?')) {
            return;
        }
        document.querySelector('#userStyle').value = '';
        bg.settings.save('userStyle', '');
        chrome.runtime.sendMessage({action: 'changeUserStyle'});
    }

    function handleSuggestStyle() {
        if (document.querySelector('#userStyle').value !== '') {
            if (!confirm('Do you really want to replace your current style with colors template?')) {
                return;
            }
        }
        const defaultStyle = bg.settings.get('defaultStyle');
        document.querySelector('#userStyle').value = defaultStyle;
        bg.settings.save('userStyle', defaultStyle);
        chrome.runtime.sendMessage({action: 'changeUserStyle'});
    }


    function handleChange(event) {
        const target = event.target;
        bg.settings.save(target.id, target.value);
        if (target.id === 'userStyle') {
            chrome.runtime.sendMessage({action: 'changeUserStyle'});
        }
        if (target.id === 'invertColors') {
            chrome.runtime.sendMessage({action: 'changeInvertColors'});
        }
    }

    function handleCheck(event) {
        const target = event.target;
        bg.settings.save(target.id, target.checked);
    }

    function handleDefaultSound(event) {
        const file = event.currentTarget.files[0];
        if (!file || file.size === 0) {
            return;
        }

        if (!file.type.match(/audio.*/)) {
            alert('Please select audio file!');
            return;
        }

        if (file.size > 500000) {
            alert('Please use file smaller than 500kB!');
            return;
        }

        const reader = new FileReader();
        reader.onload = function () {
            bg.settings.save('defaultSound', this.result);
        };

        reader.readAsDataURL(file);
    }

    function handleExportSmart() {
        const smartExportStatus = document.querySelector('#smart-exported');
        const data = {
            folders: bg.folders.toJSON(),
            sources: bg.sources.toJSON(),
            items: bg.items.toJSON()
        };

        smartExportStatus.setAttribute('href', '#');
        smartExportStatus.removeAttribute('download');
        smartExportStatus.textContent = 'Exporting, please wait';


        setTimeout(() => {
            const expr = new Blob([JSON.stringify(data)]);
            smartExportStatus.setAttribute('href', URL.createObjectURL(expr));
            smartExportStatus.setAttribute('download', 'exported-rss.smart');
            smartExportStatus.textContent = 'Click to download exported data';
        }, 20);
    }

    function handleExportSettings() {
        const settingsExportStatus = document.querySelector('#settings-exported');
        const data = {
            settings: bg.settings.toJSON()
        };

        settingsExportStatus.setAttribute('href', '#');
        settingsExportStatus.removeAttribute('download');
        settingsExportStatus.textContent = 'Exporting, please wait';


        setTimeout(() => {
            const expr = new Blob([JSON.stringify(data)]);
            settingsExportStatus.setAttribute('href', URL.createObjectURL(expr));
            settingsExportStatus.setAttribute('download', 'settings.smart');
            settingsExportStatus.textContent = 'Click to download exported data';
        }, 20);
    }

    function handleExportOPML() {

        function addFolder(doc, title, id) {
            const folder = doc.createElement('outline');
            folder.setAttribute('text', escapeHtml(title));
            folder.setAttribute('title', escapeHtml(title));
            folder.setAttribute('id', id);
            return folder;
        }

        function addSource(doc, title, url) {
            const source = doc.createElement('outline');
            source.setAttribute('text', escapeHtml(title));
            source.setAttribute('title', escapeHtml(title));
            source.setAttribute('type', 'rss');
            source.setAttribute('xmlUrl', url);
            return source;
        }

        function addLine(doc, to, ctn = '\n\t') {
            const line = doc.createTextNode(ctn);
            to.appendChild(line);
        }

        const opmlExportStatus = document.querySelector('#opml-exported');

        opmlExportStatus.setAttribute('href', '#');
        opmlExportStatus.removeAttribute('download');
        opmlExportStatus.textContent = 'Exporting, please wait';

        const start = '<?xml version="1.0" encoding="utf-8"?>\n<opml version="1.0">\n<head>\n\t<title>Newsfeeds exported from Smart RSS</title>\n</head>\n<body>';
        const end = '\n</body>\n</opml>';

        const parser = new DOMParser();
        const doc = parser.parseFromString(start + end, 'application/xml');


        setTimeout(() => {
            const body = doc.querySelector('body');

            bg.folders.forEach((folder) => {
                addLine(doc, body);
                body.appendChild(addFolder(doc, folder.get('title'), folder.get('id')));
            });


            bg.sources.forEach((source) => {
                if (source.get('folderID')) {
                    const folder = body.querySelector('[id="' + source.get('folderID') + '"]');
                    if (folder) {
                        addLine(doc, folder, '\n\t\t');
                        folder.appendChild(addSource(doc, source.get('title'), source.get('url')));
                    } else {
                        addLine(doc, body);
                        body.appendChild(addSource(doc, source.get('title'), source.get('url')));
                    }
                } else {
                    addLine(doc, body);
                    body.appendChild(addSource(doc, source.get('title'), source.get('url')));
                }
            });

            const folders = body.querySelectorAll('[id]');
            [...folders].forEach((folder) => {
                folder.removeAttribute('id');
            });

            const expr = new Blob([(new XMLSerializer()).serializeToString(doc)]);
            opmlExportStatus.setAttribute('href', URL.createObjectURL(expr));
            opmlExportStatus.setAttribute('download', 'exported-rss.opml');
            opmlExportStatus.textContent = 'Click to download exported data';
        }, 20);
    }


    function handleImportSettings(event) {
        const settingsImportStatus = document.querySelector('#settings-imported');
        const file = event.target.files[0];
        if (!file || file.size === 0) {
            settingsImportStatus.textContent = 'Wrong file';
            return;
        }
        settingsImportStatus.textContent = 'Loading & parsing file';

        const reader = new FileReader();
        reader.onload = function () {
            const data = JSON.safeParse(this.result);

            if (!data || !data.settings) {
                settingsImportStatus.textContent = 'Wrong file';
                return;
            }

            settingsImportStatus.textContent = 'Importing, please wait!';

            const worker = new Worker('scripts/options/worker.js');
            worker.onmessage = function (message) {
                if (message.data.action === 'finished-settings') {
                    settingsImportStatus.textContent = 'Loading data to memory!';
                    bg.fetchAll().then(function () {
                        if (typeof browser !== 'undefined') {
                            chrome.runtime.reload();
                        }
                        bg.info.refreshSpecialCounters();
                        settingsImportStatus.textContent = 'Import fully completed!';
                        bg.loader.downloadAll(true);
                    });
                } else if (message.data.action === 'message-settings') {
                    settingsImportStatus.textContent = message.data.value;
                }
            };
            worker.postMessage({action: 'settings', value: data});

            worker.onerror = function (error) {
                alert('Importing error: ' + error.message);
            };
        };
        if (typeof browser !== 'undefined') {
            reader.readAsText(file);
        } else {
            const url = chrome.extension.getURL('rss.html');
            chrome.tabs.query({url: url}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    chrome.tabs.remove(tabs[i].id);
                }

                // wait for clear events to happen
                setTimeout(function () {
                    reader.readAsText(file);
                }, 1000);
            });
        }
    }


    function handleImportSmart(event) {
        const smartImportStatus = document.querySelector('#smart-imported');
        const file = event.target.files[0];
        if (!file || file.size === 0) {
            smartImportStatus.textContent = 'Wrong file';
            return;
        }
        smartImportStatus.textContent = 'Loading & parsing file';

        const reader = new FileReader();
        reader.onload = function () {
            const data = JSON.safeParse(this.result);

            if (!data || !data.items || !data.sources) {
                smartImportStatus.textContent = 'Wrong file';
                return;
            }

            smartImportStatus.textContent = 'Importing, please wait!';

            const worker = new Worker('scripts/options/worker.js');
            worker.onmessage = function (message) {
                if (message.data.action === 'finished') {
                    smartImportStatus.textContent = 'Loading data to memory!';
                    bg.fetchAll().then(function () {
                        if (typeof browser !== 'undefined') {
                            chrome.runtime.reload();
                        }
                        bg.info.refreshSpecialCounters();
                        smartImportStatus.textContent = 'Import fully completed!';
                        bg.loader.downloadAll(true);
                    });
                } else if (message.data.action === 'message') {
                    smartImportStatus.textContent = message.data.value;
                }
            };
            worker.postMessage({action: 'file-content', value: data});

            worker.onerror = function (error) {
                alert('Importing error: ' + error.message);
            };
        };
        if (typeof browser !== 'undefined') {
            reader.readAsText(file);
        } else {
            const url = chrome.extension.getURL('rss.html');
            chrome.tabs.query({url: url}, function (tabs) {
                for (let i = 0; i < tabs.length; i++) {
                    chrome.tabs.remove(tabs[i].id);
                }

                // wait for clear events to happen
                setTimeout(function () {
                    reader.readAsText(file);
                }, 1000);
            });
        }
    }

    function handleImportOPML(event) {
        const opmlImportStatus = document.querySelector('#opml-imported');
        const file = event.target.files[0];
        if (!file || file.size === 0) {
            opmlImportStatus.textContent = 'Wrong file';
            return;
        }

        opmlImportStatus.textContent = 'Importing, please wait!';

        const reader = new FileReader();
        reader.onload = function () {
            const parser = new DOMParser();
            const doc = parser.parseFromString(this.result, 'application/xml');

            if (!doc) {
                opmlImportStatus.textContent = 'Wrong file';
                return;
            }

            const feeds = doc.querySelectorAll('body > outline[text], body > outline[title]');

            [...feeds].forEach((feed) => {
                if (!feed.hasAttribute('xmlUrl')) {
                    const subFeeds = feed.querySelectorAll('outline[xmlUrl]');
                    const folderTitle = decodeHTML(feed.getAttribute('title') || feed.getAttribute('text'));

                    const duplicate = bg.folders.findWhere({title: folderTitle});

                    const folder = duplicate || bg.folders.create({
                        title: folderTitle
                    }, {wait: true});
                    const folderId = folder.get('id');

                    [...subFeeds].forEach((subFeed) => {
                        if (bg.sources.findWhere({url: decodeHTML(subFeed.getAttribute('xmlUrl'))})) {
                            return;
                        }
                        bg.sources.create({
                            title: decodeHTML(subFeed.getAttribute('title') || subFeed.getAttribute('text')),
                            url: decodeHTML(subFeed.getAttribute('xmlUrl')),
                            updateEvery: -1,
                            folderID: folderId
                        }, {wait: true});

                    });
                } else {
                    if (bg.sources.findWhere({url: decodeHTML(feed.getAttribute('xmlUrl'))})) {
                        return;
                    }
                    bg.sources.create({
                        title: decodeHTML(feed.getAttribute('title') || feed.getAttribute('text')),
                        url: decodeHTML(feed.getAttribute('xmlUrl')),
                        updateEvery: -1
                    }, {wait: true});
                }
            });

            opmlImportStatus.textContent = 'Import completed!';

            setTimeout(function () {
                bg.loader.downloadAll(true);
            }, 10);
        };


        reader.readAsText(file);
    }

    function handleClearSettings() {
        if (!confirm('Do you really want to remove all extension settings?')) {
            return;
        }
        const request = indexedDB.open('backbone-indexeddb', 4);
        request.addEventListener('success', function () {
            db = this.result;
            const transaction = db.transaction(['settings-backbone'], 'readwrite');
            const settings = transaction.objectStore('settings-backbone');
            settings.clear();
            chrome.alarms.clearAll();
            chrome.runtime.reload();
        });
    }

    function handleClearData() {
        if (!confirm('Do you really want to remove all extension data?')) {
            return;
        }

        bg.indexedDB.deleteDatabase('backbone-indexeddb');
        localStorage.clear();
        chrome.alarms.clearAll();
        chrome.runtime.reload();
    }


    function handleClearDeletedStorage() {
        if (!confirm('Do you really want to remove deleted articles metadata? This may cause some of them to appear again')) {
            return;
        }

        bg.items.where({
            deleted: true
        })
            .forEach((item) => {
                item.destroy();
            });
        alert('Done,extension will reboot now');
        chrome.runtime.reload();
    }

    function handleClearFavicons() {
        if (!confirm('Do you really want to remove all favicons?')) {
            return;
        }

        bg.sources.toArray().forEach((source) => {
            source.save({
                favicon: '/images/feed.png',
                faviconExpires: 0
            });
        });
        alert('Done');
    }

})
;
