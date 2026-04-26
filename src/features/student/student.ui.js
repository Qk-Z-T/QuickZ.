// src/features/student/student.ui.js
// স্টুডেন্ট UI রেন্ডারিং — পেজ ও কম্পোনেন্ট

import { escapeHtml } from '../../core/utils/sanitize.js';
import { loadMathJax } from '../../core/utils/math-helper.js';
import { getState } from '../../core/state/store.js';
import { renderStudentHeader } from './components/header.js';
import { renderDashboard } from './views/dashboard.view.js';
import { renderCourses } from './views/courses.view.js';
import { renderRank } from './views/rank.view.js';
import { renderResults } from './views/results.view.js';
import { renderAnalysis } from './views/analysis.view.js';
import { renderNotices } from './views/notices.view.js';
import { renderManagement } from './views/management.view.js';
import { renderProfile } from './views/profile.view.js';

let shellRendered = false;

/**
 * অ্যাপ শেল রেন্ডার (হেডার + মেইন কন্টেইনার)
 */
function renderShell() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    const headerHTML = renderStudentHeader();
    appContainer.innerHTML = `
        ${headerHTML}
        <main id="student-page-content" class="md:ml-[250px] md:pt-[60px] min-h-screen relative w-full md:w-[calc(100%-250px)]"></main>
        <button id="review-panel-btn" class="review-panel-btn hidden">
            <i class="fas fa-list-ol"></i>
        </button>
        <div id="review-panel" class="review-panel">
            <div class="review-panel-title">প্রশ্নসমূহ</div>
            <div id="question-numbers" class="question-numbers"></div>
        </div>
    `;
    shellRendered = true;
    // MathJax সেটআপ (প্রয়োজনমতো)
    loadMathJax();
}

/**
 * শেল টিয়ারডাউন
 */
function teardownShell() {
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.innerHTML = '';
    shellRendered = false;
}

/**
 * নির্দিষ্ট পেজ লোড
 */
function loadPage(page) {
    const contentEl = document.getElementById('student-page-content');
    if (!contentEl) return;

    // XSS প্রতিরোধে escapeHtml ব্যবহার করা হয়েছে
    contentEl.innerHTML = `<div class="p-6 text-center"><div class="loader mx-auto"></div><p>Loading ${escapeHtml(page)}...</p></div>`;

    // ফিচার-নির্দিষ্ট রেন্ডারিং
    switch (page) {
        case 'dashboard':
            renderDashboard(contentEl);
            break;
        case 'courses':
            renderCourses(contentEl);
            break;
        case 'rank':
            renderRank(contentEl);
            break;
        case 'results':
            renderResults(contentEl);
            break;
        case 'analysis':
            renderAnalysis(contentEl);
            break;
        case 'notices':
            renderNotices(contentEl);
            break;
        case 'management':
            renderManagement(contentEl);
            break;
        case 'profile':
            renderProfile(contentEl);
            break;
        default:
            contentEl.innerHTML = `<div class="p-6 text-center">Unknown page: ${escapeHtml(page)}</div>`;
    }
}

export const StudentUI = {
    renderShell,
    teardownShell,
    loadPage,
};

window.StudentUI = StudentUI;
