// src/app/router.js
// ইউনিফাইড রাউটার — স্টুডেন্ট ও টিচার উভয়ের জন্য

import { getState, setState, subscribe } from '../core/state/store.js';
import { EventBus } from '../core/state/event-bus.js';
import { STUDENT_ROUTES, TEACHER_ROUTES } from '../core/constants/routes.js';
import { escapeHtml } from '../core/utils/sanitize.js';

let currentRole = null;
let currentPage = null;

/**
 * রাউটার ইনিশিয়ালাইজ
 */
function initRouter() {
    // রোল চেঞ্জ শুনুন
    subscribe('role', (role) => {
        currentRole = role;
        if (role) {
            showAppShell();
            navigateToDefault();
        } else {
            showAuthScreen();
        }
    });

    // পেজ চেঞ্জ হ্যান্ডলার (ইভেন্ট-বাস থেকে)
    EventBus.on('page:change', (page) => {
        if (page) loadPage(page);
    });

    // ব্রাউজার ব্যাক/ফরওয়ার্ড হ্যান্ডেল
    window.addEventListener('popstate', (event) => {
        if (event.state?.page) {
            loadPage(event.state.page);
        }
    });
}

/**
 * অ্যাপ শেল দেখান (রোল অনুযায়ী কন্টেইনার সেট)
 */
function showAppShell() {
    // অথ স্ক্রিন হাইড
    document.getElementById('auth-screen')?.classList.add('hidden');
    // স্প্ল্যাশ হাইড
    document.getElementById('splash-screen')?.classList.add('hidden');
    // অ্যাপ কন্টেইনার দেখান
    document.getElementById('app-container')?.classList.remove('hidden');
}

function showAuthScreen() {
    document.getElementById('auth-screen')?.classList.remove('hidden');
    document.getElementById('app-container')?.classList.add('hidden');
}

function navigateToDefault() {
    const role = getState('role');
    let page;
    if (role === 'student') {
        page = getState('profileCompleted') ? 'dashboard' : 'profile';
    } else if (role === 'teacher') {
        page = 'home';
    }
    navigateTo(page, true);
}

/**
 * পেজ নেভিগেট
 * @param {string} page
 * @param {boolean} [addToHistory=true]
 */
function navigateTo(page, addToHistory = true) {
    const role = getState('role');
    const validPages = role === 'student' ? STUDENT_ROUTES.map(r => r.path) : TEACHER_ROUTES.map(r => r.path);
    if (!validPages.includes(page)) {
        console.warn(`Invalid page: ${page}`);
        return;
    }
    currentPage = page;
    if (addToHistory) {
        window.history.pushState({ page }, '', `#${page}`);
    }
    loadPage(page);
}

/**
 * পেজ লোড করা (ইভেন্ট এমিট করা, UI রেন্ডারিং ফিচার মডিউল করবে)
 */
function loadPage(page) {
    EventBus.emit('page:loading', page);
    // এখানে ডায়নামিক ইমপোর্ট করব, কিন্তু এখন placeholder:
    // ফিচার মডিউল রেজিস্টার করলে তারা page:loading শুনবে
    // আমরা এখন একটি সিম্পল innerHTML দিয়ে সূচনা করি
    const container = document.getElementById('app-container');
    if (container) {
        container.innerHTML = `<div class="p-6 text-center"><div class="loader mx-auto"></div><p>Loading ${escapeHtml(page)}...</p></div>`;
    }
}

// রাউট এক্সপোজ
export const Router = {
    init: initRouter,
    navigateTo,
    getCurrentPage: () => currentPage,
    getCurrentRole: () => getState('role'),
};

window.Router = Router;
