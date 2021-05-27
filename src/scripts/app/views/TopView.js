define([
    'backbone', 'modules/Locale', 'text!templates/topView.html',
], function (BB, Locale, topViewTemplate) {
    return BB.View.extend({
        tagName: 'div',
        template: topViewTemplate,
        className: 'sources-list-item',
        handleMouseUp: function (e) {
            if (e.which === 3) {
                this.showContextMenu(e);
            }
        },
        getSelectData: function (e) {
            return {
                action: 'new-select',
                value: this.model.id || Object.assign({}, this.model.get('filter')),
                name: this.model.get('name'),
                unreadOnly: !!e.altKey
            };
        },
        setTitle: function (unread, total) {
            this.el.setAttribute('title',
                this.model.get('title') + ' (' + unread + ' ' + Locale.UNREAD + ', ' + total + ' ' + Locale.TOTAL + ')'
            );
        }
    });
});
