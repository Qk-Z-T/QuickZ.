// shared/config/constants.js
// কেন্দ্রীয় কনফিগারেশন ও কনস্ট্যান্টসমূহ

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyB4A6r2JlK_P-29fmC8LSi8gz-HjzFA4CQ",
    authDomain: "exam-611e5.firebaseapp.com",
    projectId: "exam-611e5",
    storageBucket: "exam-611e5.firebasestorage.app",
    messagingSenderId: "887013693688",
    appId: "1:887013693688:web:35cedd5b463bf642fa030d"
};

/**
 * স্টুডেন্ট পোর্টালের বৈধ পেজসমূহ
 */
const STUDENT_PAGES = [
    'dashboard',
    'courses',
    'rank',
    'results',
    'analysis',
    'notices',
    'management',
    'profile'
];

/**
 * টিচার পোর্টালের বৈধ পেজসমূহ
 */
const TEACHER_PAGES = [
    'home',
    'create',
    'rank',
    'folders',
    'management'
];

/**
 * ক্লাস লেভেল অপশন
 */
const CLASS_LEVELS = ['6', '7', '8', 'SSC', 'HSC', 'Admission'];

/**
 * এডমিশন শাখা অপশন
 */
const ADMISSION_STREAMS = ['Science', 'Humanities', 'Commerce'];

/**
 * ডাটাবেজ স্টোরের নাম (shortcut)
 */
const DB_STORES = {
    EXAMS: 'exams',
    RESULTS: 'results',
    QUESTIONS: 'questions',
    SYNC_QUEUE: 'syncQueue'
};

/**
 * জয়েন মেথড টেক্সট ম্যাপিং
 */
const JOIN_METHOD_LABELS = {
    'public': 'পাবলিক',
    'code': 'কোর্স কোড',
    'permission': 'পারমিশন কী'
};

/**
 * ক্লাস লেভেল ডিসপ্লে নাম ম্যাপিং
 */
const CLASS_LEVEL_LABELS = {
    '6': '৬ষ্ঠ শ্রেণী',
    '7': '৭ম শ্রেণী',
    '8': '৮ম শ্রেণী',
    'SSC': 'এসএসসি',
    'HSC': 'এইচএসসি',
    'Admission': 'এডমিশন'
};

/**
 * স্টোরেজ কী সমূহ
 */
const STORAGE_KEYS = {
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

window.AppConfig = {
    FIREBASE_CONFIG,
    STUDENT_PAGES,
    TEACHER_PAGES,
    CLASS_LEVELS,
    ADMISSION_STREAMS,
    DB_STORES,
    JOIN_METHOD_LABELS,
    CLASS_LEVEL_LABELS,
    STORAGE_KEYS
};

export {
    FIREBASE_CONFIG,
    STUDENT_PAGES,
    TEACHER_PAGES,
    CLASS_LEVELS,
    ADMISSION_STREAMS,
    DB_STORES,
    JOIN_METHOD_LABELS,
    CLASS_LEVEL_LABELS,
    STORAGE_KEYS
};
