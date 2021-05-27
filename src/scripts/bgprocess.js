require.config({

    baseUrl: 'scripts/bgprocess',
    waitSeconds: 0,

    paths: {
        jquery: '../libs/jquery.min',
        underscore: '../libs/underscore.min',
        backbone: '../libs/backbone.min',
        backboneDB: '../libs/backbone.indexDB',
        text: '../libs/require.text'
    },

    shim: {
        jquery: {
            exports: '$'
        },
        backbone: {
            deps: ['underscore'],
            exports: 'Backbone'
        },
        backboneDB: {
            deps: ['backbone']
        },
        underscore: {
            exports: '_'
        }
    }
});

requirejs(['bg'], function () {
    // bg started
});

