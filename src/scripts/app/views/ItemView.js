/**
 * @module App
 * @submodule views/ItemView
 */
define([
    'backbone', '../../libs/template', 'helpers/formatDate', 'instances/contextMenus', 'helpers/stripTags', 'text!templates/item.html'
], function (BB, template, formatDate, contextMenus, stripTags, tplItem) {

    /**
     * View of one article item in article list
     * @class ItemView
     * @constructor
     * @extends Backbone.View
     */
    let ItemView = BB.View.extend({

        /**
         * Tag name of article item element
         * @property tagName
         * @default 'a'
         * @type String
         */
        tagName: 'a',

        /**
         * Class name of article item element
         * @property className
         * @default 'item'
         * @type String
         */
        className: 'articles-list-item',

        /**
         * Article item view template
         * @property template
         * @default ./templates/item.html
         * @type Function
         */
        template: template(tplItem),

        /**
         * Reference to view/articleList instance. It should be replaced with require('views/articleList')
         * @property list
         * @default null
         * @type Backbone.View
         */
        list: null,

        /**
         * Initializations (*constructor*)
         * @method initialize
         * @param opt {Object} I don't use it, but it is automatically passed by Backbone
         * @param list {Backbone.View} Reference to articleList
         */
        initialize: function (opt, list) {
            this.multiple = opt.model.multiple;
            this.list = list;
            // this.el.setAttribute('draggable', 'true');
            this.el.view = this;
            this.setEvents();
        },

        /**
         * Set events that are binded to bgprocess
         * @method setEvents
         */
        setEvents: function () {
            this.model.on('change', this.handleModelChange, this);
            this.model.on('destroy', this.handleModelDestroy, this);
            bg.sources.on('clear-events', this.handleClearEvents, this);
        },


        /**
         * If the tab is closed, it will remove all events bound to bgprocess
         * @method handleClearEvents
         * @triggered when bgprocesses triggers clear-events event
         * @param id {Number} ID of closed tab
         */
        handleClearEvents: function (id) {
            if (window == null || id === tabID) {
                this.clearEvents();
            }
        },

        /**
         * Removes all events binded to bgprocess
         * @method clearEvents
         */
        clearEvents: function () {
            if (this.model) {
                this.model.off('change', this.handleModelChange, this);
                this.model.off('destroy', this.handleModelDestroy, this);
            }
            bg.sources.off('clear-events', this.handleClearEvents, this);
        },

        /**
         * Renders article item view
         * @method render
         * @chainable
         */
        render: function () {
            const classList = this.el.classList;
            classList.remove('pinned');
            classList.remove('unvisited');
            classList.remove('unread');
            classList.remove('one-line');

            if (!this.model.get('visited')) {
                classList.add('unvisited');
            }
            if (this.model.get('unread')) {
                classList.add('unread');
            }
            if (this.model.get('pinned')) {
                classList.add('pinned');
            }
            if (bg.settings.get('lines') === '1') {
                classList.add('one-line');
            }

            const changedAttributes = this.model.changedAttributes();
            if (changedAttributes) {
                const caKeys = Object.keys(changedAttributes);
                if ((('unread' in changedAttributes || 'visited' in changedAttributes) && caKeys.length === 1) || ('unread' in changedAttributes && 'visited' in changedAttributes && caKeys.length === 2)) {
                    return this;
                }
            }

            let article = this.model.toJSON();
            article.datetime = new Date(article.date).toISOString();
            article.date = this.getItemDate(article.date);
            article.title = stripTags(article.title).trim() || '&lt;no title&gt;';
            if(this.multiple){
                const source = bg.sources.find({id: this.model.get('sourceID')});
                article.sourceTitle = source.get('title');
                // article.favicon = source.get('favicon');
                article.author = article.sourceTitle !== article.author ? article.sourceTitle + ' - ' + article.author : article.author;
            }
            this.el.setAttribute('href', article.url);
            if (bg.settings.get('showFullHeadline') === '1') {
                this.el.classList.add('full-headline');
            } else {
                this.el.setAttribute('title', article.title);
            }


            while (this.el.firstChild) {
                this.el.removeChild(this.el.firstChild);
            }

            const fragment = document.createRange().createContextualFragment(this.template(article));
            this.el.appendChild(fragment);

            return this;
        },

        /**
         * Returns formatted date according to user settings and time interval
         * @method getItemDate
         * @param date {Number} UTC time
         * @return String
         */
        getItemDate: function (date) {
            const dateFormats = {normal: 'DD.MM.YYYY', iso: 'YYYY-MM-DD', us: 'MM/DD/YYYY'};
            const pickedFormat = dateFormats[bg.settings.get('dateType') || 'normal'] || dateFormats['normal'];

            const timeFormat = bg.settings.get('hoursFormat') === '12h' ? 'H:mm a' : 'hh:mm';

            if (date) {
                if (bg.settings.get('fullDate')) {
                    date = formatDate(new Date(date), pickedFormat + ' ' + timeFormat);
                } else if (parseInt(formatDate(date, 'T') / 86400000, 10) >= parseInt(formatDate(Date.now(), 'T') / 86400000, 10)) {
                    date = formatDate(new Date(date), timeFormat);
                } else if ((new Date(date)).getFullYear() === (new Date()).getFullYear()) {
                    date = formatDate(new Date(date), pickedFormat.replace(/\/?YYYY(?!-)/, ''));
                } else {
                    date = formatDate(new Date(date), pickedFormat);
                }
            }

            return date;
        },

        /**
         * Shows context menu on right click
         * @method handleMouseUp
         * @triggered on mouse up + condition for right click only
         * @param event {MouseEvent}
         */
        handleMouseUp: function (event) {
            if (event.button === 2) {
                this.showContextMenu(event);
            }
        },

        /**
         * Shows context menu for article item
         * @method showContextMenu
         * @param event {MouseEvent}
         */
        showContextMenu: function (event) {
            if (!this.el.classList.contains('selected')) {
                this.list.select(this, event);
            }
            contextMenus.get('items').currentSource = this.model;
            contextMenus.get('items').show(event.clientX, event.clientY);
        },

        /**
         * When model is changed rerender it or remove it from DOM (depending on what is changed)
         * @method handleModelChange
         * @triggered when model is changed
         */
        handleModelChange: function () {
            if (this.model.get('deleted') || (this.list.currentData.name !== 'trash' && this.model.get('trashed'))) {
                this.list.destroyItem(this);
            } else {
                this.render();
            }
        },

        /**
         * When model is removed from DB/Backbone remove it from DOM as well
         * @method handleModelDestroy
         * @triggered when model is destroyed
         */
        handleModelDestroy: function () {
            this.list.destroyItem(this);
        },

        /**
         * Changes pin state (true/false)
         * @method when user clicked on pin button in article item
         * @triggered when model is destroyed
         */
        handleClickPin: function (event) {
            event.stopPropagation();
            this.model.save({pinned: !this.model.get('pinned')});
        }
    });

    return ItemView;
});
