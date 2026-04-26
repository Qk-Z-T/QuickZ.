// src/app/main.js
// অ্যাপ বুটস্ট্র্যাপ — সবকিছুর শুরু

import { auth, db } from '../core/config/firebase.js';
import { AuthService } from '../core/services/auth.service.js';
import { Router } from './router.js';
import { EventBus } from '../core/state/event-bus.js';
import { getState } from '../core/state/store.js';
import { STORAGE_KEYS } from '../core/constants/app-constants.js';
import { loadMathJax } from '../core/utils/math-helper.js';

// গ্লোবাল এক্সপোজ
window.EventBus = EventBus;
window.AuthService = AuthService;

/**
 * অ্যাপ কিকস্টার্ট
 */
async function bootstrap() {
    console.log('🚀 QuickZ bootstrapping...');

    // রাউটার সেটআপ
    Router.init();

    // অথ লিসেনার চালু
    AuthService.initAuthListener();

    // লোকাল স্টোরেজ থেকে সম্ভাব্য সেশন রিস্টোর (ফাস্ট বুট)
    restoreSession();

    // অফলাইন/অনলাইন স্ট্যাটাস
    window.addEventListener('online', () => {
        dispatch({ isOnline: true });
        EventBus.emit('connection:online');
    });
    window.addEventListener('offline', () => {
        dispatch({ isOnline: false });
        EventBus.emit('connection:offline');
    });

    // গ্লোবাল ক্লিক হ্যান্ডলার (ড্রপডাউন, etc.)
    setupGlobalListeners();

    // স্প্ল্যাশ হাইড (সর্বোচ্চ ৩ সেকেন্ড)
    setTimeout(() => {
        document.getElementById('splash-screen')?.classList.add('hidden');
    }, 3000);
}

function restoreSession() {
    // টিচার সেশন
    const teacherData = localStorage.getItem(STORAGE_KEYS.TEACHER_DATA);
    if (teacherData && !localStorage.getItem(STORAGE_KEYS.EXPLICIT_LOGOUT)) {
        const teacher = JSON.parse(teacherData);
        import('../core/state/store.js').then(({ dispatch }) => {
            dispatch({
                role: 'teacher',
                user: { uid: teacher.id, email: teacher.email },
                currentUser: { ...teacher, id: teacher.id },
                profileCompleted: !!(teacher.fullName && teacher.phone),
            });
            // Firestore থেকে লেটেস্ট আনতে চাইলে:
            AuthService.loginTeacher(teacher.email, teacher.password).catch(e => console.warn(e));
        });
        return;
    }
    // স্টুডেন্ট সেশন অথ লিসেনার হ‍্যান্ডেল করবে
}

function setupGlobalListeners() {
    document.addEventListener('click', (e) => {
        // ড্রপডাউন ক্লোজ
        if (!e.target.closest('.three-dot-menu') && !e.target.closest('.dot-menu-dropdown')) {
            document.querySelectorAll('.dot-menu-dropdown.show').forEach(d => d.classList.remove('show'));
        }
        // ...
    });
}

// স্টার্ট
bootstrap().catch(console.error);
