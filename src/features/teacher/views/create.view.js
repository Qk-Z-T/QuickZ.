// src/features/teacher/views/create.view.js (UPDATED)
// পরীক্ষা তৈরি — ম্যানুয়াল, JSON ও লাইব্রেরি থেকে প্রশ্ন সিলেক্ট

import { getState } from '../../../core/state/store.js';
import { TeacherData } from '../teacher.data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';
import { loadMathJax, autoResizeTextarea } from '../../../core/utils/math-helper.js';
import { openQuestionSelector } from '../../library/question-selector.js';

let questions = [];
let currentQuestionIndex = null;
let currentMode = 'manual'; // 'manual' or 'json'

export function renderCreate(container) {
  const group = getState('selectedGroup');
  if (!group) {
    container.innerHTML = `<div class="p-6 text-center"><p>Please select a course first.</p></div>`;
    return;
  }

  questions = [];
  currentQuestionIndex = null;
  currentMode = 'manual';

  container.innerHTML = `
  <div class="pb-6 max-w-5xl">
    <h2 class="text-2xl font-bold mb-4">Create Exam</h2>
    
    <div class="bg-white dark:bg-dark-secondary p-3 rounded-xl shadow-sm border mb-4 flex items-center gap-3">
      <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm">
        <i class="fas fa-book"></i>
      </div>
      <div>
        <span class="font-bold text-sm">${escapeHtml(group.name)}</span>
        <span class="text-xs text-slate-500 ml-2">পরীক্ষা তৈরি হচ্ছে</span>
      </div>
    </div>

    <div class="bg-white dark:bg-dark-secondary p-5 rounded-2xl shadow-sm border w-full">
      <input id="exam-title" class="w-full p-3 border rounded-xl" placeholder="Exam Title">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div>
          <label class="block text-sm font-bold mb-1">Subject</label>
          <input id="exam-subject" class="w-full p-3 border rounded-xl" placeholder="Subject">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Chapter</label>
          <input id="exam-chapter" class="w-full p-3 border rounded-xl" placeholder="Chapter">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <div>
          <label class="block text-sm font-bold mb-1">Duration (Minutes)</label>
          <input id="exam-duration" type="number" class="w-full p-3 border rounded-xl" placeholder="60" value="60">
        </div>
        <div>
          <label class="block text-sm font-bold mb-1">Total Marks</label>
          <input id="exam-marks" type="number" class="w-full p-3 border rounded-xl" placeholder="100" value="100">
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-sm font-bold mb-1">Type</label>
        <select id="exam-type" class="w-full p-3 border rounded-xl">
          <option value="mock">Mock (Practice)</option>
          <option value="live">Live Exam</option>
        </select>
      </div>

      <!-- Mode Switcher -->
      <div class="flex items-center justify-between mt-6 mb-4">
        <span class="text-sm font-bold">Question Mode:</span>
        <div class="flex gap-2">
          <button id="mode-manual-btn" class="px-4 py-2 rounded-lg font-bold text-sm bg-indigo-600 text-white" onclick="window.switchQuestionMode('manual')">Manual</button>
          <button id="mode-json-btn" class="px-4 py-2 rounded-lg font-bold text-sm bg-slate-200" onclick="window.switchQuestionMode('json')">JSON</button>
        </div>
      </div>

      <!-- Manual Mode -->
      <div id="manual-section">
        <!-- লাইব্রেরি থেকে প্রশ্ন যোগ বাটন -->
        <div class="mb-4">
          <button id="open-library-btn" class="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
            <i class="fas fa-book-open mr-2"></i>লাইব্রেরি থেকে প্রশ্ন যোগ করুন
          </button>
        </div>

        <div id="questions-list" class="mb-4 p-3 bg-slate-50 rounded border">
          <h3 class="font-bold mb-2">Questions (${questions.length})</h3>
          <div id="questions-container">No questions added yet</div>
        </div>
        <div class="border rounded p-4">
          <h4 class="font-bold mb-2" id="question-form-title">Add New Question</h4>
          <textarea id="q-text" class="w-full p-2 border rounded mb-2" rows="3" placeholder="Question text"></textarea>
          ${['A','B','C','D'].map(letter => `
            <div class="flex items-center gap-2 mb-2">
              <span class="font-bold w-6">${letter}.</span>
              <input id="opt-${letter.toLowerCase()}" class="flex-1 p-2 border rounded" placeholder="Option ${letter}">
            </div>
          `).join('')}
          <div class="mb-2">
            <label class="text-sm font-bold mb-1 block">Correct Answer</label>
            <select id="correct-ans" class="w-full p-2 border rounded">
              <option value="">Select</option>
              <option value="0">A</option>
              <option value="1">B</option>
              <option value="2">C</option>
              <option value="3">D</option>
            </select>
          </div>
          <div class="mb-2">
            <label class="text-sm font-bold mb-1 block">Explanation (optional)</label>
            <textarea id="expl" class="w-full p-2 border rounded" rows="2" placeholder="Explanation"></textarea>
          </div>
          <button id="add-question-btn" class="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold">Add Question</button>
        </div>
      </div>

      <!-- JSON Mode -->
      <div id="json-section" class="hidden mt-4">
        <textarea id="json-input" class="w-full h-40 p-3 border rounded font-mono text-sm" placeholder='[{"q":"...","options":["A","B","C","D"],"correct":0,"expl":""}]'></textarea>
      </div>

      <div class="mt-6">
        <button id="publish-btn" class="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow">Publish Exam</button>
      </div>
    </div>
  </div>`;

  // ইভেন্ট বাইন্ডিং
  document.getElementById('add-question-btn').addEventListener('click', () => handleAddQuestion());
  document.getElementById('publish-btn').addEventListener('click', () => handlePublishExam());
  document.getElementById('open-library-btn').addEventListener('click', () => {
    openQuestionSelector((selectedQuestions) => {
      questions = questions.concat(selectedQuestions);
      renderQuestionsList();
    }, []);
  });

  window.switchQuestionMode = (mode) => {
    currentMode = mode;
    document.getElementById('mode-manual-btn').className = mode === 'manual'
      ? 'px-4 py-2 rounded-lg font-bold text-sm bg-indigo-600 text-white'
      : 'px-4 py-2 rounded-lg font-bold text-sm bg-slate-200';
    document.getElementById('mode-json-btn').className = mode === 'json'
      ? 'px-4 py-2 rounded-lg font-bold text-sm bg-indigo-600 text-white'
      : 'px-4 py-2 rounded-lg font-bold text-sm bg-slate-200';
    document.getElementById('manual-section').classList.toggle('hidden', mode !== 'manual');
    document.getElementById('json-section').classList.toggle('hidden', mode !== 'json');
  };
}

