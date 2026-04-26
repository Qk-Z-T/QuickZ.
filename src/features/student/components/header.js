// src/features/student/components/header.js
// স্টুডেন্ট হেডার — ডেস্কটপ সাইডবার + মোবাইল ড্রয়ার

import { getState } from '../../../core/state/store.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';

export function renderStudentHeader() {
    const profile = getState('currentUser') || {};
    const initial = (profile.name || 'U').charAt(0).toUpperCase();

    let courseName = 'Select Course';
    const groups = getState('joinedGroups') || [];
    const activeGroupId = getState('activeGroupId');
    if (activeGroupId && groups.length) {
        const active = groups.find(g => g.groupId === activeGroupId);
        if (active) courseName = active.groupName || 'Unknown';
    }

    return `
<!-- ডেস্কটপ সাইডবার -->
<aside class="desktop-sidebar hidden md:!flex flex-col bg-white border-r fixed left-0 top-0 h-screen w-[250px] z-50 shadow-sm">
    <div class="p-6 flex items-center border-b border-slate-100">
        <div class="flex-1">
            <div class="text-xl font-bold"><span>Quick</span><span class="text-emerald-500">Z</span></div>
            <div class="text-[10px] text-slate-500">Student Portal</div>
        </div>
        <button onclick="window.StudentModule?.eventBus?.emit?.('navigate','profile')" class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-md">
            ${escapeHtml(initial)}
        </button>
    </div>
    <div class="flex-1 overflow-y-auto py-6 px-4 space-y-2" id="sidebar-nav">
        ${renderNavItems()}
    </div>
</aside>

<!-- মোবাইল হেডার -->
<header class="md:!hidden sticky top-0 z-40 px-5 py-3 ...">
    <div>QuickZ</div>
    <button onclick="window.toggleMobileDrawer?.()">☰</button>
</header>

<!-- মোবাইল ড্রয়ার (সরলীকৃত) -->
<div id="mobileDrawer" class="mobile-drawer ...">
    ${renderNavItems()}
</div>

<!-- ডেস্কটপ টপ বার -->
<div class="hidden md:!block fixed top-0 left-[250px] right-0 z-40 px-6 py-2 border-b">
    <span>Current: ${escapeHtml(courseName)}</span>
</div>
`;
}

function renderNavItems() {
    const pages = [
        { id: 'dashboard', icon: 'fa-home', label: 'হোম' },
        { id: 'courses', icon: 'fa-book-open', label: 'কোর্সসমূহ' },
        { id: 'rank', icon: 'fa-trophy', label: 'র‌্যাংক' },
        { id: 'results', icon: 'fa-clipboard-list', label: 'ফলাফল' },
        { id: 'analysis', icon: 'fa-chart-pie', label: 'অগ্রগতি' },
        { id: 'notices', icon: 'fa-bell', label: 'নোটিস' },
        { id: 'management', icon: 'fa-cogs', label: 'ম্যানেজমেন্ট' },
    ];
    return pages.map(p =>
        `<button onclick="EventBus.emit('navigate', '${p.id}')" class="sidebar-nav-item">
            <i class="fas ${p.icon}"></i> ${escapeHtml(p.label)}
        </button>`
    ).join('');
}
