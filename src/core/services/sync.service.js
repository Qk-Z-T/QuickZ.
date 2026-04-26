// src/core/services/sync.service.js
// অফলাইন → অনলাইন সিঙ্ক ইঞ্জিন

import { DBService } from './db.service.js';
import { FirestoreService } from './firestore.service.js';

const SYNC_INTERVAL_MS = 300000; // ৫ মিনিট
let syncTimer = null;

/**
 * সিঙ্ক ইঞ্জিন শুরু
 */
function startSyncEngine() {
    // অনলাইন/অফলাইন ইভেন্ট
    window.addEventListener('online', () => {
        console.log('🌐 Online — starting sync');
        processSyncQueue();
    });

    window.addEventListener('offline', () => {
        console.log('📴 Offline — sync paused');
    });

    // প্রাথমিক চেক
    if (navigator.onLine) {
        processSyncQueue();
    }

    // পর্যায়ক্রমিক সিঙ্ক
    syncTimer = setInterval(() => {
        if (navigator.onLine) processSyncQueue();
    }, SYNC_INTERVAL_MS);
}

/**
 * সিঙ্ক ইঞ্জিন বন্ধ
 */
function stopSyncEngine() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}

/**
 * পেন্ডিং আইটেম প্রসেস করা
 */
async function processSyncQueue() {
    try {
        const pending = await DBService.getPendingSyncItems();
        if (!pending || pending.length === 0) return;

        console.log(`🔄 Processing ${pending.length} sync items...`);

        for (const item of pending) {
            try {
                await handleSyncItem(item);
                await DBService.markSyncItemDone(item.id);
            } catch (e) {
                console.error(`Sync failed for item ${item.id}:`, e);
                // রিট্রাই কাউন্ট বাড়াই
                item.retryCount = (item.retryCount || 0) + 1;
                if (item.retryCount > 5) {
                    // ৫ বার fail হলে মার্ক করে দিই (পরে ম্যানুয়ালি দেখতে হবে)
                    await DBService.markSyncItemDone(item.id);
                    console.warn(`Item ${item.id} marked done after 5 retries (failed)`);
                }
            }
        }
    } catch (e) {
        console.error('Sync queue processing error:', e);
    }
}

/**
 * একেক ধরনের সিঙ্ক আইটেম হ্যান্ডেল
 */
async function handleSyncItem(item) {
    switch (item.collection) {
        case 'attempts':
            if (item.operation === 'add') {
                await FirestoreService.addDocument('attempts', item.payload);
            } else if (item.operation === 'update') {
                await FirestoreService.updateDocument('attempts', item.docId, item.payload);
            }
            break;

        case 'exams':
            if (item.operation === 'add') {
                await FirestoreService.addDocument('exams', item.payload);
            } else if (item.operation === 'update') {
                await FirestoreService.updateDocument('exams', item.docId, item.payload);
            }
            break;

        case 'students':
            if (item.operation === 'update') {
                await FirestoreService.updateDocument('students', item.docId, item.payload);
            }
            break;

        default:
            console.warn(`Unknown sync collection: ${item.collection}`);
    }
}

export const SyncService = {
    start: startSyncEngine,
    stop: stopSyncEngine,
    processSyncQueue,
};

window.SyncService = SyncService;