// বাকি ফাংশন (handleAddQuestion, renderQuestionsList, ইত্যাদি) পূর্বের মতোই আছে
// (এখানে সংক্ষেপের জন্য বাদ দিলাম না, সম্পূর্ণ আগের create.view.js এর নিচের অংশ ব্যবহার করুন)
// ---------- নিচের অংশ পূর্বের create.view.js থেকে ----------
function handleAddQuestion() {
  const qText = document.getElementById('q-text').value.trim();
  const optA = document.getElementById('opt-a').value.trim();
  const optB = document.getElementById('opt-b').value.trim();
  const optC = document.getElementById('opt-c').value.trim();
  const optD = document.getElementById('opt-d').value.trim();
  const correct = document.getElementById('correct-ans').value;
  const expl = document.getElementById('expl').value.trim();

  if (!qText || !optA || !optB || !optC || !optD || correct === '') {
    alert('Please fill all required fields');
    return;
  }

  const question = {
    q: qText,
    options: [optA, optB, optC, optD],
    correct: parseInt(correct),
    expl: expl || '',
  };

  if (currentQuestionIndex !== null) {
    questions[currentQuestionIndex] = question;
    currentQuestionIndex = null;
    document.getElementById('add-question-btn').textContent = 'Add Question';
    document.getElementById('question-form-title').textContent = 'Add New Question';
  } else {
    questions.push(question);
  }

  document.getElementById('q-text').value = '';
  document.getElementById('opt-a').value = '';
  document.getElementById('opt-b').value = '';
  document.getElementById('opt-c').value = '';
  document.getElementById('opt-d').value = '';
  document.getElementById('correct-ans').value = '';
  document.getElementById('expl').value = '';

  renderQuestionsList();
}

