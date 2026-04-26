// src/features/student/components/course-card.js
// পুনর্ব্যবহারযোগ্য কোর্স কার্ড কম্পোনেন্ট

import { escapeHtml } from '../../../core/utils/sanitize.js';
import { CLASS_LABELS } from '../../../core/constants/app-constants.js';

/**
 * কোর্স কার্ড রেন্ডার
 * @param {Object} group
 * @param {boolean} isJoined
 * @returns {string}
 */
export function renderCourseCard(group, isJoined = false) {
    const classBadge = group.classLevel
        ? `<span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">${escapeHtml(CLASS_LABELS[group.classLevel] || group.classLevel)}</span>`
        : '';

    const streamBadge = group.admissionStream
        ? `<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-1">${escapeHtml(group.admissionStream)}</span>`
        : '';

    const imageHtml = group.imageUrl
        ? `<img src="${escapeHtml(group.imageUrl)}" alt="${escapeHtml(group.name)}" class="w-full h-36 object-cover rounded-t-xl" loading="lazy">`
        : `<div class="w-full h-36 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-3xl text-indigo-400 rounded-t-xl"><i class="fas fa-book-open"></i></div>`;

    return `
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
        ${imageHtml}
        <div class="p-4">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg">${escapeHtml(group.name)}</h3>
                <div class="flex gap-1">${classBadge} ${streamBadge}</div>
            </div>
            <p class="text-xs text-slate-500 mb-1"><i class="fas fa-user-tie"></i> ${escapeHtml(group.teacherName || '')}</p>
            <p class="text-sm text-slate-600 mb-3 line-clamp-2">${escapeHtml(group.description || 'No description')}</p>
            <div class="flex items-center justify-between mb-3">
                <span class="text-xs"><i class="fas fa-users"></i> ${group.studentIds?.length || 0} students</span>
            </div>
            <button class="w-full ${isJoined ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white'} py-2 rounded-lg text-sm font-bold"
                ${isJoined ? 'disabled' : `onclick="EventBus.emit('student:joinCourse', '${escapeHtml(group.id)}')"`}>
                ${isJoined ? 'Joined' : 'Join Course'}
            </button>
        </div>
    </div>`;
}

/**
 * কোর্স কার্ড লিস্ট রেন্ডার
 */
export function renderCourseList(courses, joinedIds = []) {
    if (!courses.length) return '<div class="col-span-2 text-center p-10 text-slate-400">No courses found</div>';
    return courses.map(c => renderCourseCard(c, joinedIds.includes(c.id))).join('');
}
