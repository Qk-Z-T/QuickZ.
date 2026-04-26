// src/features/student/student.data.js
// স্টুডেন্ট ডেটা ফেচিং ও প্রসেসিং লজিক

import { FirestoreService } from '../../core/services/firestore.service.js';
import { getState, dispatch } from '../../core/state/store.js';
import { EventBus } from '../../core/state/event-bus.js';

/**
 * ড্যাশবোর্ড ডেটা লোড (কোর্স, লাইভ পরীক্ষা ইত্যাদি)
 */
async function loadDashboardData() {
    const groupId = getState('activeGroupId');
    if (!groupId) return { course: null, liveExams: [], mockExams: [] };

    const { data: course } = await FirestoreService.getDocument('groups', groupId);
    if (!course) return { course: null, liveExams: [], mockExams: [] };

    // পরীক্ষা ডেটা
    const exams = await FirestoreService.queryDocuments('exams', [
        { field: 'groupId', operator: '==', value: groupId }
    ]);

    const now = new Date();
    const liveExams = [];
    const mockExams = [];
    exams.forEach(e => {
        if (e.type === 'live') {
            const st = new Date(e.startTime);
            const et = new Date(e.endTime);
            if (now >= st && now <= et && !e.cancelled && !e.resultPublished) {
                liveExams.push({ ...e, status: 'ongoing' });
            } else if (now < st && !e.cancelled && !e.resultPublished) {
                liveExams.push({ ...e, status: 'upcoming' });
            }
        } else if (e.type === 'mock') {
            mockExams.push(e);
        }
    });

    return { course, liveExams, mockExams };
}

/**
 * কোর্সসমূহ লোড (joinable courses)
 */
async function loadAvailableCourses() {
    const courses = await FirestoreService.queryDocuments('groups', [
        { field: 'archived', operator: '==', value: false },
        { field: 'joinEnabled', operator: '==', value: true }
    ]);
    return courses;
}

/**
 * র‌্যাংক ডেটা লোড
 */
async function loadRankings(examId) {
    const attempts = await FirestoreService.queryDocuments('attempts', [
        { field: 'examId', operator: '==', value: examId },
        { field: 'isPractice', operator: '==', value: false }
    ], { orderByField: 'score', orderDirection: 'desc' });

    return attempts;
}

/**
 * ফলাফল লোড
 */
async function loadResults() {
    const uid = getState('user')?.uid;
    if (!uid) return [];
    const attempts = await FirestoreService.queryDocuments('attempts', [
        { field: 'userId', operator: '==', value: uid }
    ], { orderByField: 'submittedAt', orderDirection: 'desc' });
    return attempts;
}

/**
 * নোটিস লোড
 */
async function loadNotices() {
    const groupId = getState('activeGroupId');
    if (!groupId) return [];
    const notices = await FirestoreService.queryDocuments('notices', [
        { field: 'groupId', operator: '==', value: groupId }
    ], { orderByField: 'createdAt', orderDirection: 'desc' });
    return notices;
}

/**
 * পরীক্ষা ফেচ (একটি)
 */
async function fetchExam(examId) {
    const { data } = await FirestoreService.getDocument('exams', examId);
    return data;
}

/**
 * কোর্সে জয়েন
 */
async function joinCourse(groupId) {
    const uid = getState('user')?.uid;
    if (!uid) throw new Error('Not logged in');

    const { data: course } = await FirestoreService.getDocument('groups', groupId);
    if (!course) throw new Error('Course not found');

    // ছাত্র তালিকা আপডেট
    const studentIds = course.studentIds || [];
    if (!studentIds.includes(uid)) {
        studentIds.push(uid);
        await FirestoreService.updateDocument('groups', groupId, { studentIds });
    }

    // ইউজার প্রোফাইল আপডেট
    const joined = getState('joinedGroups') || [];
    if (!joined.find(g => g.groupId === groupId)) {
        joined.push({ groupId, groupName: course.name });
        await FirestoreService.updateDocument('students', uid, { joinedGroups: joined });
        dispatch({ joinedGroups: joined, activeGroupId: groupId });
    }

    EventBus.emit('student:courseJoined', { groupId });
}

/**
 * প্রশ্নোত্তর সাবমিট
 */
async function submitAttempt(data) {
    const id = await FirestoreService.addDocument('attempts', {
        ...data,
        submittedAt: new Date(),
        status: 'submitted',
    });
    return id;
}

export const StudentData = {
    loadDashboardData,
    loadAvailableCourses,
    loadRankings,
    loadResults,
    loadNotices,
    fetchExam,
    joinCourse,
    submitAttempt,
};

window.StudentData = StudentData;
