/**
 * @module App
 * @submodule layouts/ContentLayout
 */
define([
        'layouts/Layout', 'views/ToolbarView', 'views/contentView', 'views/SandboxView'
    ],
    function (Layout, ToolbarView, contentView, SandboxView) {

        const toolbar = bg.toolbars.findWhere({region: 'content'});

        /**
         * Content layout view
         * @class ContentLayout
         * @constructor
         * @extends Layout
         */
        let ContentLayout = Layout.extend({

            /**
             * View element
             * @property el
             * @default #content
             * @type HTMLElement
             */
            el: '#content',

            /**
             * @method initialize
             */
            initialize: function () {
                this.on('attach', function () {

                    this.attach('toolbar', new ToolbarView({model: toolbar}));
                    this.attach('content', contentView);
                    this.attach('sandbox', new SandboxView());
                });
            }
        });

        return ContentLayout;
    });
