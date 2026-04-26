// src/features/student/views/results.view.js

import { StudentData } from '../student.data.js';
import { escapeHtml } from '../../../core/utils/sanitize.js';

export async function renderResults(container) {
    container.innerHTML = `<div class="p-5 pb-20"><h2 class="text-2xl font-bold mb-4">Results</h2><div id="results-content"><div class="loader"></div></div></div>`;
    const results = await StudentData.loadResults();
    if (!results.length) {
        document.getElementById('results-content').innerHTML = '<p>No results</p>';
        return;
    }
    let html = '';
    results.forEach(r => {
        html += `<div class="bg-white p-3 mb-2 rounded shadow"><strong>${escapeHtml(r.examTitle)}</strong> - ${r.score?.toFixed(2)}</div>`;
    });
    document.getElementById('results-content').innerHTML = html;
}
