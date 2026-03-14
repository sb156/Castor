// ==UserScript==
// @name         YouTube Video Time Navigator - Final v3.4
// @namespace    http://tampermonkey.net/
// @version      3.4
// @description  Hotkey Grid: 4,5,6 | 1,2,3 | 0,.,[Speed] with Tooltips
// @author       Castor
// @match        *://*.youtube.com/watch*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    let originalSpeed = 1;

    function updateSpeedDisplay() {
        const video = document.querySelector('video');
        const speedBtn = document.getElementById('nav-speed-val');
        if (video && speedBtn) {
            speedBtn.innerText = `[${video.playbackRate}x]`;
        }
    }

    function injectAuditBar() {
        if (document.getElementById('audit-nav-panel')) {
            updateSpeedDisplay();
            return;
        }

        const video = document.querySelector('video');
        if (!video) return;

        const div = document.createElement('div');
        div.id = 'audit-nav-panel';
        div.style = "position:fixed; top:200px; right:30px; z-index:2147483647; background:rgba(10, 10, 10, 0.95); color:#00ff00; padding:8px; border:1px solid #00ff00; font-family:monospace; width:135px; pointer-events: auto; cursor: grab; text-align:center;";

        const seek = (type, value) => {
            const v = document.querySelector('video');
            if (!v) return;

            switch(type) {
                case 'SET': v.currentTime = value; break;
                case 'PERC': v.currentTime = v.duration * value; break;
                case 'ADD': v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + value)); break;
                case 'SPEED':
                    if (v.playbackRate !== 1.5) {
                        originalSpeed = v.playbackRate;
                        v.playbackRate = 1.5;
                    } else {
                        v.playbackRate = (originalSpeed === 1.5) ? 1 : originalSpeed;
                    }
                    updateSpeedDisplay();
                    break;
            }
        };

        window.addEventListener('keydown', (e) => {
            if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
            const code = e.code;
            let handled = true;

            switch(code) {
                case 'Numpad4': seek('ADD', -120); break;
                case 'Numpad5': seek('SPEED'); break;
                case 'Numpad6': seek('ADD', 120); break;
                case 'Numpad1': seek('PERC', 0.25); break;
                case 'Numpad2': seek('PERC', 0.50); break;
                case 'Numpad3': seek('PERC', 0.75); break;
                case 'Numpad0': seek('SET', 0); break;
                case 'NumpadDecimal': seek('SET', Math.max(0, video.duration - 10)); break;
                default: handled = false;
            }

            if (handled) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }, true);

        const grid = document.createElement('div');
        grid.style = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 5px;";

        const btnStyle = "background:#000; color:#00ff00; border:1px solid #444; cursor:pointer; padding:8px 0; font-size:12px; font-family:monospace; font-weight:bold;";

        const addBtn = (label, type, val, desc, id = null) => {
            const b = document.createElement('button');
            b.style = btnStyle;
            if (id) b.id = id;
            b.innerText = `[${label}]`;
            b.title = desc;
            b.onclick = () => seek(type, val);
            grid.appendChild(b);
            return b;
        };

        // Row 1: Nav & Speed
        addBtn("4", 'ADD', -120, "Rewind 2 Minutes");
        addBtn("5", 'SPEED', null, "Toggle 1.5x Speed");
        addBtn("6", 'ADD', 120, "Forward 2 Minutes");

        // Row 2: Percentages
        addBtn("1", 'PERC', 0.25, "Jump to 25%");
        addBtn("2", 'PERC', 0.50, "Jump to 50%");
        addBtn("3", 'PERC', 0.75, "Jump to 75%");

        // Row 3: Markers & Status
        addBtn("0", 'SET', 0, "Restart Video");
        const decBtn = addBtn(".", 'SET', -1, "Jump to End - 10s");
        decBtn.onclick = () => seek('SET', Math.max(0, video.duration - 10));

        // Speed Cell (9th cell)
        addBtn(video.playbackRate + "x", 'SPEED', null, "Current Speed / Toggle", 'nav-speed-val');

        div.appendChild(grid);
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