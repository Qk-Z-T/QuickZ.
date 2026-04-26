// src/features/teacher/views/groups.view.js
// কোর্স ব্যবস্থাপনা - তালিকা, তৈরি, সম্পাদনা, ছাত্র তালিকা

import { getState } from '../../../core/state/store.js';
import { GroupsData } from '../../groups/groups-data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';
import { EventBus } from '../../../core/state/event-bus.js';
import { CLASS_LABELS, JOIN_METHODS } from '../../../core/constants/app-constants.js';

let currentView = 'list'; // 'list', 'create', 'students', 'edit'
let selectedGroupId = null;

export async function renderGroups(container) {
  currentView = 'list';
  const groups = await GroupsData.fetchTeacherGroups();
  container.innerHTML = `
    <div class="pb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">কোর্স ব্যবস্থাপনা</h2>
        <button id="btn-new-group" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">নতুন কোর্স</button>
      </div>
      <div id="groups-content">
        ${renderGroupsList(groups)}
      </div>
    </div>`;

  document.getElementById('btn-new-group').addEventListener('click', () => showCreateForm(container));
}

function renderGroupsList(groups) {
  if (!groups.length) return '<div class="text-center p-10 text-slate-400">কোনো কোর্স নেই</div>';
  let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  groups.forEach(g => {
    const classLabel = g.classLevel ? CLASS_LABELS[g.classLevel] || g.classLevel : '';
    html += `
    <div class="bg-white dark:bg-dark-secondary p-4 rounded-xl shadow-sm border">
      <div class="flex justify-between items-start">
        <div>
          <h3 class="font-bold text-lg">${escapeHtml(g.name)}</h3>
          <p class="text-xs text-slate-500">${escapeHtml(classLabel)} ${g.admissionStream ? '· ' + escapeHtml(g.admissionStream) : ''}</p>
          <p class="text-xs mt-1"><strong>কোড:</strong> ${escapeHtml(g.groupCode)}</p>
          <p class="text-xs">${g.studentIds?.length || 0} জন শিক্ষার্থী</p>
        </div>
        <div class="flex gap-2">
          <button onclick="window.viewGroupStudents('${g.id}')" class="text-indigo-600 text-sm">ছাত্র</button>
          <button onclick="window.editGroupInfo('${g.id}')" class="text-blue-600 text-sm">সম্পাদনা</button>
          <button onclick="window.archiveGroup('${g.id}')" class="text-amber-600 text-sm">আর্কাইভ</button>
        </div>
      </div>
    </div>`;
  });
  html += '</div>';
  return html;
}

function showCreateForm(container) {
  currentView = 'create';
  container.innerHTML = `
    <div class="pb-6 max-w-lg">
      <h3 class="text-xl font-bold mb-4">নতুন কোর্স তৈরি</h3>
      <div class="space-y-3">
        <input id="g-name" class="w-full p-3 border rounded-xl" placeholder="কোর্সের নাম">
        <select id="g-class" class="w-full p-3 border rounded-xl">
          <option value="">ক্লাস নির্বাচন</option>
          <option value="6">৬ষ্ঠ</option><option value="7">৭ম</option><option value="8">৮ম</option>
          <option value="SSC">এসএসসি</option><option value="HSC">এইচএসসি</option><option value="Admission">এডমিশন</option>
        </select>
        <div id="g-stream-container" class="hidden">
          <select id="g-stream" class="w-full p-3 border rounded-xl">
            <option value="">শাখা নির্বাচন</option>
            <option value="Science">সায়েন্স</option>
            <option value="Humanities">মানবিক</option>
            <option value="Commerce">কমার্স</option>
          </select>
        </div>
        <textarea id="g-desc" class="w-full p-3 border rounded-xl" rows="2" placeholder="বিবরণ (ঐচ্ছিক)"></textarea>
        <select id="g-join" class="w-full p-3 border rounded-xl">
          <option value="public">পাবলিক (যে কেউ)</option>
          <option value="code">কোর্স কোড প্রয়োজন</option>
          <option value="permission">পারমিশন কী প্রয়োজন</option>
        </select>
        <button id="btn-create-group" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">তৈরি করুন</button>
        <button id="btn-cancel-create" class="w-full bg-slate-200 py-3 rounded-xl">বাতিল</button>
      </div>
    </div>`;

  document.getElementById('g-class').addEventListener('change', function() {
    document.getElementById('g-stream-container').classList.toggle('hidden', this.value !== 'Admission');
  });
  document.getElementById('btn-create-group').addEventListener('click', createNewGroup);
  document.getElementById('btn-cancel-create').addEventListener('click', () => renderGroups(container));
}

