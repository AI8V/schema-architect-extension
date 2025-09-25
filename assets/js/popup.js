document.addEventListener('DOMContentLoaded', function () {
    const inspectBtn = document.getElementById('inspectBtn');

    inspectBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['assets/js/content-script.js']
            });
            // Close the popup immediately after injecting the script
            window.close();
        });
    });

    // --- NEW: Listen for messages from the content script ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'selector-copied') {
            // This part is for future use, e.g., showing a success notification
            // For now, we just log it. The main action (copying) is done.
            console.log('Popup received copied selector:', message.selector);
        }
    });
});