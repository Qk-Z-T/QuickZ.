// src/app/main.js
// অ্যাপ বুটস্ট্র্যাপ — ফাইনাল

import { auth, db } from '../core/config/firebase.js';
import { AuthService } from '../core/services/auth.service.js';
import { SyncService } from '../core/services/sync.service.js';
import { Router } from './router.js';
import { EventBus } from '../core/state/event-bus.js';
import { getState, dispatch, subscribe } from '../core/state/store.js';
import { STORAGE_KEYS } from '../core/constants/app-constants.js';
import { renderSplashScreen, hideSplashScreen } from '../shared/components/splash-screen.js';
import { renderAuthScreen } from '../shared/components/auth-screen.js';
import { renderMathPanel, showMathPanel, hideMathPanel } from '../shared/components/math-panel.js';
import { registerSW } from '../core/utils/sw-register.js';

// গ্লোবাল এক্সপোজ
window.EventBus = EventBus;
window.AuthService = AuthService;

async function bootstrap() {
    console.log('🚀 QuickZ bootstrapping...');

    // 1. সার্ভিস ওয়ার্কার রেজিস্টার
    registerSW('public/sw.js');

    // 2. UI কম্পোনেন্ট রেন্ডার (স্প্ল্যাশ, অথ স্ক্রিন, মেথ প্যানেল)
    renderSplashScreen();
    renderAuthScreen();
    renderMathPanel();

    // 3. কোর সেবা চালু
    Router.init();
    AuthService.initAuthListener();
    SyncService.start();

    // 4. স্টেট অনুযায়ী UI টগল
    subscribe('role', (role) => {
        if (!role) {
            // লগইন নেই → অথ স্ক্রিন দেখান
            hideSplashScreen();
            document.getElementById('auth-screen')?.classList.remove('hidden');
            document.getElementById('app-container')?.classList.add('hidden');
            hideMathPanel();
        } else {
            // লগইন আছে → অ্যাপ কন্টেনার দেখান
            hideSplashScreen();
            document.getElementById('auth-screen')?.classList.add('hidden');
            document.getElementById('app-container')?.classList.remove('hidden');
            if (role === 'teacher') {
                showMathPanel(); // টিচার হলে মেথ প্যানেল দেখানোর বাটন দেখাবে
            }
            // লোকাল সেশন রিস্টোর (প্রয়োজনে)
            restoreSession();
        }
    });

    // 5. অনলাইন/অফলাইন ইভেন্ট
    window.addEventListener('online', () => {
        dispatch({ isOnline: true });
        EventBus.emit('connection:online');
    });
    window.addEventListener('offline', () => {
        dispatch({ isOnline: false });
        EventBus.emit('connection:offline');
    });

    // 6. গ্লোবাল ক্লিক হ্যান্ডলার (ড্রপডাউন বন্ধ)
    setupGlobalListeners();

    // 7. স্প্ল্যাশ সর্বোচ্চ ৩ সেকেন্ড
    setTimeout(() => {
        hideSplashScreen();
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
        // টিচার হলে হোম পেজে নিয়ে যান
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
