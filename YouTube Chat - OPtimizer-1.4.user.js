// ==UserScript==
// @name         YouTube Chat - OPtimizer
// @namespace    UserScript
// @version      1.4
// @description  Combined Performance Tweaks & Ctrl+Shift-Click Channel Opener.
// @author       Castor
// @match        https://www.youtube.com/live_chat*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 1. CSS INJECTION (Performance & Cleanup)
    const style = document.createElement('style');
    style.textContent = `
        /* Hide Avatars & Badges to save CPU/Network */
        #author-photo, .yt-img-shadow, #chat-badges { display: none !important; }

        /* Visual cue for clickable names */
        #author-name.yt-live-chat-author-chip { cursor: copy !important; }
        #author-name.yt-live-chat-author-chip:hover { text-decoration: underline; color: #3ea6ff !important; }

        /* GPU Acceleration for smooth scrolling */
        #items.yt-live-chat-item-list-renderer { transform: translateZ(0); contain: content; }
    `;
    document.head.append(style);


// MEMORY PURGE (Keeps the DOM light)
const MAX_MESSAGES = 500; // Adjust to 2000 if you really want to push it

const purgeOldMessages = () => {
    const chatItems = document.querySelectorAll('yt-live-chat-text-message-renderer');
    if (chatItems.length > MAX_MESSAGES) {
        // Remove the oldest 50 messages in one go to reduce layout shifts
        for (let i = 0; i < 50; i++) {
            chatItems[i].remove();
        }
    }
};

// Run the purge every 10 seconds
setInterval(purgeOldMessages, 10000);


    // 2. LOGIC (Ctrl+Shift+Click Opener)
    document.addEventListener('click', (e) => {
        if (e.ctrlKey && e.shiftKey) {
            const nameElement = e.target.closest('#author-name');
            if (nameElement) {
                const renderer = nameElement.closest('yt-live-chat-text-message-renderer');
                const channelId = renderer?.__data?.data?.authorExternalChannelId ||
                                renderer?.data?.authorExternalChannelId;

                if (channelId) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    window.open(`https://www.youtube.com/channel/${channelId}`, '_blank');
                }
            }
        }
    }, true);
})();