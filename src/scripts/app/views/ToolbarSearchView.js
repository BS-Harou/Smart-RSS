define(['backbone', 'modules/Locale'], function (BB, Locale) {
    return BB.View.extend({
        tagName: 'input',
        className: 'input-search',
        initialize: function () {
            this.el.setAttribute('placeholder', Locale.SEARCH);
            this.el.setAttribute('type', 'search');
            this.el.setAttribute('tabindex', -1);

            const action = app.actions.get(this.model.get('actionName'));

            this.el.dataset.action = this.model.get('actionName');
            this.el.title = action.get('title');

            this.el.view = this;
        }
    });
});
