define(['backbone'], function (BB) {
    return BB.View.extend({
        tagName: 'div',
        className: 'button',
        initialize: function () {
            const action = app.actions.get(this.model.get('actionName'));
            this.el.style.background = 'url("/images/' + action.get('icon') + '") no-repeat center center';

            this.el.dataset.action = this.model.get('actionName');
            this.el.title = action.get('title');

            this.el.view = this;
        }
    });
});
