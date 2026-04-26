// src/features/teacher/views/management.view.js
// ম্যানেজমেন্ট হাব (groups পেজের লিংক সহ)

import { escapeHtml } from '../../../core/utils/sanitize.js';
import { EventBus } from '../../../core/state/event-bus.js';

export function renderManagement(container) {
    container.innerHTML = `
    <div class="pb-6">
        <h2 class="text-2xl font-bold mb-6">Management</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-5 rounded-2xl shadow-sm border cursor-pointer hover:shadow-md" onclick="EventBus.emit('navigate','groups')">
                <i class="fas fa-users text-2xl text-indigo-500 mb-2"></i>
                <h3 class="font-bold">Manage Courses</h3>
                <p class="text-sm text-slate-500">View and edit courses, students</p>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border cursor-pointer hover:shadow-md" onclick="EventBus.emit('navigate','notices')">
                <i class="fas fa-bell text-2xl text-amber-500 mb-2"></i>
                <h3 class="font-bold">Notices & Polls</h3>
                <p class="text-sm text-slate-500">Create notices and polls</p>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border cursor-pointer hover:shadow-md" onclick="EventBus.emit('navigate','archived')">
                <i class="fas fa-archive text-2xl text-rose-500 mb-2"></i>
                <h3 class="font-bold">Archived Courses</h3>
                <p class="text-sm text-slate-500">Restore or delete archived courses</p>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border cursor-pointer hover:shadow-md" onclick="AuthService.logout()">
                <i class="fas fa-sign-out-alt text-2xl text-red-500 mb-2"></i>
                <h3 class="font-bold">Logout</h3>
            </div>
        </div>
    </div>`;
}
