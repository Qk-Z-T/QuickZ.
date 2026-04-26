// src/features/student/views/profile.view.js

import { getState } from '../../../core/state/store.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';

export function renderProfile(container) {
    const profile = getState('currentUser') || {};
    container.innerHTML = `
    <div class="p-5 max-w-md mx-auto">
        <h2 class="text-2xl font-bold mb-4">Profile</h2>
        <div class="bg-white p-6 rounded-2xl shadow-sm border">
            <div class="mb-2"><strong>Name:</strong> ${escapeHtml(profile.name || 'Not set')}</div>
            <div class="mb-2"><strong>Email:</strong> ${escapeHtml(profile.email || '')}</div>
            <div class="mb-2"><strong>Phone:</strong> ${escapeHtml(profile.phone || '')}</div>
        </div>
    </div>`;
}
