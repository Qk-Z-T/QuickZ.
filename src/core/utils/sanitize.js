// src/core/utils/sanitize.js
// XSS প্রতিরোধে এইচটিএমএল এস্কেপিং

const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

/**
 * টেক্সট থেকে বিপজ্জনক HTML ক্যারেক্টার এস্কেপ করে
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=\/]/g, char => entityMap[char] || char);
}

/**
 * ইউজার ইনপুট স্যানিটাইজ (এস্কেপ + প্রয়োজনীয় প্রি-প্রসেসিং)
 * @param {string} text
 * @returns {string}
 */
export function sanitizeText(text) {
    return escapeHtml(text);
}

/**
 * DOM এলিমেন্টে টেক্সট সেট করা (নিরাপদ)
 * @param {HTMLElement} el
 * @param {string} text
 */
export function setTextContent(el, text) {
    if (el) el.textContent = text;
}

// গ্লোবাল
window.Sanitize = { escapeHtml, sanitizeText, setTextContent };
