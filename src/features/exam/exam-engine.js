// src/features/exam/exam-engine.js
// পরীক্ষা ইঞ্জিন — প্রশ্ন রেন্ডার, টাইমার, সিলেকশন, সাবমিট

import { getState } from '../../core/state/store.js';
import { EventBus } from '../../core/state/event-bus.js';
import { FirestoreService } from '../../core/services/firestore.service.js';
import { DBService } from '../../core/services/db.service.js';
import { escapeHtml } from '../../core/utils/sanitize.js';
import { renderExamContent, loadMathJax } from '../../core/utils/math-helper.js';
import { AutoSave } from './auto-save.js';

let timerInterval = null;
let remainingSeconds = 0;
let questions = [];
let answers = [];
let markedAnswers = [];
let startedAt = null;
let currentExam = null;
let isPractice = false;
let attemptId = null;
let currentPage = 0;
const QUESTIONS_PER_PAGE = 25;

/**
 * পরীক্ষা শুরু
 * @param {string} examId
 * @param {boolean} [forcePractice=false]
 */
export async function startExam(examId, forcePractice = false) {
  // কনফার্ম ডায়ালগ
  const confirmed = await Swal.fire({
    title: 'শুরু করবেন?',
    text: 'পরীক্ষা শুরু হলে সময় গণনা শুরু হবে।',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'হ্যাঁ',
    cancelButtonText: 'না'
  });
  if (!confirmed.isConfirmed) return;

  try {
    // পরীক্ষার ডেটা আনা
    let examData;
    if (navigator.onLine) {
      const { data } = await FirestoreService.getDocument('exams', examId);
      if (!data) throw new Error('পরীক্ষা খুঁজে পাওয়া যায়নি');
      examData = { id: examId, ...data };
    } else {
      // অফলাইন ক্যাশ থেকে
      examData = await loadExamFromCache(examId);
      if (!examData) throw new Error('পরীক্ষার ডেটা অফলাইনে নেই। ইন্টারনেট সংযোগ দিন।');
    }

    const fullQs = JSON.parse(examData.questions);
    // শিক্ষার্থীকে সঠিক উত্তর ছাড়া প্রশ্ন দেখানো হবে
    questions = fullQs.map(q => {
      const { correct, ...rest } = q;
      return rest;
    });
    // সঠিক উত্তরের জন্য পূর্ণাঙ্গ প্রশ্ন সংরক্ষণ
    window._fullQuestions = fullQs;

    answers = new Array(questions.length).fill(null);
    markedAnswers = new Array(questions.length).fill(false);
    startedAt = new Date();
    currentExam = examData;
    isPractice = forcePractice || examData.type === 'mock';
    currentPage = 0;

    // অ্যাটেম্প্ট তৈরি (অনলাইনে Firestore-এ, অফলাইনে লোকাল আইডি)
    if (navigator.onLine && !forcePractice && examData.type === 'live') {
      const uid = getState('user').uid;
      // আগের চলমান অ্যাটেম্প্ট চেক
      const existing = await FirestoreService.queryDocuments('attempts', [
        { field: 'userId', operator: '==', value: uid },
        { field: 'examId', operator: '==', value: examId },
        { field: 'isPractice', operator: '==', value: false }
      ]);
      const running = existing.find(a => !a.submittedAt);
      if (running) {
        attemptId = running.id;
        answers = running.answers || answers;
        markedAnswers = running.markedAnswers || markedAnswers;
        startedAt = running.startedAt?.toDate() || new Date();
      } else {
        // সাবমিটেড আগে থেকেই থাকলে
        const submitted = existing.find(a => a.submittedAt);
        if (submitted) {
          Swal.fire('অংশগ্রহণ সম্পন্ন', 'আপনি ইতিমধ্যে এই পরীক্ষায় অংশগ্রহণ করেছেন', 'info');
          return;
        }
        // নতুন অ্যাটেম্প্ট
        attemptId = await FirestoreService.addDocument('attempts', {
          userId: uid,
          userName: getState('currentUser')?.name || 'Student',
          examId,
          examTitle: examData.title,
          status: 'in-progress',
          startedAt: new Date(),
          answers: [],
          markedAnswers: [],
          score: 0,
          isPractice: false,
          groupId: getState('activeGroupId')
        });
      }
    } else {
      attemptId = 'local_' + Date.now() + '_' + examId;
    }

    // অটো-সেভ শুরু (লাইভ হলে)
    if (!isPractice && examData.type === 'live') {
      AutoSave.start(attemptId, examId, () => ({
        answers,
        markedAnswers,
        status: 'in-progress',
        lastSaved: new Date().toISOString()
      }));
    }

    // UI রেন্ডার
    renderExamUI();
    // টাইমার চালু
    startTimer(examData.duration * 60);
    // রিভিউ প্যানেল দেখান
    document.getElementById('review-panel-btn')?.classList.remove('hidden');
    updateReviewPanel();
  } catch (error) {
    console.error(error);
    Swal.fire('ত্রুটি', error.message, 'error');
  }
}

