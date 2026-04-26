// src/features/student/index.js
// স্টুডেন্ট মডিউল এন্ট্রি পয়েন্ট — পাবলিক API

import { EventBus } from '../../core/state/event-bus.js';
import { getState } from '../../core/state/store.js';
import { StudentData } from './student.data.js';
import { StudentUI } from './student.ui.js';
import { registerStudentEvents, unregisterStudentEvents } from './student.events.js';

let isMounted = false;

/**
 * স্টুডেন্ট মডিউল মাউন্ট করা (অ্যাপ শেল তৈরি, ইভেন্ট রেজিস্টার)
 */
function mountStudentModule() {
    if (isMounted) return;
    isMounted = true;

    // UI কন্টেইনার তৈরি (হেডার + মেইন কন্টেন্ট)
    StudentUI.renderShell();

    // ইভেন্ট রেজিস্টার
    registerStudentEvents();

    // পেজ চেঞ্জ লিসেন
    EventBus.on('page:loading', (page) => {
        if (getState('role') === 'student') {
            StudentUI.loadPage(page);
        }
    });

    // প্রথম পেজ লোড
    const startPage = getState('profileCompleted') ? 'dashboard' : 'profile';
    StudentUI.loadPage(startPage);
}

/**
 * স্টুডেন্ট মডিউল ডিস্ট্রয় (লগআউটে)
 */
function destroyStudentModule() {
    if (!isMounted) return;
    isMounted = false;
    unregisterStudentEvents();
    StudentUI.teardownShell();
}

export const StudentModule = {
    mount: mountStudentModule,
    destroy: destroyStudentModule,
};

window.StudentModule = StudentModule;