function renderQuestionsList() {
  const container = document.getElementById('questions-container');
  if (!container) return;
  if (!questions.length) {
    container.innerHTML = '<p class="text-slate-400">No questions added yet</p>';
    document.getElementById('questions-list').querySelector('h3').textContent = `Questions (0)`;
    return;
  }
  let html = '';
  questions.forEach((q, i) => {
    html += `<div class="p-3 mb-2 border rounded bg-white flex justify-between items-start">
      <div><strong>Q${i+1}:</strong> ${escapeHtml(q.q.substring(0, 80))}... | Ans: ${String.fromCharCode(65+q.correct)}</div>
      <div class="flex gap-2">
        <button class="text-blue-600 text-sm" onclick="window.editQuestion(${i})"><i class="fas fa-edit"></i></button>
        <button class="text-red-600 text-sm" onclick="window.deleteQuestion(${i})"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  });
  container.innerHTML = html;
  document.getElementById('questions-list').querySelector('h3').textContent = `Questions (${questions.length})`;
}

window.editQuestion = (index) => {
  const q = questions[index];
  document.getElementById('q-text').value = q.q;
  document.getElementById('opt-a').value = q.options[0];
  document.getElementById('opt-b').value = q.options[1];
  document.getElementById('opt-c').value = q.options[2];
  document.getElementById('opt-d').value = q.options[3];
  document.getElementById('correct-ans').value = q.correct;
  document.getElementById('expl').value = q.expl || '';
  currentQuestionIndex = index;
  document.getElementById('add-question-btn').textContent = 'Update Question';
  document.getElementById('question-form-title').textContent = `Edit Question ${index+1}`;
  document.getElementById('q-text').focus();
};

window.deleteQuestion = (index) => {
  if (confirm('Delete this question?')) {
    questions.splice(index, 1);
    renderQuestionsList();
  }
};

async function handlePublishExam() {
  const title = document.getElementById('exam-title').value.trim();
  const subject = document.getElementById('exam-subject').value.trim();
  const chapter = document.getElementById('exam-chapter').value.trim();
  const duration = parseInt(document.getElementById('exam-duration').value) || 60;
  const totalMarks = parseInt(document.getElementById('exam-marks').value) || 100;
  const type = document.getElementById('exam-type').value;
  const group = getState('selectedGroup');

  if (!title) return alert('Title required');

  let finalQuestions = [];
  if (currentMode === 'manual') {
    if (!questions.length) return alert('Add at least one question');
    finalQuestions = questions;
  } else {
    try {
      finalQuestions = JSON.parse(document.getElementById('json-input').value);
    } catch (e) {
      return alert('Invalid JSON');
    }
  }

  const examData = {
    title,
    subject,
    chapter,
    duration,
    totalMarks,
    type,
    negativeMark: 0,
    questions: JSON.stringify(finalQuestions),
    groupId: group.id,
    groupName: group.name,
    createdBy: getState('currentUser')?.id,
    createdAt: new Date(),
    isDraft: type === 'live' ? true : false,
    resultPublished: type === 'mock' ? true : false,
    cancelled: false,
  };

  try {
    await TeacherData.createExam(examData);
    alert('Exam created successfully!');
    questions = [];
    currentQuestionIndex = null;
    import('../../app/router.js').then(m => m.Router.navigateTo('home'));
  } catch (e) {
    alert('Failed: ' + e.message);
  }
}
