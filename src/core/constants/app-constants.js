// src/core/constants/app-constants.js
// অ্যাপ-ব্যাপী কনস্ট্যান্ট

/** Firebase কনফিগ (আবার এক্সপোর্ট করা হলো) */
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB4A6r2JlK_P-29fmC8LSi8gz-HjzFA4CQ",
    authDomain: "exam-611e5.firebaseapp.com",
    projectId: "exam-611e5",
    storageBucket: "exam-611e5.firebasestorage.app",
    messagingSenderId: "887013693688",
    appId: "1:887013693688:web:35cedd5b463bf642fa030d"
};

/** পেজ লিস্ট */
export const STUDENT_PAGES = ['dashboard','courses','rank','results','analysis','notices','management','profile'];
export const TEACHER_PAGES = ['home','create','rank','folders','management'];

/** ক্লাস ও শাখা */
export const CLASS_LEVELS = ['6','7','8','SSC','HSC','Admission'];
export const ADMISSION_STREAMS = ['Science','Humanities','Commerce'];

/** ডাটাবেজ স্টোর */
export const DB_STORES = {
    EXAMS: 'exams',
    RESULTS: 'results',
    QUESTIONS: 'questions',
    SYNC_QUEUE: 'syncQueue'
};

/** জয়েন মেথড লেবেল */
export const JOIN_METHODS = {
    public: 'পাবলিক',
    code: 'কোর্স কোড',
    permission: 'পারমিশন কী'
};

/** ক্লাস লেভেল ডিসপ্লে */
export const CLASS_LABELS = {
    '6': '৬ষ্ঠ', '7': '৭ম', '8': '৮ম',
    SSC: 'এসএসসি', HSC: 'এইচএসসি', Admission: 'এডমিশন'
};

/** স্টোরেজ কী */
export const STORAGE_KEYS = {
    USER_PROFILE: 'userProfile',
    USER_LOGGED_IN: 'userLoggedIn',
    ACTIVE_GROUP: 'activeGroupId',
    TEACHER_DATA: 'teacher_data',
    SELECTED_GROUP: 'selectedGroup',
    DARK_MODE: 'darkMode',
    EXPLICIT_LOGOUT: 'explicit_logout',
    EXAM_CACHE_PREFIX: 'offlineExamCache_',
    FOLDER_CACHE_PREFIX: 'offlineFolderStructure_'
};

// গ্লোবাল এক্সপোজ
window.AppConstants = {
    FIREBASE_CONFIG, STUDENT_PAGES, TEACHER_PAGES,
    CLASS_LEVELS, ADMISSION_STREAMS, DB_STORES,
    JOIN_METHODS, CLASS_LABELS, STORAGE_KEYS
};
