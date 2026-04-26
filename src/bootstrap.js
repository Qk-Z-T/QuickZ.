// src/bootstrap.js
// মেইন বুটস্ট্র্যাপ: স্প্ল্যাশ, অথ UI, SW, মেথ প্যানেল ইত্যাদি সেটআপ

import { renderSplashScreen, hideSplashScreen } from './shared/components/splash-screen.js';
import { renderAuthScreen } from './shared/components/auth-screen.js';
import { renderMathPanel, showMathPanel, hideMathPanel } from './shared/components/math-panel.js';
import { registerSW } from './core/utils/sw-register.js';
import { initRouter } from './app/router.js';
import { initAuthListener } from './core/services/auth.service.js';
import { startSyncEngine } from './core/services/sync.service.js';
import { EventBus } from './core/state/event-bus.js';
import { subscribe, getState } from './core/state/store.js';

(async function boot() {
    // SW রেজিস্টার
    registerSW('public/sw.js');

    // স্প্ল্যাশ স্ক্রিন রেন্ডার
    renderSplashScreen();

    // অথ স্ক্রিন তৈরি (প্রথমে হিডেন)
    renderAuthScreen();

    // মেথ প্যানেল তৈরি (প্রথমে হিডেন)
    renderMathPanel();

    // রাউটার ও কোর সেবা চালু
    initRouter();
    initAuthListener();
    startSyncEngine();

    // স্টেট অনুযায়ী UI টগল
    subscribe('role', role => {
        if (!role) {
            // লগইন নেই -> অথ স্ক্রিন দেখান
            hideSplashScreen();
            document.getElementById('auth-screen')?.classList.remove('hidden');
            document.getElementById('app-container')?.classList.add('hidden');
            hideMathPanel();
        } else {
            // লগইন আছে -> অ্যাপ কন্টেনার দেখান
            hideSplashScreen();
            document.getElementById('auth-screen')?.classList.add('hidden');
            document.getElementById('app-container')?.classList.remove('hidden');
            // টিচার হলে মেথ প্যানেল দেখান (নির্দিষ্ট পেজে)
            if (role === 'teacher') {
                // পেজ অনুযায়ী দেখানোর দায়িত্ব teacher module এর
            }
        }
    });

    // অনলাইন/অফলাইন ইভেন্ট
    window.addEventListener('online', () => EventBus.emit('connection:online'));
    window.addEventListener('offline', () => EventBus.emit('connection:offline'));

    // স্প্ল্যাশ সর্বোচ্চ ৩ সেকেন্ড
    setTimeout(() => {
        hideSplashScreen();
    }, 3000);
})();
