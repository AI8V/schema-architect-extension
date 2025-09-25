'use strict';
document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzePageBtn');
    const iframe = document.getElementById('tool-iframe');

    analyzeBtn.addEventListener('click', () => {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span class="ms-1">Analyzing...</span>
        `;
        analyzeBtn.classList.remove('btn-gold');
        analyzeBtn.classList.add('btn-secondary'); // Change color during loading

        const scriptToExecute = `({ url: window.location.href, html: document.documentElement.outerHTML })`;

        chrome.devtools.inspectedWindow.eval(scriptToExecute, (result, isException) => {
            if (isException || !result) {
                console.error("Could not get page data:", isException);
            } else {
                iframe.contentWindow.postMessage({
                    type: 'ANALYZE_HTML',
                    htmlContent: result.html,
                    pageUrl: result.url
                }, 'https://ai8v.github.io');
            }

            setTimeout(() => {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<i class="bi bi-play-fill me-1"></i> Analyze in Tool Below';
                analyzeBtn.classList.remove('btn-secondary');
                analyzeBtn.classList.add('btn-gold');
            }, 1000);
        });
    });
});