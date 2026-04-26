// src/features/groups/groups-data.js
// গ্রুপ (কোর্স) সম্পর্কিত সকল ডেটা অপারেশন

import { FirestoreService } from '../../core/services/firestore.service.js';
import { getState } from '../../core/state/store.js';
import { escapeHtml } from '../../core/utils/sanitize.js';

/**
 * টিচারের সকল গ্রুপ লোড (আর্কাইভ বাদে)
 * @returns {Promise<Object[]>}
 */
async function fetchTeacherGroups() {
  const teacherId = getState('currentUser')?.id;
  if (!teacherId) return [];
  const groups = await FirestoreService.queryDocuments('groups', [
    { field: 'teacherId', operator: '==', value: teacherId },
    { field: 'archived', operator: '==', value: false }
  ], { orderByField: 'createdAt', orderDirection: 'desc' });
  return groups;
}

/**
 * আর্কাইভকৃত গ্রুপ লোড
 * @returns {Promise<Object[]>}
 */
async function fetchArchivedGroups() {
  const teacherId = getState('currentUser')?.id;
  if (!teacherId) return [];
  const groups = await FirestoreService.queryDocuments('groups', [
    { field: 'teacherId', operator: '==', value: teacherId },
    { field: 'archived', operator: '==', value: true }
  ], { orderByField: 'createdAt', orderDirection: 'desc' });
  return groups;
}

/**
 * নতুন গ্রুপ তৈরি
 * @param {Object} groupData - { name, classLevel, admissionStream, description, joinMethod, ... }
 * @returns {Promise<string>} groupId
 */
async function createGroup(groupData) {
  // গ্রুপ কোড জেনারেট
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let groupCode = '';
  for (let i = 0; i < 5; i++) groupCode += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 5; i++) groupCode += numbers.charAt(Math.floor(Math.random() * numbers.length));

  const data = {
    ...groupData,
    groupCode,
    teacherId: getState('currentUser').id,
    teacherName: getState('currentUser').fullName,
    archived: false,
    approvalRequired: false,
    joinEnabled: true,
    studentIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const docId = await FirestoreService.addDocument('groups', data);
  return docId;
}

/**
 * গ্রুপ আপডেট
 * @param {string} groupId
 * @param {Object} updates
 */
async function updateGroup(groupId, updates) {
  await FirestoreService.updateDocument('groups', groupId, {
    ...updates,
    updatedAt: new Date()
  });
}

/**
 * গ্রুপ আর্কাইভ / আনআর্কাইভ
 * @param {string} groupId
 * @param {boolean} archive
 */
async function setGroupArchiveStatus(groupId, archive) {
  await FirestoreService.updateDocument('groups', groupId, {
    archived: archive,
    updatedAt: new Date()
  });
}

/**
 * গ্রুপ ডিলিট (সতর্কতা: সব পরীক্ষা ও অ্যাটেম্প্ট ডিলিট করে না, শুধু গ্রুপ)
 * @param {string} groupId
 */
async function deleteGroup(groupId) {
  await FirestoreService.deleteDocument('groups', groupId);
}

/**
 * গ্রুপের শিক্ষার্থী তালিকা আনা
 * @param {string} groupId
 * @returns {Promise<Object[]>} students array with profile info
 */
async function fetchGroupStudents(groupId) {
  const { data: group } = await FirestoreService.getDocument('groups', groupId);
  if (!group) return [];
  const studentIds = group.studentIds || [];
  const students = [];
  for (const sid of studentIds) {
    const { data: student } = await FirestoreService.getDocument('students', sid);
    if (student) {
      students.push({ id: sid, ...student });
    }
  }
  return students;
}

/**
 * গ্রুপের জয়েন রিকোয়েস্ট (pending)
 * @param {string} groupId
 * @returns {Promise<Object[]>}
 */
async function fetchJoinRequests(groupId) {
  const requests = await FirestoreService.queryDocuments('join_requests', [
    { field: 'groupId', operator: '==', value: groupId },
    { field: 'status', operator: '==', value: 'pending' }
  ]);
  return requests;
}

/**
 * জয়েন রিকোয়েস্ট অ্যাপ্রুভ
 */
async function approveJoinRequest(requestId, studentId, groupId) {
  const { data: request } = await FirestoreService.getDocument('join_requests', requestId);
  if (!request) return;
  // গ্রুপে ছাত্র যোগ
  await FirestoreService.updateDocument('groups', groupId, {
    studentIds: FirestoreService.arrayUnion ? FirestoreService.arrayUnion(studentId) : null
  });
  // রিকোয়েস্ট স্ট্যাটাস আপডেট
  await FirestoreService.updateDocument('join_requests', requestId, {
    status: 'approved',
    approvedAt: new Date(),
    approvedBy: getState('currentUser').id
  });
  // ছাত্রের joinedGroups আপডেট (later)
}

/**
 * ছাত্রকে গ্রুপ থেকে সরানো
 */
async function removeStudentFromGroup(studentId, groupId) {
  // গ্রুপ থেকে সরান
  const { data: group } = await FirestoreService.getDocument('groups', groupId);
  if (group && group.studentIds) {
    const updated = group.studentIds.filter(id => id !== studentId);
    await FirestoreService.updateDocument('groups', groupId, { studentIds: updated });
  }
  // ছাত্রের joinedGroups থেকে সরান
  const { data: student } = await FirestoreService.getDocument('students', studentId);
  if (student && student.joinedGroups) {
    const updatedGroups = student.joinedGroups.filter(g => g.groupId !== groupId);
    await FirestoreService.updateDocument('students', studentId, { joinedGroups: updatedGroups });
  }
}

export const GroupsData = {
  fetchTeacherGroups,
  fetchArchivedGroups,
  createGroup,
  updateGroup,
  setGroupArchiveStatus,
  deleteGroup,
  fetchGroupStudents,
  fetchJoinRequests,
  approveJoinRequest,
  removeStudentFromGroup,
};

window.GroupsData = GroupsData;
