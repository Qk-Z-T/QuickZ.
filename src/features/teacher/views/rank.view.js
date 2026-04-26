// src/features/teacher/views/rank.view.js
// শিক্ষক র‌্যাংকিং — পরীক্ষার তালিকা ও বিস্তারিত র‌্যাংক

import { getState } from '../../../core/state/store.js';
import { RankingsData } from '../../rankings/rankings-data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';
import { loadMathJax } from '../../../core/utils/math-helper.js';
import { EventBus } from '../../../core/state/event-bus.js';

export async function renderRank(container) {
    container.innerHTML = `
    <div class="pb-6">
        <h2 class="text-2xl font-bold mb-4">Live Exam Rankings</h2>
        <div id="rank-content">
            <div class="text-center p-10"><div class="loader mx-auto"></div></div>
        </div>
    </div>`;

    const exams = await RankingsData.fetchPublishedLiveExams();
    if (!exams.length) {
        document.getElementById('rank-content').innerHTML =
            '<div class="text-center p-10 text-slate-400">No published live exams found</div>';
        return;
    }

    let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    exams.forEach(exam => {
        html += `
        <div class="bg-white dark:bg-dark-secondary p-5 rounded-2xl shadow-sm border cursor-pointer hover:shadow-md"
             onclick="window.showRankDetail('${exam.id}', '${escapeHtml(exam.title).replace(/'/g, "\\'")}')">
            <div class="flex justify-between items-start">
                <div>
                    <span class="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">Live</span>
                    <h3 class="font-bold mt-2">${escapeHtml(exam.title)}</h3>
                    <p class="text-xs text-slate-500">${escapeHtml(exam.subject || '')}</p>
                </div>
                <i class="fas fa-trophy text-indigo-400 text-xl"></i>
            </div>
        </div>`;
    });
    html += '</div>';
    document.getElementById('rank-content').innerHTML = html;
}

// গ্লোবাল ফাংশন (view তে ক্লিক করলে)
window.showRankDetail = async (examId, examTitle) => {
    const container = document.getElementById('teacher-page-content');
    if (!container) return;

    container.innerHTML = '<div class="p-10 text-center"><div class="loader mx-auto"></div></div>';

    const attempts = await RankingsData.fetchRankData(examId);
    // প্রশ্নপত্র ও অন্যান্য তথ্যের জন্য পরীক্ষা ডকুমেন্ট নিচ্ছি
    const { data: exam } = await FirestoreService.getDocument('exams', examId);
    const questions = exam?.questions ? JSON.parse(exam.questions) : [];

    // শিক্ষার্থী প্রোফাইল ম্যাপ
    const studentIds = [...new Set(attempts.map(a => a.userId))];
    const studentMap = {};
    await Promise.all(studentIds.map(async (sid) => {
        const profile = await RankingsData.fetchStudentProfile(sid);
        if (profile) studentMap[sid] = profile;
    }));

    // টাইম ও অ্যাকুরেসি গণনা
    attempts.forEach(a => {
        if (a.startedAt && a.submittedAt) {
            const diffMs = a.submittedAt.toDate() - a.startedAt.toDate();
            a.timeTakenSeconds = Math.floor(diffMs / 1000);
        } else {
            a.timeTakenSeconds = Infinity;
        }
        if (questions.length > 0 && a.answers) {
            const correct = questions.reduce((acc, q, idx) =>
                acc + (a.answers[idx] === q.correct ? 1 : 0), 0);
            a.accuracy = ((correct / questions.length) * 100);
        } else {
            a.accuracy = 0;
        }
    });

    let rows = '';
    attempts.forEach((a, i) => {
        const studentInfo = studentMap[a.userId] || {};
        const institute = studentInfo.collegeName || studentInfo.schoolName || '';
        const timeDisplay = a.timeTakenSeconds === Infinity ? 'N/A'
            : `${Math.floor(a.timeTakenSeconds / 60)}m ${a.timeTakenSeconds % 60}s`;

        rows += `
        <div class="flex items-center p-3 border-b dark:border-dark-tertiary hover:bg-slate-50 dark:hover:bg-dark-tertiary cursor-pointer"
             onclick="window.viewStudentResult('${a.id}')">
            <div class="w-8 text-center text-xs font-bold text-slate-400">${i+1}</div>
            <div class="flex-1 ml-3">
                <div class="font-bold text-sm dark:text-white">${escapeHtml(a.userName)}</div>
                <div class="text-[9px] text-slate-500">${escapeHtml(institute)} | ${timeDisplay}</div>
            </div>
            <div class="font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/50 px-3 py-1 rounded text-xs">
                ${a.score.toFixed(2)}
            </div>
        </div>`;
    });

    container.innerHTML = `
    <div class="pb-6">
        <button onclick="renderRank(document.getElementById('teacher-page-content'))" class="mb-4 text-xs font-bold text-slate-500"><i class="fas fa-arrow-left"></i> Back</button>
        <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl text-white mb-6">
            <h3 class="font-bold text-lg">${escapeHtml(examTitle)}</h3>
            <div class="grid grid-cols-2 gap-4 mt-4">
                <div class="bg-white/5 p-3 rounded-xl">
                    <div class="text-xs opacity-70">Total Students</div>
                    <div class="text-xl font-bold">${attempts.length}</div>
                </div>
                <div class="bg-white/5 p-3 rounded-xl">
                    <div class="text-xs opacity-70">Highest Score</div>
                    <div class="text-xl font-bold text-emerald-400">${attempts[0]?.score?.toFixed(2) || '0'}</div>
                </div>
            </div>
        </div>
        <div class="bg-white dark:bg-dark-secondary rounded-2xl border dark:border-dark-tertiary overflow-hidden shadow-sm">
            ${rows || '<div class="p-10 text-center text-slate-400">No participants</div>'}
        </div>
    </div>`;
    loadMathJax(null, container);
};

// viewStudentResult -> next phase (just placeholder)
window.viewStudentResult = (attemptId) => {
    alert('Student result detail coming soon');
};
