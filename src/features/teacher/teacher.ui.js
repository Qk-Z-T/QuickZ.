// src/features/teacher/teacher.ui.js
// টিচার UI রেন্ডারিং — groups পেজ সহ

import { escapeHtml } from '../../core/utils/sanitize.js';
import { loadMathJax } from '../../core/utils/math-helper.js';
import { getState } from '../../core/state/store.js';
import { renderTeacherHeader } from './components/header.js';

let shellRendered = false;

function renderShell() {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;

    const headerHTML = renderTeacherHeader();
    appContainer.innerHTML = `
        ${headerHTML}
        <main id="teacher-page-content" class="ml-[240px] pt-[58px] min-h-screen"></main>
    `;
    shellRendered = true;
    loadMathJax();
}

function teardownShell() {
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.innerHTML = '';
    shellRendered = false;
}

function loadPage(page) {
    const contentEl = document.getElementById('teacher-page-content');
    if (!contentEl) return;

    contentEl.innerHTML = `<div class="p-6 text-center"><div class="loader mx-auto"></div><p>Loading ${escapeHtml(page)}...</p></div>`;

    switch (page) {
        case 'home':
            import('./views/home.view.js').then(m => m.renderHome(contentEl));
            break;
        case 'create':
            import('./views/create.view.js').then(m => m.renderCreate(contentEl));
            break;
        case 'rank':
            import('./views/rank.view.js').then(m => m.renderRank(contentEl));
            break;
        case 'folders':
            import('./views/folders.view.js').then(m => m.renderFolders(contentEl));
            break;
        case 'management':
            import('./views/management.view.js').then(m => m.renderManagement(contentEl));
            break;
        case 'groups':
            import('./views/groups.view.js').then(m => m.renderGroups(contentEl));
            break;
        default:
            contentEl.innerHTML = `<div class="p-6 text-center">Unknown page: ${escapeHtml(page)}</div>`;
    }
}

export const TeacherUI = {
    renderShell,
    teardownShell,
    loadPage,
};

window.TeacherUI = TeacherUI;
