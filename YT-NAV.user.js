// ==UserScript==
// @name         YouTube Video Time Navigator - Numpad 0,1,2,.
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Hardened Numpad: 0 (Start), 1 (-2m), 2 (+2m), Del (+99m)
// @author       Castor
// @match        *://*.youtube.com/watch*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function injectAuditBar() {
        if (document.getElementById('audit-nav-panel')) return;

        const video = document.querySelector('video');
        if (!video) return;

        const div = document.createElement('div');
        div.id = 'audit-nav-panel';
        div.style = "position:fixed; top:200px; right:30px; z-index:2147483647; background:rgba(10, 10, 10, 0.9); color:#00ff00; padding:12px; border:1px solid #00ff00; font-family:monospace; min-width:105px; pointer-events: auto; cursor: grab;";

        const seek = (seconds) => {
            const v = document.querySelector('video');
            if (!v) return;
            if (seconds === "START") v.currentTime = 0;
            else v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + seconds));
        };

        // Keydown Listener using the Capture Phase (true) to intercept YouTube's own hotkeys
        window.addEventListener('keydown', (e) => {
            if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

            // Using e.code for hardware-level Numpad detection
            switch(e.code) {
                case 'Numpad0':
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    seek("START");
                    break;
                case 'Numpad1':
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    seek(-120);
                    break;
                case 'Numpad2':
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    seek(120);
                    break;
                case 'NumpadDecimal': // This is the "Del" key on the Numpad
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    seek(6000);
                    break;
            }
        }, true);

        // UI Build
        const title = document.createElement('div');
        title.style = "font-weight:bold; margin-bottom:8px; font-size:11px; border-bottom:1px solid #00ff00; padding-bottom:4px;";
        title.innerText = "YT-NAV v2.1";
        div.appendChild(title);

        const btnStyle = "display:block; width:100%; background:#000; color:#00ff00; border:1px solid #333; margin:4px 0; cursor:pointer; padding:5px; text-align:left; font-size:10px; font-family:monospace;";

        const addBtn = (label, action) => {
            const b = document.createElement('button');
            b.style = btnStyle;
            b.innerText = label;
            b.onclick = () => seek(action);
            div.appendChild(b);
        };

        addBtn("[0] Start", "START");
        addBtn("[1] -2m", -120);
        addBtn("[2] +2m", 120);
        addBtn("[.] +99m", 6000);

        document.documentElement.appendChild(div);

        // Drag Logic
        let isDragging = false, offset = { x: 0, y: 0 };
        div.onmousedown = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            offset.x = e.clientX - div.getBoundingClientRect().left;
            offset.y = e.clientY - div.getBoundingClientRect().top;
        };
        document.onmousemove = (e) => {
            if (!isDragging) return;
            div.style.left = (e.clientX - offset.x) + 'px';
            div.style.top = (e.clientY - offset.y) + 'px';
            div.style.right = 'auto';
        };
        document.onmouseup = () => { isDragging = false; };
    }

    setInterval(injectAuditBar, 2000);
})();