// src/core/services/firestore.service.js
// Firestore CRUD র‍্যাপার (পুনরায়)

import { db } from '../config/firebase.js';
import {
    doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc,
    collection, query, where, orderBy, limit, writeBatch, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

export const FirestoreService = {
    async getDocument(collectionName, docId) {
        const snap = await getDoc(doc(db, collectionName, docId));
        return { id: snap.id, exists: snap.exists(), data: () => snap.data() };
    },
    async setDocument(collectionName, docId, data) {
        await setDoc(doc(db, collectionName, docId), data);
    },
    async updateDocument(collectionName, docId, data) {
        await updateDoc(doc(db, collectionName, docId), data);
    },
    async addDocument(collectionName, data) {
        const ref = await addDoc(collection(db, collectionName), data);
        return ref.id;
    },
    async deleteDocument(collectionName, docId) {
        await deleteDoc(doc(db, collectionName, docId));
    },
    async queryDocuments(collectionName, conditions = [], opts = {}) {
        const constraints = conditions.map(c => where(c.field, c.operator, c.value));
        if (opts.orderByField) constraints.push(orderBy(opts.orderByField, opts.orderDirection || 'asc'));
        if (opts.limitCount) constraints.push(limit(opts.limitCount));
        const q = query(collection(db, collectionName), ...constraints);
        const snap = await getDocs(q);
        const results = [];
        snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
        return results;
    },
    listenToCollection(collectionName, conditions, callback) {
        const constraints = conditions.map(c => where(c.field, c.operator, c.value));
        const q = query(collection(db, collectionName), ...constraints);
        return onSnapshot(q, snap => {
            const docs = [];
            snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
            callback(docs);
        });
    },
    listenToDocument(collectionName, docId, callback) {
        return onSnapshot(doc(db, collectionName, docId), snap => {
            if (snap.exists()) callback({ id: snap.id, ...snap.data() });
            else callback(null);
        });
    }
};
window.FirestoreService = FirestoreService;
