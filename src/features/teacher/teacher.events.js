// src/features/teacher/teacher.events.js
// টিচার ইভেন্ট হ্যান্ডলিং

import { EventBus } from '../../core/state/event-bus.js';
import { TeacherData } from './teacher.data.js';
import { TeacherUI } from './teacher.ui.js';

const handlers = {};

export function registerTeacherEvents() {
    handlers.navigate = (page) => {
        import('../../app/router.js').then(({ Router }) => Router.navigateTo(page));
    };
    EventBus.on('navigate', handlers.navigate);

    handlers.switchGroup = async (groupId, groupName) => {
        await TeacherData.switchGroup(groupId, groupName);
        TeacherUI.loadPage('home');
    };
    EventBus.on('teacher:switchGroup', handlers.switchGroup);
}

export function unregisterTeacherEvents() {
    EventBus.off('navigate', handlers.navigate);
    EventBus.off('teacher:switchGroup', handlers.switchGroup);
}
