    // ── Mini format bar logic ──
    (function () {
        var bar = document.getElementById('miniFormatBar');
        var hideTimer = null;

        function isDesktop() {
            return window.innerWidth > 900 && !('ontouchstart' in window);
        }
        function isBoardMode() {
            return document.body.classList.contains('board-mode');
        }
        function isCollabActive() {
            return window._collabRole === 'teacher' || window._collabRole === 'student';
        }
        function shouldShow() {
            return isDesktop() && isBoardMode() && !isCollabActive();
        }

        function positionBar(rect) {
            var barH = bar.offsetHeight || 44;
            // bar is position:fixed → use viewport coords (no scrollY offset)
            var top = rect.top - barH - 10;
            if (top < 8) top = rect.bottom + 10;
            var centerX = rect.left + rect.width / 2;
            var barW = bar.offsetWidth || 300;
            var minLeft = barW / 2 + 8;
            var maxLeft = window.innerWidth - barW / 2 - 8;
            centerX = Math.max(minLeft, Math.min(maxLeft, centerX));
            bar.style.top  = top + 'px';
            bar.style.left = centerX + 'px';
        }

        function syncActiveStates() {
            // Bold / Underline / Strike
            var map = { mfbBold: 'bold', mfbUnderline: 'underline', mfbStrike: 'strikethrough' };
            Object.keys(map).forEach(function(id) {
                var btn = document.getElementById(id);
                if (!btn) return;
                try { btn.classList.toggle('active', document.queryCommandState(map[id])); } catch(e) {}
            });
            // Alignment
            var sel = window.getSelection();
            var align = '';
            var editor = document.getElementById('boardEditor');
            if (sel && sel.rangeCount && editor) {
                var node = sel.getRangeAt(0).startContainer;
                if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
                while (node && node !== editor) {
                    // Шукаємо inline style або style attribute — не computedStyle,
                    // бо computedStyle успадковує і може повернути 'start' замість 'left'
                    if (node.style && node.style.textAlign) {
                        align = node.style.textAlign;
                        break;
                    }
                    node = node.parentNode;
                }
                // Якщо inline style не знайдено — fallback на computedStyle першого блоку
                if (!align && sel.rangeCount) {
                    var n2 = sel.getRangeAt(0).startContainer;
                    if (n2.nodeType === Node.TEXT_NODE) n2 = n2.parentNode;
                    while (n2 && n2 !== editor) {
                        if (n2.nodeType === Node.ELEMENT_NODE &&
                            (n2.tagName === 'DIV' || n2.tagName === 'P') &&
                            n2.parentNode === editor) {
                            var ta = window.getComputedStyle(n2).textAlign;
                            align = (ta === 'start' || !ta) ? 'left' : ta;
                            break;
                        }
                        n2 = n2.parentNode;
                    }
                }
            }
            document.getElementById('mfbLeft')  ?.classList.toggle('active', !align || align === 'left' || align === 'start');
            document.getElementById('mfbCenter')?.classList.toggle('active', align === 'center');
            document.getElementById('mfbRight') ?.classList.toggle('active', align === 'right' || align === 'end');
            // Sup / Sub
            var inSup = false, inSub = false;
            if (sel && sel.rangeCount && editor) {
                var node2 = sel.getRangeAt(0).startContainer;
                if (node2.nodeType === Node.TEXT_NODE) node2 = node2.parentNode;
                while (node2 && node2 !== editor) {
                    var tag = node2.nodeName && node2.nodeName.toLowerCase();
                    if (tag === 'sup') inSup = true;
                    if (tag === 'sub') inSub = true;
                    node2 = node2.parentNode;
                }
            }
            document.getElementById('mfbSup')?.classList.toggle('active', inSup);
            document.getElementById('mfbSub')?.classList.toggle('active', inSub);
        }

        function showBar(rect) {
            clearTimeout(hideTimer);
            bar.classList.add('mfb-visible');
            positionBar(rect);
            syncActiveStates();
            // Зберігаємо rect бару для mfbAnchorEl (до mousedown)
            requestAnimationFrame(function() {
                _mfbBarRect = bar.getBoundingClientRect();
            });
        }

        function hideBar() {
            hideTimer = setTimeout(function() {
                bar.classList.remove('mfb-visible');
            }, 200);
        }

        document.addEventListener('selectionchange', function () {
            if (!shouldShow()) { bar.classList.remove('mfb-visible'); return; }
            var sel = window.getSelection();
            if (!sel || sel.isCollapsed || !sel.rangeCount) { hideBar(); return; }
            // Перевіряємо що виділення всередині редактора або таблиці на картці
            var editor = document.getElementById('boardEditor');
            var card   = document.getElementById('notebookCard');
            var anchor = sel.anchorNode;
            if (!anchor) { hideBar(); return; }
            var container = anchor.nodeType === Node.TEXT_NODE ? anchor.parentNode : anchor;
            var inEditor = editor && editor.contains(container);
            var inTable  = card   && card.querySelector('.nb-floating-table') && card.contains(container);
            if (!inEditor && !inTable) { hideBar(); return; }

            var range = sel.getRangeAt(0);
            // При багаторядковому виділенні getBoundingClientRect дає rect всього
            // діапазону — top може бути посередині. Беремо рядок з найменшим top.
            var rects = range.getClientRects();
            var rect;
            if (rects && rects.length > 0) {
                rect = rects[0];
                for (var ri = 1; ri < rects.length; ri++) {
                    if (rects[ri].top < rect.top) rect = rects[ri];
                }
            } else {
                rect = range.getBoundingClientRect();
            }
            if (!rect || (rect.width === 0 && rect.height === 0)) { hideBar(); return; }
            showBar(rect);
        });

        // Не ховаємо панель при кліку на неї; після форматування — оновлюємо позицію
        bar.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        bar.addEventListener('mouseup', function() {
            // Після того як браузер переобчислить layout — оновлюємо позицію бару
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    var sel = window.getSelection();
                    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
                    var range = sel.getRangeAt(0);
                    var rects = range.getClientRects();
                    var rect;
                    if (rects && rects.length > 0) {
                        rect = rects[0];
                        for (var ri = 1; ri < rects.length; ri++) {
                            if (rects[ri].top < rect.top) rect = rects[ri];
                        }
                    } else {
                        rect = range.getBoundingClientRect();
                    }
                    if (rect && (rect.width > 0 || rect.height > 0)) {
                        positionBar(rect);
                        _mfbBarRect = bar.getBoundingClientRect();
                    }
                    syncActiveStates();
                });
            });
        });
        bar.addEventListener('mouseenter', function() { clearTimeout(hideTimer); });
        bar.addEventListener('mouseleave', function() {
            var sel = window.getSelection();
            if (!sel || sel.isCollapsed) hideBar();
        });

        /* ── Зберігаємо range при кожній зміні виділення ──
           Snapshot береться заздалегідь, бо до mousedown на кнопці
           selection може вже змінитись або bar сховатись. */
        var _mfbRange = null;
        var _mfbBarRect = null;

        document.addEventListener('selectionchange', function() {
            var sel = window.getSelection();
            if (sel && !sel.isCollapsed && sel.rangeCount) {
                _mfbRange = sel.getRangeAt(0).cloneRange();
            }
        });

        /* Повертає псевдо-елемент з координатами під баром */
        function mfbAnchorEl() {
            var r = _mfbBarRect || bar.getBoundingClientRect();
            return { style: { left: r.left + 'px', top: (r.bottom + 6) + 'px' } };
        }

        /* Витягуємо рядки зі складного HTML.
           Беремо textContent кожного прямого дочірнього блоку редактора
           що потрапив у виділення. */
        function mfbExtractLines(range, editor) {
            var lines = [];
            if (!editor) {
                var t = range.toString().trim();
                return t ? t.split('\n').map(function(l){return l.trim();}).filter(Boolean) : [' '];
            }
            var children = Array.from(editor.childNodes);
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                // Будуємо range для цього дочірнього вузла і перевіряємо перетин
                try {
                    var childRange = document.createRange();
                    childRange.selectNode(child);
                    // Перетин є якщо: початок виділення <= кінець блоку
                    //                 І кінець виділення >= початок блоку
                    var startBeforeEnd = range.compareBoundaryPoints(Range.START_TO_END, childRange) > 0;
                    var endAfterStart  = range.compareBoundaryPoints(Range.END_TO_START, childRange) < 0;
                    if (startBeforeEnd && endAfterStart) {
                        var text = (child.textContent || '').trim();
                        if (text) lines.push(text);
                    }
                } catch(e) {}
            }
            if (!lines.length) {
                var t = range.toString().trim();
                if (t) lines = t.split('\n').map(function(l){return l.trim();}).filter(Boolean);
            }
            return lines.length ? lines : [' '];
        }

        function mfbInsertList(type, range) {
            if (!range) return;
            var editor = document.getElementById('boardEditor');
            var lines = mfbExtractLines(range, editor);

            // Знаходимо всі блокові рядки (div/p) що повністю або частково виділені
            var startNode = range.startContainer;
            var endNode   = range.endContainer;
            function getLineBlock(node) {
                while (node && node !== editor) {
                    if (node.nodeType === Node.ELEMENT_NODE &&
                        (node.tagName === 'DIV' || node.tagName === 'P') &&
                        node.parentNode === editor) return node;
                    node = node.parentNode;
                }
                return null;
            }
            var startBlock = getLineBlock(startNode);
            var endBlock   = getLineBlock(endNode);

            // Будуємо список
            var list = document.createElement(type);
            lines.forEach(function(line) {
                var li = document.createElement('li');
                li.textContent = line;
                list.appendChild(li);
            });

            if (startBlock) {
                // Видаляємо всі блоки між startBlock і endBlock включно
                if (startBlock !== endBlock && endBlock) {
                    var cur = startBlock.nextSibling;
                    while (cur && cur !== endBlock) {
                        var next = cur.nextSibling;
                        if (editor.contains(cur)) cur.remove();
                        cur = next;
                    }
                    if (endBlock && editor.contains(endBlock)) endBlock.remove();
                }
                // Замінюємо startBlock на список
                editor.replaceChild(list, startBlock);
            } else {
                // Fallback: звичайна вставка
                range.deleteContents();
                range.insertNode(list);
            }

            // Курсор після списку
            var sel2 = window.getSelection();
            var after = document.createRange();
            after.setStartAfter(list);
            after.collapse(true);
            sel2.removeAllRanges();
            sel2.addRange(after);
            _mfbRange = null;
            if (typeof saveState === 'function') saveState();
        }

        window.mfbOpenListNumbered = function() {
            var range = _mfbRange;
            _mfbRange = null;
            if (!range) return;
            mfbInsertList('ol', range);
        };

        window.mfbOpenLink = function() {
            var range = _mfbRange;
            if (!range) return;
            if (typeof window._mfbOpenLinkPopup === 'function') {
                window._mfbOpenLinkPopup(range, mfbAnchorEl());
            }
        };
    })();
