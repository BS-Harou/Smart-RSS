/**
 * Prepare IndexedDB stores
 * @module BgProcess
 * @submodule preps/indexeddb
 */
define(['backbone', 'backboneDB'], function (BB) {

    /**
     * IndexedDB preps.
     */

    BB.IndexedDB.prepare = function (db) {
        if (!db.objectStoreNames.contains('settings-backbone')) {
            db.createObjectStore('settings-backbone', {keyPath: 'id'});
        }

        if (!db.objectStoreNames.contains('items-backbone')) {
            db.createObjectStore('items-backbone', {keyPath: 'id'});
        }

        if (!db.objectStoreNames.contains('sources-backbone')) {
            db.createObjectStore('sources-backbone', {keyPath: 'id'});
        }

        if (!db.objectStoreNames.contains('folders-backbone')) {
            db.createObjectStore('folders-backbone', {keyPath: 'id'});
        }

        if (!db.objectStoreNames.contains('toolbars-backbone')) {
            db.createObjectStore('toolbars-backbone', {keyPath: 'region'});
        }
    };

    /**
     * 1 -> 3: Main objects stores and testing
     * 3 -> 4: Added toolbars-backbone store
     */
    BB.IndexedDB.version = 4;

    return true;
});