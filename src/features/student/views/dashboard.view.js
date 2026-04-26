// src/features/student/views/dashboard.view.js
// ড্যাশবোর্ড পেজ

import { getState } from '../../../core/state/store.js';
import { StudentData } from '../student.data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';
import { loadMathJax } from '../../../core/utils/math-helper.js';

export async function renderDashboard(container) {
    container.innerHTML = `
    <div class="p-5 pb-20 max-w-lg mx-auto">
        <div id="active-course-card" class="bg-white dark:bg-dark-secondary rounded-2xl shadow-md border dark:border-dark-tertiary overflow-hidden mb-6">
            <div class="p-5 text-center"><div class="loader mx-auto"></div></div>
        </div>
        <div class="grid grid-cols-1 gap-6">
            <button id="live-exam-card" class="dashboard-card bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl">Live Exam</button>
            <button id="mock-exam-card" class="dashboard-card bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">Mock Exam</button>
        </div>
    </div>`;

    const data = await StudentData.loadDashboardData();
    renderCourseCard(data.course);
    renderLiveExamButton(data.liveExams);
}

function renderCourseCard(course) {
    const card = document.getElementById('active-course-card');
    if (!card || !course) return;
    card.innerHTML = `
        <div class="p-5">
            <h3 class="text-xl font-bold">${escapeHtml(course.name)}</h3>
            <p class="text-sm text-slate-500">${course.studentIds?.length || 0} students</p>
            <p class="text-xs">${escapeHtml(course.teacherName || '')}</p>
        </div>`;
}

function renderLiveExamButton(exams) {
    const btn = document.getElementById('live-exam-card');
    if (!btn) return;
    const ongoing = exams.filter(e => e.status === 'ongoing');
    btn.innerHTML = `Live Exam ${ongoing.length ? '<span class="animate-pulse">●</span>' : ''}`;
    btn.onclick = () => import('../../app/router.js').then(m => m.Router.navigateTo('live'));
}
