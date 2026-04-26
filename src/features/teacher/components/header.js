// src/features/teacher/components/header.js
// টিচার হেডার — সাইডবার + টপ বার + গ্রুপ সুইচার

import { getState } from '../../../core/state/store.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';

export function renderTeacherHeader() {
    const teacher = getState('currentUser') || {};
    const selectedGroup = getState('selectedGroup');
    const groupName = selectedGroup?.name || 'Select Course';
    const groups = getState('teacherGroups') || [];

    const groupOptions = groups.map(g =>
        `<option value="${escapeHtml(g.id)}" ${selectedGroup?.id === g.id ? 'selected' : ''}>${escapeHtml(g.name)}</option>`
    ).join('');

    return `
<!-- সাইডবার -->
<aside class="sidebar" id="main-sidebar">
    <div class="sidebar-logo">
        <div class="sidebar-logo-icon"><i class="fas fa-chalkboard-teacher"></i></div>
        <span class="sidebar-logo-text">Quick<span style="color:#10b981">Z</span></span>
    </div>
    
    <div class="sidebar-group-section">
        <div class="sidebar-group-label">Active Course</div>
        <div class="group-switcher">
            <select id="teacher-group-select" class="w-full p-2 rounded border" onchange="EventBus.emit('teacher:switchGroup', this.value, this.options[this.selectedIndex].text)">
                ${groupOptions || '<option disabled>No courses</option>'}
            </select>
        </div>
    </div>
    
    <nav class="sidebar-nav">
        <div class="sidebar-nav-item" onclick="EventBus.emit('navigate', 'home')"><i class="fas fa-home"></i> Home</div>
        <div class="sidebar-nav-item" onclick="EventBus.emit('navigate', 'create')"><i class="fas fa-plus-circle"></i> Create Exam</div>
        <div class="sidebar-nav-item" onclick="EventBus.emit('navigate', 'rank')"><i class="fas fa-trophy"></i> Rankings</div>
        <div class="sidebar-nav-item" onclick="EventBus.emit('navigate', 'folders')"><i class="fas fa-book-open"></i> Library</div>
        <div class="sidebar-nav-item" onclick="EventBus.emit('navigate', 'management')"><i class="fas fa-tasks"></i> Management</div>
    </nav>
    
    <div class="sidebar-bottom">
        <div class="sidebar-nav-item" onclick="window.toggleDarkMode?.()"><i class="fas fa-moon"></i> Dark Mode</div>
        <div class="sidebar-nav-item" onclick="AuthService.logout()"><i class="fas fa-power-off"></i> Logout</div>
    </div>
</aside>

<!-- টপ বার -->
<div class="top-bar" id="teacher-header">
    <div class="flex items-center gap-3">
        <button class="mobile-menu-btn" onclick="document.getElementById('main-sidebar').classList.toggle('mobile-open')">
            <i class="fas fa-bars"></i>
        </button>
        <span class="top-bar-title">Teacher <span style="color:#4f46e5">Panel</span></span>
    </div>
</div>

<!-- মোবাইল ওভারলে -->
<div id="mobile-overlay" class="mobile-overlay" onclick="document.getElementById('main-sidebar').classList.remove('mobile-open')"></div>
`;
}
