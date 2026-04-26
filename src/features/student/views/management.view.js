// src/features/student/views/management.view.js

import { escapeHtml } from '../../../core/utils/sanitize.js';

export function renderManagement(container) {
    container.innerHTML = `
    <div class="p-5 max-w-md mx-auto">
        <h2 class="text-2xl font-bold mb-6">Management</h2>
        <div class="bg-white p-6 rounded-2xl shadow-sm border">
            <button class="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold" onclick="AuthService.logout()">Logout</button>
        </div>
    </div>`;
}
