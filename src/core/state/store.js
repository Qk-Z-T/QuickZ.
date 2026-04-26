// src/core/state/store.js
// কেন্দ্রীয় স্টেট ম্যানেজমেন্ট (Observer/PubSub প্যাটার্ন)

/**
 * অ্যাপ্লিকেশন-ব্যাপী স্টেট ইনিশিয়াল স্ট্রাকচার
 */
const initialState = {
    role: null,                 // 'student' | 'teacher'
    user: null,                 // Firebase Auth user object
    currentUser: null,          // Firestore প্রোফাইল ডেটা
    profileCompleted: false,
    userDisabled: false,

    // Student specific
    activeGroupId: null,
    joinedGroups: [],
    teacherCodes: [],
    activeTeacherCode: null,
    classLevel: '',
    admissionStream: '',
    teacherNames: {},

    // Teacher specific
    selectedGroup: null,        // { id, name }
    teacherGroups: [],

    // Common
    darkMode: false,
    isOnline: navigator.onLine,
};

let state = { ...initialState };

/**
 * লিসেনার ম্যাপ: key -> callback[]
 */
const listeners = new Map();

/**
 * নির্দিষ্ট key-তে লিসেনার যোগ করা
 * @param {string} key
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
function subscribe(key, callback) {
    if (!listeners.has(key)) listeners.set(key, []);
    listeners.get(key).push(callback);

    return () => {
        const arr = listeners.get(key);
        if (arr) {
            const idx = arr.indexOf(callback);
            if (idx !== -1) arr.splice(idx, 1);
        }
    };
}

/**
 * সব সাবস্ক্রাইবারকে নোটিফাই করা
 * @param {string} key
 * @param {*} value
 */
function notify(key, value) {
    const arr = listeners.get(key);
    if (arr) arr.forEach(cb => cb(value));
}

/**
 * স্টেট আপডেট (একক key)
 * @param {string} key
 * @param {*} value
 */
function setState(key, value) {
    state[key] = value;
    notify(key, value);
}

/**
 * স্টেট রিড (একক key)
 * @param {string} key
 * @returns {*}
 */
function getState(key) {
    return state[key];
}

/**
 * একাধিক key-এর মান একসাথে আপডেট (batch update)
 * @param {Object} updates
 */
function dispatch(updates) {
    for (const [key, value] of Object.entries(updates)) {
        state[key] = value;
        notify(key, value);
    }
}

/**
 * সম্পূর্ণ স্টেট রিসেট (লগআউটের সময়)
 */
function resetState() {
    dispatch(initialState);
}

// গ্লোবাল এক্সপোজ (লিগ্যাসি অ্যাক্সেসের জন্য)
window.AppStore = {
    subscribe,
    getState,
    setState,
    dispatch,
    resetState,
};

export { subscribe, getState, setState, dispatch, resetState, initialState };
