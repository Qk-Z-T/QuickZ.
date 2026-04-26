// shared/services/firebase-app.js
// Firebase অ্যাপ ইনিশিয়ালাইজেশন ও এক্সপোর্ট (সিঙ্গেলটন)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { FIREBASE_CONFIG } from '../config/constants.js';

/**
 * Firebase অ্যাপ ইনস্ট্যান্স (সিঙ্গেলটন)
 */
const app = initializeApp(FIREBASE_CONFIG);

/**
 * Firebase Auth ইনস্ট্যান্স
 */
const auth = getAuth(app);

/**
 * Firestore ইনস্ট্যান্স
 */
const db = getFirestore(app);

/**
 * IndexedDB পারসিস্টেন্স সক্রিয় করা (অফলাইন সাপোর্ট)
 */
enableIndexedDbPersistence(db, {
    experimentalForceOwningTab: true
}).catch((err) => {
    console.warn('⚠️ Firestore persistence failed, falling back to memory cache:', err.message);
});

/**
 * Firebase Storage রেফারেন্স (প্রয়োজনে লোড হবে)
 */
let storage = null;
async function getStorageInstance() {
    if (!storage) {
        const module = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js");
        storage = module.getStorage(app);
    }
    return storage;
}

// গ্লোবাল এক্সপোজ
window.FirebaseApp = app;
window.FirebaseAuth = auth;
window.FirebaseDB = db;

export { app, auth, db, getStorageInstance };
