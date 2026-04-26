// src/features/rankings/rankings-data.js
// র‌্যাংকিং সংক্রান্ত ডেটা অপারেশন

import { FirestoreService } from '../../core/services/firestore.service.js';
import { getState } from '../../core/state/store.js';

/**
 * প্রকাশিত লাইভ পরীক্ষার তালিকা
 * @returns {Promise<Object[]>}
 */
async function fetchPublishedLiveExams() {
    const groupId = getState('selectedGroup')?.id;
    if (!groupId) return [];
    const exams = await FirestoreService.queryDocuments('exams', [
        { field: 'groupId', operator: '==', value: groupId },
        { field: 'type', operator: '==', value: 'live' },
        { field: 'resultPublished', operator: '==', value: true }
    ], { orderByField: 'createdAt', orderDirection: 'desc' });
    return exams;
}

/**
 * নির্দিষ্ট পরীক্ষার র‌্যাংক ডেটা (সাবমিটেড অ্যাটেম্প্ট)
 * @param {string} examId
 * @returns {Promise<Object[]>} score desc, time asc sorted
 */
async function fetchRankData(examId) {
    const attempts = await FirestoreService.queryDocuments('attempts', [
        { field: 'examId', operator: '==', value: examId },
        { field: 'isPractice', operator: '==', value: false }
    ], { orderByField: 'score', orderDirection: 'desc' });
    // অতিরিক্ত প্রসেসিং (সময়, অ্যাকুরেসি) ক্লায়েন্টে করব
    return attempts;
}

/**
 * শিক্ষার্থীর বিস্তারিত প্রোফাইল (নাম, প্রতিষ্ঠান)
 * @param {string} studentId
 * @returns {Promise<Object|null>}
 */
async function fetchStudentProfile(studentId) {
    const { data } = await FirestoreService.getDocument('students', studentId);
    return data || null;
}

export const RankingsData = {
    fetchPublishedLiveExams,
    fetchRankData,
    fetchStudentProfile,
};

window.RankingsData = RankingsData;
