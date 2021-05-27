/**
 * My own Backbone indexDB Adapter based on indexedDB adapter from jeromegn:
 *
 * Version 1.1.6
 * https://github.com/jeromegn/Backbone.localStorage
 */
(function (root, factory) {
    if (typeof exports === 'object' && root.require) {
        module.exports = factory(require('backbone'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['backbone'], function (Backbone) {
            // Use global variables if the locals are undefined.
            return factory(Backbone || root.Backbone);
        });
    } else {
        // RequireJS isn't being used. Assume underscore and backbone are loaded in <script> tags
        factory(Backbone);
    }
}(this, function (Backbone) {
    // A simple module to replace `Backbone.sync` with *IndexedDB*-based
    // persistence. Models are given GUIDS, and saved into a JSON object. Simple
    // as that.


    // Generate four random hex digits.
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    // Generate a pseudo-GUID by concatenating random hexadecimal.

    function guid() {
        return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
    }

    // Our Store is represented by a single JS object in *IndexedDB*. Create it
    // with a meaningful name, like the name you'd give a table.
    // window.Store is deprecated, use Backbone.IndexedDB instead
    Backbone.IndexedDB = function (name) {
        if (!window.indexedDB) {
            throw 'Backbone.indexedDB: Environment does not support IndexedDB.';
        }
        this.name = name;
        this.db = null;
        const request = window.indexedDB.open('backbone-indexeddb', Backbone.IndexedDB.version);
        this.dbRequest = request;
        const that = this;

        request.addEventListener('error', function (e) {
            // user probably disallowed idb
            throw 'Error code: ' + this.errorCode;
            // what are the possible codes???
        });

        request.addEventListener('success', function (e) {
            that.db = this.result;
        });

        request.addEventListener('upgradeneeded', function (e) {
            const db = this.result;
            Backbone.IndexedDB.prepare(db);
        });
    };

    Backbone.IndexedDB.prototype = Object.assign(Backbone.IndexedDB.prototype, {

        // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
        // have an id of it's own.
        create: function (model) {
            if (!model.id) {
                model.id = guid();
                model.set(model.idAttribute, model.id);
            }
            this.indexedDB().add(model.toJSON());
        },

        // Update a model by replacing its copy in `this.data`.
        update: function (model, cb) {
            this.indexedDB().put(model.toJSON());
        },

        // Retrieve a model from `this.data` by id.
        find: function (model, cb) {
            const request = this.indexedDB().get(model.id);
            request.onsuccess = function () {
                cb(this.result);
            };
            request.onerror = function () {
                throw 'IndexDB Error: Can\'t read from or write to database';
            };
        },

        // Return the array of all models currently in storage.
        findAll: function (cb) {
            const items = [];

            this.indexedDB('readonly').openCursor().onsuccess = function (event) {
                const cursor = this.result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    cb(items);
                }
            };
        },

        // Delete a model from `this.data`, returning it.
        destroy: function (model) {
            if (model.isNew()) {
                return false;
            }
            this.indexedDB().delete(model.id);
            return model;
        },

        indexedDB: (function () {
            let tx;

            window.addEventListener('message', function (e) {
                if (e.data.action === 'clear-tx') {
                    tx = null;
                }
            });

            return function (type) {
                if (tx && !type) {
                    try {
                        const tmpStore = tx.objectStore(this.name);
                        // necessary to trigger error with <1ms async calls
                        tmpStore.get(-1);
                        return tmpStore;
                    } catch (e) {
                    }
                }

                const names = [...this.db.objectStoreNames].map((item) => {
                    return item;
                });
                const tmpTx = this.db.transaction(names, type || 'readwrite');

                const tmpStore = tmpTx.objectStore(this.name);
                if (!type) {
                    tx = tmpTx;
                    // setImmidiate polyfill , doesn't work very wll tho.
                    window.postMessage({action: 'clear-tx'}, '*');
                }

                return tmpStore;
            };
        })(),

        _clear: function (cb) {
            const req = this.indexedDB().clear();
            req.onsuccess = cb;
            req.onerror = cb;
        },

        // Size of indexedDB.
        _storageSize: function (cb) {
            this.indexedDB().count().onsuccess = cb;
        }

    });

    // localSync delegate to the model or collection's
    // *indexedDB* property, which should be an instance of `Store`.
    // window.Store.sync and Backbone.localSync is deprecated, use Backbone.IndexedDB.sync instead
    Backbone.IndexedDB.sync =  function (method, model, options) {
        const store = model.indexedDB || model.collection.indexedDB;
        options = options || {};

        const that = this;

        let errorMessage;
        let syncDfd = options.syncDfd || (Backbone.$.Deferred && Backbone.$.Deferred()); //If $ is having Deferred - use it.
        options.syncDfd = syncDfd;

        if (!store.db) {
            store.dbRequest.addEventListener('success', function (e) {
                store.db = this.result;
                Backbone.IndexedDB.sync.call(that, method, model, options);
            });
        } else {

            const cbh = callbackHandler.bind(this, options);

            try {
                switch (method) {
                    case 'read':
                        model.id !== undefined ? store.find(model, cbh) : store.findAll(cbh);
                        break;
                    case 'create':
                        store.create(model, nothing);
                        cbh(model.toJSON());
                        break;
                    case 'update':
                        store.update(model, nothing);
                        cbh(model.toJSON());
                        break;
                    case 'delete':
                        store.destroy(model, nothing);
                        cbh(model.toJSON());
                        break;
                }

            } catch (error) {
                if (error.code === 22) { // && store._storageSize() === 0, what is code 22?
                    errorMessage = 'Private browsing is unsupported';
                } else {
                    errorMessage = error.message;
                }
                cbh(null, errorMessage);
            }
        }
        return syncDfd && syncDfd.promise();
    };

    function nothing() {

    }

    function callbackHandler(options, resp, errorMessage) {

        const syncDfd = options.syncDfd;
        if (resp) {
            if (options && options.success) {
                options.success(resp);
            }
            if (syncDfd) {
                syncDfd.resolve(resp);
            }

        } else {
            errorMessage = errorMessage ? errorMessage : 'Record Not Found';

            if (options && options.error) {
                options.error(errorMessage);
            }

            if (syncDfd) {
                syncDfd.reject(errorMessage);
            }
        }

        if (options && options.complete) {
            options.complete(resp);
        }

    }

    Backbone.ajaxSync = Backbone.sync;

    Backbone.getSyncMethod = function (model) {
        if (model.indexedDB || (model.collection && model.collection.indexedDB)) {
            return Backbone.IndexedDB.sync;
        }

        return Backbone.ajaxSync;
    };

    // Override 'Backbone.sync' to default to localSync,
    // the original 'Backbone.sync' is still available in 'Backbone.ajaxSync'
    Backbone.sync = function (method, model, options) {
        return Backbone.getSyncMethod(model).apply(this, [method, model, options]);
    };

    return Backbone.IndexedDB;
}));
