// src/features/library/question-selector.js
// লাইব্রেরি থেকে প্রশ্ন সিলেক্ট করার UI কম্পোনেন্ট (মডাল আকারে)

import { QuestionBank } from './question-bank.js';
import { escapeHtml } from '../../core/utils/sanitize.js';
import { renderExamContent } from '../../core/utils/math-helper.js';

/**
 * প্রশ্ন সিলেক্টর মডাল খোলে
 * @param {Function} onSelect - সিলেক্ট করা প্রশ্নগুলোর অ্যারে নিয়ে কল হবে
 * @param {Object[]} [preSelected=[]] - পূর্বে সিলেক্ট করা প্রশ্ন
 */
export async function openQuestionSelector(onSelect, preSelected = []) {
  const tree = await QuestionBank.fetchLibraryTree();

  // মডাল কন্টেন্ট
  let html = `
  <div id="qsel-container" style="max-height: 70vh; overflow-y: auto;">
    <div class="mb-4">
      <input id="qsel-search" class="w-full p-2 border rounded" placeholder="পরীক্ষার নাম বা বিষয় খুঁজুন...">
    </div>
    <div id="qsel-tree">
      ${renderTree(tree, preSelected)}
    </div>
  </div>
  <div class="mt-4 flex justify-between">
    <button id="qsel-add-selected" class="bg-indigo-600 text-white px-4 py-2 rounded">নির্বাচিত প্রশ্ন যোগ করুন</button>
  </div>`;

  // Swal ফায়ার
  Swal.fire({
    title: 'লাইব্রেরি থেকে প্রশ্ন বাছাই করুন',
    html,
    width: '800px',
    showConfirmButton: false,
    showCloseButton: true,
    didOpen: () => {
      // সার্চ ফাংশন
      document.getElementById('qsel-search').addEventListener('input', function() {
        filterTree(this.value.toLowerCase());
      });

      // ট্রি টগল
      document.querySelectorAll('.qsel-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
          const target = document.getElementById(this.dataset.target);
          if (target) {
            target.classList.toggle('hidden');
            const icon = this.querySelector('i');
            if (icon) {
              icon.classList.toggle('fa-chevron-right');
              icon.classList.toggle('fa-chevron-down');
            }
          }
        });
      });

      // প্রশ্ন চেকবক্স ইভেন্ট
      document.querySelectorAll('.qsel-q-check').forEach(cb => {
        cb.addEventListener('change', updateSelectionCount);
      });

      // প্রি-সিলেক্টেড মার্ক
      preSelected.forEach(q => {
        const cb = document.querySelector(`.qsel-q-check[data-qid="${q.q}"]`);
        if (cb) cb.checked = true;
      });
      updateSelectionCount();

      // অ্যাড বাটন
      document.getElementById('qsel-add-selected').addEventListener('click', () => {
        const selected = [];
        document.querySelectorAll('.qsel-q-check:checked').forEach(cb => {
          const examId = cb.dataset.examId;
          const qIndex = parseInt(cb.dataset.qindex);
          const qText = cb.dataset.qtext;
          const options = JSON.parse(cb.dataset.options);
          const correct = parseInt(cb.dataset.correct);
          const expl = cb.dataset.explanation || '';
          selected.push({
            q: qText,
            options,
            correct,
            expl,
            sourceExamId: examId,
            sourceQIndex: qIndex
          });
        });
        Swal.close();
        onSelect(selected);
      });
    },
    willClose: () => {
      // ক্লিনআপ
    }
  });
}

