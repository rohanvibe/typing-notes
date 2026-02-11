import { openDB } from 'idb';
import { bus } from '../core/event-bus.js';

const DB_NAME = 'typing-notes-db';
const DB_VERSION = 1;

export const STORES = {
    NOTES: 'notes',
    FOLDERS: 'folders',
    SETTINGS: 'settings',
    SYNC_META: 'sync_meta'
};

class Database {
    constructor() {
        this.dbPromise = null;
    }

    async init() {
        this.dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                // Notes Store
                if (!db.objectStoreNames.contains(STORES.NOTES)) {
                    const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
                    notesStore.createIndex('folderId', 'folderId');
                    notesStore.createIndex('updated_at', 'updated_at');
                }

                // Folders Store
                if (!db.objectStoreNames.contains(STORES.FOLDERS)) {
                    const foldersStore = db.createObjectStore(STORES.FOLDERS, { keyPath: 'id' });
                    foldersStore.createIndex('parentId', 'parentId');
                }

                // Settings Store
                if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                    db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
                }

                // Sync Meta Store
                if (!db.objectStoreNames.contains(STORES.SYNC_META)) {
                    db.createObjectStore(STORES.SYNC_META, { keyPath: 'id' });
                }
            },
        });
        await this.dbPromise;
        console.log('Database initialized');
    }

    async get(storeName, key) {
        return (await this.dbPromise).get(storeName, key);
    }

    async getAll(storeName) {
        return (await this.dbPromise).getAll(storeName);
    }

    async set(storeName, value) {
        const result = await (await this.dbPromise).put(storeName, value);
        bus.emit('db:update', { store: storeName, key: value.id || value.key, value });
        return result;
    }

    async delete(storeName, key) {
        const result = await (await this.dbPromise).delete(storeName, key);
        bus.emit('db:delete', { store: storeName, key });
        return result;
    }

    // Helper for Folders
    async getNotesInFolder(folderId) {
        return (await this.dbPromise).getAllFromIndex(STORES.NOTES, 'folderId', folderId);
    }
}

export const db = new Database();