/**
 * পরীক্ষার UI রেন্ডার
 */
function renderExamUI() {
  const appContainer = document.getElementById('app-container');
  if (!appContainer) return;

  const answeredCount = answers.filter(a => a !== null).length;
  const practiceLabel = isPractice ? '<span class="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Mock Mode</span>' : '';

  appContainer.innerHTML = `
    <div class="sticky top-0 border-b px-4 py-3 flex justify-between items-center z-30 bg-white dark:bg-dark-secondary shadow-sm exam-header-bar">
      <div>
        ${practiceLabel}
        <div class="text-center">
          <span class="font-bold block text-sm">${escapeHtml(currentExam.title)}</span>
          <div class="flex items-center justify-center gap-2 mt-1">
            <span id="timer" class="text-xs font-mono bg-slate-100 px-1 rounded">00:00</span>
            <span id="answered-counter" class="text-xs font-mono bg-indigo-100 text-indigo-600 px-1 rounded">সম্পন্ন: ${answeredCount}/${questions.length}</span>
          </div>
        </div>
      </div>
      <div>
        <button id="submit-exam-btn" class="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-bold">জমা দিন</button>
      </div>
    </div>
    <div id="exam-content" class="p-4 pb-20 min-h-screen" style="background-color:var(--bg-primary);"></div>
  `;

  document.getElementById('submit-exam-btn').addEventListener('click', () => submitExam(false));
  renderQuestionPage();
  loadMathJax(null, document.getElementById('app-container'));
}

/**
 * প্রশ্ন পৃষ্ঠা রেন্ডার
 */
function renderQuestionPage() {
  const container = document.getElementById('exam-content');
  if (!container) return;

  const start = currentPage * QUESTIONS_PER_PAGE;
  const end = Math.min(start + QUESTIONS_PER_PAGE, questions.length);
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  let html = '';
  for (let i = start; i < end; i++) {
    const q = questions[i];
    const qText = renderExamContent(q.q);
    const selected = answers[i];
    const isAnswered = selected !== null;

    html += `<div class="p-4 rounded-xl shadow-sm border mb-4 bg-white dark:bg-dark-secondary" id="q-${i}">
      <div class="flex justify-between items-center mb-3">
        <span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 text-sm rounded">${i+1}</span>
        <button id="mark-btn-${i}" class="text-xs font-bold ${markedAnswers[i] ? 'text-amber-500' : 'text-slate-400'}" onclick="window.toggleMark(${i})">
          <i class="${markedAnswers[i] ? 'fas' : 'far'} fa-bookmark"></i> ${markedAnswers[i] ? 'চিহ্নিত' : 'চিহ্নিত করুন'}
        </button>
      </div>
      <p class="font-bold mb-3 text-left">${qText}</p>
      <div class="space-y-2">
        ${q.options.map((opt, oi) => `
          <button onclick="window.selectAnswer(${i}, ${oi})" class="opt-btn w-full text-left p-3 rounded-lg border text-sm flex gap-2 transition ${selected === oi ? 'selected' : ''} ${isAnswered ? 'locked' : ''}" ${isAnswered ? 'disabled' : ''}>
            <span class="font-bold opacity-50 w-6">${String.fromCharCode(65+oi)}.</span>
            <span class="flex-1">${renderExamContent(opt)}</span>
            ${selected === oi ? '<i class="fas fa-check text-indigo-600 ml-2"></i>' : ''}
          </button>
        `).join('')}
      </div>
    </div>`;
  }

  if (totalPages > 1) {
    html += `<div class="flex justify-center gap-2 mt-4">
      <button onclick="window.prevExamPage()" class="px-4 py-2 bg-slate-100 rounded-lg" ${currentPage === 0 ? 'disabled' : ''}>পূর্ববর্তী</button>
      <span class="px-4 py-2 text-sm">পৃষ্ঠা ${currentPage+1}/${totalPages}</span>
      <button onclick="window.nextExamPage()" class="px-4 py-2 bg-slate-100 rounded-lg" ${currentPage === totalPages-1 ? 'disabled' : ''}>পরবর্তী</button>
    </div>`;
  }

  container.innerHTML = html;
  updateReviewPanel();
}

