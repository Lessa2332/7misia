        // === QR CODE GENERATOR ===
        (function () {
            let qrInsertSize = 150; // px size in notebook
            let qrGenSize = 400;    // canvas generation resolution
            let qrDebounceTimer = null;
            let qrReady = false;

            const qrInput = document.getElementById('qrInput');
            const qrCanvas = document.getElementById('qrPreviewCanvas');
            const qrPlaceholder = document.getElementById('qrPlaceholder');
            const qrInsertBtn = document.getElementById('qrInsertBtn');
            const qrModal = document.getElementById('qrModal');

            window.openQrModal = function () {
                qrModal.classList.add('visible');
                setTimeout(() => qrInput.focus(), 120);
            };

            window.closeQrModal = function () {
                qrModal.classList.remove('visible');
                // reset after transition
                setTimeout(() => {
                    qrInput.value = '';
                    qrPlaceholder.style.display = '';
                    qrCanvas.style.display = 'none';
                    qrInsertBtn.disabled = true;
                    qrReady = false;
                }, 220);
            };

            window.setQrSize = function (btn) {
                document.querySelectorAll('.qr-size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                qrInsertSize = parseInt(btn.dataset.size);
            };

            function renderQr(text) {
                // clear canvas
                const ctx = qrCanvas.getContext('2d');
                ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

                // use a temp div for QRCode library
                const tmp = document.createElement('div');
                tmp.style.position = 'absolute';
                tmp.style.left = '-9999px';
                document.body.appendChild(tmp);

                try {
                    new QRCode(tmp, {
                        text: text,
                        width: qrGenSize,
                        height: qrGenSize,
                        colorDark: '#1e293b',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                } catch (e) {
                    document.body.removeChild(tmp);
                    return;
                }

                // QRCode lib creates img or canvas async — wait for it
                const tryDraw = (attempts) => {
                    const img = tmp.querySelector('img');
                    const src = img ? img.src : null;
                    if (src && !src.endsWith('#')) {
                        const image = new Image();
                        image.onload = () => {
                            qrCanvas.width = qrGenSize;
                            qrCanvas.height = qrGenSize;
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, qrGenSize, qrGenSize);
                            ctx.drawImage(image, 0, 0, qrGenSize, qrGenSize);
                            qrPlaceholder.style.display = 'none';
                            qrCanvas.style.display = 'block';
                            qrInsertBtn.disabled = false;
                            qrReady = true;
                            document.body.removeChild(tmp);
                        };
                        image.src = src;
                    } else {
                        const cv = tmp.querySelector('canvas');
                        if (cv) {
                            qrCanvas.width = qrGenSize;
                            qrCanvas.height = qrGenSize;
                            ctx.drawImage(cv, 0, 0, qrGenSize, qrGenSize);
                            qrPlaceholder.style.display = 'none';
                            qrCanvas.style.display = 'block';
                            qrInsertBtn.disabled = false;
                            qrReady = true;
                            document.body.removeChild(tmp);
                        } else if (attempts > 0) {
                            setTimeout(() => tryDraw(attempts - 1), 60);
                        } else {
                            document.body.removeChild(tmp);
                        }
                    }
                };
                tryDraw(10);
            }

            qrInput.addEventListener('input', () => {
                clearTimeout(qrDebounceTimer);
                const val = qrInput.value.trim();
                if (!val) {
                    qrPlaceholder.style.display = '';
                    qrCanvas.style.display = 'none';
                    qrInsertBtn.disabled = true;
                    qrReady = false;
                    return;
                }
                qrDebounceTimer = setTimeout(() => renderQr(val), 350);
            });

            qrInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeQrModal();
                if (e.key === 'Enter' && qrReady) insertQrToNotebook();
            });

            window.insertQrToNotebook = function () {
                if (!qrReady) return;

                const dataUrl = qrCanvas.toDataURL('image/png');
                const id = Date.now();
                const rect = card.getBoundingClientRect();
                const x = Math.round(card.scrollLeft + rect.width / 2 - qrInsertSize / 2);
                const y = Math.round(card.scrollTop + rect.height / 3);
                const data = { id, src: dataUrl, x, y, w: qrInsertSize, h: qrInsertSize };

                const list = getPageImages();
                list.push(data);
                setPageImages(list);
                saveImages();

                const el = createImageEl(data);
                card.appendChild(el);

                closeQrModal();

                const t = document.getElementById('toast');
                const _ui = uiText[state.lang] || uiText.ua;
                t.textContent = _ui.qrInserted;
                t.classList.add('show');
                setTimeout(() => { t.classList.remove('show'); t.textContent = _ui.toastCopied; }, 2000);
            };
        })();

        // === TIMER WIDGET ===
        (function () {
            let allTimers = JSON.parse(localStorage.getItem('board_timers') || '{}');
            const timerIntervals = {};

            function saveTimers() {
                const toSave = {};
                Object.keys(allTimers).forEach(pi => {
                    toSave[pi] = allTimers[pi].map(t => ({ ...t, isRunning: false }));
                });
                localStorage.setItem('board_timers', JSON.stringify(toSave));
            }

            function getPageTimers() { return allTimers[currentPageIndex] || []; }
            function setPageTimers(list) { allTimers[currentPageIndex] = list; }

            function formatTime(s) {
                const m = Math.floor(Math.abs(s) / 60).toString().padStart(2, '0');
                const sec = (Math.abs(s) % 60).toString().padStart(2, '0');
                return `${m}:${sec}`;
            }

            function stopTimer(id) {
                if (timerIntervals[id]) { clearInterval(timerIntervals[id]); delete timerIntervals[id]; }
            }

            function beepAlert() {
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    [0, 0.35, 0.7].forEach(delay => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain); gain.connect(ctx.destination);
                        osc.type = 'sine'; osc.frequency.value = 880;
                        gain.gain.setValueAtTime(0.35, ctx.currentTime + delay);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.28);
                        osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.3);
                    });
                } catch (e) { }
            }

            function makeTimerDraggable(el, data) {
                const excluded = '.timer-delete,.timer-start-btn,.timer-reset-btn,.timer-preset-btn';
                let sx, sy, ox, oy;

                function dragStart(cx, cy) {
                    sx = cx; sy = cy;
                    ox = parseInt(el.style.left) || 0;
                    oy = parseInt(el.style.top) || 0;
                    el.style.zIndex = 60;
                }
                function dragMove(cx, cy) {
                    el.style.left = (ox + cx - sx) + 'px';
                    el.style.top = (oy + cy - sy) + 'px';
                }
                function dragEnd() {
                    data.x = parseInt(el.style.left) || 0;
                    data.y = parseInt(el.style.top) || 0;
                    saveTimers();
                    el.style.zIndex = 50;
                }

                el.addEventListener('mousedown', e => {
                    if (e.target.closest(excluded)) return;
                    e.preventDefault();
                    dragStart(e.clientX, e.clientY);
                    const mm = e2 => dragMove(e2.clientX, e2.clientY);
                    const mu = () => { dragEnd(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
                    document.addEventListener('mousemove', mm);
                    document.addEventListener('mouseup', mu);
                });
                el.addEventListener('touchstart', e => {
                    if (e.target.closest(excluded)) return;
                    const t0 = e.touches[0]; dragStart(t0.clientX, t0.clientY);
                    const tm = e2 => { e2.preventDefault(); const t2 = e2.touches[0]; dragMove(t2.clientX, t2.clientY); };
                    const te = () => { dragEnd(); document.removeEventListener('touchmove', tm); document.removeEventListener('touchend', te); };
                    document.addEventListener('touchmove', tm, { passive: false });
                    document.addEventListener('touchend', te);
                }, { passive: true });
            }

            function createTimerEl(data) {
                // r=58 → circumference = 2*π*58 ≈ 364.4
                const CIRCUMFERENCE = 364;
                const _tt = uiText[state.lang] || uiText.ua;

                const el = document.createElement('div');
                el.className = 'board-timer';
                el.id = 'btimer-' + data.id;
                el.style.left = data.x + 'px';
                el.style.top = data.y + 'px';

                /* ── HEADER ── */
                const header = document.createElement('div');
                header.className = 'timer-header';

                /* delete btn */
                const delBtn = document.createElement('button');
                delBtn.className = 'timer-delete';
                delBtn.textContent = '×';
                delBtn.title = 'Видалити таймер';
                delBtn.addEventListener('mousedown', e => e.stopPropagation());
                delBtn.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
                delBtn.addEventListener('click', e => { e.stopPropagation(); deleteTimer(data.id, el); });

                /* ring wrap */
                const ringWrap = document.createElement('div');
                ringWrap.className = 'timer-ring-wrap';

                /* SVG ring */
                const svgNS = 'http://www.w3.org/2000/svg';
                const svg = document.createElementNS(svgNS, 'svg');
                svg.setAttribute('width', '130'); svg.setAttribute('height', '130');
                svg.setAttribute('viewBox', '0 0 130 130');
                svg.classList.add('timer-progress-ring');
                const cx = '65', cy = '65', r = '58';
                const track = document.createElementNS(svgNS, 'circle');
                track.setAttribute('cx', cx); track.setAttribute('cy', cy); track.setAttribute('r', r);
                track.classList.add('timer-ring-track');
                const fill = document.createElementNS(svgNS, 'circle');
                fill.setAttribute('cx', cx); fill.setAttribute('cy', cy); fill.setAttribute('r', r);
                fill.classList.add('timer-ring-fill');
                fill.style.strokeDasharray = CIRCUMFERENCE;
                fill.style.strokeDashoffset = '0';
                fill.style.stroke = '#64748b';
                svg.appendChild(track); svg.appendChild(fill);

                /* center text */
                const centerText = document.createElement('div');
                centerText.className = 'timer-center-text';

                const display = document.createElement('div');
                display.className = 'timer-display';
                display.textContent = formatTime(data.remainingSeconds);
                display.title = _tt.timerClickToEdit;

                const lbl = document.createElement('div');
                lbl.className = 'timer-label';
                lbl.textContent = langPick('ТАЙМЕР', 'TIMER', 'TIMER');

                /* Inline time editor */
                const editor = document.createElement('div');
                editor.className = 'timer-time-editor';

                const minInput = document.createElement('input');
                minInput.className = 'timer-time-input';
                minInput.type = 'number'; minInput.min = 0; minInput.max = 99;
                minInput.placeholder = langPick('мм', 'mm', 'mm');

                const sep = document.createElement('span');
                sep.className = 'timer-time-sep';
                sep.textContent = ':';

                const secInput = document.createElement('input');
                secInput.className = 'timer-time-input';
                secInput.type = 'number'; secInput.min = 0; secInput.max = 59;
                secInput.placeholder = langPick('сс', 'ss', 'ss');

                const okBtn = document.createElement('button');
                okBtn.className = 'timer-time-ok';
                okBtn.textContent = '✓';

                editor.appendChild(minInput); editor.appendChild(sep);
                editor.appendChild(secInput); editor.appendChild(okBtn);

                [minInput, secInput, editor, okBtn].forEach(el2 => {
                    el2.addEventListener('mousedown', e => e.stopPropagation());
                    el2.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
                });

                function openEditor() {
                    if (data.isRunning) return;
                    const m = Math.floor(data.remainingSeconds / 60);
                    const s = data.remainingSeconds % 60;
                    minInput.value = m; secInput.value = s;
                    display.classList.add('editing');
                    editor.classList.add('visible');
                    minInput.focus(); minInput.select();
                }

                function applyEditorTime() {
                    const m = Math.min(99, parseInt(minInput.value) || 0);
                    const s = Math.min(59, parseInt(secInput.value) || 0);
                    const total = m * 60 + s;
                    if (total > 0) {
                        data.totalSeconds = total;
                        data.remainingSeconds = total;
                        display.textContent = formatTime(total);
                        display.classList.remove('finished');
                        startBtn.className = 'timer-start-btn';
                        startBtn.textContent = '▶ Старт';
                        // if timer was running — restart it with new time
                        if (data.isRunning) {
                            stopTimer(data.id);
                            timerIntervals[data.id] = setInterval(tick, 1000);
                        }
                        updateRing();
                        saveTimers();
                    }
                    editor.classList.remove('visible');
                    display.classList.remove('editing');
                }

                display.addEventListener('click', e => { e.stopPropagation(); openEditor(); });
                okBtn.addEventListener('click', e => { e.stopPropagation(); applyEditorTime(); });
                [minInput, secInput].forEach(inp => {
                    inp.addEventListener('keydown', e => {
                        if (e.key === 'Enter') applyEditorTime();
                        if (e.key === 'Escape') { editor.classList.remove('visible'); display.classList.remove('editing'); }
                        e.stopPropagation();
                    });
                    inp.addEventListener('click', e => e.stopPropagation());
                });

                centerText.appendChild(display);
                centerText.appendChild(editor);

                ringWrap.appendChild(svg);
                ringWrap.appendChild(centerText);

                header.appendChild(delBtn);
                header.appendChild(ringWrap);
                header.appendChild(lbl);

                /* ── BODY ── */
                const body = document.createElement('div');
                body.className = 'timer-body';

                /* presets */
                const presets = document.createElement('div');
                presets.className = 'timer-presets';

                const startBtn = document.createElement('button');
                startBtn.className = 'timer-start-btn';
                startBtn.textContent = _tt.timerStart;

                const resetBtn = document.createElement('button');
                resetBtn.className = 'timer-reset-btn';
                resetBtn.title = _tt.timerReset;
                resetBtn.textContent = '↺';

                /* ring update */
                function updateRing() {
                    const total = data.totalSeconds || 1;
                    const ratio = Math.max(0, data.remainingSeconds / total);
                    fill.style.strokeDashoffset = CIRCUMFERENCE * (1 - ratio);
                    if (ratio < 0.2) fill.style.stroke = '#f87171';
                    else fill.style.stroke = '#64748b';
                }
                updateRing();

                /* preset buttons — work while timer is running */
                const presetLabels = langPick(
                    [['1хв', 60], ['5хв', 300], ['10хв', 600]],
                    [['1m', 60], ['5m', 300], ['10m', 600]],
                    [['1 Min', 60], ['5 Min', 300], ['10 Min', 600]]
                );
                presetLabels.forEach(([label, secs]) => {
                    const pb = document.createElement('button');
                    pb.className = 'timer-preset-btn';
                    pb.textContent = '+' + label;
                    pb.addEventListener('mousedown', e => e.stopPropagation());
                    pb.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
                    pb.addEventListener('click', e => {
                        e.stopPropagation();
                        const wasRunning = data.isRunning;
                        stopTimer(data.id);
                        data.totalSeconds = Math.min((data.totalSeconds || 0) + secs, 5999);
                        data.remainingSeconds = Math.min(data.remainingSeconds + secs, data.totalSeconds);
                        display.textContent = formatTime(data.remainingSeconds);
                        display.classList.remove('finished');
                        updateRing();
                        // resume if was running
                        if (wasRunning) {
                            timerIntervals[data.id] = setInterval(tick, 1000);
                        } else {
                            startBtn.className = 'timer-start-btn';
                            startBtn.textContent = _tt.timerStart;
                        }
                        saveTimers();
                        // flash the button to confirm
                        pb.style.background = '#bbf7d0';
                        pb.style.borderColor = '#86efac';
                        setTimeout(() => { pb.style.background = ''; pb.style.borderColor = ''; }, 400);
                    });
                    presets.appendChild(pb);
                });

                function tick() {
                    data.remainingSeconds = Math.max(0, data.remainingSeconds - 1);
                    display.textContent = formatTime(data.remainingSeconds);
                    updateRing();
                    if (data.remainingSeconds <= 0) {
                        stopTimer(data.id);
                        data.isRunning = false;
                        display.classList.add('finished');
                        startBtn.className = 'timer-start-btn finished';
                        startBtn.textContent = _tt.timerFinished;
                        saveTimers();
                        beepAlert();
                    } else {
                        saveTimers();
                    }
                }

                startBtn.addEventListener('mousedown', e => e.stopPropagation());
                startBtn.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
                startBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    if (data.isRunning) {
                        stopTimer(data.id);
                        data.isRunning = false;
                        startBtn.className = 'timer-start-btn paused';
                        startBtn.textContent = _tt.timerResume;
                        display.style.cursor = 'pointer';
                        display.style.opacity = '';
                        display.title = _tt.timerClickToEdit;
                    } else {
                        if (data.remainingSeconds <= 0) {
                            data.remainingSeconds = data.totalSeconds || 300;
                            display.textContent = formatTime(data.remainingSeconds);
                            display.classList.remove('finished');
                        }
                        if (!data.totalSeconds) { data.totalSeconds = 300; data.remainingSeconds = 300; display.textContent = formatTime(300); }
                        updateRing();
                        timerIntervals[data.id] = setInterval(tick, 1000);
                        data.isRunning = true;
                        startBtn.className = 'timer-start-btn running';
                        startBtn.textContent = _tt.timerPause;
                        display.style.cursor = 'default';
                        display.style.opacity = '1';
                        display.title = '';
                    }
                    saveTimers();
                });

                resetBtn.addEventListener('mousedown', e => e.stopPropagation());
                resetBtn.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
                resetBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    stopTimer(data.id);
                    data.isRunning = false;
                    data.remainingSeconds = data.totalSeconds || 300;
                    display.textContent = formatTime(data.remainingSeconds);
                    display.classList.remove('finished');
                    startBtn.className = 'timer-start-btn';
                    startBtn.textContent = _tt.timerStart;
                    display.style.cursor = 'pointer';
                    display.style.opacity = '';
                    display.title = _tt.timerClickToEdit;
                    updateRing();
                    saveTimers();
                });

                const controls = document.createElement('div');
                controls.className = 'timer-controls';
                controls.appendChild(startBtn);
                controls.appendChild(resetBtn);

                body.appendChild(presets);
                body.appendChild(controls);
                el.appendChild(header);
                el.appendChild(body);
                makeTimerDraggable(el, data);
                return el;
            }

            function deleteTimer(id, el) {
                stopTimer(id);
                el.style.transition = 'all 0.2s ease';
                el.style.transform = 'scale(0.8)';
                el.style.opacity = '0';
                setTimeout(() => {
                    el.remove();
                    setPageTimers(getPageTimers().filter(t => t.id !== id));
                    saveTimers();
                }, 200);
            }

            window.renderTimers = function (pageIndex) {
                Object.keys(timerIntervals).forEach(id => { clearInterval(timerIntervals[id]); delete timerIntervals[id]; });
                document.querySelectorAll('.board-timer').forEach(el => el.remove());
                (allTimers[pageIndex] || []).forEach(data => {
                    data.isRunning = false;
                    card.appendChild(createTimerEl(data));
                });
            };

            // ── BACKUP / RESTORE ──────────────────────────────────────────
            window.saveNotebookBackup = function () {
                const _t = uiText[state.lang] || uiText.ua;
                const KEYS = [
                    'board_lang', 'board_type', 'board_font', 'board_bg',
                    'board_pages', 'board_page_index',
                    'board_brush_size', 'board_eraser_size',
                    'board_sym_panel_visible',
                    'board_shapes', 'board_freetexts',
                    'board_stickers', 'board_images', 'board_timers'
                ];
                const backup = { _version: 1, _saved: new Date().toISOString() };
                KEYS.forEach(k => {
                    const v = localStorage.getItem(k);
                    if (v !== null) backup[k] = v;
                });
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const dateStr = new Date().toISOString().slice(0, 10);
                const a = document.createElement('a');
                a.href = url;
                a.download = `зошит-${dateStr}.notebook`;
                a.click();
                URL.revokeObjectURL(url);
                showOcrToast(_t.toastNotebookSaved, '#1e293b');
            };

            window.loadNotebookBackup = function (event) {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (!data._version) throw new Error((uiText[state.lang] || uiText.ua).alertLoadError);
                        const _t = uiText[state.lang] || uiText.ua;
                        showConfirmModal(_t.confirmLoadTitle, function () {
                            Object.keys(data).forEach(k => {
                                if (k.startsWith('_')) return;
                                localStorage.setItem(k, data[k]);
                            });
                            showOcrToast(_t.toastNotebookLoaded, '#10b981');
                            setTimeout(() => location.reload(), 900);
                        }, {
                            subText: _t.confirmLoadSub,
                            yesText: _t.confirmLoadYes,
                            noText: _t.confirmLoadNo,
                            yesColor: '#2563eb',
                        });
                    } catch (err) {
                        const _t = uiText[state.lang] || uiText.ua;
                        showOcrToast('❌ ' + (_t.alertLoadError || 'Error') + ': ' + err.message, '#ef4444');
                    }
                };
                reader.readAsText(file);
                event.target.value = '';
            };
            // ─────────────────────────────────────────────────────────────

            window.addTimerToPage = function () {
                const cardRect = card.getBoundingClientRect();
                const timerWidth = 192;
                const timerHeight = 160;

                // Middle-right of the visible card area
                const x = Math.round(card.scrollLeft + cardRect.width - timerWidth - 80);
                const y = Math.round(card.scrollTop + (cardRect.height / 2) - (timerHeight / 2));

                const id = Date.now();
                const data = { id, x, y, totalSeconds: 300, remainingSeconds: 300, isRunning: false, theme: 'dark' };
                const list = getPageTimers();
                list.push(data);
                setPageTimers(list);
                saveTimers();
                card.appendChild(createTimerEl(data));
            };
        })();
