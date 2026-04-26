// src/core/state/event-bus.js
// কাস্টম ইভেন্ট বাস (Decoupled component communication)

const events = {};

/**
 * ইভেন্ট সাবস্ক্রাইব করা
 * @param {string} event
 * @param {Function} callback
 */
function on(event, callback) {
    if (!events[event]) events[event] = [];
    events[event].push(callback);
}

/**
 * ইভেন্ট আনসাবস্ক্রাইব
 * @param {string} event
 * @param {Function} callback
 */
function off(event, callback) {
    if (!events[event]) return;
    events[event] = events[event].filter(cb => cb !== callback);
}

/**
 * ইভেন্ট এমিট/ট্রিগার করা
 * @param {string} event
 * @param {*} data
 */
function emit(event, data) {
    (events[event] || []).forEach(cb => cb(data));
}

/**
 * একবার মাত্র ইভেন্ট শোনা
 * @param {string} event
 * @param {Function} callback
 */
function once(event, callback) {
    const wrapper = (data) => {
        callback(data);
        off(event, wrapper);
    };
    on(event, wrapper);
}

// গ্লোবাল এক্সপোজ
window.EventBus = { on, off, emit, once };

export { on, off, emit, once };
