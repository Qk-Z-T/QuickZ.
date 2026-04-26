// src/features/notices/notices-data.js
// নোটিশ ও পোল ডেটা অপারেশন

import { FirestoreService } from '../../core/services/firestore.service.js';
import { getState } from '../../core/state/store.js';

/**
 * নোটিশ ও পোল তালিকা (নতুন থেকে পুরনো)
 */
async function fetchNotices() {
    const groupId = getState('selectedGroup')?.id;
    if (!groupId) return [];
    const notices = await FirestoreService.queryDocuments('notices', [
        { field: 'groupId', operator: '==', value: groupId }
    ], { orderByField: 'createdAt', orderDirection: 'desc' });
    return notices;
}

/**
 * নতুন নোটিশ বা পোল তৈরি
 */
async function createNotice(data) {
    const payload = {
        ...data,
        groupId: getState('selectedGroup').id,
        teacherId: getState('currentUser').id,
        teacherName: getState('currentUser').fullName,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: {},
        votes: {}
    };
    const id = await FirestoreService.addDocument('notices', payload);
    return id;
}

/**
 * নোটিশ মুছে ফেলা
 */
async function deleteNotice(noticeId) {
    await FirestoreService.deleteDocument('notices', noticeId);
}

/**
 * পোল ভোটার তালিকা দেখা (optional)
 */
async function getPollVoters(noticeId) {
    const { data } = await FirestoreService.getDocument('notices', noticeId);
    return data?.votes || {};
}

export const NoticesData = {
    fetchNotices,
    createNotice,
    deleteNotice,
    getPollVoters,
};

window.NoticesData = NoticesData;
