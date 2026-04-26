// src/core/utils/math-helper.js
// ম্যাথ রেন্ডারিং ও MathJax লোডার (XSS নিরাপদ)

import { sanitizeText } from './sanitize.js';

/**
 * MathJax লাইব্রেরি লোড ও টাইপসেট
 */
export function loadMathJax(callback, targetElement) {
    setTimeout(() => {
        if (window.MathJax?.typesetPromise) {
            if (window.MathJax.typesetClear) window.MathJax.typesetClear();
            MathJax.typesetPromise(targetElement ? [targetElement] : undefined)
                .then(() => callback?.())
                .catch(err => console.warn('MathJax error:', err));
            return;
        }
        if (!document.getElementById('mathjax-script')) {
            const script = document.createElement('script');
            script.id = 'mathjax-script';
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
            script.async = true;
            script.onload = () => {
                MathJax.typesetPromise(targetElement ? [targetElement] : undefined)
                    .then(() => callback?.())
                    .catch(err => console.warn('MathJax error:', err));
            };
            document.head.appendChild(script);
        }
    }, 50);
}

/**
 * স্টার রেটিং HTML
 */
export function starRating(percentage) {
    const full = Math.floor(percentage / 20);
    const half = (percentage % 20) >= 10 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '';
    for (let i = 0; i < full; i++) html += '<i class="fas fa-star text-yellow-400"></i>';
    if (half) html += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
    for (let i = 0; i < empty; i++) html += '<i class="far fa-star text-yellow-400"></i>';
    return `<span class="star-rating">${html}</span>`;
}

/**
 * পরীক্ষার কন্টেন্ট রেন্ডার (XSS সুরক্ষিত)
 * @param {string} text
 * @returns {string}
 */
export function renderExamContent(text) {
    if (!text) return '';
    // স্যানিটাইজ
    text = sanitizeText(text);
    text = text
        .replace(/\\propotional/g, '\\propto')
        .replace(/\\degree/g, '^{\\circ}');

    const hasMathDelimiters = /\$|\\[\(\)\[\]]/.test(text);
    const hasMathSymbols = /[_^\\]/.test(text);
    // বেঙ্গলি চেক
    const hasBengali = /[\u0980-\u09FF]/.test(text);

    if (hasMathDelimiters) return `<span class="bengali-text">${text}</span>`;
    if (!hasBengali && hasMathSymbols) return `<span class="bengali-text">\\(${text}\\)</span>`;
    if (hasBengali && hasMathSymbols) {
        let autoFixed = text.replace(/([A-Za-z0-9]*[_^\\][A-Za-z0-9{}\\\-+=.]+)/g, '$$$1$$');
        return `<span class="bengali-text">${autoFixed}</span>`;
    }
    return `<span class="bengali-text">${text}</span>`;
}

/**
 * অপশন লিস্ট প্রসেস
 */
export function processOptions(options) {
    return options.map((opt, i) =>
        `<div class="option-math flex items-start gap-2">
            <span class="font-bold">${String.fromCharCode(65 + i)}.</span>
            <div class="flex-1">${renderExamContent(opt)}</div>
        </div>`
    );
}

/**
 * টেক্সটএরিয়া অটো-রিসাইজ
 */
export function autoResizeTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// গ্লোবাল এক্সপোজ
window.MathHelper = {
    starRating, renderExamContent, processOptions,
    loadMathJax, autoResizeTextarea
};
