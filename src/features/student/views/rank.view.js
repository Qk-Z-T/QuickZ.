// src/features/student/views/rank.view.js
// র‌্যাংকিং পেজ

import { StudentData } from '../student.data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';

export async function renderRank(container) {
    container.innerHTML = `<div class="p-5 pb-20"><h2 class="text-2xl font-bold mb-4">Rankings</h2><div id="rank-content"><div class="loader"></div></div></div>`;
    const exams = await StudentData.loadRankings('latest'); // simplified
    if (!exams.length) {
        document.getElementById('rank-content').innerHTML = '<p class="text-slate-400">No rankings yet</p>';
        return;
    }
    let html = '';
    exams.forEach((a, i) => {
        html += `<div class="flex justify-between p-3 border-b"><span>${i+1}. ${escapeHtml(a.userName)}</span><span>${a.score?.toFixed(2)}</span></div>`;
    });
    document.getElementById('rank-content').innerHTML = html;
}
