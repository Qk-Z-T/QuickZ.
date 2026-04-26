// src/features/library/question-bank.js
// লাইব্রেরির সমস্ত প্রশ্ন এক জায়গায় লোড ও ক্যাশ করার সার্ভিস

import { FirestoreService } from '../../core/services/firestore.service.js';
import { getState } from '../../core/state/store.js';

/**
 * @typedef {Object} LibraryQuestion
 * @property {string} id - পরীক্ষার ID
 * @property {string} examTitle - পরীক্ষার শিরোনাম
 * @property {string} subject - বিষয়
 * @property {string} chapter - অধ্যায়
 * @property {string} type - 'live' | 'mock'
 * @property {Object[]} questions - প্রশ্নের অ্যারে
 */

/**
 * ফোল্ডার স্ট্রাকচার থেকে সকল পরীক্ষার তালিকা এবং তাদের আইডি বের করে
 * @returns {Promise<Array<{id:string, name:string, subject:string, chapter:string, type:string}>>}
 */
async function fetchAllExamHeaders() {
  const teacherId = getState('currentUser')?.id;
  const groupId = getState('selectedGroup')?.id;
  if (!teacherId || !groupId) return [];

  const { data } = await FirestoreService.getDocument('folderStructures', `${teacherId}_${groupId}`);
  if (!data) return [];

  const headers = [];
  ['live', 'mock'].forEach(type => {
    (data[type] || []).forEach(subject => {
      (subject.children || []).forEach(chapter => {
        (chapter.exams || []).forEach(exam => {
          headers.push({
            id: exam.id,
            name: exam.name,
            subject: subject.name,
            chapter: chapter.name,
            type: type
          });
        });
      });
    });
  });

  (data.uncategorized || []).forEach(exam => {
    headers.push({
      id: exam.id,
      name: exam.name,
      subject: 'Uncategorized',
      chapter: '',
      type: exam.examType || 'mock'
    });
  });

  return headers;
}

/**
 * নির্দিষ্ট পরীক্ষার প্রশ্ন লোড (ক্যাশ সহ)
 * @param {string} examId
 * @returns {Promise<Object[]>}
 */
async function fetchQuestionsByExamId(examId) {
  // লোকাল ক্যাশ চেক
  const cached = sessionStorage.getItem(`exam_questions_${examId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const { data } = await FirestoreService.getDocument('exams', examId);
  if (!data || !data.questions) return [];

  let questions = [];
  try {
    questions = JSON.parse(data.questions);
  } catch (e) {
    return [];
  }

  // ক্যাশে রাখি (5 মিনিট)
  sessionStorage.setItem(`exam_questions_${examId}`, JSON.stringify(questions));
  return questions;
}

/**
 * একটি সম্পূর্ণ লাইব্রেরি ট্রি রিটার্ন করে (সাবজেক্ট -> চ্যাপ্টার -> পরীক্ষার তালিকা)
 * @returns {Promise<Object[]>} [{ subject, chapters: [{ chapter, exams: [{id,name,type}] }] }]
 */
async function fetchLibraryTree() {
  const headers = await fetchAllExamHeaders();
  const tree = new Map();

  headers.forEach(h => {
    const subject = h.subject;
    const chapter = h.chapter || 'Uncategorized';

    if (!tree.has(subject)) tree.set(subject, new Map());
    const chapterMap = tree.get(subject);
    if (!chapterMap.has(chapter)) chapterMap.set(chapter, []);
    chapterMap.get(chapter).push({
      id: h.id,
      name: h.name,
      type: h.type
    });
  });

  // Map -> Array
  const result = [];
  for (let [subject, chapterMap] of tree.entries()) {
    const chapters = [];
    for (let [chapter, exams] of chapterMap.entries()) {
      chapters.push({ chapter, exams });
    }
    result.push({ subject, chapters });
  }
  return result;
}

export const QuestionBank = {
  fetchAllExamHeaders,
  fetchQuestionsByExamId,
  fetchLibraryTree
};

window.QuestionBank = QuestionBank;
