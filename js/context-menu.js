    (function () {
        var menu = document.getElementById('editorContextMenu');
        var editor = document.getElementById('boardEditor');
        var _savedRange = null;
        var _clickPos = { x: 0, y: 0 };

        function isEditorActive() {
            return document.body.classList.contains('board-mode');
        }

        function hideMenu() {
            menu.classList.remove('visible');
            menu.style.display = '';
        }

        function showMenu(x, y) {
            // reset animation
            menu.style.animation = 'none';
            menu.style.display = 'flex';
            menu.classList.add('visible');
            requestAnimationFrame(function() {
                menu.style.animation = '';
            });

            var vw = window.innerWidth, vh = window.innerHeight;
            var mw = menu.offsetWidth || 200, mh = menu.offsetHeight || 200;
            var left = (x + mw > vw - 8) ? vw - mw - 8 : x;
            var top  = (y + mh > vh - 8) ? y - mh : y;
            menu.style.left = Math.max(8, left) + 'px';
            menu.style.top  = Math.max(8, top)  + 'px';

            // update disabled state
            var sel = window.getSelection();
            var hasText = sel && sel.toString().trim().length > 0;
            document.getElementById('ctxCopy').disabled = !hasText;
            document.getElementById('ctxCut').disabled  = !hasText;

            var trLabel = document.getElementById('ctxTranslate');
            if (trLabel) {
                var trLastText = trLabel.childNodes[trLabel.childNodes.length - 1];
                if (trLastText && trLastText.nodeType === 3)
                    trLastText.textContent = ' ' + (hasText ? (trLabel._labelSel || 'Перекласти виділене') : (trLabel._labelDefault || 'Перекласти'));
            }

            var tlLabel = document.getElementById('ctxTranslit');
            if (tlLabel) {
                var tlLastText = tlLabel.childNodes[tlLabel.childNodes.length - 1];
                if (tlLastText && tlLastText.nodeType === 3)
                    tlLastText.textContent = ' ' + (hasText ? (tlLabel._labelSel || 'Транслітерувати виділене') : (tlLabel._labelDefault || 'Транслітерація'));
                tlLabel.style.display = hasText ? '' : 'none';
            }
            var tlSep = document.getElementById('ctxTranslitSep');
            if (tlSep) tlSep.style.display = hasText ? '' : 'none';

            var qrLabel = document.getElementById('ctxQr').querySelector
                ? document.getElementById('ctxQr') : null;
            if (qrLabel) {
                var lastText = qrLabel.childNodes[qrLabel.childNodes.length - 1];
                if (lastText && lastText.nodeType === 3)
                    lastText.textContent = ' ' + (hasText ? (qrLabel._labelSel || 'Генерувати QR з виділеного') : (qrLabel._labelDefault || 'Генерувати QR'));
            }

            // save selection range so paste/qr can restore focus
            if (sel && sel.rangeCount) {
                _savedRange = sel.getRangeAt(0).cloneRange();
            }

            var lang = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
            var ctxQuizBtn = document.getElementById('ctxQuiz');
            if (ctxQuizBtn) {
                ctxQuizBtn.style.display = hasText ? '' : 'none';
                // Also hide/show the separator before quiz
                var quizSep = ctxQuizBtn.previousElementSibling;
                if (quizSep && quizSep.classList.contains('ctx-sep')) {
                    quizSep.style.display = hasText ? '' : 'none';
                }
            }

            var ctxTableBtn = document.getElementById('ctxTable');
            if (ctxTableBtn) {
                var lastText = ctxTableBtn.childNodes[ctxTableBtn.childNodes.length - 1];
                if (lastText && lastText.nodeType === 3) {
                    lastText.textContent = ' ' + (lang === 'en' ? 'Insert table' : lang === 'de' ? 'Tabelle einfügen' : 'Вставити таблицю');
                }
            }

            if (ctxQuizBtn) {
                var quizLastText = ctxQuizBtn.childNodes[ctxQuizBtn.childNodes.length - 1];
                if (quizLastText && quizLastText.nodeType === 3) {
                    quizLastText.textContent = ' ' + (lang === 'en' ? 'Generate quiz' : lang === 'de' ? 'Test generieren' : 'Згенерувати тест');
                }
            }
        }

        // intercept contextmenu only inside editor when board-mode is on
        document.addEventListener('contextmenu', function(e) {
            if (!isEditorActive()) return;
            if (!editor.contains(e.target) && e.target !== editor) return;
            e.preventDefault();
            // зберігаємо координати відносно картки для вставки стікера
            var cardEl = document.getElementById('notebookCard');
            if (cardEl) {
                var rect = cardEl.getBoundingClientRect();
                _clickPos.x = e.clientX - rect.left;
                _clickPos.y = e.clientY - rect.top + cardEl.scrollTop;
            }
            showMenu(e.clientX, e.clientY);
        });

        // hide on outside click / scroll / Escape
        document.addEventListener('pointerdown', function(e) {
            if (!menu.contains(e.target)) hideMenu();
        }, true);
        document.addEventListener('scroll', hideMenu, true);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') hideMenu();
        });

        window.ctxAction = function(action) {
            hideMenu();

            if (action === 'copy') {
                document.execCommand('copy');
                return;
            }

            if (action === 'cut') {
                document.execCommand('cut');
                return;
            }

            if (action === 'paste') {
                // restore focus to editor
                if (_savedRange) {
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(_savedRange);
                }
                navigator.clipboard.readText().then(function(text) {
                    document.execCommand('insertText', false, text);
                }).catch(function() {
                    document.execCommand('paste');
                });
                return;
            }

            if (action === 'sticker') {
                if (typeof window.addStickerToPage === 'function') {
                    window.addStickerToPage(_clickPos.x, _clickPos.y);
                }
                return;
            }

            if (action === 'translate') {
                var selText = '';
                var sel = window.getSelection();
                if (sel) selText = sel.toString().trim();
                if (typeof openTranslateModal === 'function') {
                    openTranslateModal(selText, _savedRange);
                }
                return;
            }

            if (action === 'translit') {
                var selTextTl = '';
                var selTl = window.getSelection();
                if (selTl) selTextTl = selTl.toString().trim();
                if (selTextTl && typeof openTranslitModal === 'function') {
                    openTranslitModal(selTextTl, _savedRange);
                }
                return;
            }

            if (action === 'qr') {
                var selText = '';
                var sel = window.getSelection();
                if (sel) selText = sel.toString().trim();

                if (typeof openQrModal === 'function') {
                    openQrModal();
                    if (selText) {
                        setTimeout(function() {
                            var inp = document.getElementById('qrInput');
                            if (inp) {
                                inp.value = selText;
                                inp.dispatchEvent(new Event('input'));
                            }
                        }, 80);
                    }
                }
            }

            if (action === 'table') {
                if (typeof openTablePicker === 'function') {
                    openTablePicker(_savedRange, _clickPos.x, _clickPos.y);
                }
                return;
            }

            if (action === 'embed') {
                if (typeof openEmbedModal === 'function') {
                    openEmbedModal(action, _clickPos.x, _clickPos.y);
                }
                return;
            }

            if (action === 'quiz') {
                var selText = '';
                var sel = window.getSelection();
                if (sel) selText = sel.toString().trim();
                if (selText && typeof mfbOpenQuizMaker === 'function') {
                    mfbOpenQuizMaker();
                }
                return;
            }

            if (action === 'list') {
                _listSavedRange = _savedRange;
                doCtxListInsert('ol');
                return;
            }

        };

        /* ─────────────────────────────────────────
           LIST PICKER — відкриває підменю вибору типу
        ───────────────────────────────────────── */
        var listPicker = document.getElementById('ctxListPicker');
        var _listSavedRange = null;

        function openListPicker(savedRange, menuEl) {
            _listSavedRange = savedRange;
            listPicker.classList.add('visible');
            listPicker.style.animation = 'none';
            requestAnimationFrame(function() { listPicker.style.animation = ''; });

            var mx = parseFloat(menuEl.style.left) || 0;
            var my = parseFloat(menuEl.style.top)  || 0;
            var vw = window.innerWidth, vh = window.innerHeight;
            var pw = listPicker.offsetWidth  || 190;
            var ph = listPicker.offsetHeight || 90;
            var left = (mx + pw > vw - 8) ? vw - pw - 8 : mx;
            var top  = (my + ph > vh - 8) ? my - ph : my;
            listPicker.style.left = Math.max(8, left) + 'px';
            listPicker.style.top  = Math.max(8, top)  + 'px';
        }

        function hideListPicker() {
            if (listPicker) listPicker.classList.remove('visible');
        }

        /* Викликається з onclick кнопок у picker-і */
        window.doCtxListInsert = function(type) {
            if (listPicker) hideListPicker();
            var savedRange = _listSavedRange;
            if (!savedRange) return;

            /* Клонуємо вміст, щоб зрозуміти рядки */
            var frag = savedRange.cloneContents();
            var tmp = document.createElement('div');
            tmp.appendChild(frag);
            /* Вставляємо \n перед кожним блочним елементом і після <br> */
            tmp.querySelectorAll('br').forEach(function(br) {
                br.replaceWith('\n');
            });
            tmp.querySelectorAll('div, p').forEach(function(block) {
                block.prepend('\n');
            });
            var rawText = tmp.textContent || savedRange.toString() || '';
            var lines = rawText.split('\n').filter(function(l) { return l.trim(); });
            if (!lines.length) lines = [rawText.trim() || ' '];

            /* Видаляємо виділений вміст і вставляємо список */
            var range = savedRange.cloneRange();
            range.deleteContents();

            var list = document.createElement(type);
            lines.forEach(function(line) {
                var li = document.createElement('li');
                li.textContent = line.trim();
                list.appendChild(li);
            });
            range.insertNode(list);

            /* Курсор після списку */
            var sel = window.getSelection();
            var after = document.createRange();
            after.setStartAfter(list);
            after.collapse(true);
            sel.removeAllRanges();
            sel.addRange(after);

            if (typeof saveState === 'function') saveState();
        };

        /* Закриваємо picker при кліку за його межами */
        document.addEventListener('pointerdown', function(e) {
            if (listPicker && listPicker.classList.contains('visible') && !listPicker.contains(e.target)) {
                hideListPicker();
            }
        }, true);

        /* ─────────────────────────────────────────
           LINK POPUP — запитує URL і вставляє <a>
        ───────────────────────────────────────── */
        var linkPopup  = document.getElementById('ctxLinkPopup');
        var linkInput  = document.getElementById('ctxLinkInput');
        var _linkSavedRange = null;

        function openLinkPopup(savedRange, menuEl) {
            _linkSavedRange = savedRange;
            linkInput.value = '';
            linkPopup.classList.add('visible');
            linkPopup.style.animation = 'none';
            requestAnimationFrame(function() { linkPopup.style.animation = ''; });

            var mx = parseFloat(menuEl.style.left) || 0;
            var my = parseFloat(menuEl.style.top)  || 0;
            var vw = window.innerWidth, vh = window.innerHeight;
            var pw = linkPopup.offsetWidth  || 268;
            var ph = linkPopup.offsetHeight || 110;
            var left = (mx + pw > vw - 8) ? vw - pw - 8 : mx;
            var top  = (my + ph > vh - 8) ? my - ph : my;
            linkPopup.style.left = Math.max(8, left) + 'px';
            linkPopup.style.top  = Math.max(8, top)  + 'px';

            setTimeout(function() { linkInput.focus(); }, 80);
        }

        window.closeCtxLinkPopup = function() {
            linkPopup.classList.remove('visible');
        };

        window.confirmCtxLink = function() {
            var url = linkInput.value.trim();
            if (!url) { linkInput.focus(); return; }
            window.closeCtxLinkPopup();

            var savedRange = _linkSavedRange;
            if (!savedRange) return;

            /* Нормалізуємо URL */
            if (!/^https?:\/\//i.test(url) && !/^mailto:/i.test(url)) {
                url = 'https://' + url;
            }

            var editor = document.getElementById('boardEditor');

            /* Нормалізуємо голі текстові вузли та <br> безпосередньо в редакторі —
               загортаємо їх у <div>, щоб getLineBlock завжди знаходив блок-батько */
            Array.from(editor.childNodes).forEach(function(node) {
                if (node.nodeType === Node.TEXT_NODE ||
                    (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR')) {
                    var div = document.createElement('div');
                    editor.insertBefore(div, node);
                    div.appendChild(node);
                }
            });

            /* Збираємо рядки і блоки що потрапили у виділення */
            function getLineBlock(node) {
                while (node && node !== editor) {
                    if (node.nodeType === Node.ELEMENT_NODE &&
                        (node.tagName === 'DIV' || node.tagName === 'P') &&
                        node.parentNode === editor) return node;
                    node = node.parentNode;
                }
                return null;
            }

            var startBlock = getLineBlock(savedRange.startContainer);
            var endBlock   = getLineBlock(savedRange.endContainer);
            var isMultiBlock = startBlock && endBlock && startBlock !== endBlock;

            if (isMultiBlock) {
                /* Збираємо всі блоки у виділенні */
                var blocks = [];
                var cur = startBlock;
                while (cur) {
                    blocks.push(cur);
                    if (cur === endBlock) break;
                    cur = cur.nextSibling;
                }

                /* Для кожного блоку створюємо окремий <a> і замінюємо вміст */
                blocks.forEach(function(block, idx) {
                    var text = block.textContent.trim();
                    if (!text) return;
                    var a = document.createElement('a');
                    a.href = url;
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.textContent = text;
                    block.innerHTML = '';
                    block.appendChild(a);
                });

                /* Курсор після останнього блоку */
                var sel = window.getSelection();
                var after = document.createRange();
                after.setStartAfter(endBlock);
                after.collapse(true);
                sel.removeAllRanges();
                sel.addRange(after);
            } else {
                /* Один рядок — стара логіка */
                var selectedText = savedRange.toString().trim();
                var range = savedRange.cloneRange();
                range.deleteContents();

                var a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = selectedText || url;

                range.insertNode(a);

                var sel = window.getSelection();
                var after = document.createRange();
                after.setStartAfter(a);
                after.collapse(true);
                sel.removeAllRanges();
                sel.addRange(after);
            }

            if (typeof saveState === 'function') saveState();
        };

        /* Enter у полі = підтвердити, Escape = закрити */
        if (linkInput) {
            linkInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter')  { e.preventDefault(); window.confirmCtxLink(); }
                if (e.key === 'Escape') { e.preventDefault(); window.closeCtxLinkPopup(); }
            });
        }

        /* Закриваємо link popup при кліку за його межами */
        document.addEventListener('pointerdown', function(e) {
            if (linkPopup.classList.contains('visible') && !linkPopup.contains(e.target)) {
                window.closeCtxLinkPopup();
            }
        }, true);

        /* Відкриваємо для mini format bar */
        window._mfbOpenLinkPopup = function(savedRange, fakeAnchor) {
            openLinkPopup(savedRange, fakeAnchor);
        };

    })();
