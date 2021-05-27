define(['views/TopView', 'text!templates/specialView.html'],
    function (TopView, specialView) {
        return TopView.extend({
            className: 'sources-list-item special',
            /*events: {
                'mouseup': 'handleMouseUp',
                'click': 'handleClick'
            },*/
            showContextMenu: function (e) {
                if (!this.contextMenu) {
                    return;
                }

                if (!this.el.classList.contains('selected')) {
                    app.feeds.feedList.select(this, e);
                }
                this.contextMenu.currentSource = this.model;
                this.contextMenu.show(e.clientX, e.clientY);
            },
            initialize: function () {
                this.el.view = this;
                if (this.model.get('onReady')) {
                    this.model.get('onReady').call(this);
                }
                bg.info.on('change', this.changeInfo, this);
                bg.sources.on('clear-events', this.handleClearEvents, this);
            },
            handleClearEvents: function (id) {
                if (window === null || id === tabID) {
                    this.clearEvents();
                }
            },
            clearEvents: function () {
                bg.info.off('change', this.changeInfo, this);
                bg.sources.off('clear-events', this.handleClearEvents, this);
            },
            changeInfo: function () {
                if (this.model.get('name') === 'all-feeds') {
                    const changed = bg.info.changedAttributes();
                    if (changed && typeof changed === 'object' && 'allCountUnread' in changed) {
                        this.render(true);
                    }
                    this.setTitle(bg.info.get('allCountUnread'), bg.info.get('allCountTotal'));
                    return;
                }
                if (this.model.get('name') === 'pinned') {
                    const changed = bg.info.changedAttributes();
                    if (changed && typeof changed === 'object' && 'pinnedCountUnread' in changed) {
                        this.render(true);
                    }
                    this.setTitle(bg.info.get('pinnedCountUnread'), bg.info.get('pinnedCountTotal'));
                    return;
                }
                if (this.model.get('name') === 'trash') {
                    const tot = bg.info.get('trashCountTotal');
                    this.setTitle(bg.info.get('trashCountUnread'), tot);

                    /**
                     * Change trash icon (0, 1-99, 100+)
                     */
                    if (tot <= 0 && this.model.get('icon') !== 'trashsource.png') {
                        this.model.set('icon', 'trashsource.png');
                        this.render(true);
                    } else if (tot > 0 && tot < 100 && this.model.get('icon') !== 'trash_full.png') {
                        this.model.set('icon', 'trash_full.png');
                        this.render(true);
                    } else if (tot >= 100 && this.model.get('icon') !== 'trash_really_full.png') {
                        this.model.set('icon', 'trash_really_full.png');
                        this.render(true);
                    }
                }
            },
            render: function (noinfo) {
                this.el.classList.remove('has-unread');
                const data = this.model.toJSON();
                data.count = 0;
                if (this.model.get('name') === 'all-feeds') {
                    data.count = bg.info.get('allCountUnread');
                }

                if (this.model.get('name') === 'pinned') {
                    data.count = bg.info.get('pinnedCountUnread');
                }

                if (data.count > 0) {
                    this.el.classList.add('has-unread');
                }
                while (this.el.firstChild) {
                    this.el.removeChild(this.el.firstChild);
                }

                const fragment = document.createRange().createContextualFragment(specialView);
                fragment.querySelector('.source-icon').src = '/images/' + data.icon;
                fragment.querySelector('.source-title').textContent = data.title;
                fragment.querySelector('.source-counter').textContent = data.count;
                this.el.appendChild(fragment);

                if (!noinfo) {
                    this.changeInfo();
                }
                return this;
            }
        });
    });
