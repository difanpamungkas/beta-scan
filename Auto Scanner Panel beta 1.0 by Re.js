// ==UserScript==
// @name         Auto Scanner Panel beta 1.8 by Re
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Automated barcode scanning panel with running text easter egg upon completion.
// @match        https://tsiraw.tsindustri.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function showRunningText() {
        let oldMsg = document.getElementById('runningTextBanner');
        if (oldMsg) oldMsg.remove();

        let banner = document.createElement('div');
        banner.id = 'runningTextBanner';
        banner.style.cssText = `
            position: fixed;
            bottom: 25px;
            left: 0;
            width: 100%;
            background: rgba(9, 9, 11, 0.92);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            color: #22c55e;
            padding: 12px 0;
            z-index: 1000000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 15px;
            font-weight: 700;
            overflow: hidden;
            white-space: nowrap;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.6);
            border-top: 1px solid rgba(34, 197, 94, 0.4);
            border-bottom: 1px solid rgba(34, 197, 94, 0.4);
            cursor: pointer;
        `;

        let content = document.createElement('div');
        content.style.cssText = `
            display: inline-block;
            padding-left: 100%;
            animation: marqueeAnim 9s linear infinite;
        `;
        content.innerText = '☕ wes kabeh cak,ojo lali kopine @Rey😎   |   ☕ wes kabeh cak,ojo lali kopine @Rey😎';

        if (!document.getElementById('marqueeStyle')) {
            let style = document.createElement('style');
            style.id = 'marqueeStyle';
            style.innerHTML = `
                @keyframes marqueeAnim {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-100%, 0); }
                }
            `;
            document.head.appendChild(style);
        }

        banner.appendChild(content);
        banner.onclick = () => banner.remove();
        document.body.appendChild(banner);

        setTimeout(() => { if (banner) banner.remove(); }, 18000);
    }

    function initPanel() {
        if (document.getElementById('autoScanPanelContainer')) return;

        let p = document.createElement('div');
        p.id = 'autoScanPanelContainer';
        p.style.cssText = `
            position: fixed;
            top: 70px;
            left: 12px;
            background: rgba(24, 24, 27, 0.94);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            color: #f4f4f5;
            padding: 14px 16px;
            z-index: 999999;
            border-radius: 14px;
            width: calc(100vw - 24px);
            max-width: 330px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.12);
            transition: width 0.2s ease, padding 0.2s ease;
        `;

        p.innerHTML = `
            <div id="panelHeader" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; user-select:none; padding-bottom:4px; transition:margin 0.2s ease, border 0.2s ease;">
                <div style="display:flex; align-items:center; gap:8px; white-space:nowrap; overflow:hidden;">
                    <span style="width:8px; height:8px; background:#22c55e; border-radius:50%; display:inline-block; box-shadow:0 0 8px #22c55e; flex-shrink:0;"></span>
                    <b style="color:#ffffff; font-size:13px; letter-spacing:0.3px; white-space:nowrap;">beta 1.5 <span style="font-weight:normal; font-size:11px; color:#a1a1aa;">by Re</span></b>
                </div>
                <div style="display:flex; gap:6px; flex-shrink:0; margin-left:8px;">
                    <span id="minBtn" style="cursor:pointer; background:rgba(255,255,255,0.08); color:#a1a1aa; padding:2px 8px; border-radius:6px; font-weight:600; font-size:12px;" title="Minimize">_</span>
                    <span id="clsBtn" style="cursor:pointer; background:rgba(239,68,68,0.2); color:#ef4444; padding:2px 8px; border-radius:6px; font-weight:600; font-size:12px;" title="Tutup">X</span>
                </div>
            </div>

            <div id="bodyPanel">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="color:#a1a1aa; font-weight:500;">Daftar Barcode:</span>
                    <span id="cnt" style="color:#38bdf8; font-weight:600; background:rgba(56,189,248,0.1); padding:2px 8px; border-radius:12px; font-size:11px;">Total: 0</span>
                </div>

                <textarea id="txt" placeholder="Paste nomor barcode di sini (1 nomor per baris)..." style="width:100%; height:95px; background:#09090b; color:#f4f4f5; border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:8px; font-family:monospace; font-size:12px; box-sizing:border-box; resize:vertical; outline:none;"></textarea>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; margin-bottom:8px;">
                    <span style="color:#a1a1aa; font-size:11px;">Kecepatan Scan:</span>
                    <select id="speedSel" style="background:#09090b; color:#f4f4f5; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:3px 6px; font-size:11px; outline:none;">
                        <option value="500">Cepat (0.5s)</option>
                        <option value="900" selected>Normal (0.9s)</option>
                        <option value="1500">Lambat (1.5s)</option>
                    </select>
                </div>

                <div style="display:flex; gap:6px; margin-bottom:10px;">
                    <button id="clrBtn" style="flex:1; background:rgba(255,255,255,0.06); color:#d4d4d8; border:1px solid rgba(255,255,255,0.1); padding:7px; border-radius:6px; font-weight:600; cursor:pointer; font-size:12px;">Clear</button>
                    <button id="onBtn" style="flex:2; background:linear-gradient(135deg, #16a34a, #22c55e); color:#fff; border:none; padding:7px; border-radius:6px; font-weight:600; cursor:pointer; font-size:12px; box-shadow:0 2px 4px rgba(34,197,94,0.2);">START ON</button>
                    <button id="offBtn" style="flex:1; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3); padding:7px; border-radius:6px; font-weight:600; cursor:pointer; font-size:12px;">STOP</button>
                </div>

                <div style="background:rgba(0,0,0,0.3); padding:8px; border-radius:8px; border:1px solid rgba(255,255,255,0.05); margin-bottom:10px;">
                    <div id="stat" style="font-weight:600; color:#eab308; font-size:12px; margin-bottom:4px;">Status: Siap</div>
                    <div id="errCnt" style="font-weight:500; color:#f97316; font-size:11px;">Total Gagal: 0</div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-weight:600; color:#d4d4d8; font-size:12px;">Daftar Gagal / Ganda:</span>
                    <button id="expBtn" style="background:none; border:none; color:#38bdf8; font-size:11px; cursor:pointer; text-decoration:underline; padding:0;">Download Log</button>
                </div>

                <div id="errLst" style="max-height:85px; overflow-y:auto; background:#09090b; padding:8px; border-radius:8px; font-family:monospace; font-size:11px; color:#f87171; border:1px solid rgba(255,255,255,0.08);"></div>
            </div>
        `;
        document.body.appendChild(p);

        let run = false, min = false;
        let body = p.querySelector('#bodyPanel');
        let minBtn = p.querySelector('#minBtn');
        let header = p.querySelector('#panelHeader');

        minBtn.onclick = function() {
            min = !min;
            body.style.display = min ? 'none' : 'block';
            p.style.width = min ? '210px' : 'calc(100vw - 24px)';
            p.style.padding = min ? '10px 14px' : '14px 16px';
            header.style.marginBottom = min ? '0px' : '12px';
            header.style.borderBottom = min ? 'none' : '1px solid rgba(255,255,255,0.08)';
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
        let failedLog = [];

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
            failedLog = [];
        };

        p.querySelector('#expBtn').onclick = function() {
            if (failedLog.length === 0) return alert('Belum ada data gagal untuk diunduh.');
            let blob = new Blob([failedLog.join('\n')], { type: 'text/plain;charset=utf-8' });
            let a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'log_gagal_scan.txt';
            a.click();
        };

        p.querySelector('#offBtn').onclick = function() {
            if (run) {
                run = false;
                p.querySelector('#stat').innerText = 'Status: Dihentikan (STOP)';
                p.querySelector('#stat').style.color = '#ef4444';
            }
        };

        p.querySelector('#onBtn').onclick = async function() {
            if (run) return;
            let val = txt.value.trim();
            if (!val) return alert('Kotak teks masih kosong!');
            let list = val.split(/\r?\n/).map(x => x.trim()).filter(x => x.length > 0);
            if (list.length === 0) return alert('Tidak ada barcode valid!');

            let inputEl = document.querySelector('input[placeholder*="barcode" i]') || Array.from(document.querySelectorAll('input')).find(el => el.type !== 'date' && el.type !== 'hidden');
            if (!inputEl) return alert('Input barcode tidak ditemukan di halaman!');

            run = true;
            let stat = p.querySelector('#stat');
            let fails = 0, idx = 0;
            let speedDelay = parseInt(document.getElementById('speedSel').value) || 900;

            stat.innerText = 'Status: Memproses (0 / ' + list.length + ')';
            stat.style.color = '#22c55e';

            for (let code of list) {
                if (!run) break;
                idx++;
                stat.innerText = 'Status: Memproses (' + idx + ' / ' + list.length + ')';

                inputEl.focus();
                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(inputEl, code);
                inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                inputEl.dispatchEvent(new Event('change', { bubbles: true }));
                await new Promise(r => setTimeout(r, 200));

                let btn = inputEl.closest('div')?.querySelector('button, [role="button"]') || document.querySelectorAll('button');
                if (btn instanceof Element) btn.click();
                else if (btn.length) btn[btn.length - 1].click();
                else ['keydown', 'keypress', 'keyup'].forEach(e => inputEl.dispatchEvent(new KeyboardEvent(e, { key: 'Enter', keyCode: 13, bubbles: true })));

                await new Promise(r => setTimeout(r, speedDelay));
                let pageText = document.body.innerText.toLowerCase();

                let errorReason = "";
                if (pageText.includes("sudah di scan") || pageText.includes("sudah scan")) {
                    errorReason = "Sudah di-scan";
                } else if (pageText.includes("tidak ada di sloc sender") || pageText.includes("tidak ditemukan")) {
                    errorReason = "Tidak ada di Sloc Sender";
                } else if (pageText.includes("tidak valid")) {
                    errorReason = "Tidak valid";
                } else if (pageText.includes("gagal")) {
                    errorReason = "Gagal diproses";
                }

                if (errorReason !== "") {
                    let logEntry = `${code} -> ${errorReason}`;
                    failedLog.push(logEntry);
                    errLst.innerHTML += `<div style="margin-bottom:2px;"><b>${code}</b> <span style="color:#fbbf24;">(${errorReason})</span></div>`;
                    errLst.scrollTop = errLst.scrollHeight;
                    fails++;
                    errCnt.innerText = 'Total Gagal: ' + fails;

                    let btnOk = Array.from(document.querySelectorAll('button')).find(b => {
                        let t = b.innerText.toLowerCase().trim();
                        return t === 'ok' || t === 'close' || t === 'tutup' || t === 'confirm';
                    });
                    if (btnOk) btnOk.click();
                    await new Promise(r => setTimeout(r, 300));
                }
            }

            let wasRunning = run;
            run = false;
            stat.innerText = 'Status: Selesai!';
            stat.style.color = '#38bdf8';

            if (wasRunning) {
                showRunningText();
            }
        };
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initPanel, 1000);
    } else {
        window.addEventListener('DOMContentLoaded', initPanel);
    }
})();
