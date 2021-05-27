define(['backbone'], function (BB) {
    return BB.View.extend({
        tagName: 'div',
        className: 'context-menu-item',
        contextMenu: null,
        events: {
            'click': 'handleClick'
        },
        initialize: function () {
            if (this.model.id) {
                this.el.id = this.model.id;
            }
        },
        render: function () {
            while (this.el.firstChild) {
                this.el.removeChild(this.el.firstChild);
            }

            const fragment = document.createRange().createContextualFragment('<img class="context-menu-icon" alt="" src=""/>' + this.model.get('title'));
            this.el.appendChild(fragment);

            if (this.model.get('icon')) {
                this.el.querySelector('img').setAttribute('src', '/images/' + this.model.get('icon'));
            }
            return this;
        },
        handleClick: function (e) {
            const action = this.model.get('action');
            if (action && typeof action === 'function') {
                action(e, app.feeds.feedList);
            }
            this.contextMenu.hide();
        }
    });
});