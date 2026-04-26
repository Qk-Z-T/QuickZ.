// src/features/teacher/views/folders.view.js
// লাইব্রেরি / ফোল্ডার স্ট্রাকচার

import { TeacherData } from '../teacher.data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';

export async function renderFolders(container) {
    container.innerHTML = `
    <div class="pb-6">
        <h2 class="text-2xl font-bold mb-4">Library</h2>
        <div id="folders-content"><div class="loader"></div></div>
    </div>`;

    const data = await TeacherData.loadLibraryData();
    const content = document.getElementById('folders-content');

    let html = '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">';
    html += renderFolderSection(data.live || [], 'Live');
    html += renderFolderSection(data.mock || [], 'Mock');
    html += '</div>';
    content.innerHTML = html;
}

function renderFolderSection(subjects, type) {
    if (!subjects.length) return `<div class="bg-white p-5 rounded-2xl shadow-sm border"><h3 class="font-bold mb-2">${escapeHtml(type)} Exams</h3><p class="text-slate-400">No subjects</p></div>`;
    let html = `<div class="bg-white p-5 rounded-2xl shadow-sm border"><h3 class="font-bold mb-4">${escapeHtml(type)} Exams</h3>`;
    subjects.forEach(sub => {
        html += `<div class="mb-4"><h4 class="font-bold text-lg">${escapeHtml(sub.name)}</h4><ul class="ml-4 list-disc">`;
        sub.children?.forEach(chap => {
            html += `<li>${escapeHtml(chap.name)} (${chap.exams?.length || 0} exams)</li>`;
        });
        html += '</ul></div>';
    });
    html += '</div>';
    return html;
}