/**
 * টাইমার শুরু (সেকেন্ডে ইনপুট)
 */
function startTimer(seconds) {
  remainingSeconds = seconds;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingSeconds--;
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const el = document.getElementById('timer');
    if (el) el.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    if (remainingSeconds <= 0) {
      submitExam(true);
    }
  }, 1000);
}

/**
 * উত্তর সিলেক্ট
 */
function selectAnswer(qIndex, optIndex) {
  if (answers[qIndex] !== null) return; // already answered
  answers[qIndex] = optIndex;

  // UI update without full re-render
  const questionDiv = document.getElementById(`q-${qIndex}`);
  if (questionDiv) {
    const buttons = questionDiv.querySelectorAll('.opt-btn');
    buttons.forEach((btn, idx) => {
      if (idx === optIndex) {
        btn.classList.add('selected');
        if (!btn.querySelector('.fa-check')) {
          const icon = document.createElement('i');
          icon.className = 'fas fa-check text-indigo-600 ml-2';
          btn.appendChild(icon);
        }
      }
      btn.classList.add('locked');
      btn.disabled = true;
    });
  }
  updateAnsweredCounter();
  updateReviewPanel();
}

/**
 * মার্ক টগল
 */
function toggleMark(index) {
  markedAnswers[index] = !markedAnswers[index];
  const btn = document.getElementById(`mark-btn-${index}`);
  if (btn) {
    btn.innerHTML = markedAnswers[index]
      ? `<i class="fas fa-bookmark"></i> চিহ্নিত`
      : `<i class="far fa-bookmark"></i> চিহ্নিত করুন`;
    btn.classList.toggle('text-amber-500', markedAnswers[index]);
    btn.classList.toggle('text-slate-400', !markedAnswers[index]);
  }
  updateReviewPanel();
}

/**
 * উত্তরদাতা কাউন্টার আপডেট
 */
function updateAnsweredCounter() {
  const answered = answers.filter(a => a !== null).length;
  const el = document.getElementById('answered-counter');
  if (el) el.textContent = `সম্পন্ন: ${answered}/${questions.length}`;
}

/**
 * রিভিউ প্যানেল আপডেট
 */
function updateReviewPanel() {
  const panel = document.getElementById('question-numbers');
  if (!panel) return;
  panel.innerHTML = '';
  questions.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'question-number-btn';
    if (answers[i] !== null) btn.classList.add('answered');
    if (i >= currentPage * QUESTIONS_PER_PAGE && i < (currentPage + 1) * QUESTIONS_PER_PAGE) {
      btn.classList.add('current-view');
    }
    btn.textContent = i + 1;
    btn.onclick = () => {
      const targetPage = Math.floor(i / QUESTIONS_PER_PAGE);
      if (targetPage !== currentPage) {
        currentPage = targetPage;
        renderQuestionPage();
      }
      setTimeout(() => {
        const el = document.getElementById(`q-${i}`);
        if (el) {
          el.scrollIntoView({ behavior: 'instant', block: 'center' });
          el.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
          setTimeout(() => el.style.backgroundColor = '', 1000);
        }
      }, 50);
      document.getElementById('review-panel')?.classList.remove('show');
    };
    panel.appendChild(btn);
  });
}

