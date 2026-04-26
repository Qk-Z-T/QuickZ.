// src/shared/components/toast.js
// টোস্ট নোটিফিকেশন কম্পোনেন্ট (অস্থায়ী বার্তা)

/**
 * টোস্ট দেখানো
 * @param {string} message - বার্তা
 * @param {'success'|'error'|'warning'|'info'} [type='info'] - ধরন
 * @param {number} [duration=3000] - মিলিসেকেন্ডে স্থায়িত্ব
 */
export function showToast(message, type = 'info', duration = 3000) {
  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-amber-600',
    info: 'bg-indigo-600'
  };
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-sm shadow-lg z-50 flex items-center text-white ${bgColors[type]}`;
  toast.innerHTML = `<i class="fas ${icons[type]} mr-2"></i>${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

window.showToast = showToast;
