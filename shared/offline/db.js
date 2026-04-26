// shared/offline/db.js
// কেন্দ্রীয় IndexedDB ডাটাবেজ ম্যানেজার (স্টুডেন্ট + টিচার উভয়ের জন্য)

const DB_NAME = 'QuickZOfflineDB';
const DB_VERSION = 2;

/**
 * ডাটাবেজ স্টোরের নামসমূহ
 */
const STORES = {
    EXAMS: 'exams',
    RESULTS: 'results',
    QUESTIONS: 'questions',
    SYNC_QUEUE: 'syncQueue'
};

let dbPromise = null;

/**
 * IndexedDB ওপেন করে প্রমিজ রিটার্ন করে
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (ev) => {
            const db = ev.target.result;

            if (!db.objectStoreNames.contains(STORES.EXAMS)) {
                db.createObjectStore(STORES.EXAMS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.RESULTS)) {
                db.createObjectStore(STORES.RESULTS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.QUESTIONS)) {
                db.createObjectStore(STORES.QUESTIONS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                const store = db.createObjectStore(STORES.SYNC_QUEUE, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('by_status', 'status');
                store.createIndex('by_collection', 'collection');
            }
        };
    });

    return dbPromise;
}

/**
 * ডাটা সংরক্ষণ করে (একক বা অ্যারে)
 * @param {string} storeName 
 * @param {Object|Object[]} data 
 * @returns {Promise<boolean>}
 */
async function saveData(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        if (Array.isArray(data)) {
            data.forEach(item => store.put(item));
        } else {
            store.put(data);
        }
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * ডাটা পড়ে (কি দিলে একক, না দিলে সব)
 * @param {string} storeName 
 * @param {string} [key] 
 * @returns {Promise<Object|Object[]>}
 */
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

/**
 * ডাটা মুছে ফেলে
 * @param {string} storeName 
 * @param {string} key 
 * @returns {Promise<boolean>}
 */
async function deleteData(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(key);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * সিঙ্ক কিউতে অপারেশন যোগ করে (অফলাইন সাবমিশনের জন্য)
 * @param {Object} operation 
 * @param {string} operation.collection
 * @param {string} operation.operation - 'add' | 'update' | 'delete'
 * @param {Object} operation.payload
 * @param {string} [operation.docId]
 * @param {string} [operation.teacherId]
 * @returns {Promise<number>} - নতুন আইটেমের id
 */
async function addToSyncQueue(operation) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const item = {
            ...operation,
            status: 'pending',
            timestamp: Date.now(),
            retryCount: 0
        };
        const request = store.add(item);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * পেন্ডিং সব সিঙ্ক আইটেম রিটার্ন করে
 * @returns {Promise<Object[]>}
 */
async function getPendingSyncItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const index = store.index('by_status');
        const request = index.getAll('pending');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * সিঙ্ক আইটেমকে সম্পন্ন হিসেবে চিহ্নিত করে
 * @param {number} id 
 * @returns {Promise<boolean>}
 */
async function markSyncItemDone(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
            const item = getReq.result;
            if (item) {
                item.status = 'done';
                store.put(item);
            }
        };
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}

/**
 * নির্দিষ্ট collection-এর পেন্ডিং আইটেম ফেরত দেয়
 * @param {string} collectionName 
 * @returns {Promise<Object[]>}
 */
async function getPendingByCollection(collectionName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        const index = store.index('by_collection');
        const request = index.getAll(collectionName);
        request.onsuccess = () => {
            const pending = request.result.filter(item => item.status === 'pending');
            resolve(pending);
        };
        request.onerror = () => reject(request.error);
    });
}

// গ্লোবাল এক্সপোজ (সব জায়গা থেকে ব্যবহার করা যাবে)
window.DB = {
    saveData,
    getData,
    deleteData,
    addToSyncQueue,
    getPendingSyncItems,
    markSyncItemDone,
    getPendingByCollection,
    STORES
};

export { saveData, getData, deleteData, addToSyncQueue, getPendingSyncItems, markSyncItemDone, getPendingByCollection, STORES };
