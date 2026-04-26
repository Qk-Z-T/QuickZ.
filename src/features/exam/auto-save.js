// src/features/exam/auto-save.js
// পরীক্ষার অটো-সেভ (প্রতি ২০ সেকেন্ডে Firestore/লোকালে)

import { FirestoreService } from '../../core/services/firestore.service.js';
import { getState } from '../../core/state/store.js';

let autoSaveInterval = null;

/**
 * অটো-সেভ শুরু
 * @param {string} attemptId
 * @param {string} examId
 * @param {Function} getData - বর্তমান ডেটা রিটার্ন করবে { answers, markedAnswers, status, ... }
 */
function start(attemptId, examId, getData) {
  stop(); // আগের ইন্টারভাল ক্লিয়ার
  autoSaveInterval = setInterval(async () => {
    const data = getData();
    // লোকাল স্টোরেজে সবসময় সেভ
    localStorage.setItem('currentExamProgress', JSON.stringify({
      firestoreId: attemptId,
      examId,
      ...data,
    }));

    // অনলাইনে Firestore-এ সেভ
    if (navigator.onLine && !attemptId.startsWith('local_')) {
      try {
        await FirestoreService.updateDocument('attempts', attemptId, {
          answers: data.answers,
          markedAnswers: data.markedAnswers,
          lastSaved: new Date(),
        });
      } catch (e) {
        console.warn('Auto-save to Firestore failed:', e);
      }
    }
  }, 20000); // 20 seconds
}

/**
 * অটো-সেভ বন্ধ
 */
function stop() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

export const AutoSave = { start, stop };
