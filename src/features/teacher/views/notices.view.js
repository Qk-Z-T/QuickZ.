// src/features/teacher/views/notices.view.js
// শিক্ষক নোটিশ ও পোল ম্যানেজমেন্ট

import { NoticesData } from '../../notices/notices-data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';

export async function renderNotices(container) {
    container.innerHTML = `
    <div class="pb-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold">নোটিশ ও পোল</h2>
            <button id="btn-new-notice" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">নতুন তৈরি</button>
        </div>
        <div id="notices-content">
            <div class="text-center p-10"><div class="loader mx-auto"></div></div>
        </div>
    </div>`;

    document.getElementById('btn-new-notice').addEventListener('click', () => showCreateForm(container));
    await loadNoticesList();
}

async function loadNoticesList() {
    const notices = await NoticesData.fetchNotices();
    const content = document.getElementById('notices-content');
    if (!notices.length) {
        content.innerHTML = '<div class="text-center p-10 text-slate-400">কোনো নোটিশ বা পোল নেই</div>';
        return;
    }
    let html = '';
    notices.forEach(n => {
        const isPoll = n.type === 'poll';
        html += `
        <div class="bg-white dark:bg-dark-secondary p-4 rounded-xl border mb-3">
            <div class="flex justify-between items-start">
                <div>
                    <span class="text-xs font-bold px-2 py-1 rounded ${isPoll ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                        ${isPoll ? '📊 পোল' : '📢 নোটিশ'}
                    </span>
                    <h3 class="font-bold mt-2">${escapeHtml(n.title)}</h3>
                    ${!isPoll ? `<p class="text-sm mt-1">${escapeHtml(n.content || '')}</p>` : ''}
                </div>
                <button class="text-red-500" onclick="window.deleteNotice('${n.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;
    });
    content.innerHTML = html;
}

function showCreateForm(container) {
    container.innerHTML = `
    <div class="pb-6 max-w-2xl">
        <button id="btn-back-notices" class="mb-4 text-sm font-bold"><i class="fas fa-arrow-left"></i> ফিরুন</button>
        <h3 class="text-xl font-bold mb-4">নতুন নোটিশ / পোল</h3>
        <div class="bg-white dark:bg-dark-secondary p-5 rounded-2xl shadow-sm border">
            <select id="notice-type" class="w-full p-3 border rounded-xl mb-4">
                <option value="notice">সাধারণ নোটিশ</option>
                <option value="poll">পোল</option>
            </select>
            <input id="notice-title" class="w-full p-3 border rounded-xl mb-4" placeholder="শিরোনাম">
            <div id="notice-content-field">
                <textarea id="notice-content" class="w-full p-3 border rounded-xl" rows="3" placeholder="বিস্তারিত"></textarea>
            </div>
            <div id="poll-options-container" class="hidden mb-4">
                <label class="text-sm font-bold mb-2 block">পোল অপশন</label>
                <div id="poll-options-list">
                    <div class="flex gap-2 mb-2"><input class="poll-opt flex-1 p-2 border rounded" placeholder="অপশন ১"><button class="px-3 bg-slate-200 rounded add-opt-btn">+</button></div>
                </div>
            </div>
            <button id="btn-save-notice" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">প্রকাশ করুন</button>
        </div>
    </div>`;

    document.getElementById('btn-back-notices').addEventListener('click', () => renderNotices(container));
    document.getElementById('notice-type').addEventListener('change', function() {
        const isPoll = this.value === 'poll';
        document.getElementById('notice-content-field').classList.toggle('hidden', isPoll);
        document.getElementById('poll-options-container').classList.toggle('hidden', !isPoll);
    });

    document.querySelector('.add-opt-btn').addEventListener('click', () => {
        const list = document.getElementById('poll-options-list');
        const div = document.createElement('div');
        div.className = 'flex gap-2 mb-2';
        div.innerHTML = '<input class="poll-opt flex-1 p-2 border rounded" placeholder="অপশন"><button class="px-3 bg-red-100 text-red-600 rounded remove-opt-btn">×</button>';
        list.appendChild(div);
        div.querySelector('.remove-opt-btn').addEventListener('click', () => div.remove());
    });

    document.getElementById('btn-save-notice').addEventListener('click', async () => {
        const type = document.getElementById('notice-type').value;
        const title = document.getElementById('notice-title').value.trim();
        if (!title) return alert('শিরোনাম আবশ্যক');
        const content = type === 'notice' ? document.getElementById('notice-content').value.trim() : '';
        const options = [];
        if (type === 'poll') {
            document.querySelectorAll('.poll-opt').forEach(inp => {
                const val = inp.value.trim();
                if (val) options.push(val);
            });
            if (options.length < 2) return alert('কমপক্ষে দুটি অপশন দিন');
        }
        await NoticesData.createNotice({ title, content, type, options });
        alert('প্রকাশিত');
        renderNotices(container);
    });
}

window.deleteNotice = async (id) => {
    if (confirm('মুছবেন?')) {
        await NoticesData.deleteNotice(id);
        const container = document.getElementById('teacher-page-content');
        if (container) renderNotices(container);
    }
};
