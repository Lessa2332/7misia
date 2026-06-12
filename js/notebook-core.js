        var uaMonths = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
        var uaDays = ["", "перше", "друге", "третє", "четверте", "п'яте", "шосте", "сьоме", "восьме", "дев'яте", "десяте", "одинадцяте", "дванадцяте", "тринадцяте", "чотирнадцяте", "п'ятнадцяте", "шістнадцяте", "сімнадцяте", "вісімнадцяте", "дев'ятнадцяте", "двадцяте", "двадцять перше", "двадцять друге", "двадцять третє", "двадцять четверте", "двадцять п'яте", "двадцять шосте", "двадцять сьоме", "двадцять восьме", "двадцять дев'яте", "тридцяте", "тридцять перше"];
        var enOrdinals = ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "twentieth", "twenty-first", "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth", "twenty-sixth", "twenty-seventh", "twenty-eighth", "twenty-ninth", "thirtieth", "thirty-first"];
        var deMonths = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        var deOrdinals = ["", "ersten", "zweiten", "dritten", "vierten", "fünften", "sechsten", "siebten", "achten", "neunten", "zehnten", "elften", "zwölften", "dreizehnten", "vierzehnten", "fünfzehnten", "sechzehnten", "siebzehnten", "achtzehnten", "neunzehnten", "zwanzigsten", "einundzwanzigsten", "zweiundzwanzigsten", "dreiundzwanzigsten", "vierundzwanzigsten", "fünfundzwanzigsten", "sechsundzwanzigsten", "siebenundzwanzigsten", "achtundzwanzigsten", "neunundzwanzigsten", "dreißigsten", "einunddreißigsten"];
        var deWeekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

        var typeLabels = {
            ua: {
                home:        'Домашня робота',
                class:       'Класна робота',
                independent: 'Самостійна робота',
                control:     'Контрольна робота',
                test:        'Тест',
                diagnostic:  'Діагностувальна робота',
                practical:   'Практична робота',
                lab:         'Лабораторна робота',
                creative:    'Творча робота',
                dictation:   'Диктант',
            },
            en: {
                home:        'Homework',
                class:       'Classwork',
                independent: 'Independent Work',
                control:     'Control Work',
                test:        'Test',
                diagnostic:  'Diagnostic Work',
                practical:   'Practical Work',
                lab:         'Corrections',
                creative:    'Creative Work',
                dictation:   'Dictation',
            },
            de: {
                home:        'Hausarbeit',
                class:       'Klassenarbeit',
                independent: 'Selbstständige Arbeit',
                control:     'Kontrollarbeit',
                test:        'Test',
                diagnostic:  'Diagnostische Arbeit',
                practical:   'Praktische Arbeit',
                lab:         'Laborarbeit',
                creative:    'Kreative Arbeit',
                dictation:   'Diktat',
            }
        };

        function getBoardLang() {
            return state.lang || 'ua';
        }

        function langPick(ua, en, de) {
            const l = getBoardLang();
            if (l === 'en') return en;
            if (l === 'de') return de !== undefined ? de : en;
            return ua;
        }

        function recognitionLocale(lang) {
            if (lang === 'en') return 'en-US';
            if (lang === 'de') return 'de-DE';
            return 'uk-UA';
        }

        var card = document.getElementById('notebookCard');
        var editor = document.getElementById('boardEditor');
        var canvas = document.getElementById('drawingCanvas');
        var ctx = canvas.getContext('2d');
        var dateSelect = document.getElementById('dateSelect');

        // Відновлення стану з localStorage
        var state = {
            lang: localStorage.getItem('board_lang') || 'ua',
            type: localStorage.getItem('board_type') || 'home',
            font: localStorage.getItem('board_font') || 'font-print',
            bg: localStorage.getItem('board_bg') || 'bg-lines'
        };

        // На мобільному режим косої лінії не підтримується
        if (window.innerWidth <= 768 && state.bg === 'bg-diagonal') {
            state.bg = 'bg-lines';
        }

        var currentColor = '#497bb8';
        var drawMode = 'off';
        var points = [];
        var lastTime = 0;
        var lastWidth = 2;

        // --- СИСТЕМА ІСТОРІЇ ТА СТОРІНОК ---
        var historyStack = [];
        var currentStep = -1;
        var textDebounceTimeout;

        var boardPages = JSON.parse(localStorage.getItem('board_pages')) || [{ html: '', canvas: '' }];
        var currentPageIndex = parseInt(localStorage.getItem('board_page_index')) || 0;
        if (currentPageIndex >= boardPages.length) currentPageIndex = boardPages.length - 1;
        if (currentPageIndex < 0) currentPageIndex = 0;

        function saveState() {
            if (currentStep < historyStack.length - 1) {
                historyStack.length = currentStep + 1;
            }

            historyStack.push({
                html: editor.innerHTML,
                pic: canvas.toDataURL()
            });
            currentStep++;

            if (historyStack.length > 50) {
                historyStack.shift();
                currentStep--;
            }

            boardPages[currentPageIndex] = {
                html: editor.innerHTML,
                canvas: canvas.toDataURL(),
                tables: window.saveTablesState ? window.saveTablesState() : []
            };
            localStorage.setItem('board_pages', JSON.stringify(boardPages));
        }

        function flushTextDebounce() {
            if (textDebounceTimeout) {
                clearTimeout(textDebounceTimeout);
                textDebounceTimeout = null;
                saveState();
            }
        }

        function undoAction() {
            flushTextDebounce();
            if (currentStep > 0) {
                currentStep--;
                applyState(historyStack[currentStep]);
            }
        }

        function redoAction() {
            flushTextDebounce();
            if (currentStep < historyStack.length - 1) {
                currentStep++;
                applyState(historyStack[currentStep]);
            }
        }

        function applyState(stateObj) {
            editor.innerHTML = stateObj.html;
            drawCanvasDataUrlToCurrentSize(stateObj.pic, () => {
                boardPages[currentPageIndex] = {
                    html: editor.innerHTML,
                    canvas: canvas.toDataURL()
                };
                localStorage.setItem('board_pages', JSON.stringify(boardPages));
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                const key = e.key.toLowerCase();
                const code = e.code;
                if (key === 'z' || code === 'KeyZ') {
                    e.preventDefault();
                    if (e.shiftKey) redoAction();
                    else undoAction();
                } else if (key === 'y' || code === 'KeyY') {
                    e.preventDefault();
                    redoAction();
                }
            }
        });

        editor.addEventListener('input', (e) => {
            clearTimeout(textDebounceTimeout);
            textDebounceTimeout = setTimeout(() => {
                saveState();
            }, 800);

            // === АВТОМАТИЧНИЙ ПІДРАХУНОК МАТЕМАТИКИ ===
            if (e.data === '=' || (e.inputType === 'insertText' && e.data && e.data.includes('='))) {
                const sel = window.getSelection();
                if (!sel.rangeCount) return;

                const range = sel.getRangeAt(0);
                if (range.startContainer.nodeType === Node.TEXT_NODE) {
                    const text = range.startContainer.textContent.substring(0, range.startOffset);

                    // Відсоток: "20% від 150=" або "20% of 150="
                    const pctMatch = text.match(/([0-9.,]+)%\s*(?:від|of)\s*([0-9.,]+)\s*=$/i);
                    if (pctMatch) {
                        const pct = parseFloat(pctMatch[1].replace(',', '.'));
                        const base = parseFloat(pctMatch[2].replace(',', '.'));
                        if (!isNaN(pct) && !isNaN(base)) {
                            const res = Math.round(pct / 100 * base * 10000000) / 10000000;
                            showMathHint(res.toString().replace('.', ','));
                            return;
                        }
                    }

                    // Звичайний арифметичний вираз
                    const match = text.match(/([0-9.,\s+\-*/()%]+)=$/);
                    if (match) {
                        let expr = match[1];
                        let sanitized = expr.replace(/\s+/g, '').replace(/,/g, '.');
                        if (/^[0-9.+\-*/()%]+$/.test(sanitized) && /[+\-*/]/.test(sanitized)) {
                            try {
                                let result = Function('"use strict";return (' + sanitized + ')')();
                                if (typeof result === 'number' && isFinite(result)) {
                                    result = Math.round(result * 10000000) / 10000000;
                                    showMathHint(result.toString().replace('.', ','));
                                }
                            } catch (err) {
                                // Ігноруємо синтаксичні помилки
                            }
                        }
                    }
                }
            }

            // === АВТОЗАМІНА СИМВОЛІВ (після введення останнього символу) ===
            if (e.inputType === 'insertText') {
                const sel2 = window.getSelection();
                if (!sel2 || !sel2.rangeCount) return;
                const node2 = sel2.getRangeAt(0).startContainer;
                if (node2.nodeType !== Node.TEXT_NODE) return;
                const off2 = sel2.getRangeAt(0).startOffset;
                const t2 = node2.textContent;

                const REPLACEMENTS = [
                    [/--$/, '—'],
                    [/->$/, '→'],
                    [/\(c\)$/i, '©'],
                    [/\(r\)$/i, '®'],
                    [/\(tm\)$/i, '™'],
                ];

                for (const [rx, sym] of REPLACEMENTS) {
                    const before = t2.substring(0, off2);
                    const m = before.match(rx);
                    if (m) {
                        const deleteCount = m[0].length;
                        // Видаляємо trigger-символи та вставляємо замінник
                        const r2 = document.createRange();
                        r2.setStart(node2, off2 - deleteCount);
                        r2.setEnd(node2, off2);
                        sel2.removeAllRanges();
                        sel2.addRange(r2);
                        document.execCommand('insertText', false, sym);
                        break;
                    }
                }
                {
                    const before = t2.substring(0, off2);
                    const powerMatch = before.match(/([0-9]+(?:[.,][0-9]+)?)\^([0-9]+)$/);
                    if (powerMatch) {
                        const base = powerMatch[1];
                        const exp = powerMatch[2];
                        const deleteCount = powerMatch[0].length;

                        // Видаляємо "base^exp" з текстового вузла
                        node2.textContent = t2.substring(0, off2 - deleteCount) + t2.substring(off2);

                        // Вставляємо base як текст + <sup>exp</sup> через DOM (без execCommand)
                        const insertPos = off2 - deleteCount;
                        const beforeText = node2.textContent.substring(0, insertPos);
                        const afterText = node2.textContent.substring(insertPos);

                        const supEl = document.createElement('sup');
                        supEl.textContent = exp;

                        // Розбиваємо текстовий вузол: [beforeText + base] [sup] [afterText]
                        node2.textContent = beforeText + base;
                        node2.after(supEl);

                        const afterNode = document.createTextNode(afterText);
                        supEl.after(afterNode);

                        // Курсор після <sup>, у afterNode
                        const nr = document.createRange();
                        nr.setStart(afterNode, 0);
                        nr.collapse(true);
                        sel2.removeAllRanges();
                        sel2.addRange(nr);
                    }
                }
            }
        });

        // === ПОЗНАЧКА CTRL+V ===
        editor.addEventListener('paste', (e) => {
            if (!document.body.classList.contains('board-mode')) return;

            // Визначаємо вертикальну позицію курсора в картці
            let markerTop = 60; // запасний варіант
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                if (rect.top !== 0) {
                    const cardRect = card.getBoundingClientRect();
                    markerTop = rect.top - cardRect.top + card.scrollTop + (rect.height / 2) - 9;
                }
            }

            // Видаляємо старі маркери для цієї ж позиції (уникаємо нагромадження)
            const existing = card.querySelectorAll('.paste-marker');
            existing.forEach(m => {
                if (Math.abs(parseInt(m.style.top) - markerTop) < 4) m.remove();
            });

            const marker = document.createElement('div');
            marker.className = 'paste-marker';
            marker.style.top = markerTop + 'px';
            marker.innerHTML = '<span>Ctrl+V</span>';
            card.appendChild(marker);

            // Перехоплюємо вставку
            e.preventDefault();

            // Перевіряємо чи є зображення в буфері обміну
            const items = (e.clipboardData || window.clipboardData).items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.startsWith('image/')) {
                        const file = items[i].getAsFile();
                        if (!file) continue;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                            const src = ev.target.result;
                            const id = Date.now();
                            const rect = card.getBoundingClientRect();
                            const x = Math.round(card.scrollLeft + rect.width / 2 - 100);
                            const y = Math.round(card.scrollTop + rect.height / 3);
                            const data = { id, src, x, y, w: 200, h: 200 };
                            const list = getPageImages();
                            list.push(data);
                            setPageImages(list);
                            saveImages();
                            const imgEl = createImageEl(data);
                            card.appendChild(imgEl);
                        };
                        reader.readAsDataURL(file);
                        return; // зображення оброблено — виходимо
                    }
                }
            }

        // === WORD COUNTER ===
        function updateWordCounter() {
            const text = editor.innerText || '';
            const trimmed = text.trim();
            const words = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
            const chars = text.replace(/\s/g, '').length;
            const el = document.getElementById('wordCounter');
            if (!el) return;
            el.textContent = langPick(
                `${words} слів · ${chars} симв.`,
                `${words} words · ${chars} chars`,
                `${words} Wörter · ${chars} Zeichen`
            );
            el.classList.toggle('visible', words > 0 || chars > 0);
        }

        editor.addEventListener('input', updateWordCounter);




        // === MATH HINT ===
        var mathHintPending = null;
        var mathHintTimeout = null;

        function showMathHint(result) {
            mathHintPending = result;
            const hint = document.getElementById('mathHint');
            const val = document.getElementById('mathHintVal');
            val.textContent = ' ' + result;

            // Position near cursor
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
                const rect = sel.getRangeAt(0).getBoundingClientRect();
                hint.style.left = Math.min(rect.left, window.innerWidth - 220) + 'px';
                hint.style.top = (rect.bottom + 6) + 'px';
            }
            hint.classList.add('visible');

            clearTimeout(mathHintTimeout);
            mathHintTimeout = setTimeout(() => hideMathHint(), 8000);
        }

        function hideMathHint() {
            mathHintPending = null;
            const hint = document.getElementById('mathHint');
            hint.classList.remove('visible');
        }

        // Confirm math result on Enter
        editor.addEventListener('keydown', (ev) => {
            if (mathHintPending !== null && ev.key === 'Enter') {
                ev.preventDefault();
                const result = mathHintPending;
                hideMathHint();
                document.execCommand('insertText', false, ' ' + result);
                saveState();
                return;
            } else if (mathHintPending !== null && ev.key !== 'Enter') {
                hideMathHint();
            }

        }, true);

        window.onload = () => {
            render();
            applyUiLanguage();
            loadFromStorage();
            renderStickers(currentPageIndex);
            renderImages(currentPageIndex);
            renderFreetexts(currentPageIndex);
            updateWordCounter();
            // Re-init pills after full layout
            updateAllPills();
        };


        // === GRID MODE: one digit/math symbol per cell ===
        (function () {
            // Characters that should be snapped into a cell (digits + common math symbols + = and space)
            const GRID_CHARS = /^[0-9+\-*/.,()%²³√±×÷≠≈∞π∂∆∇≤≥∠°′″→↔∈∉⊂⊃∩∪⊥∥∑∏∫=]$/u;

            editor.addEventListener('keydown', function (ev) {
                // Only in grid mode
                if (!isGridModeActive()) return;
                if (ev.ctrlKey || ev.metaKey || ev.altKey) return;

                // Handle Backspace: after deletion, if cursor is inside or just after a .gc span,
                // ensure cursor is placed cleanly AFTER the span (not inside it).
                if (ev.key === 'Backspace') {
                    const sel = window.getSelection();
                    if (!sel || !sel.rangeCount) return;
                    const range = sel.getRangeAt(0);

                    // Only act on collapsed cursor (no selection)
                    if (!range.collapsed) return;

                    let node = range.startContainer;
                    let offset = range.startOffset;

                    // Case 1: cursor is inside a text node inside a .gc span
                    // After the default Backspace, the span will be empty — we handle it on input event.
                    // But we need to also handle: cursor is directly inside a .gc span element node.
                    if (node.nodeType === Node.ELEMENT_NODE && node.classList && node.classList.contains('gc')) {
                        // Let the default deletion happen, then clean up on the next microtask
                        setTimeout(() => {
                            const s2 = window.getSelection();
                            if (!s2 || !s2.rangeCount) return;
                            const r2 = s2.getRangeAt(0);
                            let n2 = r2.startContainer;
                            // Walk up to find a .gc ancestor
                            let gcSpan = null;
                            let cur = n2.nodeType === Node.TEXT_NODE ? n2.parentNode : n2;
                            while (cur && cur !== editor) {
                                if (cur.classList && cur.classList.contains('gc')) { gcSpan = cur; break; }
                                cur = cur.parentNode;
                            }
                            if (gcSpan && gcSpan.textContent === '') {
                                const after = gcSpan.nextSibling;
                                const parent = gcSpan.parentNode;
                                gcSpan.remove();
                                // Place cursor at the deletion point
                                const nr = document.createRange();
                                if (after) { nr.setStartBefore(after); }
                                else { nr.setStart(parent, parent.childNodes.length); }
                                nr.collapse(true);
                                s2.removeAllRanges();
                                s2.addRange(nr);
                            }
                            editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
                        }, 0);
                        return;
                    }

                    // Case 2: cursor is in a text node — check if it's inside a .gc span
                    if (node.nodeType === Node.TEXT_NODE) {
                        let gcSpan = null;
                        let cur = node.parentNode;
                        while (cur && cur !== editor) {
                            if (cur.classList && cur.classList.contains('gc')) { gcSpan = cur; break; }
                            cur = cur.parentNode;
                        }
                        if (gcSpan) {
                            // Let default Backspace delete the character, then clean up empty span
                            setTimeout(() => {
                                if (gcSpan.textContent === '' || gcSpan.textContent === '\u200B') {
                                    const s2 = window.getSelection();
                                    const parent = gcSpan.parentNode;
                                    const prev = gcSpan.previousSibling;
                                    gcSpan.remove();
                                    // Place cursor after previous sibling or at start of parent
                                    if (s2) {
                                        const nr = document.createRange();
                                        if (prev) { nr.setStartAfter(prev); }
                                        else { nr.setStart(parent, 0); }
                                        nr.collapse(true);
                                        s2.removeAllRanges();
                                        s2.addRange(nr);
                                    }
                                }
                                editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
                            }, 0);
                            return;
                        }
                    }

                    // Case 3: cursor is between nodes — if previous sibling is a .gc span, delete it entirely
                    if (node.nodeType === Node.ELEMENT_NODE && offset > 0) {
                        const prevNode = node.childNodes[offset - 1];
                        if (prevNode && prevNode.classList && prevNode.classList.contains('gc')) {
                            ev.preventDefault();
                            prevNode.remove();
                            editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
                            return;
                        }
                    }
                    return; // let default Backspace handle everything else
                }

                // Handle Enter: insert a clean <br> so the new line has no inherited .gc indentation
                if (ev.key === 'Enter') {
                    if (ev.defaultPrevented) return; /* collab-обробник вже обробив Enter — не втручаємось */
                    /* Учень: Enter у своїй зоні — дозволяємо браузеру обробити стандартно */
                    if (window._collabRole === 'student') return;
                    ev.preventDefault();
                    const sel = window.getSelection();
                    if (!sel || !sel.rangeCount) return;
                    const range = sel.getRangeAt(0);
                    range.deleteContents();

                    const br = document.createElement('br');
                    // Ensure cursor ends up in a plain text node after the <br>
                    const anchor = document.createTextNode('');
                    range.insertNode(anchor);
                    range.insertNode(br);

                    const nr = document.createRange();
                    nr.setStart(anchor, 0);
                    nr.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(nr);

                    editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertParagraph' }));
                    return;
                }

                // Only single printable chars (not Ctrl/Alt combos, not special keys)
                if (!ev.key || ev.key.length !== 1) return;

                // Move cursor out of any current .gc span BEFORE checking GRID_CHARS
                // This prevents Spaces or regular letters from being typed inside a centered grid cell.
                // IMPORTANT: cursor must land in a TEXT NODE — element-node context causes browser
                // to misalign/overwrite content when it inserts non-grid characters natively.
                {
                    const sel0 = window.getSelection();
                    if (sel0 && sel0.rangeCount) {
                        const r0 = sel0.getRangeAt(0);
                        let cur = r0.startContainer;
                        if (cur.nodeType === Node.TEXT_NODE) cur = cur.parentNode;
                        while (cur && cur !== editor) {
                            if (cur.classList && cur.classList.contains('gc')) {
                                // Find or create a text node right after the span
                                let anchor = cur.nextSibling;
                                if (!anchor || anchor.nodeType !== Node.TEXT_NODE) {
                                    anchor = document.createTextNode('');
                                    cur.after(anchor);
                                }
                                const nr = document.createRange();
                                nr.setStart(anchor, 0);
                                nr.collapse(true);
                                sel0.removeAllRanges();
                                sel0.addRange(nr);
                                break;
                            }
                            cur = cur.parentNode;
                        }
                    }
                }

                // Пробіл — вставляємо вручну як чистий текстовий вузол
                if (ev.key === ' ') {
                    ev.preventDefault();
                    const sel2 = window.getSelection();
                    if (!sel2 || !sel2.rangeCount) return;
                    const r2 = sel2.getRangeAt(0);
                    r2.deleteContents();
                    const spaceNode = document.createTextNode('\u00A0');
                    r2.insertNode(spaceNode);
                    const nr2 = document.createRange();
                    nr2.setStart(spaceNode, 1);
                    nr2.collapse(true);
                    sel2.removeAllRanges();
                    sel2.addRange(nr2);
                    editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ' ' }));
                    return;
                }

                if (!GRID_CHARS.test(ev.key)) return;

                ev.preventDefault();

                insertGcSpan(ev.key);

                // Trigger save debounce (don't pass '=' as data to avoid triggering math hint)
                editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ev.key === '=' ? null : ev.key }));
            }, false);

            // === MOBILE FIX: virtual keyboards fire beforeinput, not a reliable keydown ===
            // On physical keyboards keydown calls preventDefault() → beforeinput never fires.
            // On touch keyboards keydown gives key='Unidentified' → no preventDefault() →
            // beforeinput fires with the real character, so we catch it here.
            editor.addEventListener('beforeinput', function (ev) {
                if (!isGridModeActive()) return;

                // Only plain text insertion from the virtual keyboard
                if (ev.inputType !== 'insertText') return;

                const ch = ev.data;
                if (!ch) return;

                // Move cursor out of any current .gc span BEFORE checking GRID_CHARS
                const sel0 = window.getSelection();
                if (sel0 && sel0.rangeCount) {
                    const r0 = sel0.getRangeAt(0);
                    let cur = r0.startContainer;
                    if (cur.nodeType === Node.TEXT_NODE) cur = cur.parentNode;
                    while (cur && cur !== editor) {
                        if (cur.classList && cur.classList.contains('gc')) {
                            // Find or create a text node right after the span
                            let anchor = cur.nextSibling;
                            if (!anchor || anchor.nodeType !== Node.TEXT_NODE) {
                                anchor = document.createTextNode('');
                                cur.after(anchor);
                            }
                            const nr = document.createRange();
                            nr.setStart(anchor, 0);
                            nr.collapse(true);
                            sel0.removeAllRanges();
                            sel0.addRange(nr);
                            break;
                        }
                        cur = cur.parentNode;
                    }
                }

                if (ch.length > 1) {
                    ev.preventDefault();
                    insertGridMixedText(ch, GRID_CHARS);
                    editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
                    return;
                }

                if (!GRID_CHARS.test(ch)) {
                    // Пробіл на мобільному — вставляємо вручну
                    if (ch === ' ') {
                        ev.preventDefault();
                        const sel2 = window.getSelection();
                        if (!sel2 || !sel2.rangeCount) return;
                        const r2 = sel2.getRangeAt(0);
                        r2.deleteContents();
                        const spaceNode = document.createTextNode('\u00A0');
                        r2.insertNode(spaceNode);
                        const nr2 = document.createRange();
                        nr2.setStart(spaceNode, 1);
                        nr2.collapse(true);
                        sel2.removeAllRanges();
                        sel2.addRange(nr2);
                        editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ' ' }));
                    }
                    return;
                }

                ev.preventDefault();

                insertGcSpan(ch);

                editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: ch === '=' ? null : ch }));
            }, false);

            editor.addEventListener('paste', function (ev) {
                if (!isGridModeActive()) return;
                const text = (ev.clipboardData || window.clipboardData)?.getData('text/plain');
                if (!text) return;
                ev.preventDefault();
                insertGridMixedText(text, GRID_CHARS);
                editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }));
            }, true);
        })();

        // === TOOLBAR: перший тап ховає клавіатуру, другий виконує дію ===
        (function () {
            const toolbar = document.getElementById('boardToolbar');
            const editorEl = document.getElementById('boardEditor');
            if (!toolbar || !editorEl) return;

            toolbar.addEventListener('touchstart', function (e) {
                if (document.activeElement === editorEl) {
                    // Клавіатура відкрита — блокуємо цей тап, лише ховаємо клавіатуру
                    e.preventDefault();
                    e.stopPropagation();
                    editorEl.blur();
                }
            }, { capture: true });
        })();

        // === HELP MODAL ===
        function toggleHelpModal() {
            const modal = document.getElementById('helpModal');
            modal.classList.toggle('visible');
        }
        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('helpModal');
                if (modal.classList.contains('visible')) modal.classList.remove('visible');
            }
        });

        async function boardCopyImage(e) {
            e.stopPropagation();

            const btn = document.getElementById('ssCopyBtn');
            const origHTML = btn.innerHTML;
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';

            try {
                const tempCanvas = await renderCardToCanvas();
                tempCanvas.toBlob(async (blob) => {
                    try {
                        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                        const t = document.getElementById('toast');
                        t.textContent = '✓ PNG скопійовано!';
                        t.classList.add('show');
                        setTimeout(() => { t.classList.remove('show'); t.textContent = 'Скопійовано!'; }, 2500);
                    } catch (err) {
                        showOcrToast((uiText[state.lang] || uiText.ua).alertCopyNotSupported, '#f59e0b');
                    }
                    btn.innerHTML = origHTML;
                }, 'image/png');
            } catch (err) {
                console.error('boardCopyImage error:', err);
                btn.innerHTML = origHTML;
            }
        }

        async function boardDownloadImage(e) {
            e.stopPropagation();

            const btn = document.getElementById('ssDownloadBtn');
            const origHTML = btn.innerHTML;
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>';

            try {
                const tempCanvas = await renderCardToCanvas();
                const link = document.createElement('a');
                // Build a filename like "зошит-2026-05-03.png"
                const dateStr = new Date().toISOString().slice(0, 10);
                link.download = `зошит-${dateStr}.png`;
                link.href = tempCanvas.toDataURL('image/png');
                link.click();

                const t = document.getElementById('toast');
                t.textContent = '✓ Зображення збережено у вашій папці завантажені.';
                t.classList.add('show');
                setTimeout(() => { t.classList.remove('show'); t.textContent = 'Скопійовано!'; }, 2500);
            } catch (err) {
                console.error('boardDownloadImage error:', err);
                showOcrToast((uiText[state.lang] || uiText.ua).alertSaveError, '#ef4444');
            }

            btn.innerHTML = origHTML;
        }

            // === YOUTUBE FLOATING WINDOW ===
            const clipText = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
            const ytMatch = clipText.trim().match(
                /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/
            );
            if (ytMatch) {
                const videoId = ytMatch[1];
                const id = Date.now();
                const cardRect = card.getBoundingClientRect();
                const x = Math.round(card.scrollLeft + cardRect.width / 2 - 210);
                const y = Math.round(card.scrollTop + cardRect.height / 4);
                const data = { id, videoId, x, y, w: 420 };
                
                const list = getPageYtWindows();
                list.push(data);
                setPageYtWindows(list);
                saveYtWindows();
                
                createYoutubeFloatWindow(data, card);
                return; // YouTube оброблено — виходимо
            }

            // === HTML / iFrame FLOATING WINDOW ===
            const htmlMatch = clipText.trim().match(/^<iframe/i) || clipText.trim().match(/^<(div|script|style|blockquote|a|table|form|html|body|center|canvas|svg|audio|video)\b/i);
            if (htmlMatch) {
                const id = Date.now();
                const cardRect = card.getBoundingClientRect();
                const x = Math.round(card.scrollLeft + cardRect.width / 2 - 210);
                const y = Math.round(card.scrollTop + cardRect.height / 4);
                const data = { id, htmlContent: clipText.trim(), x, y, w: 420 };
                
                const list = getPageYtWindows();
                list.push(data);
                setPageYtWindows(list);
                saveYtWindows();
                
                createYoutubeFloatWindow(data, card);
                return; // HTML оброблено — виходимо
            }

            // Переконуємось, що курсор в редакторі
            let pastesel = window.getSelection();
            if (!pastesel.rangeCount || !editor.contains(pastesel.anchorNode)) {
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                pastesel.removeAllRanges();
                pastesel.addRange(range);
            }

            // Спробуємо отримати HTML з буфера — для збереження списків
            const htmlData = (e.clipboardData || window.clipboardData).getData('text/html');
            if (htmlData) {
                // Парсимо HTML і перевіряємо чи є списки
                const tmp = document.createElement('div');
                tmp.innerHTML = htmlData;
                const hasLists = tmp.querySelector('ol, ul');
                if (hasLists) {
                    // Витягуємо тільки OL/UL/LI структуру, очищуємо зайве
                    function extractLists(node, out) {
                        Array.from(node.childNodes).forEach(function(child) {
                            if (child.nodeType === Node.ELEMENT_NODE) {
                                const tag = child.tagName;
                                if (tag === 'OL' || tag === 'UL') {
                                    const listEl = document.createElement(tag);
                                    // Зберігаємо start для OL
                                    if (tag === 'OL' && child.getAttribute('start')) {
                                        listEl.setAttribute('start', child.getAttribute('start'));
                                    }
                                    Array.from(child.querySelectorAll('li')).forEach(function(li) {
                                        const liEl = document.createElement('li');
                                        liEl.textContent = li.textContent.trim();
                                        listEl.appendChild(liEl);
                                    });
                                    out.push(listEl.outerHTML);
                                } else if (tag === 'LI') {
                                    // LI без батьківського OL/UL — вставляємо як текст
                                    out.push('<div>' + child.textContent.trim() + '</div>');
                                } else {
                                    extractLists(child, out);
                                }
                            } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
                                out.push('<div>' + child.textContent.trim() + '</div>');
                            }
                        });
                    }
                    const parts = [];
                    extractLists(tmp, parts);
                    if (parts.length) {
                        document.execCommand('insertHTML', false, parts.join(''));
                        saveState();
                        return;
                    }
                }
            }

            // Fallback: чистий текст
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            if (!text) return;

            // Перевіряємо чи текст схожий на нумерований список (1. ..., 2. ...)
            const numberedListRe = /^(\d+)[.)]\s+/;
            const lines = text.split('\n');
            const isNumberedList = lines.filter(l => l.trim()).every(l => numberedListRe.test(l.trim()));

            if (isNumberedList) {
                // Будуємо <ol> зі збереженням нумерації
                const firstNum = parseInt(lines.find(l => l.trim()).trim().match(numberedListRe)[1], 10);
                const ol = document.createElement('ol');
                if (firstNum !== 1) ol.setAttribute('start', firstNum);
                lines.forEach(function(line) {
                    const trimmed = line.trim();
                    if (!trimmed) return;
                    const li = document.createElement('li');
                    li.textContent = trimmed.replace(numberedListRe, '');
                    ol.appendChild(li);
                });
                document.execCommand('insertHTML', false, ol.outerHTML);
            } else {
                // Звичайний текст — кожен рядок у окремий <div>, порожні → <div><br></div>
                const html = lines.map(line => {
                    const t = line.trimEnd();
                    if (!t) return '<div><br></div>';
                    const esc = t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                    return '<div>' + esc + '</div>';
                }).join('');
                document.execCommand('insertHTML', false, html);
            }
            saveState();
        });

        // === RENDER (перенесено з media-windows.js: викликається на topi-рівні drawing.js) ===
        function render() {
            const [y, m, d] = dateSelect.value.split('-');
            const dayIdx = parseInt(d);
            const monthIdx = parseInt(m) - 1;

            const isCleanMode = state.type === 'clean';
            const displayDateEl = document.getElementById('displayDate');
            const displayTypeEl = document.getElementById('displayType');

            if (isCleanMode) {
                displayDateEl.style.visibility = 'hidden';
                displayTypeEl.style.visibility = 'hidden';
            } else {
                displayDateEl.style.visibility = '';
                displayTypeEl.style.visibility = '';
                if (state.lang === 'ua') {
                    let text = `${uaDays[dayIdx]} ${uaMonths[monthIdx]}`;
                    displayDateEl.textContent = text.charAt(0).toUpperCase() + text.slice(1);
                    displayTypeEl.textContent = typeLabels.ua[state.type] || typeLabels.ua.class;
                } else if (state.lang === 'de') {
                    const dateObj = new Date(y, m - 1, d);
                    const weekday = deWeekdays[dateObj.getDay()];
                    displayDateEl.textContent = `${weekday}, den ${deOrdinals[dayIdx]} ${deMonths[monthIdx]}`;
                    displayTypeEl.textContent = typeLabels.de[state.type] || typeLabels.de.class;
                } else {
                    const dateObj = new Date(y, m - 1, d);
                    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
                    displayDateEl.textContent = `${weekday}, the ${enOrdinals[dayIdx]} of ${monthName}`;
                    displayTypeEl.textContent = typeLabels.en[state.type] || typeLabels.en.class;
                }
            }
            card.className = `card ${state.bg} ${state.font}`;
            applyUiLanguage();
            updateMathToolAvailability();
            syncCanvasSize();
        }
