/**
 * @module App
 * @submodule views/ContextMenu
 */
define([
        'backbone', 'collections/MenuCollection', 'views/MenuItemView', 'controllers/comm'
    ],
    function (BB, MenuCollection, MenuItemView, comm) {

        /**
         * Context menu view
         * @class ContextMenu
         * @constructor
         * @extends Backbone.View
         */
        let ContextMenu = BB.View.extend({

            /**
             * Tag name of content view element
             * @property tagName
             * @default 'div'
             * @type String
             */
            tagName: 'div',

            /**
             * Class name of content view element
             * @property className
             * @default 'context-menu'
             * @type String
             */
            className: 'context-menu',

            /**
             * Backbone collection of all context menu items
             * @property menuCollection
             * @default 'context-menu'
             * @type MenuCollection
             */
            menuCollection: null,

            /**
             * Adds one context menu item
             * @method addItem
             * @param item {models/MenuItem} New menu item
             */
            addItem: function (item) {
                const itemView = new MenuItemView({
                    model: item
                });
                itemView.contextMenu = this;
                this.el.insertAdjacentElement('beforeend', itemView.render().el);
            },

            /**
             * Adds multiple context menu items
             * @method addItems
             * @param items {Array|MenuCollection} List of models to add
             */
            addItems: function (items) {
                items.forEach((item) => {
                    this.addItem(item);
                });
            },


            /**
             * Called when new instance is created
             * @method initialize
             * @param mc {MenuCollection} Menu collection for this context menu
             */
            initialize: function (mc) {
                this.el.view = this;
                this.el.hidden = true;
                this.menuCollection = new MenuCollection(mc);
                this.addItems(this.menuCollection);
                document.body.appendChild(this.render().el);
                this.listenTo(comm, 'hide-overlays', this.hide);
            },

            /**
             * Displays the context menu and moves it to given position
             * @method show
             * @param x {Number} x-coordinate
             * @param y {Number} y-coordinate
             */
            show: function (x, y) {
                this.el.hidden = false;
                if (x + this.el.offsetWidth + 4 > document.body.offsetWidth) {
                    x = document.body.offsetWidth - this.el.offsetWidth - 8;
                }
                if (y + this.el.offsetHeight + 4 > document.body.offsetHeight) {
                    y = document.body.offsetHeight - this.el.offsetHeight - 8;
                }
                this.el.style.left = x + 'px';
                this.el.style.top = y + 'px';
            },

            /**
             * Hides the context menu
             * @method hide
             * @triggered when 'hide-overlays' comm message is sent
             */
            hide: function () {
                this.el.hidden = true;
            }
        });

        return ContextMenu;
    });