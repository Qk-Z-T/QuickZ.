// src/core/services/db.service.js
// IndexedDB অফলাইন ডাটাবেজ র‍্যাপার

import { DB_STORES } from '../constants/app-constants.js';

const DB_NAME = 'QuickZOfflineDB';
const DB_VERSION = 2;
let dbPromise = null;

function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (ev) => {
            const db = ev.target.result;
            if (!db.objectStoreNames.contains(DB_STORES.EXAMS)) {
                db.createObjectStore(DB_STORES.EXAMS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(DB_STORES.RESULTS)) {
                db.createObjectStore(DB_STORES.RESULTS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(DB_STORES.QUESTIONS)) {
                db.createObjectStore(DB_STORES.QUESTIONS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(DB_STORES.SYNC_QUEUE)) {
                const store = db.createObjectStore(DB_STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
                store.createIndex('by_status', 'status');
                store.createIndex('by_collection', 'collection');
            }
        };
    });
    return dbPromise;
}

async function saveData(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        if (Array.isArray(data)) data.forEach(item => store.put(item));
        else store.put(data);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function getData(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = key ? store.get(key) : store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteData(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function addToSyncQueue(operation) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORES.SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(DB_STORES.SYNC_QUEUE);
        const item = { ...operation, status: 'pending', timestamp: Date.now(), retryCount: 0 };
        const request = store.add(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getPendingSyncItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORES.SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(DB_STORES.SYNC_QUEUE);
        const index = store.index('by_status');
        const request = index.getAll('pending');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function markSyncItemDone(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORES.SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(DB_STORES.SYNC_QUEUE);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const item = getReq.result;
            if (item) { item.status = 'done'; store.put(item); }
        };
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

async function getPendingByCollection(collectionName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORES.SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(DB_STORES.SYNC_QUEUE);
        const index = store.index('by_collection');
        const request = index.getAll(collectionName);
        request.onsuccess = () => {
            resolve(request.result.filter(item => item.status === 'pending'));
        };
        request.onerror = () => reject(request.error);
    });
}

export const DBService = {
    saveData, getData, deleteData,
    addToSyncQueue, getPendingSyncItems,
    markSyncItemDone, getPendingByCollection,
    STORES: DB_STORES
};
window.DB = DBService;
