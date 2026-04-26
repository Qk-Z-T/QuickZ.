// src/shared/components/modal.js
// কাস্টম মোডাল কম্পোনেন্ট (SweetAlert2 ছাড়া plain modal)

/**
 * মোডাল তৈরি ও দেখানো
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.bodyHTML
 * @param {Array<{text:string, class:string, callback:Function}>} [options.buttons]
 * @returns {HTMLElement} মোডাল এলিমেন্ট
 */
export function showModal({ title, bodyHTML, buttons = [] }) {
  // ওভারলে
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
  overlay.id = 'custom-modal-overlay';

  // মোডাল বক্স
  const modal = document.createElement('div');
  modal.className = 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 relative';
  modal.innerHTML = `
    <h3 class="text-xl font-bold mb-4">${title}</h3>
    <div class="mb-6">${bodyHTML}</div>
    <div class="flex justify-end gap-3" id="modal-buttons"></div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // বাটন রেন্ডার
  const btnContainer = modal.querySelector('#modal-buttons');
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.className = `px-4 py-2 rounded-lg font-bold text-sm ${btn.class || 'bg-slate-200'}`;
    button.textContent = btn.text;
    button.addEventListener('click', () => {
      closeModal();
      if (btn.callback) btn.callback();
    });
    btnContainer.appendChild(button);
  });

  // ওভারলে ক্লিক করলে বন্ধ
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  return overlay;
}

/**
 * মোডাল বন্ধ
 */
export function closeModal() {
  const overlay = document.getElementById('custom-modal-overlay');
  if (overlay) overlay.remove();
}

window.showModal = showModal;
window.closeModal = closeModal;
