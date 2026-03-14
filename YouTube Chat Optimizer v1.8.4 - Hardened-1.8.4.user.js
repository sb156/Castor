// ==UserScript==
// @name         YouTube Chat Optimizer v1.8.4 - Hardened
// @version      1.8.4
// @description  high-contrast timestamps, nukes ad slots, stabilizes reflows.
// @author       Castor
// @match        https://www.youtube.com/live_chat*
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // CONFIGURATION FUNCTIONS
    // ==========================================
    const SHOW_EMOJIS = false;
    const SHOW_AVATARS = true;
    const BLOCK_AD_NET = true;
    const SILENCE_CONSOLE = true;
    const KILL_PLAYER_ADS = true;
    const CONTRAST_TIME = true;
    // ==========================================

    // 1. CONSOLE SILENCER
    if (SILENCE_CONSOLE) {
        const suppress = ['[Violation]', '[Rewards]', 'TrustedScriptURL', 'preloadResponse', 'Timed out waiting'];
        ['log', 'warn', 'info', 'debug'].forEach(method => {
            const original = console[method];
            console[method] = (...args) => {
                if (typeof args[0] === 'string' && suppress.some(s => args[0].includes(s))) return;
                if (original) original.apply(console, args);
            };
        });
    }

    // 2. CSS PURGE & CONTRAST RESTORATION
    let customStyle = `
        /* Nuke the specific Engagement Panel Ad you identified */
        ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"],
        #engagement-panel-ads,

        /* Nuke the specific Ad Slots and In-Feed layouts */
        ytd-ad-slot-renderer,
        ytd-in-feed-ad-layout-renderer,
        ad-badge-view-model,
        .ytwAdImageViewModelHostImageContainer,

        /* General cleanup & Reactions */
        .yt-live-chat-renderer-floating-animations-container,
        .ytp-reaction-animator-container,
        .ytp-reactions-flyout,
        #player-ads, #rewards, .ytd-rewards-renderer,
        #ticker, #reaction-control-panel {
            display: none !important;
            height: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }

        #items.yt-live-chat-item-list-renderer {
            contain: layout paint !important;
        }
    `;

    if (CONTRAST_TIME) {
        customStyle += `
            #timestamp.yt-live-chat-text-message-renderer {
                color: #00ffcc !important; /* Cyber-cyan for readability */
                font-weight: 700 !important;
                font-size: 0.9em !important;
                margin-right: 8px !important;
            }
        `;
    }

    if (!SHOW_AVATARS) customStyle += ` #author-photo.yt-live-chat-text-message-renderer { display: none !important; } `;

    // Apply Styles
    GM_addStyle(customStyle);

    // 3. THE INTERCEPTOR (DOM SCRUBBER)
    const scrubUI = () => {
        // Safe removal using Optional Chaining (?.) to prevent null parsing errors
        document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]')?.remove();
        document.querySelector('.ytp-reaction-animator-container')?.remove();
    };

    const interceptor = new MutationObserver((mutations) => {
        // Run the UI Scrubber on every change
        scrubUI();

        for (let i = 0; i < mutations.length; i++) {
            const added = mutations[i].addedNodes;
            for (let j = 0; j < added.length; j++) {
                const node = added[j];
                if (node.nodeType !== 1) continue;

                const nodeUrl = node.src || "";

                // Targeted Nuke for Ad Slots
                if (KILL_PLAYER_ADS && (
                    node.tagName === 'YTD-AD-SLOT-RENDERER' ||
                    node.tagName === 'YTD-IN-FEED-AD-LAYOUT-RENDERER' ||
                    node.id === 'player-ads' ||
                    node.getAttribute?.('target-id') === 'engagement-panel-ads'
                )) {
                    node.remove();
                    continue;
                }

                // Script & Animation Engine Neutralization
                if (BLOCK_AD_NET && (node.tagName === 'SCRIPT' || node.tagName === 'IMG')) {
                    if (nodeUrl.includes('web-animations-next-lite') ||
                        nodeUrl.includes('lottie_light.js') ||
                        nodeUrl.includes('doubleclick.net') ||
                        nodeUrl.includes('googlesyndication.com') ||
                        nodeUrl.includes('googleadservices.com')) {
                        node.type = 'text/plain';
                        node.remove();
                        continue;
                    }
                }

                // Emoji Neutralization
                if (!SHOW_EMOJIS && node.tagName === 'IMG' && (node.classList.contains('emoji') || nodeUrl.includes('emoji'))) {
                    node.remove();
                }
            }
        }
    });

    interceptor.observe(document.documentElement, { childList: true, subtree: true });

    console.log("v1.8.4: Hardened Ad-slot nuke active.");
})();