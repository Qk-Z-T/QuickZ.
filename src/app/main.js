// src/app/main.js
// অ্যাপ বুটস্ট্র্যাপ — ফাইনাল

import { auth, db } from '../core/config/firebase.js';
import { AuthService } from '../core/services/auth.service.js';
import { SyncService } from '../core/services/sync.service.js';
import { Router } from './router.js';
import { EventBus } from '../core/state/event-bus.js';
import { getState, dispatch } from '../core/state/store.js';
import { STORAGE_KEYS } from '../core/constants/app-constants.js';

window.EventBus = EventBus;
window.AuthService = AuthService;

async function bootstrap() {
    console.log('🚀 QuickZ bootstrapping...');

    // রাউটার সেটআপ
    Router.init();

    // অথ লিসেনার চালু
    AuthService.initAuthListener();

    // সিঙ্ক ইঞ্জিন চালু
    SyncService.start();

    // লোকাল সেশন রিস্টোর
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

    // গ্লোবাল ক্লিক হ্যান্ডলার
    setupGlobalListeners();

    // স্প্ল্যাশ হাইড (সর্বোচ্চ ৩ সেকেন্ড)
    setTimeout(() => {
        document.getElementById('splash-screen')?.classList.add('hidden');
    }, 3000);
}

function restoreSession() {
    const teacherData = localStorage.getItem(STORAGE_KEYS.TEACHER_DATA);
    if (teacherData && !localStorage.getItem(STORAGE_KEYS.EXPLICIT_LOGOUT)) {
        const teacher = JSON.parse(teacherData);
        dispatch({
            role: 'teacher',
            user: { uid: teacher.id, email: teacher.email },
            currentUser: { ...teacher, id: teacher.id },
            profileCompleted: !!(teacher.fullName && teacher.phone),
        });
        Router.navigateTo('home');
    }
}

function setupGlobalListeners() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.three-dot-menu') && !e.target.closest('.dot-menu-dropdown')) {
            document.querySelectorAll('.dot-menu-dropdown.show').forEach(d => d.classList.remove('show'));
        }
    });
}

bootstrap().catch(console.error);
