// src/features/student/student.ui.js
// স্টুডেন্ট UI রেন্ডারিং — পেজ ও কম্পোনেন্ট

import { escapeHtml } from '../../core/utils/sanitize.js';
import { loadMathJax } from '../../core/utils/math-helper.js';
import { getState } from '../../core/state/store.js';
import { renderStudentHeader } from './components/header.js';

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
        <main id="student-page-content" class="md:ml-[250px] md:pt-[60px] min-h-screen"></main>
        <button id="review-panel-btn" class="hidden fixed bottom-5 right-5 ...">...</button>
        <div id="review-panel" class="hidden fixed bottom-20 right-5 ...">...</div>
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

    // গুরুত্বপূর্ণ: XSS প্রতিরোধে escapeHtml ব্যবহার করা হয়েছে
    contentEl.innerHTML = `<div class="p-6 text-center"><div class="loader mx-auto"></div><p>Loading ${escapeHtml(page)}...</p></div>`;

    // ফিচার-নির্দিষ্ট রেন্ডারিং ডায়নামিক ইমপোর্ট দিয়ে করা হবে
    // আপাতত আমরা স্টাব রেখেছি — পরবর্তী ধাপে প্রতিটি পেজের আলাদা ফাইল আসবে
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

// প্লেসহোল্ডার রেন্ডার ফাংশন (পরের ধাপে বিস্তারিত হবে)
function renderDashboard(container) {
    container.innerHTML = `<div class="p-5 max-w-lg mx-auto">
        <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
        <p>Loading dashboard data...</p>
    </div>`;
}

function renderCourses(container) {
    container.innerHTML = `<div class="p-5"><h2 class="text-2xl font-bold mb-4">Courses</h2><p>Loading courses...</p></div>`;
}

function renderRank(container) {
    container.innerHTML = `<div class="p-5"><h2 class="text-2xl font-bold mb-4">Rankings</h2><p>Loading rankings...</p></div>`;
}

function renderResults(container) {
    container.innerHTML = `<div class="p-5"><h2 class="text-2xl font-bold mb-4">Results</h2><p>Loading results...</p></div>`;
}

function renderAnalysis(container) {
    container.innerHTML = `<div class="p-5"><h2 class="text-2xl font-bold mb-4">Analysis</h2><p>Loading analysis...</p></div>`;
}

function renderNotices(container) {
    container.innerHTML = `<div class="p-5"><h2 class="text-2xl font-bold mb-4">Notices</h2><p>Loading notices...</p></div>`;
}

function renderManagement(container) {
    container.innerHTML = `<div class="p-5"><h2 class="text-2xl font-bold mb-4">Management</h2><p>Loading management...</p></div>`;
}

function renderProfile(container) {
    container.innerHTML = `<div class="p-5"><h2 class="text-2xl font-bold mb-4">Profile</h2><p>Loading profile...</p></div>`;
}

export const StudentUI = {
    renderShell,
    teardownShell,
    loadPage,
};

window.StudentUI = StudentUI;
