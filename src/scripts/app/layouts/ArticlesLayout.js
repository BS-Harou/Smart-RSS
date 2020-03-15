/**
 * @module App
 * @submodule layouts/ArticlesLayout
 */
define([
        'layouts/Layout', 'views/ToolbarView', 'views/articleList',
        'mixins/resizable'
    ],
    function (Layout, ToolbarView, articleList, resizable) {

        const toolbar = bg.toolbars.findWhere({region: 'articles'});

        /**
         * Articles layout view
         * @class ArticlesLayout
         * @constructor
         * @extends Layout
         */
        let ArticlesLayout = Layout.extend({
            el: '#articles',
            events: {
                'keydown': 'handleKeyDown',
                'mousedown': 'handleMouseDown'
            },
            initialize: function () {
                this.el.view = this;

                this.on('attach', function () {
                    this.attach('toolbar', new ToolbarView({model: toolbar}));
                    this.attach('articleList', articleList);
                });

                // this.el.addEventListener('focus', (event) => {
                //     event.target.classList.add('focused');
                //     clearTimeout(blurTimeout);
                // });


                // let focus = true;
                // let blurTimeout;

                // comm.on('stop-blur', function () {
                //     focus = false;
                // });

                // this.el.addEventListener('blur', (event) => {
                //     blurTimeout = setTimeout(() => {
                //         if (focus && !event.relatedTarget) {
                //             this.focus();
                //             return;
                //         }
                //         event.target.classList.remove('focused');
                //         focus = true;
                //     }, 0);
                // });
                this.on('resize:after', this.handleResizeAfter);
            },

            /**
             * Saves the new layout size
             * @triggered after resize
             * @method handleResizeAfter
             */
            handleResizeAfter: function () {

                if (bg.settings.get('layout') === 'horizontal') {
                    const width = this.el.offsetWidth;
                    bg.settings.save({posB: width});
                } else {
                    const height = this.el.offsetHeight;
                    bg.settings.save({posC: height});
                }
            }
        });

        ArticlesLayout = ArticlesLayout.extend(resizable);

        return ArticlesLayout;
    });
