// ==UserScript==
// @name         YouTube Chat Optimizer v1.5
// @version      1.5
// @description  Surgical removal of high-overhead elements with optional identity preservation.
// @author       Castor
// @match        https://www.youtube.com/live_chat*
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION ---
    const KEEP_AVATARS = false; // Set to true if you need to identify users by icons
    // ---------------------

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Ensure it's an element

                    // 1. Surgical Culling of Badges (Always removed)
                    node.querySelectorAll('yt-live-chat-author-badge-renderer').forEach(el => el.remove());

                    // 2. Reaction Overlay Neutralization (Always removed)
                    node.querySelectorAll('#reaction-control-panel-overlay').forEach(el => el.remove());

                    // 3. Conditional Avatar Removal
                    if (!KEEP_AVATARS) {
                        node.querySelectorAll('#author-photo, .yt-img-shadow').forEach(el => el.remove());
                    }
                }
            });
        });
    });

    // Target the chat container specifically
    const chatContainer = document.querySelector('yt-live-chat-item-list-renderer #items');
    if (chatContainer) {
        observer.observe(chatContainer, { childList: true, subtree: true });
    }
})();