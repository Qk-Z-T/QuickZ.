// shared/utils/math-helper.js
// ম্যাথ কন্টেন্ট রেন্ডারিং ও MathJax লোডার (স্টুডেন্ট + টিচার উভয়ের জন্য)

/**
 * MathJax লাইব্রেরি ডায়নামিক্যালি লোড করে এবং রেন্ডারিং করে
 * @param {Function} [callback]
 * @param {HTMLElement} [targetElement]
 */
function loadMathJax(callback, targetElement) {
    setTimeout(() => {
        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            if (window.MathJax.typesetClear) {
                window.MathJax.typesetClear();
            }
            MathJax.typesetPromise(targetElement ? [targetElement] : undefined)
                .then(() => { if (callback) callback(); })
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
                    .then(() => { if (callback) callback(); })
                    .catch(err => console.warn('MathJax error:', err));
            };
            document.head.appendChild(script);
        }
    }, 50);
}

/**
 * স্টার রেটিং HTML জেনারেট করে
 * @param {number} percentage 
 * @returns {string} HTML স্ট্রিং
 */
function starRating(percentage) {
    const fullStars = Math.floor(percentage / 20);
    const remainder = percentage % 20;
    const halfStar = remainder >= 10 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star text-yellow-400"></i>';
    if (halfStar) starsHTML += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
    for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="far fa-star text-yellow-400"></i>';

    return `<div class="flex items-center gap-1 text-sm star-rating">${starsHTML}</div>`;
}

/**
 * ম্যাথ কন্টেন্ট প্রি-প্রসেস ও রেন্ডারিংয়ের জন্য প্রস্তুত করে
 * @param {string} text 
 * @returns {string} HTML স্ট্রিং
 */
function renderExamContent(text) {
    if (!text) return '';

    text = String(text)
        .replace(/\\propotional/g, '\\propto')
        .replace(/\\div/g, '\\div')
        .replace(/\\times/g, '\\times')
        .replace(/\\approx/g, '\\approx')
        .replace(/\\degree/g, '^{\\circ}');

    const hasBengali = /[\u0980-\u09FF]/.test(text);
    const hasMathDelimiters = text.includes('$') || text.includes('\\(') || text.includes('\\[');
    const hasMathSymbols = /[_^\\]/.test(text);

    if (hasMathDelimiters) {
        return `<span class="bengali-text">${text}</span>`;
    }
    if (!hasBengali && hasMathSymbols) {
        return `<span class="bengali-text">\\(${text}\\)</span>`;
    }
    if (hasBengali && hasMathSymbols) {
        let autoFixedText = text.replace(/([A-Za-z0-9]*[_^\\][A-Za-z0-9{}\\\-+=.]+)/g, '$$$1$$');
        return `<span class="bengali-text">${autoFixedText}</span>`;
    }
    return `<span class="bengali-text">${text}</span>`;
}

/**
 * অপশন লিস্ট প্রসেস করে HTML জেনারেট করে
 * @param {string[]} options 
 * @returns {string} HTML স্ট্রিং
 */
function processOptions(options) {
    return options.map((opt, index) => {
        return `<div class="option-math flex items-start gap-2">
            <span class="font-bold">${String.fromCharCode(65 + index)}.</span>
            <div class="flex-1">${renderExamContent(opt)}</div>
        </div>`;
    });
}

/**
 * টেক্সটএরিয়ার অটো রিসাইজ ফাংশন
 * @param {HTMLTextAreaElement} textarea 
 */
function autoResizeTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

// গ্লোবাল এক্সপোজ
window.MathHelper = {
    renderExamContent,
    processOptions,
    starRating,
    loadMathJax,
    autoResizeTextarea
};

export { renderExamContent, processOptions, starRating, loadMathJax, autoResizeTextarea };
