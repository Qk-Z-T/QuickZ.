// src/features/teacher/index.js
// টিচার মডিউল এন্ট্রি পয়েন্ট — পাবলিক API

import { EventBus } from '../../core/state/event-bus.js';
import { getState } from '../../core/state/store.js';
import { TeacherData } from './teacher.data.js';
import { TeacherUI } from './teacher.ui.js';
import { registerTeacherEvents, unregisterTeacherEvents } from './teacher.events.js';

let isMounted = false;

/**
 * টিচার মডিউল মাউন্ট করা (অ্যাপ শেল তৈরি, ইভেন্ট রেজিস্টার)
 */
function mountTeacherModule() {
    if (isMounted) return;
    isMounted = true;

    // UI কন্টেইনার তৈরি (হেডার + মেইন কন্টেন্ট)
    TeacherUI.renderShell();

    // ইভেন্ট রেজিস্টার
    registerTeacherEvents();

    // পেজ চেঞ্জ লিসেন
    EventBus.on('page:loading', (page) => {
        if (getState('role') === 'teacher') {
            TeacherUI.loadPage(page);
        }
    });

    // প্রথম পেজ লোড
    const startPage = 'home';
    TeacherUI.loadPage(startPage);
}

/**
 * টিচার মডিউল ডিস্ট্রয় (লগআউটে)
 */
function destroyTeacherModule() {
    if (!isMounted) return;
    isMounted = false;
    unregisterTeacherEvents();
    TeacherUI.teardownShell();
}

export const TeacherModule = {
    mount: mountTeacherModule,
    destroy: destroyTeacherModule,
};

window.TeacherModule = TeacherModule;