async function createNewGroup() {
  const name = document.getElementById('g-name').value.trim();
  const classLevel = document.getElementById('g-class').value;
  const stream = document.getElementById('g-stream')?.value || null;
  const desc = document.getElementById('g-desc').value.trim();
  const joinMethod = document.getElementById('g-join').value;

  if (!name || !classLevel) return alert('নাম ও ক্লাস আবশ্যক');
  try {
    await GroupsData.createGroup({ name, classLevel, admissionStream: stream, description: desc, joinMethod });
    alert('কোর্স তৈরি হয়েছে');
    const container = document.getElementById('teacher-page-content');
    if (container) renderGroups(container);
  } catch (e) {
    alert('ত্রুটি: ' + e.message);
  }
}

// গ্লোবাল এক্সপোজ
window.viewGroupStudents = async (groupId) => {
  const container = document.getElementById('teacher-page-content');
  if (!container) return;
  selectedGroupId = groupId;
  const students = await GroupsData.fetchGroupStudents(groupId);
  const requests = await GroupsData.fetchJoinRequests(groupId);

  container.innerHTML = `
    <div class="pb-6">
      <button onclick="renderGroups(document.getElementById('teacher-page-content'))" class="mb-4 text-sm font-bold"><i class="fas fa-arrow-left"></i> ফিরুন</button>
      <h3 class="text-xl font-bold mb-4">শিক্ষার্থী তালিকা</h3>
      <h4 class="font-bold mt-4">সক্রিয় (${students.length})</h4>
      <div class="space-y-2">
        ${students.map(s => `
          <div class="flex justify-between items-center p-2 bg-white rounded border">
            <div>
              <strong>${escapeHtml(s.name || s.fullName || 'নাম নেই')}</strong>
              <span class="text-xs ml-2">${escapeHtml(s.phone || '')}</span>
            </div>
            <button onclick="window.removeStudent('${s.id}', '${groupId}')" class="text-red-600 text-sm">সরান</button>
          </div>`).join('') || '<p class="text-slate-400">কোনো শিক্ষার্থী নেই</p>'}
      </div>
      <h4 class="font-bold mt-6">অপেক্ষমান অনুরোধ (${requests.length})</h4>
      <div class="space-y-2">
        ${requests.map(r => `
          <div class="flex justify-between items-center p-2 bg-amber-50 rounded border">
            <span>${escapeHtml(r.studentName || r.studentEmail)}</span>
            <button onclick="window.approveRequest('${r.id}', '${r.studentId}', '${groupId}')" class="text-green-600 text-sm">অনুমোদন</button>
          </div>`).join('') || '<p class="text-slate-400">কোনো অনুরোধ নেই</p>'}
      </div>
    </div>`;
};

window.removeStudent = async (studentId, groupId) => {
  if (confirm('সরাতে চান?')) {
    await GroupsData.removeStudentFromGroup(studentId, groupId);
    window.viewGroupStudents(groupId);
  }
};

window.approveRequest = async (requestId, studentId, groupId) => {
  await GroupsData.approveJoinRequest(requestId, studentId, groupId);
  window.viewGroupStudents(groupId);
};

window.editGroupInfo = (groupId) => {
  // সরলীকৃত: শুধু নাম আপডেট
  const newName = prompt('নতুন নাম:');
  if (newName) {
    GroupsData.updateGroup(groupId, { name: newName }).then(() => {
      const container = document.getElementById('teacher-page-content');
      if (container) renderGroups(container);
    });
  }
};

window.archiveGroup = async (groupId) => {
  if (confirm('আর্কাইভে সরাবেন?')) {
    await GroupsData.setGroupArchiveStatus(groupId, true);
    const container = document.getElementById('teacher-page-content');
    if (container) renderGroups(container);
  }
};
