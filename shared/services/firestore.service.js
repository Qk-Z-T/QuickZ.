// shared/services/firestore.service.js
// Firestore CRUD অপারেশনের জন্য পুনর্ব্যবহারযোগ্য র‍্যাপার

import { db } from './firebase-app.js';
import {
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

/**
 * একটি ডকুমেন্ট পড়া
 * @param {string} collectionName 
 * @param {string} docId 
 * @returns {Promise<{id: string, exists: boolean, data: Function}>}
 */
async function getDocument(collectionName, docId) {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return {
        id: docSnap.id,
        exists: docSnap.exists(),
        data: () => docSnap.data()
    };
}

/**
 * ডকুমেন্ট সেট/ওভাররাইট করা
 * @param {string} collectionName 
 * @param {string} docId 
 * @param {Object} data 
 * @returns {Promise<void>}
 */
async function setDocument(collectionName, docId, data) {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
}

/**
 * ডকুমেন্ট আপডেট (মার্জ) করা
 * @param {string} collectionName 
 * @param {string} docId 
 * @param {Object} data 
 * @returns {Promise<void>}
 */
async function updateDocument(collectionName, docId, data) {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
}

/**
 * নতুন ডকুমেন্ট যোগ করা (অটো-জেনারেটেড ID)
 * @param {string} collectionName 
 * @param {Object} data 
 * @returns {Promise<string>} - নতুন ডকুমেন্টের ID
 */
async function addDocument(collectionName, data) {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
}

/**
 * ডকুমেন্ট মুছে ফেলা
 * @param {string} collectionName 
 * @param {string} docId 
 * @returns {Promise<void>}
 */
async function deleteDocument(collectionName, docId) {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
}

/**
 * একাধিক ডকুমেন্ট মুছে ফেলা (ব্যাচ)
 * @param {string} collectionName 
 * @param {string[]} docIds 
 * @returns {Promise<void>}
 */
async function deleteDocuments(collectionName, docIds) {
    const batch = writeBatch(db);
    docIds.forEach(id => {
        const docRef = doc(db, collectionName, id);
        batch.delete(docRef);
    });
    await batch.commit();
}

/**
 * কুয়েরি চালানো
 * @param {string} collectionName 
 * @param {Array<{field: string, operator: string, value: any}>} conditions 
 * @param {{orderByField?: string, orderDirection?: 'asc'|'desc', limitCount?: number}} [options]
 * @returns {Promise<Array<{id: string, data: Function}>>}
 */
async function queryDocuments(collectionName, conditions = [], options = {}) {
    const constraints = conditions.map(c => where(c.field, c.operator, c.value));
    
    if (options.orderByField) {
        constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    if (options.limitCount) {
        constraints.push(limit(options.limitCount));
    }
    
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const results = [];
    querySnapshot.forEach(doc => {
        results.push({
            id: doc.id,
            data: () => doc.data()
        });
    });
    return results;
}

/**
 * রিয়েল-টাইম লিসেনার সেট করা
 * @param {string} collectionName 
 * @param {Array<{field: string, operator: string, value: any}>} conditions 
 * @param {Function} callback - (docs[]) => void
 * @returns {Function} unsubscribe function
 */
function listenToCollection(collectionName, conditions = [], callback) {
    const constraints = conditions.map(c => where(c.field, c.operator, c.value));
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = [];
        snapshot.forEach(doc => {
            docs.push({ id: doc.id, ...doc.data() });
        });
        callback(docs);
    }, (error) => {
        console.error(`❌ Snapshot error for ${collectionName}:`, error);
    });
    
    return unsubscribe;
}

/**
 * নির্দিষ্ট ডকুমেন্টে রিয়েল-টাইম লিসেনার
 * @param {string} collectionName 
 * @param {string} docId 
 * @param {Function} callback - (doc) => void
 * @returns {Function} unsubscribe function
 */
function listenToDocument(collectionName, docId, callback) {
    const docRef = doc(db, collectionName, docId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
        } else {
            callback(null);
        }
    });
    
    return unsubscribe;
}

// গ্লোবাল এক্সপোজ
window.FirestoreService = {
    getDocument,
    setDocument,
    updateDocument,
    addDocument,
    deleteDocument,
    deleteDocuments,
    queryDocuments,
    listenToCollection,
    listenToDocument
};

export {
    getDocument,
    setDocument,
    updateDocument,
    addDocument,
    deleteDocument,
    deleteDocuments,
    queryDocuments,
    listenToCollection,
    listenToDocument
};
