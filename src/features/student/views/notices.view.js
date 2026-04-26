// src/features/student/views/notices.view.js

import { StudentData } from '../student.data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';

export async function renderNotices(container) {
    container.innerHTML = `<div class="p-5 pb-20"><h2 class="text-2xl font-bold mb-4">Notices</h2><div id="notices-content"><div class="loader"></div></div></div>`;
    const notices = await StudentData.loadNotices();
    if (!notices.length) {
        document.getElementById('notices-content').innerHTML = '<p>No notices</p>';
        return;
    }
    let html = '';
    notices.forEach(n => {
        html += `<div class="bg-white p-4 rounded mb-3 border"><h3 class="font-bold">${escapeHtml(n.title)}</h3><p class="text-sm">${escapeHtml(n.content || '')}</p></div>`;
    });
    document.getElementById('notices-content').innerHTML = html;
}
