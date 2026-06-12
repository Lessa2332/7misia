        // === OCR — РОЗПІЗНАВАННЯ ТЕКСТУ ===
        function pickOcrLanguage() {
            return new Promise(resolve => {
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position:fixed; inset:0; background:rgba(15,23,42,0.45);
                    backdrop-filter:blur(4px); z-index:9999;
                    display:flex; align-items:center; justify-content:center;
                `;

                const _t = uiText[state.lang] || uiText.ua;
                overlay.innerHTML = `
                    <div style="
                        background:#fff; border-radius:18px; padding:24px 24px 20px;
                        width:300px; max-width:90vw;
                        box-shadow:0 24px 60px rgba(0,0,0,0.18);
                        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
                        animation: ocrBoxIn 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards;
                    ">
                        <style>
                            @keyframes ocrBoxIn {
                                from { opacity:0; transform:scale(0.88) translateY(10px); }
                                to   { opacity:1; transform:scale(1) translateY(0); }
                            }
                        </style>
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
                            <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                            </div>
                            <div style="font-weight:700;font-size:15px;color:#0f172a;">${_t.ocrPickerTitle}</div>
                        </div>
                        <div style="display:flex;gap:10px;">
                            <button id="ocrUkr" style="
                                flex:1; padding:12px 8px; border:2px solid #e2e8f0; border-radius:12px;
                                background:#fff; cursor:pointer; font-size:14px; font-weight:600;
                                color:#1e293b; transition:all 0.15s; display:flex; flex-direction:column;
                                align-items:center; gap:4px;
                            ">
                                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                ${_t.ocrUkrBtn}
                            </button>
                            <button id="ocrEng" style="
                                flex:1; padding:12px 8px; border:2px solid #e2e8f0; border-radius:12px;
                                background:#fff; cursor:pointer; font-size:14px; font-weight:600;
                                color:#1e293b; transition:all 0.15s; display:flex; flex-direction:column;
                                align-items:center; gap:4px;
                            ">
                                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                ${_t.ocrEngBtn}
                            </button>
                        </div>
                        <button id="ocrCancel" style="
                            width:100%; margin-top:12px; padding:9px; border:1.5px solid #e2e8f0;
                            border-radius:10px; background:#fff; color:#94a3b8; font-size:13px;
                            font-weight:600; cursor:pointer;
                        ">${_t.ocrCancel}</button>
                    </div>
                `;

                document.body.appendChild(overlay);

                function close(val) {
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.18s';
                    setTimeout(() => overlay.remove(), 180);
                    resolve(val);
                }

                overlay.querySelector('#ocrUkr').addEventListener('click', () => close('ukr+eng'));
                overlay.querySelector('#ocrEng').addEventListener('click', () => close('eng'));
                overlay.querySelector('#ocrCancel').addEventListener('click', () => close(null));
                overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });

                // Hover ефекти
                ['ocrUkr', 'ocrEng'].forEach(id => {
                    const btn = overlay.querySelector('#' + id);
                    btn.addEventListener('mouseenter', () => { btn.style.borderColor = '#3b82f6'; btn.style.background = '#eff6ff'; });
                    btn.addEventListener('mouseleave', () => { btn.style.borderColor = '#e2e8f0'; btn.style.background = '#fff'; });
                });
            });
        }

        // === GROQ VISION OCR ===
        var _gk = ['gsk_QWuN1VxRKsDamhVsp2YiWGdyb3FY',
                      'x8dGpsClTdwHfIyauFDL743C'].join('');

        async function recognizeImageText(data, btn) {
            const apiKey = (window.getGroqUserKey ? (window.getGroqUserKey() || _gk) : _gk);

            const lang = await pickOcrLanguage();
            if (!lang) return;

            btn.classList.add('loading');
            btn.title = 'Розпізнаю...';

            try {
                // Конвертуємо src у base64 якщо треба
                let imageBase64 = data.src;
                let mediaType = 'image/jpeg';

                if (imageBase64.startsWith('data:')) {
                    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
                    if (match) { mediaType = match[1]; imageBase64 = match[2]; }
                } else {
                    // Зовнішній URL — завантажуємо через canvas
                    imageBase64 = await (async () => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = data.src; });
                        const c = document.createElement('canvas');
                        c.width = img.naturalWidth; c.height = img.naturalHeight;
                        c.getContext('2d').drawImage(img, 0, 0);
                        const dataUrl = c.toDataURL('image/jpeg', 0.92);
                        return dataUrl.split(',')[1];
                    })();
                    mediaType = 'image/jpeg';
                }

                const langPrompt = lang === 'ukr+eng'
                    ? 'Extract ALL text from this image exactly as written. Preserve line breaks. Output only the extracted text, nothing else.'
                    : 'Extract ALL text from this image exactly as written. Preserve line breaks. Output only the extracted text, nothing else.';

                const response = await GroqQueue.enqueue('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey
                    },
                    body: JSON.stringify({
                        model: 'meta-llama/llama-4-scout-17b-16e-instruct',  /* fallback: maverick → llama-3.2-11b-vision */
                        messages: [{
                            role: 'user',
                            content: [
                                { type: 'text', text: langPrompt },
                                { type: 'image_url', image_url: { url: 'data:' + mediaType + ';base64,' + imageBase64 } }
                            ]
                        }],
                        max_tokens: 2048,
                        temperature: 0
                    })
                }, 'ocr', 'vision');

                if (response.status === 401) {
                    showOcrToast('Groq API: помилка авторизації (401)', '#ef4444');
                    return;
                }

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error?.message || 'Groq API error ' + response.status);
                }

                const result = await response.json();
                const cleaned = (result.choices?.[0]?.message?.content || '').trim();

                if (!cleaned) {
                    showOcrToast('Текст не знайдено на зображенні', '#f59e0b');
                    return;
                }

                // Вставляємо текст в редактор
                setDrawMode('off');
                editor.focus();

                let sel = window.getSelection();
                if (!sel.rangeCount || !editor.contains(sel.anchorNode)) {
                    const range = document.createRange();
                    range.selectNodeContents(editor);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

                const lines = cleaned.split('\n');
                lines.forEach((line, index) => {
                    const trimmed = line.trim();
                    if (trimmed) document.execCommand('insertText', false, trimmed);
                    if (index < lines.length - 1) document.execCommand('insertHTML', false, '<br>');
                });

                saveState();
                showOcrToast('✓ Текст вставлено в зошит', '#10b981');

                let ocrMarkerTop = 60;
                const selAfter = window.getSelection();
                if (selAfter && selAfter.rangeCount > 0) {
                    const rect = selAfter.getRangeAt(0).getBoundingClientRect();
                    if (rect.top !== 0) {
                        const cardRect = card.getBoundingClientRect();
                        ocrMarkerTop = rect.top - cardRect.top + card.scrollTop + (rect.height / 2) - 9;
                    }
                }
                const ocrMarker = document.createElement('div');
                ocrMarker.className = 'paste-marker ocr-marker';
                ocrMarker.style.top = ocrMarkerTop + 'px';
                ocrMarker.innerHTML = '<span>Текст з картинки</span>';
                card.appendChild(ocrMarker);

            } catch (err) {
                console.error('OCR error:', err);
                showOcrToast('Помилка розпізнавання: ' + err.message, '#ef4444');
            } finally {
                btn.classList.remove('loading');
                btn.title = 'Розпізнати текст';
            }
        }

        function showOcrToast(msg, color = '#1e293b') {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.style.background = color;
            t.classList.add('show');
            setTimeout(() => {
                t.classList.remove('show');
                setTimeout(() => {
                    t.style.background = '';
                    t.textContent = 'Скопійовано!';
                }, 400);
            }, 3000);
        }

        // === ВИДАЛЕННЯ ФОНУ ЗОБРАЖЕННЯ ===
        function renderImages(pageIndex) {
            document.querySelectorAll('.board-image').forEach(el => el.remove());
            const list = allImages[pageIndex] || [];
            list.forEach(data => {
                const el = createImageEl(data);
                card.appendChild(el);
            });
            renderShapes(pageIndex);
            renderYtWindows(pageIndex);
        }

        function renderYtWindows(pageIndex) {
            document.querySelectorAll('.yt-float-window').forEach(el => { var f = el.querySelector('iframe'); if (f) f.remove(); el.remove(); });
            const list = allYtWindows[pageIndex] || [];
            list.forEach(data => {
                createYoutubeFloatWindow(data, card);
            });
        }

        // Deselect image/shape on click outside
        document.addEventListener('pointerdown', (e) => {
            if (!e.target.closest('.board-image')) {
                document.querySelectorAll('.board-image.selected').forEach(b => b.classList.remove('selected'));
            }
            if (!e.target.closest('.board-shape')) {
                document.querySelectorAll('.board-shape.selected').forEach(b => b.classList.remove('selected'));
            }
        });

        // Малює фон зошита вручну (html2canvas не рендерить repeating-linear-gradient)
        function drawNotebookBackground(ctx, w, h, scale, mode) {
            const style = getComputedStyle(document.documentElement);
            const lineColor = style.getPropertyValue('--line-color').trim() || 'rgba(179, 224, 255, 1)';
            const marginColor = style.getPropertyValue('--margin-line-color').trim() || 'rgba(255, 153, 153, 1)';
            const marginLeft = parseInt(style.getPropertyValue('--margin-left')) || 100;
            const lineHeight = parseInt(style.getPropertyValue('--line-height')) || 50;
            const cellSize = parseInt(style.getPropertyValue('--cell-size')) || 25;
            const ml = marginLeft * scale;

            if (mode === 'bg-lines') {
                // Горизонтальні лінії
                const step = lineHeight * scale;
                const offsetY = 49 * scale;
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 1 * scale;
                for (let y = offsetY % step - step; y < h + step; y += step) {
                    const ly = Math.round(y) + 0.5;
                    ctx.beginPath();
                    ctx.moveTo(0, ly);
                    ctx.lineTo(w, ly);
                    ctx.stroke();
                }
            } else if (mode === 'bg-grid') {
                // Горизонтальні лінії
                const step = cellSize * scale;
                const offsetY = 24 * scale;
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 1 * scale;
                for (let y = offsetY % step - step; y < h + step; y += step) {
                    const ly = Math.round(y) + 0.5;
                    ctx.beginPath();
                    ctx.moveTo(0, ly);
                    ctx.lineTo(w, ly);
                    ctx.stroke();
                }
                // Вертикальні лінії
                for (let x = 0; x < w + step; x += step) {
                    const lx = Math.round(x) + 0.5;
                    ctx.beginPath();
                    ctx.moveTo(lx, 0);
                    ctx.lineTo(lx, h);
                    ctx.stroke();
                }
            } else if (mode === 'bg-diagonal') {
                // Три горизонтальні лінії на рядок (цикл 75px, offset 42px)
                const cycleH = 75 * scale;
                const offsetY = 42 * scale;
                const lineOffsets = [0, 28 * scale, 46 * scale];
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 1 * scale;
                for (let y = (offsetY % cycleH) - cycleH; y < h + cycleH; y += cycleH) {
                    for (const lo of lineOffsets) {
                        const ly = Math.round(y + lo) + 0.5;
                        ctx.beginPath();
                        ctx.moveTo(0, ly);
                        ctx.lineTo(w, ly);
                        ctx.stroke();
                    }
                }
                // Косі лінії -65deg, крок 125px (= 44px + gap, period ~125)
                const angle = -65 * Math.PI / 180;
                const step = 125 * scale;
                const diagLen = Math.sqrt(w * w + h * h) * 2;
                const dx = Math.cos(angle + Math.PI / 2);
                const dy = Math.sin(angle + Math.PI / 2);
                const count = Math.ceil(diagLen / step) + 2;
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 1 * scale;
                for (let i = -count; i <= count; i++) {
                    const ox = 20 * scale + dx * step * i;
                    const oy = dy * step * i;
                    ctx.beginPath();
                    ctx.moveTo(ox - Math.cos(angle) * diagLen / 2, oy - Math.sin(angle) * diagLen / 2);
                    ctx.lineTo(ox + Math.cos(angle) * diagLen / 2, oy + Math.sin(angle) * diagLen / 2);
                    ctx.stroke();
                }
            }

            // Червона вертикальна лінія поля (для всіх режимів крім bg-clean)
            if (mode !== 'bg-clean') {
                ctx.strokeStyle = marginColor;
                ctx.lineWidth = 2 * scale;
                ctx.beginPath();
                ctx.moveTo(ml, 0);
                ctx.lineTo(ml, h);
                ctx.stroke();
            }
        }

        function getCardFilledHeight() {
            const cardRect = card.getBoundingClientRect();
            let maxBottom = Math.max(card.clientHeight, card.offsetHeight);
            const editorEl = document.getElementById('boardEditor');
            if (editorEl) {
                maxBottom = Math.max(maxBottom, editorEl.offsetTop + editorEl.scrollHeight + 28);
            }
            const canvasEl = document.getElementById('drawingCanvas');
            if (canvasEl) {
                maxBottom = Math.max(maxBottom, canvasEl.offsetTop + canvasEl.offsetHeight);
            }
            card.querySelectorAll('*').forEach(el => {
                if (
                    el.closest('.notebook-float-btns') ||
                    el.classList.contains('student-cursor') ||
                    el.id === 'allowEditBtn' ||
                    el.id === 'editAuthorTag'
                ) return;
                const style = getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') return;
                const rect = el.getBoundingClientRect();
                if (!rect.width && !rect.height) return;
                maxBottom = Math.max(maxBottom, rect.bottom - cardRect.top + card.scrollTop);
            });
            return Math.ceil(maxBottom + 24);
        }

        async function withExpandedCardForExport(renderFn) {
            const exportHeight = getCardFilledHeight();
            const old = {
                height: card.style.height,
                minHeight: card.style.minHeight,
                maxHeight: card.style.maxHeight,
                overflow: card.style.overflow,
                overflowY: card.style.overflowY,
                scrollTop: card.scrollTop
            };
            card.scrollTop = 0;
            card.style.height = exportHeight + 'px';
            card.style.minHeight = exportHeight + 'px';
            card.style.maxHeight = 'none';
            card.style.overflow = 'visible';
            card.style.overflowY = 'visible';
            try {
                return await renderFn(exportHeight);
            } finally {
                card.style.height = old.height;
                card.style.minHeight = old.minHeight;
                card.style.maxHeight = old.maxHeight;
                card.style.overflow = old.overflow;
                card.style.overflowY = old.overflowY;
                card.scrollTop = old.scrollTop;
            }
        }

        async function renderCardToCanvas() {
            const scale = window.devicePixelRatio || 2;
            const bgMode = ['bg-lines', 'bg-grid', 'bg-diagonal'].find(c => card.classList.contains(c)) || 'default';
            const isClean = card.classList.contains('bg-clean');
            const needsManualBg = !isClean; // всі режими крім bg-clean малюємо вручну

            return await withExpandedCardForExport(async (exportHeight) => {
                const rect = card.getBoundingClientRect();
                const w = Math.round(rect.width * scale);
                const h = Math.round(exportHeight * scale);

                const out = document.createElement('canvas');
                out.width = w;
                out.height = h;
                const octx = out.getContext('2d');

                // 1. Білий фон
                octx.fillStyle = '#ffffff';
                octx.fillRect(0, 0, w, h);

                // 2. Розмітка зошита (вручну, бо html2canvas не рендерить CSS-градієнти)
                if (needsManualBg) {
                    drawNotebookBackground(octx, w, h, scale, bgMode);
                }

                // 3. Знімаємо скріншот через onclone — прибираємо фон тільки у клоні
                const snap = await html2canvas(card, {
                    scale,
                    backgroundColor: null,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    width: Math.round(rect.width),
                    height: exportHeight,
                    windowWidth: Math.ceil(rect.width),
                    windowHeight: exportHeight,
                    scrollX: 0,
                    scrollY: 0,
                    onclone: (cloneDoc, cloneEl) => {
                        cloneEl.style.height = exportHeight + 'px';
                        cloneEl.style.minHeight = exportHeight + 'px';
                        cloneEl.style.maxHeight = 'none';
                        cloneEl.style.overflow = 'visible';
                        cloneEl.style.overflowY = 'visible';
                        cloneEl.style.backgroundColor = 'transparent';
                        cloneEl.style.backgroundImage = 'none';
                    }
                });

                // 4. Накладаємо вміст поверх розмітки
                octx.drawImage(snap, 0, 0);
                return out;
            });
        }

        // --- ГОЛОСОВЕ ВВЕДЕННЯ ---
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        var recognition;       // single instance, lang switches dynamically
        var recognitionUk;     // unused placeholder (kept for compat with setupToggle stop call)
        var isDictating = false;
        // Legacy vars kept to avoid reference errors in setupToggle
        var enPendingTs = null;
        var ukPendingTs = null;
        var dualTimer = null;

        // ── shared punctuation processing & insertion ──────────────────────────
        function processAndInsert(transcript) {
            if (!transcript) return;
            let processed = transcript.trim();

            const punctuationMap = {
                'крапка з комою': ';',
                'знак питання': '?',
                'знак оклику': '!',
                'новий рядок': '\n',
                'з нового рядка': '\n',
                'наступний рядок': '\n',
                'з абзацу': '\n',
                'абзац': '\n',
                'двокрапка': ':',
                'крапка': '.',
                'точка': '.',
                'кома': ',',
                'тире': '-',
                'дефіс': '-',
                'question mark': '?',
                'exclamation mark': '!',
                'new line': '\n',
                'semicolon': ';',
                'comma': ',',
                'period': '.',
                'colon': ':',
                'dot': '.',
                'dash': '-',
                'hyphen': '-',
                'paragraph': '\n'
            };

            for (const [word, punct] of Object.entries(punctuationMap)) {
                const regex = new RegExp(`(^|[^\\p{L}])${word}(?=[^\\p{L}]|$)`, 'giu');
                processed = processed.replace(regex, `$1${punct}`);
            }

            processed = processed.replace(/\s+([.,?!:;])/g, '$1');

            setDrawMode('off');
            editor.focus();

            let sel = window.getSelection();
            if (!sel.rangeCount || !editor.contains(sel.anchorNode)) {
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }

            let isNewSentence = false;
            if (sel.rangeCount > 0) {
                let tempRange = sel.getRangeAt(0).cloneRange();
                tempRange.selectNodeContents(editor);
                tempRange.setEnd(sel.anchorNode, sel.anchorOffset);
                let preText = tempRange.toString();

                if (preText.trim() === '' || /[.?!]\s*$/.test(preText) || /\n\s*$/.test(preText)) {
                    isNewSentence = true;
                } else {
                    const node = sel.anchorNode;
                    if (node.nodeType === Node.ELEMENT_NODE && node.childNodes[sel.anchorOffset - 1]?.nodeName === 'BR') {
                        isNewSentence = true;
                    } else if (node.nodeType === Node.TEXT_NODE && sel.anchorOffset === 0 && node.previousSibling?.nodeName === 'BR') {
                        isNewSentence = true;
                    }
                }
            }

            processed = processed.replace(/([.?!]\s+|\n+)(\p{L})/giu, match => match.toUpperCase());
            if (isNewSentence) {
                processed = processed.replace(/^([^\p{L}]*)(\p{L})/u, match => match.toUpperCase());
            }

            if (/^[.,?!:;]/.test(processed) && sel.rangeCount > 0) {
                let tempRange = sel.getRangeAt(0).cloneRange();
                tempRange.selectNodeContents(editor);
                tempRange.setEnd(sel.anchorNode, sel.anchorOffset);
                if (tempRange.toString().endsWith(' ')) {
                    document.execCommand('delete', false, null);
                }
            }

            if (processed.includes('\n')) {
                const parts = processed.split('\n');
                parts.forEach((part, index) => {
                    part = part.trim();
                    if (part) document.execCommand('insertText', false, part + ' ');
                    if (index < parts.length - 1) {
                        document.execCommand('insertHTML', false, '<br><br>');
                    }
                });
            } else {
                document.execCommand('insertText', false, processed + ' ');
            }
            saveState();
        }

        // ── Dual-mode result merger — simplified, single-instance ─────────────
        var dualTimerUnused = null; // kept for compat
        function submitDualResult() { }
        function onDualResult(text) { processAndInsert(text); }

        // ── Helper: extract final transcript from SpeechRecognitionEvent ──────
        function extractTranscript(event) {
            let t = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) t += event.results[i][0].transcript;
            }
            return t;
        }

        // ── Build a recognition instance with given lang ──────────────────────
        function buildRecognition(lang, onResult, onEndRestart, onErrorCb) {
            const r = new SpeechRecognition();
            r.continuous = true;
            r.interimResults = false;
            r.maxAlternatives = 1;
            r.lang = lang;
            r.onresult = onResult;
            r.onend = onEndRestart;
            r.onerror = onErrorCb;
            return r;
        }

        var _recogIsStarting = false; // guard against double-start
        var _interimTranscript = ''; // accumulate interim results
        var _isStopping = false;     // guard against double-insert on stop

        if (SpeechRecognition) {
            // ── Single adaptive recognition instance ──────────────────────────
            // lang is set dynamically when dictation starts based on state.lang
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                // If we just manually stopped and inserted the interim text,
                // skip the browser's final result to prevent duplication
                if (_isStopping) return;
                let finalT = '';
                let interimT = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalT += event.results[i][0].transcript;
                    } else {
                        interimT += event.results[i][0].transcript;
                    }
                }
                if (finalT) {
                    _interimTranscript = '';
                    processAndInsert(finalT);
                } else if (interimT) {
                    _interimTranscript = interimT;
                }
            };

            recognition.onend = () => {
                _recogIsStarting = false;
                _isStopping = false;
                if (!isDictating) {
                    _interimTranscript = '';
                    return;
                }
                // Delay restart to avoid InvalidStateError race condition
                setTimeout(() => {
                    if (!isDictating || _recogIsStarting) return;
                    _recogIsStarting = true;
                    try {
                        recognition.start();
                    } catch (e) {
                        _recogIsStarting = false;
                        console.error('Recognition restart error:', e);
                        // Only stop dictation for hard errors — transient errors get a second retry
                        if (e.name === 'InvalidStateError') {
                            setTimeout(() => {
                                if (!isDictating) return;
                                _recogIsStarting = true;
                                try { recognition.start(); } catch (e2) {
                                    _recogIsStarting = false;
                                    isDictating = false;
                                    document.getElementById('dictationBtn').classList.remove('active');
                                }
                            }, 300);
                        } else {
                            isDictating = false;
                            document.getElementById('dictationBtn').classList.remove('active');
                        }
                    }
                }, 150);
            };

            recognition.onerror = (event) => {
                console.error('SpeechRecognition error:', event.error);
                _recogIsStarting = false;
                if (event.error === 'not-allowed') {
                    isDictating = false;
                    document.getElementById('dictationBtn').classList.remove('active');
                    showOcrToast((uiText[state.lang] || uiText.ua).alertMicNotAllowed, '#ef4444');
                } else if (event.error === 'network') {
                    isDictating = false;
                    document.getElementById('dictationBtn').classList.remove('active');
                }
                // 'no-speech', 'audio-capture', 'aborted' — onend fires after and handles restart
            };

            // Compat: expose _enInstance as self so old stop calls don't throw
            recognition._enInstance = recognition;
            // Compat: recognitionUk points to same instance
            recognitionUk = recognition;
        }

        function toggleDictation() {
            if (!recognition) {
                showOcrToast((uiText[state.lang] || uiText.ua).alertVoiceNotSupported, '#ef4444');
                return;
            }

            const btn = document.getElementById('dictationBtn');
            if (isDictating) {
                isDictating = false;
                // Insert any pending interim transcript before stopping
                if (_interimTranscript) {
                    const pending = _interimTranscript;
                    _interimTranscript = '';
                    _isStopping = true; // block onresult from inserting same text again
                    processAndInsert(pending);
                }
                try { recognition.stop(); } catch (e) { }
                enPendingTs = null; ukPendingTs = null;
                btn.classList.remove('active');
            } else {
                setDrawMode('off');
                isDictating = true;

                editor.focus();
                let sel = window.getSelection();
                if (!sel.rangeCount || !editor.contains(sel.anchorNode)) {
                    const range = document.createRange();
                    range.selectNodeContents(editor);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

                // Set recognition language based on current UI language
                // EN mode: en-US (handles English + punctuation words like "dot", "comma")
                //           Ukrainian words will still be recognised by en-US engine phonetically,
                //           and the punctuationMap handles both languages
                // UA mode: uk-UA
                recognition.lang = recognitionLocale(state.lang);
                _recogIsStarting = true;

                try {
                    recognition.start();
                    btn.classList.add('active');
                } catch (e) {
                    _recogIsStarting = false;
                    console.error("Помилка старту розпізнавання: ", e);
                    isDictating = false;
                    btn.classList.remove('active');
                }
            }
        }

        window.addEventListener('resize', () => {
            if (!document.body.classList.contains('board-mode')) return;
            syncCanvasSize();
        });

        // ResizeObserver to detect editor height changes and resize canvas automatically
        var resizeObserver = new ResizeObserver(() => {
            if (!document.body.classList.contains('board-mode')) return;
            const dpr = window.devicePixelRatio || 1;
            if (canvas.height !== card.scrollHeight * dpr || canvas.width !== card.clientWidth * dpr) {
                syncCanvasSize();
            }
        });
        resizeObserver.observe(editor);

        // Render stickers when page changes
        var originalLoadPage = loadPage;
        // Override loadPage to also render stickers and images
        function loadPageWithStickers(index, isInitialLoad = false) {
            loadPage(index, isInitialLoad);
            renderStickers(currentPageIndex);
            renderImages(currentPageIndex);
            renderFreetexts(currentPageIndex);
        }

