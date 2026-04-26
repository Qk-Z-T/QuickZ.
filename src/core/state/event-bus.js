// src/core/state/event-bus.js
// কাস্টম ইভেন্ট বাস (Decoupled component communication)

const events = {};

function on(event, callback) {
    if (!events[event]) events[event] = [];
    events[event].push(callback);
}

function off(event, callback) {
    if (!events[event]) return;
    events[event] = events[event].filter(cb => cb !== callback);
}

function emit(event, data) {
    (events[event] || []).forEach(cb => cb(data));
}

function once(event, callback) {
    const wrapper = (data) => {
        callback(data);
        off(event, wrapper);
    };
    on(event, wrapper);
}

// ✅ নামযুক্ত এক্সপোর্ট
export const EventBus = { on, off, emit, once };

// গ্লোবাল এক্সপোজ (লিগ্যাসি)
window.EventBus = EventBus;