function renderTree(tree, preSelected) {
  if (!tree.length) return '<p class="text-slate-400">কোনো লাইব্রেরি ডেটা নেই</p>';

  let html = '';
  tree.forEach(subject => {
    const subId = `sub-${Date.now()}-${Math.random().toString(36)}`;
    html += `
    <div class="mb-3">
      <div class="qsel-toggle flex items-center gap-2 cursor-pointer p-2 bg-slate-100 rounded" data-target="${subId}">
        <i class="fas fa-chevron-right text-sm"></i>
        <span class="font-bold">${escapeHtml(subject.subject)}</span>
      </div>
      <div id="${subId}" class="ml-4 hidden">`;

    subject.chapters.forEach(chapter => {
      const chapId = `chap-${Date.now()}-${Math.random().toString(36)}`;
      html += `
        <div class="mt-2">
          <div class="qsel-toggle flex items-center gap-2 cursor-pointer p-1" data-target="${chapId}">
            <i class="fas fa-chevron-right text-xs"></i>
            <span class="font-medium">${escapeHtml(chapter.chapter)}</span>
            <span class="text-xs text-slate-500">(${chapter.exams.length} পরীক্ষা)</span>
          </div>
          <div id="${chapId}" class="ml-6 hidden">`;

      chapter.exams.forEach(exam => {
        const examId = `exam-${exam.id}`;
        html += `
            <div class="mt-1">
              <div class="qsel-toggle flex items-center gap-2 cursor-pointer p-1 text-sm" data-target="${examId}">
                <i class="fas fa-chevron-right text-xs"></i>
                <span>${escapeHtml(exam.name)}</span>
              </div>
              <div id="${examId}" class="ml-4 hidden questions-container" data-exam-id="${exam.id}">
                <div class="text-center p-2"><span class="text-xs text-slate-400">প্রশ্ন লোড হচ্ছে...</span></div>
              </div>
            </div>`;
      });

      html += `</div></div>`;
    });

    html += `</div></div>`;
  });
  return html;
}

async function loadQuestionsForExam(examId, container) {
  const questions = await QuestionBank.fetchQuestionsByExamId(examId);
  let html = '';
  questions.forEach((q, i) => {
    const qText = q.q.length > 80 ? q.q.substring(0, 80) + '...' : q.q;
    html += `
    <div class="flex items-start gap-2 p-1 hover:bg-slate-50 rounded">
      <input type="checkbox" class="qsel-q-check mt-1" 
        data-exam-id="${examId}" 
        data-qindex="${i}" 
        data-qtext="${escapeHtml(q.q).replace(/"/g, '&quot;')}" 
        data-options='${JSON.stringify(q.options).replace(/'/g, "&#39;")}' 
        data-correct="${q.correct}" 
        data-explanation="${escapeHtml(q.expl || '').replace(/"/g, '&quot;')}">
      <div class="text-sm flex-1">
        <span class="font-bold">${i+1}.</span> ${escapeHtml(qText)}
        <span class="text-xs text-slate-500 ml-2">[সঠিক: ${String.fromCharCode(65+q.correct)}]</span>
      </div>
    </div>`;
  });
  container.innerHTML = html || '<span class="text-xs text-slate-400">কোনো প্রশ্ন নেই</span>';
}

function filterTree(query) {
  document.querySelectorAll('.questions-container').forEach(div => {
    // যদি প্রশ্ন লোড না হয়ে থাকে, তাহলে কিছু করবে না
  });

  document.querySelectorAll('[id^="exam-"]').forEach(el => {
    const examName = el.previousElementSibling?.textContent?.toLowerCase() || '';
    const parentChap = el.closest('[id^="chap-"]');
    const parentSub = el.closest('[id^="sub-"]');
    const matches = !query || examName.includes(query);

    if (matches && query) {
      // খুলে দাও সব প্যারেন্ট
      if (parentChap) parentChap.classList.remove('hidden');
      if (parentSub) parentSub.classList.remove('hidden');
      el.classList.remove('hidden');
    } else if (!query) {
      el.classList.add('hidden');
      if (parentChap) parentChap.classList.add('hidden');
      if (parentSub) parentSub.classList.add('hidden');
    }
  });
}

function updateSelectionCount() {
  const count = document.querySelectorAll('.qsel-q-check:checked').length;
  const btn = document.getElementById('qsel-add-selected');
  if (btn) btn.textContent = `নির্বাচিত প্রশ্ন যোগ করুন (${count}টি)`;
}

// ট্রি নোড টগল ইভেন্ট (Swal-এর ভিতর রান হয়)
document.addEventListener('click', function(e) {
  const toggle = e.target.closest('.qsel-toggle');
  if (!toggle) return;
  const targetId = toggle.dataset.target;
  const target = document.getElementById(targetId);
  if (!target) return;

  // প্রশ্ন কন্টেইনার হলে lazy load
  if (target.classList.contains('questions-container') && target.querySelector('.text-slate-400')) {
    const examId = target.dataset.examId;
    if (examId) {
      target.innerHTML = '<div class="text-center p-2"><span class="loader" style="width:16px;height:16px;"></span></div>';
      loadQuestionsForExam(examId, target);
    }
  }

  target.classList.toggle('hidden');
  const icon = toggle.querySelector('i');
  if (icon) {
    icon.classList.toggle('fa-chevron-right');
    icon.classList.toggle('fa-chevron-down');
  }
});

window.openQuestionSelector = openQuestionSelector;
