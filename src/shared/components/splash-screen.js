export function renderSplashScreen() {
    const div = document.createElement('div');
    div.id = 'splash-screen';
    div.className = 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white';
    div.innerHTML = `
        <div class="text-4xl font-bold" style="font-family:'Outfit',sans-serif;">
            <span>Quick</span><span class="text-emerald-500">Z</span>
        </div>
        <div class="text-sm text-slate-500 mt-2">The ultimate exam platform</div>
        <div class="mt-6">
            <div class="loader" style="width:32px;height:32px;border-width:3px;"></div>
        </div>
    `;
    document.body.prepend(div);
}

export function hideSplashScreen() {
    const el = document.getElementById('splash-screen');
    if (el) {
        el.classList.add('splash-hidden');
        setTimeout(() => el.remove(), 300);
    }
}
