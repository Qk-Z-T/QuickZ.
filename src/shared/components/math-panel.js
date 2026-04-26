export function renderMathPanel() {
    const panel = document.createElement('div');
    panel.id = 'math-symbols-panel';
    panel.className = 'math-symbols-panel hidden';
    panel.innerHTML = `
        <button class="math-panel-close" onclick="document.getElementById('math-symbols-panel').classList.add('hidden')">×</button>
        <div class="symbol-group">
            <div class="symbol-group-title">Basic</div>
            <div class="symbol-buttons">
                <button class="symbol-btn" onclick="insertSymbol('+')">+</button>
                <button class="symbol-btn" onclick="insertSymbol('\\times')">×</button>
                <button class="symbol-btn" onclick="insertSymbol('\\div')">÷</button>
                <button class="symbol-btn" onclick="insertSymbol('\\sqrt{}')">√</button>
                <button class="symbol-btn" onclick="insertSymbol('^{}')">x²</button>
                <button class="symbol-btn" onclick="insertSymbol('\\frac{}{}')">½</button>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    const btn = document.createElement('button');
    btn.id = 'floating-math-btn';
    btn.className = 'floating-math-btn hidden';
    btn.innerHTML = '<i class="fas fa-square-root-alt"></i>';
    btn.onclick = () => panel.classList.toggle('hidden');
    document.body.appendChild(btn);

    // insertSymbol গ্লোবাল হেল্পার
    window.insertSymbol = (symbol) => {
        const ta = window.currentFocusedTextarea;
        if (!ta) return;
        // কার্সারে সংযোজন
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const text = ta.value;
        ta.value = text.substring(0, start) + symbol + text.substring(end);
        ta.focus();
        ta.selectionStart = ta.selectionEnd = start + symbol.length;
    };
}

export function showMathPanel() {
    document.getElementById('floating-math-btn')?.classList.remove('hidden');
}

export function hideMathPanel() {
    document.getElementById('floating-math-btn')?.classList.add('hidden');
    document.getElementById('math-symbols-panel')?.classList.add('hidden');
}
