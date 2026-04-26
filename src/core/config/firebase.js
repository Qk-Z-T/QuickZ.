// src/core/config/firebase.js
// Firebase অ্যাপ, Auth, Firestore সিঙ্গেলটন

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB4A6r2JlK_P-29fmC8LSi8gz-HjzFA4CQ",
    authDomain: "exam-611e5.firebaseapp.com",
    projectId: "exam-611e5",
    storageBucket: "exam-611e5.firebasestorage.app",
    messagingSenderId: "887013693688",
    appId: "1:887013693688:web:35cedd5b463bf642fa030d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// অফলাইন পারসিস্টেন্স
enableIndexedDbPersistence(db, {
    experimentalForceOwningTab: true
}).catch((err) => {
    console.warn('⚠️ Firestore persistence failed:', err.message);
});

// গ্লোবাল এক্সপোজ (লিগ্যাসি কোডের সাথে সামঞ্জস্যের জন্য)
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;

export { app, auth, db };