/**
 * পৃষ্ঠা পরিবর্তন
 */
function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    renderQuestionPage();
  }
}

function nextPage() {
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  if (currentPage < totalPages - 1) {
    currentPage++;
    renderQuestionPage();
  }
}

/**
 * পরীক্ষা সাবমিট
 */
async function submitExam(auto = false) {
  if (!auto && !confirm('পরীক্ষা জমা দিতে চান?')) return;
  clearInterval(timerInterval);
  AutoSave.stop();

  // স্কোর গণনা
  const fullQs = window._fullQuestions;
  let score = 0;
  const neg = currentExam.negativeMark ? parseFloat(currentExam.negativeMark) : 0;
  fullQs.forEach((q, i) => {
    if (answers[i] === q.correct) score++;
    else if (answers[i] !== null) score -= neg;
  });
  score = Math.max(0, score);

  const submission = {
    userId: getState('user').uid,
    userName: getState('currentUser')?.name || 'Student',
    examId: currentExam.id,
    examTitle: currentExam.title,
    score,
    answers,
    markedAnswers,
    startedAt,
    submittedAt: new Date().toISOString(),
    isPractice: isPractice || currentExam.type === 'mock',
    groupId: getState('activeGroupId'),
    status: 'submitted'
  };

  // অনলাইনে সাবমিট
  if (navigator.onLine && !attemptId.startsWith('local_')) {
    try {
      await FirestoreService.updateDocument('attempts', attemptId, {
        answers,
        markedAnswers,
        score,
        submittedAt: new Date(),
        status: 'submitted'
      });
      localStorage.removeItem('currentExamProgress');
    } catch (e) {
      // ব্যর্থ হলে লোকাল সেভ
      await saveToOfflineQueue(submission, attemptId);
    }
  } else {
    await saveToOfflineQueue(submission, attemptId);
  }

  // UI পরিস্কার
  document.getElementById('review-panel-btn')?.classList.add('hidden');
  document.getElementById('review-panel')?.classList.remove('show');
  EventBus.emit('exam:completed', { score, examId: currentExam.id });
  EventBus.emit('navigate', 'results');
}

/**
 * অফলাইন কিউতে সাবমিট ডেটা সংরক্ষণ
 */
async function saveToOfflineQueue(submission, localAttemptId) {
  await DBService.addToSyncQueue({
    collection: 'attempts',
    operation: 'add',
    payload: submission,
    docId: localAttemptId,
    timestamp: Date.now()
  });
  // লোকাল স্টোরেজেও রাখি
  const pending = JSON.parse(localStorage.getItem('pendingAttempts') || '[]');
  pending.push(submission);
  localStorage.setItem('pendingAttempts', JSON.stringify(pending));
  if (!navigator.onLine) {
    Swal.fire('অফলাইন', 'আপনার উত্তর স্থানীয়ভাবে সংরক্ষিত হয়েছে। ইন্টারনেট ফিরলে স্বয়ংক্রিয়ভাবে জমা হবে।', 'info');
  }
}

/**
 * অফলাইন ক্যাশ থেকে পরীক্ষা লোড
 */
async function loadExamFromCache(examId) {
  const cached = localStorage.getItem('offlineExamCache_' + getState('activeGroupId'));
  if (cached) {
    const cacheObj = JSON.parse(cached);
    return cacheObj[examId];
  }
  // IndexedDB থেকেও চেষ্টা
  const exam = await DBService.getData(DBService.STORES.EXAMS, examId);
  return exam || null;
}

// গ্লোবাল এক্সপোজ
window.startExam = startExam;
window.selectAnswer = selectAnswer;
window.toggleMark = toggleMark;
window.prevExamPage = prevPage;
window.nextExamPage = nextPage;
window.submitExam = submitExam;

export { startExam };
