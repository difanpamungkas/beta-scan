// ==UserScript==
// @name         Auto Scanner Panel beta 1.0 by Re
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Automated barcode scanning panel for tsiraw website
// @match        https://tsiraw.tsindustri.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function initPanel() {
        if (document.getElementById('autoScanPanelContainer')) return;

        let p = document.createElement('div');
        p.id = 'autoScanPanelContainer';
        p.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:#1e1e1e;color:#fff;padding:15px;z-index:999999;border-radius:10px;width:320px;font-family:sans-serif;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.4);touch-action:none;';
        p.innerHTML = '<div id="dragHeader" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;cursor:move;"><b style="color:#4CAF50;">beta 1.0 by Re</b><div style="display:flex;gap:4px;"><span id="minBtn" style="cursor:pointer;background:#ff9800;color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;">_</span><span id="clsBtn" style="cursor:pointer;background:#f44336;color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;">X</span></div></div><div id="bodyPanel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span>Paste barcode:</span><span id="cnt" style="color:#00bcd4;font-weight:bold;">Total: 0</span></div><textarea id="txt" placeholder="Paste nomor barcode di sini..." style="width:100%;height:110px;background:#222;color:#fff;border:1px solid #555;border-radius:4px;padding:6px;font-family:monospace;font-size:12px;box-sizing:border-box;resize:vertical;"></textarea><div style="display:flex;gap:8px;margin-top:6px;"><button id="clrBtn" style="flex:1;background:#607d8b;color:#fff;border:none;padding:6px;border-radius:4px;font-weight:bold;cursor:pointer;">Clear All</button></div><div style="display:flex;gap:8px;margin-top:6px;margin-bottom:10px;"><button id="onBtn" style="flex:1;background:#4CAF50;color:#fff;border:none;padding:8px;border-radius:4px;font-weight:bold;cursor:pointer;">ON</button><button id="offBtn" style="flex:1;background:#f44336;color:#fff;border:none;padding:8px;border-radius:4px;font-weight:bold;cursor:pointer;">OFF</button></div><div id="stat" style="font-weight:bold;margin-bottom:6px;color:#ffeb3b;">Status: Siap</div><div id="errCnt" style="font-weight:bold;margin-bottom:6px;color:#ff9800;">Total Gagal: 0</div><hr style="border-color:#555;margin-bottom:8px;"><div style="font-weight:bold;margin-bottom:4px;">Daftar Gagal/Ganda:</div><div id="errLst" style="max-height:100px;overflow-y:auto;background:#111;padding:6px;border-radius:4px;font-family:monospace;font-size:11px;color:#ff8a80;"></div></div>';
        document.body.appendChild(p);

        let isDragging = false, startX, startY;
        let header = p.querySelector('#dragHeader');
        header.onmousedown = dragStart; header.ontouchstart = dragStart;
        document.onmousemove = drag; document.ontouchmove = drag;
        document.onmouseup = dragEnd; document.ontouchend = dragEnd;

        function dragStart(e) {
            isDragging = true;
            let clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            let clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            startX = clientX - p.offsetLeft;
            startY = clientY - p.offsetTop;
            p.style.transform = 'none';
        }
        function drag(e) {
            if (!isDragging) return;
            let clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            let clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            p.style.left = (clientX - startX) + 'px';
            p.style.top = (clientY - startY) + 'px';
        }
        function dragEnd() { isDragging = false; }

        let run = false, min = false;
        let body = p.querySelector('#bodyPanel');
        let minBtn = p.querySelector('#minBtn');
        minBtn.onclick = function() {
            min = !min;
            body.style.display = min ? 'none' : 'block';
            p.style.width = min ? '180px' : '320px';
            minBtn.innerText = min ? '+' : '_';
        };

        p.querySelector('#clsBtn').onclick = function() {
            run = false;
            p.remove();
        };

        let txt = p.querySelector('#txt');
        let cnt = p.querySelector('#cnt');
        let errCnt = p.querySelector('#errCnt');
        let errLst = p.querySelector('#errLst');

        txt.oninput = function() {
            let val = txt.value.trim();
            let arr = val ? val.split(/\r?\n/).map(x => x.trim()).filter(x => x.length > 0) : [];
            cnt.innerText = 'Total: ' + arr.length;
        };

        p.querySelector('#clrBtn').onclick = function() {
            txt.value = '';
            cnt.innerText = 'Total: 0';
            errLst.innerHTML = '';
            errCnt.innerText = 'Total Gagal: 0';
        };

        p.querySelector('#offBtn').onclick = function() {
            if (run) {
                run = false;
                p.querySelector('#stat').innerText = 'Status: Dihentikan (OFF)';
                p.querySelector('#stat').style.color = '#f44336';
            }
        };

        p.querySelector('#onBtn').onclick = async function() {
            if (run) return;
            let val = txt.value.trim();
            if (!val) return alert('Kotak teks masih kosong!');
            let list = val.split(/\r?\n/).map(x => x.trim()).filter(x => x.length > 0);
            if (list.length === 0) return alert('Tidak ada barcode valid!');

            let inputEl = document.querySelector('input[placeholder*="barcode" i]') || Array.from(document.querySelectorAll('input')).find(el => el.type !== 'date' && el.type !== 'hidden');
            if (!inputEl) return alert('Input barcode tidak ditemukan!');

            run = true;
            let stat = p.querySelector('#stat');
            let fails = 0, idx = 0;

            stat.innerText = 'Status: Berjalan (0 / ' + list.length + ')';
            stat.style.color = '#4CAF50';

            for (let code of list) {
                if (!run) break;
                idx++;
                stat.innerText = 'Status: Memproses (' + idx + ' / ' + list.length + ')';

                inputEl.focus();
                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(inputEl, code);
                inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                inputEl.dispatchEvent(new Event('change', { bubbles: true }));
                await new Promise(r => setTimeout(r, 250));

                let btn = inputEl.closest('div')?.querySelector('button, [role="button"]') || document.querySelectorAll('button');
                if (btn instanceof Element) btn.click();
                else if (btn.length) btn[btn.length - 1].click();
                else ['keydown', 'keypress', 'keyup'].forEach(e => inputEl.dispatchEvent(new KeyboardEvent(e, { key: 'Enter', keyCode: 13, bubbles: true })));

                await new Promise(r => setTimeout(r, 900));
                let page = document.body.innerText.toLowerCase();

                if (page.includes("nomor roll sudah di scan") || page.includes("sudah di scan")) {
                    errLst.innerHTML += code + '<br>';
                    fails++;
                    errCnt.innerText = 'Total Gagal: ' + fails;
                    let okBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().trim() === 'ok');
                    if (okBtn) okBtn.click();
                    await new Promise(r => setTimeout(r, 400));
                }
            }

            run = false;
            stat.innerText = 'Status: Selesai!';
            stat.style.color = '#00bcd4';
            alert('Selesai memproses ' + list.length + ' barcode! Total duplikat/gagal: ' + fails);
        };
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initPanel, 1000);
    } else {
        window.addEventListener('DOMContentLoaded', initPanel);
    }
})();
