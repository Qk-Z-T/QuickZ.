// src/app/router.js
// ইউনিফাইড রাউটার — role ভিত্তিক মডিউল মাউন্ট

import { getState, setState, subscribe } from '../core/state/store.js';
import { EventBus } from '../core/state/event-bus.js';
import { STUDENT_ROUTES, TEACHER_ROUTES } from '../core/constants/routes.js';
import { escapeHtml } from '../core/utils/sanitize.js';

let currentRole = null;
let currentPage = null;

function initRouter() {
    subscribe('role', (role) => {
        currentRole = role;
        if (role === 'student') {
            mountStudentApp();
        } else if (role === 'teacher') {
            mountTeacherApp();
        } else {
            showAuthScreen();
        }
    });

    EventBus.on('page:change', (page) => {
        if (page) loadPage(page);
    });

    window.addEventListener('popstate', (event) => {
        if (event.state?.page) {
            navigateTo(event.state.page, false);
        }
    });
}

function showAuthScreen() {
    document.getElementById('auth-screen')?.classList.remove('hidden');
    document.getElementById('app-container')?.classList.add('hidden');
}

function mountStudentApp() {
    document.getElementById('auth-screen')?.classList.add('hidden');
    document.getElementById('app-container')?.classList.remove('hidden');
    import('../features/student/index.js').then(m => m.StudentModule.mount());
    navigateTo('dashboard');
}

function mountTeacherApp() {
    document.getElementById('auth-screen')?.classList.add('hidden');
    document.getElementById('app-container')?.classList.remove('hidden');
    import('../features/teacher/index.js').then(m => m.TeacherModule.mount());
    navigateTo('home');
}

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

function loadPage(page) {
    EventBus.emit('page:loading', page);
    const container = document.getElementById('app-container');
    if (container) {
        container.innerHTML = `<div class="p-6 text-center"><div class="loader mx-auto"></div><p>Loading ${escapeHtml(page)}...</p></div>`;
    }
}

export const Router = {
    init: initRouter,
    navigateTo,
    getCurrentPage: () => currentPage,
    getCurrentRole: () => getState('role'),
};

window.Router = Router;
