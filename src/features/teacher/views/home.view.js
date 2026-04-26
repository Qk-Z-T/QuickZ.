// src/features/teacher/views/home.view.js
// টিচার হোমপেজ / ড্যাশবোর্ড

import { getState } from '../../../core/state/store.js';
import { TeacherData } from '../teacher.data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';
import { CLASS_LABELS } from '../../../core/constants/app-constants.js';

export async function renderHome(container) {
    container.innerHTML = `
    <div class="pb-6">
        <h2 class="text-2xl font-bold mb-4">Dashboard Home</h2>
        <div id="home-content" class="text-center p-10">
            <div class="loader mx-auto"></div>
            <p class="mt-2 text-sm">Loading...</p>
        </div>
    </div>`;

    const data = await TeacherData.loadHomeData();
    const group = data.group;

    if (!group) {
        document.getElementById('home-content').innerHTML = `
            <div class="text-center p-10">
                <i class="fas fa-info-circle text-3xl mb-3 text-slate-400"></i>
                <h3 class="font-bold text-lg">No course selected</h3>
                <p class="text-sm text-slate-500">Please select or create a course from Management.</p>
            </div>`;
        return;
    }

    const classBadge = group.classLevel
        ? `<span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">${escapeHtml(CLASS_LABELS[group.classLevel] || group.classLevel)}</span>`
        : '';
    const streamBadge = group.admissionStream
        ? `<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-1">${escapeHtml(group.admissionStream)}</span>`
        : '';

    document.getElementById('home-content').innerHTML = `
    <div class="bg-white dark:bg-dark-secondary rounded-2xl border p-5 mb-6 shadow-sm">
        <div class="flex justify-between items-start mb-3">
            <div>
                <h3 class="text-xl font-bold">${escapeHtml(group.name)}</h3>
                <div class="flex items-center gap-2 mt-1">
                    ${classBadge} ${streamBadge}
                </div>
            </div>
            <div class="text-right">
                <div class="text-2xl font-black text-indigo-600">${group.studentIds?.length || 0}</div>
                <div class="text-xs text-slate-500">students</div>
            </div>
        </div>
        <p class="text-sm text-slate-600">${escapeHtml(group.description || 'No description')}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
            <div class="text-2xl font-black">${group.studentIds?.length || 0}</div>
            <div class="text-xs text-slate-500">Total Students</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
            <div class="text-2xl font-black">${data.liveExams}</div>
            <div class="text-xs text-slate-500">Live Exams</div>
        </div>
        <div class="bg-white p-5 rounded-2xl border shadow-sm">
            <div class="text-2xl font-black">${data.mockExams}</div>
            <div class="text-xs text-slate-500">Mock Exams</div>
        </div>
    </div>

    <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
        <h4 class="font-bold mb-3">Quick Actions</h4>
        <div class="flex flex-wrap gap-3">
            <button onclick="EventBus.emit('navigate', 'create')" class="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition">
                <i class="fas fa-plus-circle mr-2"></i>New Exam
            </button>
            <button onclick="EventBus.emit('navigate', 'management')" class="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition">
                <i class="fas fa-cog mr-2"></i>Manage Course
            </button>
        </div>
    </div>`;
}
