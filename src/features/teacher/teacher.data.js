// src/features/teacher/teacher.data.js
// টিচার ডেটা ফেচিং ও প্রসেসিং লজিক

import { FirestoreService } from '../../core/services/firestore.service.js';
import { getState, dispatch } from '../../core/state/store.js';
import { EventBus } from '../../core/state/event-bus.js';

/**
 * হোমপেজ ডেটা লোড (গ্রুপ ওভারভিউ, পরীক্ষা সংখ্যা)
 */
async function loadHomeData() {
    const group = getState('selectedGroup');
    if (!group) return { group: null, liveExams: 0, mockExams: 0 };

    // গ্রুপ ডেটা
    const { data: groupData } = await FirestoreService.getDocument('groups', group.id);
    if (!groupData) return { group: null, liveExams: 0, mockExams: 0 };

    // পরীক্ষা সংখ্যা
    const exams = await FirestoreService.queryDocuments('exams', [
        { field: 'groupId', operator: '==', value: group.id }
    ]);
    let liveExams = 0;
    let mockExams = 0;
    exams.forEach(e => {
        if (e.type === 'live') liveExams++;
        if (e.type === 'mock') mockExams++;
    });

    return { group: groupData, liveExams, mockExams };
}

/**
 * টিচারের সব গ্রুপ লোড
 */
async function loadTeacherGroups() {
    const teacherId = getState('currentUser')?.id;
    if (!teacherId) return [];
    const groups = await FirestoreService.queryDocuments('groups', [
        { field: 'teacherId', operator: '==', value: teacherId },
        { field: 'archived', operator: '==', value: false }
    ], { orderByField: 'createdAt', orderDirection: 'desc' });
    dispatch({ teacherGroups: groups });
    return groups;
}

/**
 * গ্রুপ সুইচ
 */
async function switchGroup(groupId, groupName) {
    dispatch({ selectedGroup: { id: groupId, name: groupName } });
    localStorage.setItem('selectedGroup', JSON.stringify({ id: groupId, name: groupName }));
}

/**
 * পরীক্ষা তৈরি
 */
async function createExam(examData) {
    const id = await FirestoreService.addDocument('exams', examData);
    return id;
}

/**
 * পরীক্ষা আপডেট
 */
async function updateExam(examId, data) {
    await FirestoreService.updateDocument('exams', examId, data);
}

/**
 * পরীক্ষা ডিলিট
 */
async function deleteExam(examId) {
    await FirestoreService.deleteDocument('exams', examId);
}

/**
 * লাইব্রেরি ডেটা লোড
 */
async function loadLibraryData() {
    const teacherId = getState('currentUser')?.id;
    const groupId = getState('selectedGroup')?.id;
    if (!teacherId || !groupId) return { live: [], mock: [], uncategorized: [] };
    const { data } = await FirestoreService.getDocument('folderStructures', `${teacherId}_${groupId}`);
    return data || { live: [], mock: [], uncategorized: [] };
}

export const TeacherData = {
    loadHomeData,
    loadTeacherGroups,
    switchGroup,
    createExam,
    updateExam,
    deleteExam,
    loadLibraryData,
};

window.TeacherData = TeacherData;
