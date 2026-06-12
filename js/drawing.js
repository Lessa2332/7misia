        // === PILL ANIMATION HELPER ===
        function updatePill(container) {
            const activeBtn = container.querySelector('.segmented-btn.active');
            if (!activeBtn) return;
            const containerRect = container.getBoundingClientRect();
            const btnRect = activeBtn.getBoundingClientRect();
            const borderLeft = parseFloat(getComputedStyle(container).borderLeftWidth) || 0;
            const offsetLeft = btnRect.left - containerRect.left - borderLeft;
            container.style.setProperty('--pill-left', offsetLeft + 'px');
            container.style.setProperty('--pill-width', btnRect.width + 'px');
            container.classList.add('pill-ready');
        }

        function updateAllPills() {
            requestAnimationFrame(() => {
                ['langToggle', 'typeToggle', 'fontToggle', 'bgToggle'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) updatePill(el);
                });
            });
        }

        function setupToggle(id, key) {
            const container = document.getElementById(id);
            container.querySelectorAll('.segmented-btn').forEach(btn => {
                btn.onclick = () => {
                    container.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    state[key] = btn.dataset.val;
                    localStorage.setItem(`board_${key}`, state[key]);
                    render();
                    if (key === 'lang' && isDictating && recognition) {
                        isDictating = false;
                        try { recognition.stop(); } catch (e) { }
                        enPendingTs = null; ukPendingTs = null;
                        document.getElementById('dictationBtn').classList.remove('active');
                    }
                    // Update all pills AFTER render — lang change resizes button labels
                    updateAllPills();
                };
                if (btn.dataset.val === state[key]) btn.classList.add('active');
            });
            // Double RAF: waits for fonts + layout to fully settle before measuring
            requestAnimationFrame(() => requestAnimationFrame(() => updatePill(container)));
        }

        setupToggle('langToggle', 'lang');
        setupToggle('typeToggle', 'type');
        setupToggle('fontToggle', 'font');
        setupToggle('bgToggle', 'bg');
        dateSelect.onchange = render;

        /* ── Кастомний календар дати у шапці ── */
        (function() {
            var displayDateEl = document.getElementById('displayDate');
            if (!displayDateEl) return;

            var uaMonthsFull = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
            var uaDayNames  = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
            var enMonthsFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            var enDayNames   = ['Mo','Tu','We','Th','Fr','Sa','Su'];
            var deMonthsFull = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
            var deDayNames   = ['Mo','Di','Mi','Do','Fr','Sa','So'];

            /* Читаємо поточну дату з dateSelect */
            function getSelectedDate() {
                var parts = dateSelect.value.split('-');
                if (parts.length === 3) return { y: +parts[0], m: +parts[1] - 1, d: +parts[2] };
                var now = new Date();
                return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
            }

            /* Стан перегляду (місяць/рік у вікні календаря) */
            var view = { y: 0, m: 0 };

            /* Створюємо popup */
            var cal = document.createElement('div');
            cal.className = 'cal-popup';
            cal.id = 'calPopup';
            document.body.appendChild(cal);

            function isOpen() { return cal.style.display === 'flex'; }

            function pad(n) { return n < 10 ? '0' + n : '' + n; }

            function build() {
                var lang = state.lang || 'ua';
                var sel  = getSelectedDate();
                var today = new Date();
                var todayY = today.getFullYear(), todayM = today.getMonth(), todayD = today.getDate();

                var monthNames = lang === 'ua' ? uaMonthsFull : lang === 'de' ? deMonthsFull : enMonthsFull;
                var dayNames   = lang === 'ua' ? uaDayNames   : lang === 'de' ? deDayNames   : enDayNames;

                /* Перший день місяця (0=Sun…6=Sat) → конвертуємо у Mon-first (0=Mon…6=Sun) */
                var firstDay = new Date(view.y, view.m, 1).getDay();
                var startOffset = (firstDay + 6) % 7; /* зсув від понеділка */
                var daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
                var daysInPrev  = new Date(view.y, view.m, 0).getDate();

                var navSvgLeft  = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="10 4 6 8 10 12"/></svg>';
                var navSvgRight = '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 4 10 8 6 12"/></svg>';

                var todayLabel = lang === 'ua' ? 'Сьогодні' : lang === 'de' ? 'Heute' : 'Today';

                var html = '<div class="cal-header">'
                    + '<button class="cal-nav-btn" id="calPrev" tabindex="-1">' + navSvgLeft  + '</button>'
                    + '<div class="cal-month-label" id="calMonthLabel">' + monthNames[view.m] + ' ' + view.y + '</div>'
                    + '<button class="cal-nav-btn" id="calNext" tabindex="-1">' + navSvgRight + '</button>'
                    + '</div>';

                html += '<div class="cal-grid">';
                /* Назви днів */
                dayNames.forEach(function(dn, i) {
                    var isWe = (i >= 5);
                    html += '<div class="cal-day-name' + (isWe ? ' cal-weekend' : '') + '">' + dn + '</div>';
                });

                /* Клітинки попереднього місяця */
                for (var i = 0; i < startOffset; i++) {
                    var d = daysInPrev - startOffset + 1 + i;
                    var col = i; /* 0=Mon…6=Sun */
                    var isWe = col >= 5;
                    html += '<div class="cal-day cal-other' + (isWe ? ' cal-weekend' : '') + '" data-y="' + (view.m === 0 ? view.y-1 : view.y) + '" data-m="' + (view.m === 0 ? 11 : view.m-1) + '" data-d="' + d + '">' + d + '</div>';
                }

                /* Клітинки поточного місяця */
                for (var d = 1; d <= daysInMonth; d++) {
                    var date    = new Date(view.y, view.m, d);
                    var col     = (date.getDay() + 6) % 7;
                    var isWe    = col >= 5;
                    var isSel   = (view.y === sel.y && view.m === sel.m && d === sel.d);
                    var isToday = (view.y === todayY && view.m === todayM && d === todayD);
                    var cls = 'cal-day'
                        + (isWe    ? ' cal-weekend'  : '')
                        + (isSel   ? ' cal-selected'  : '')
                        + (isToday ? ' cal-today'     : '');
                    html += '<div class="' + cls + '" data-y="' + view.y + '" data-m="' + view.m + '" data-d="' + d + '">' + d + '</div>';
                }

                /* Клітинки наступного місяця */
                var filled = startOffset + daysInMonth;
                var remaining = filled % 7 === 0 ? 0 : 7 - (filled % 7);
                for (var i = 1; i <= remaining; i++) {
                    var col = (filled + i - 1) % 7;
                    var isWe = col >= 5;
                    html += '<div class="cal-day cal-other' + (isWe ? ' cal-weekend' : '') + '" data-y="' + (view.m === 11 ? view.y+1 : view.y) + '" data-m="' + (view.m === 11 ? 0 : view.m+1) + '" data-d="' + i + '">' + i + '</div>';
                }

                html += '</div>';
                html += '<div class="cal-sep"></div>';
                html += '<div class="cal-footer"><button class="cal-today-btn" id="calTodayBtn" tabindex="-1">' + todayLabel + '</button></div>';

                cal.innerHTML = html;

                /* Обробники */
                document.getElementById('calPrev').addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    view.m--; if (view.m < 0) { view.m = 11; view.y--; }
                    build();
                });
                document.getElementById('calNext').addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    view.m++; if (view.m > 11) { view.m = 0; view.y++; }
                    build();
                });
                document.getElementById('calTodayBtn').addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    var now = new Date();
                    view.y = now.getFullYear(); view.m = now.getMonth();
                    selectDay(now.getFullYear(), now.getMonth(), now.getDate());
                });
                cal.querySelectorAll('.cal-day').forEach(function(el) {
                    el.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        selectDay(+el.dataset.y, +el.dataset.m, +el.dataset.d);
                    });
                });
            }

            function selectDay(y, m, d) {
                dateSelect.value = y + '-' + pad(m + 1) + '-' + pad(d);
                render();
                /* Оновлюємо вид і перебудовуємо */
                view.y = y; view.m = m;
                build();
                /* Фокус залишаємо на displayDate щоб ESC/blur спрацювали */
                displayDateEl.focus();
            }

            function openCalendar() {
                if (displayDateEl.getAttribute('contenteditable') !== 'true') return;
                var sel = getSelectedDate();
                view.y = sel.y; view.m = sel.m;
                build();
                var rect = displayDateEl.getBoundingClientRect();
                cal.style.display = 'flex';
                cal.style.animation = 'none';
                cal.offsetHeight;
                cal.style.animation = '';
                cal.style.left = (rect.left + rect.width / 2) + 'px';
                cal.style.transform = 'translateX(-50%)';
                /* Позиція зверху або знизу */
                requestAnimationFrame(function() {
                    var ch = cal.offsetHeight;
                    var spaceBelow = window.innerHeight - rect.bottom - 8;
                    if (spaceBelow >= ch || spaceBelow >= window.innerHeight / 2) {
                        cal.style.top  = (rect.bottom + 6) + 'px';
                        cal.style.bottom = '';
                    } else {
                        cal.style.top  = (rect.top - 6 - ch) + 'px';
                        cal.style.bottom = '';
                    }
                });
            }

            function closeCalendar() { cal.style.display = 'none'; }

            displayDateEl.addEventListener('focus', openCalendar);

            displayDateEl.addEventListener('blur', function() {
                setTimeout(function() {
                    if (!cal.contains(document.activeElement)) closeCalendar();
                }, 150);
            });

            document.addEventListener('mousedown', function(e) {
                var path = e.composedPath ? e.composedPath() : [];
                var insideCal = path.indexOf(cal) !== -1;
                var insideDisplay = path.indexOf(displayDateEl) !== -1;
                if (!insideCal && !insideDisplay) closeCalendar();
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && isOpen()) { closeCalendar(); displayDateEl.blur(); }
            });
        })();

        /* ── Дропдаун вибору типу роботи ── */
        (function() {
            var displayTypeEl = document.getElementById('displayType');
            if (!displayTypeEl) return;

            var typeList = [
                { val: 'home',        ua: 'Домашня робота',        en: 'Homework',           de: 'Hausarbeit' },
                { val: 'class',       ua: 'Класна робота',          en: 'Classwork',          de: 'Klassenarbeit' },
                null,
                { val: 'independent', ua: 'Самостійна робота',      en: 'Independent Work',   de: 'Selbstständige Arbeit' },
                { val: 'practical',   ua: 'Практична робота',       en: 'Practical Work',     de: 'Praktische Arbeit' },
                { val: 'lab',         ua: 'Лабораторна робота',     en: 'Corrections',        de: 'Laborarbeit' },
                { val: 'creative',    ua: 'Творча робота',          en: 'Creative Work',      de: 'Kreative Arbeit' },
                null,
                { val: 'control',     ua: 'Контрольна робота',      en: 'Control Work',       de: 'Kontrollarbeit' },
                { val: 'test',        ua: 'Тест',                   en: 'Test',               de: 'Test' },
                { val: 'dictation',   ua: 'Диктант',                en: 'Dictation',          de: 'Diktat' },
                { val: 'diagnostic',  ua: 'Діагностувальна робота', en: 'Diagnostic Work',    de: 'Diagnostische Arbeit' },
            ];

            /* Створюємо dropdown */
            var dropdown = document.createElement('div');
            dropdown.id = 'typeDropdown';
            dropdown.className = 'type-dropdown';
            document.body.appendChild(dropdown);

            var checkSvg = '<svg class="type-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8 7 12 13 4"/></svg>';

            function buildDropdown() {
                dropdown.innerHTML = '';
                var lang = state.lang || 'ua';
                typeList.forEach(function(t) {
                    if (!t) {
                        var sep = document.createElement('div');
                        sep.className = 'type-dropdown-sep';
                        dropdown.appendChild(sep);
                        return;
                    }
                    var item = document.createElement('div');
                    item.className = 'type-dropdown-item' + (state.type === t.val ? ' active' : '');
                    item.innerHTML = checkSvg + (t[lang] || t.en || t.ua);
                    item.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        state.type = t.val;
                        localStorage.setItem('board_type', t.val);
                        /* Синхронізуємо панельний тогл якщо є кнопка */
                        var typeToggle = document.getElementById('typeToggle');
                        if (typeToggle) {
                            typeToggle.querySelectorAll('.segmented-btn').forEach(function(btn) {
                                btn.classList.toggle('active', btn.dataset.val === t.val);
                            });
                            updatePill(typeToggle);
                        }
                        render();
                        closeDropdown();
                        displayTypeEl.blur();
                    });
                    dropdown.appendChild(item);
                });
            }

            function openDropdown() {
                if (displayTypeEl.getAttribute('contenteditable') !== 'true') return;
                buildDropdown();
                var rect = displayTypeEl.getBoundingClientRect();
                dropdown.style.display = 'flex';
                /* Анімація: треба reset щоб вона спрацювала знову */
                dropdown.style.animation = 'none';
                dropdown.offsetHeight; /* reflow */
                dropdown.style.animation = '';
                /* Центруємо під текстом */
                dropdown.style.top  = (rect.bottom + 6) + 'px';
                dropdown.style.left = (rect.left + rect.width / 2) + 'px';
                dropdown.style.transform = 'translateX(-50%)';
                /* Якщо виходить за межі екрану знизу — ставимо вгору */
                requestAnimationFrame(function() {
                    var dh = dropdown.offsetHeight;
                    if (rect.bottom + 6 + dh > window.innerHeight - 12) {
                        dropdown.style.top = (rect.top - 6 - dh) + 'px';
                    }
                });
            }

            function closeDropdown() {
                dropdown.style.display = 'none';
            }

            displayTypeEl.addEventListener('focus', openDropdown);

            displayTypeEl.addEventListener('blur', function() {
                setTimeout(function() {
                    if (!dropdown.contains(document.activeElement)) closeDropdown();
                }, 150);
            });

            document.addEventListener('mousedown', function(e) {
                if (e.target !== displayTypeEl && !dropdown.contains(e.target)) {
                    closeDropdown();
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && dropdown.style.display !== 'none') closeDropdown();
            });
        })();

        function loadFromStorage() {
            let oldText = localStorage.getItem('board_text');
            let oldCanvas = localStorage.getItem('board_canvas');
            if (!localStorage.getItem('board_pages') && (oldText || oldCanvas)) {
                boardPages[0] = { html: oldText || '', canvas: oldCanvas || '' };
            }
            loadPage(currentPageIndex, true);
        }

        function loadPage(index, isInitialLoad = false) {
            if (!isInitialLoad && boardPages[currentPageIndex]) {
                boardPages[currentPageIndex].html = editor.innerHTML;
                boardPages[currentPageIndex].canvas = canvas.toDataURL();
                if (window.saveTablesState) boardPages[currentPageIndex].tables = window.saveTablesState();
            }

            currentPageIndex = index;
            localStorage.setItem('board_page_index', currentPageIndex);

            historyStack = [];
            currentStep = -1;

            const pageData = boardPages[currentPageIndex];
            editor.innerHTML = pageData.html || '';
            if (window.restoreTablesState) window.restoreTablesState(pageData.tables || []);
            window.scrollTo(0, 0);

            if (pageData.canvas) {
                drawCanvasDataUrlToCurrentSize(pageData.canvas, saveState);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                saveState();
            }

            updatePageIndicator();
            updateDateHeaderVisibility();
        }

        function updatePageIndicator() {
            document.getElementById('pageIndicator').innerText = `${currentPageIndex + 1} / ${boardPages.length}`;
        }

        function updateDateHeaderVisibility() {
            const header = document.querySelector('.date-header');
            if (!document.body.classList.contains('board-mode') || currentPageIndex === 0) {
                header.style.display = 'flex';
            } else {
                header.style.display = 'none';
            }
        }

        function animatePageSwitch(direction, callback) {
            const card = document.getElementById('notebookCard');
            if (!card) { callback(); return; }

            const isNext = direction === 'next';
            const cardRect = card.getBoundingClientRect();

            // Swap content immediately
            callback();

            const overlay = document.createElement('div');
            Object.assign(overlay.style, {
                position: 'fixed',
                top: cardRect.top + 'px',
                left: cardRect.left + 'px',
                width: cardRect.width + 'px',
                height: cardRect.height + 'px',
                zIndex: '9999',
                pointerEvents: 'none',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 40px rgba(50,28,8,0.18)',
                transform: 'translateX(0%)',
                transition: 'none',
                borderRadius: isNext ? '0 3px 3px 0' : '3px 0 0 3px',
            });

            // Paper edge line
            const edge = document.createElement('div');
            Object.assign(edge.style, {
                position: 'absolute',
                top: '0',
                bottom: '0',
                width: '3px',
                [isNext ? 'right' : 'left']: '0',
                background: 'linear-gradient(to bottom, rgba(180,140,80,0.08), rgba(180,140,80,0.26) 30%, rgba(180,140,80,0.26) 70%, rgba(180,140,80,0.08))',
            });
            overlay.appendChild(edge);

            // Subtle gradient
            const shade = document.createElement('div');
            Object.assign(shade.style, {
                position: 'absolute',
                inset: '0',
                background: isNext
                    ? 'linear-gradient(to right, rgba(255,252,245,1) 0%, rgba(255,255,255,1) 100%)'
                    : 'linear-gradient(to left, rgba(255,252,245,1) 0%, rgba(255,255,255,1) 100%)',
            });
            overlay.appendChild(shade);

            document.body.appendChild(overlay);

            requestAnimationFrame(() => requestAnimationFrame(() => {
                overlay.style.transition = 'transform 0.72s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.72s ease';
                overlay.style.transform = isNext ? 'translateX(-101%)' : 'translateX(101%)';
                overlay.style.boxShadow = '0 2px 12px rgba(50,28,8,0.06)';
            }));

            setTimeout(() => overlay.remove(), 760);
        }

        function prevPage() {
            if (currentPageIndex > 0) {
                animatePageSwitch('prev', () => {
                    loadPage(currentPageIndex - 1);
                    renderStickers(currentPageIndex);
                    renderImages(currentPageIndex);
                    renderFreetexts(currentPageIndex);
                });
            }
        }

        function nextPage() {
            if (currentPageIndex < boardPages.length - 1) {
                animatePageSwitch('next', () => {
                    loadPage(currentPageIndex + 1);
                    renderStickers(currentPageIndex);
                    renderImages(currentPageIndex);
                    renderFreetexts(currentPageIndex);
                });
            }
        }

        function addPage() {
            boardPages.push({ html: '', canvas: '' });
            animatePageSwitch('next', () => {
                loadPage(boardPages.length - 1);
                renderStickers(currentPageIndex);
                renderImages(currentPageIndex);
                renderFreetexts(currentPageIndex);
            });
        }

        var _confirmCallback = null;

        window.showConfirmModal = function showConfirmModal(text, onYes, opts) {
            opts = opts || {};
            _confirmCallback = onYes;
            document.getElementById('confirmModalText').textContent = text;

            const sub = document.getElementById('confirmModalSub');
            if (opts.subText) {
                sub.textContent = opts.subText;
                sub.classList.add('visible');
            } else {
                sub.textContent = '';
                sub.classList.remove('visible');
            }

            const yesBtn = document.getElementById('confirmYesBtn');
            yesBtn.textContent = opts.yesText || (uiText[state.lang] || uiText.ua).confirmYes;
            yesBtn.style.background = opts.yesColor || '#ef4444';

            document.getElementById('confirmNoBtn').textContent = opts.noText || (uiText[state.lang] || uiText.ua).confirmNo;

            document.getElementById('confirmModal').classList.add('visible');
        }

        function shadeColor(hex, pct) {
            const n = parseInt(hex.slice(1), 16);
            const r = Math.min(255, Math.max(0, (n >> 16) + pct));
            const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + pct));
            const b = Math.min(255, Math.max(0, (n & 0xff) + pct));
            return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        }

        function confirmYes() {
            document.getElementById('confirmModal').classList.remove('visible');
            document.getElementById('confirmYesBtn').style.background = '';
            if (_confirmCallback) { _confirmCallback(); _confirmCallback = null; }
        }

        function confirmNo() {
            document.getElementById('confirmModal').classList.remove('visible');
            document.getElementById('confirmYesBtn').style.background = '';
            _confirmCallback = null;
        }

        function animatePageDelete(callback) {
            const card = document.getElementById('notebookCard');
            if (!card) { callback(); return; }

            const rect = card.getBoundingClientRect();

            const overlay = document.createElement('div');
            overlay.className = 'page-drop-overlay';
            Object.assign(overlay.style, {
                top: rect.top + 'px',
                left: rect.left + 'px',
                width: rect.width + 'px',
                height: rect.height + 'px',
                borderRadius: getComputedStyle(card).borderRadius,
            });
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.classList.add('dropping');
            });

            setTimeout(() => {
                overlay.remove();
                callback();
            }, 340);
        }

        function deletePage() {
            if (boardPages.length <= 1) {
                clearBoard();
                return;
            }
            showConfirmModal((uiText[state.lang] || uiText.ua).confirmDeletePage, () => {
                animatePageDelete(_doDeletePage);
            });
        }

        function _doDeletePage() {
            const idx = currentPageIndex;
            boardPages.splice(idx, 1);

            // Перенумерувати стікери
            const newStickers = {};
            Object.keys(allStickers).forEach(k => {
                const ki = parseInt(k);
                if (ki === idx) return;
                newStickers[ki > idx ? ki - 1 : ki] = allStickers[k];
            });
            allStickers = newStickers;
            saveStickers();

            // Перенумерувати зображення
            const newImages = {};
            Object.keys(allImages).forEach(k => {
                const ki = parseInt(k);
                if (ki === idx) return;
                newImages[ki > idx ? ki - 1 : ki] = allImages[k];
            });
            allImages = newImages;
            saveImages();

            // Перенумерувати YouTube вікна
            const newYtWindows = {};
            Object.keys(allYtWindows).forEach(k => {
                const ki = parseInt(k);
                if (ki === idx) return;
                newYtWindows[ki > idx ? ki - 1 : ki] = allYtWindows[k];
            });
            allYtWindows = newYtWindows;
            saveYtWindows();

            // Перенумерувати фігури
            const newShapes = {};
            Object.keys(allShapes).forEach(k => {
                const ki = parseInt(k);
                if (ki === idx) return;
                newShapes[ki > idx ? ki - 1 : ki] = allShapes[k];
            });
            allShapes = newShapes;
            saveShapes();

            // Перенумерувати довільні тексти
            const newFreetexts = {};
            Object.keys(allFreetexts).forEach(k => {
                const ki = parseInt(k);
                if (ki === idx) return;
                newFreetexts[ki > idx ? ki - 1 : ki] = allFreetexts[k];
            });
            allFreetexts = newFreetexts;
            saveFreetexts();

            if (currentPageIndex >= boardPages.length) currentPageIndex = boardPages.length - 1;

            localStorage.setItem('board_pages', JSON.stringify(boardPages));
            loadPage(currentPageIndex);
            renderStickers(currentPageIndex);
            renderImages(currentPageIndex);
            renderFreetexts(currentPageIndex);
        }

        // --- ЛОГІКА ДОШКИ ---
        function updateColor(color, el) {
            currentColor = color;
            document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('foreColor', false, color);
            // Update brush preview dot color if slider is already visible
            const dot = document.getElementById('brushPreviewDot');
            if (dot) dot.style.background = currentColor;
        }

        function showBrushSlider() {
            const popup = document.getElementById('brushSliderPopup');
            popup.classList.add('visible');
            // Update preview dot color to match current pen color
            const dot = document.getElementById('brushPreviewDot');
            if (dot) dot.style.background = currentColor;
        }

        function hideBrushSlider() {
            const popup = document.getElementById('brushSliderPopup');
            popup.classList.remove('visible');
        }

        // Close slider when clicking/tapping outside
        document.addEventListener('pointerdown', (e) => {
            const brushPopup = document.getElementById('brushSliderPopup');
            if (brushPopup.classList.contains('visible')) {
                if (!brushPopup.contains(e.target) && !e.target.closest('#pencilTool')) {
                    hideBrushSlider();
                }
            }
            const eraserPopup = document.getElementById('eraserSliderPopup');
            if (eraserPopup.classList.contains('visible')) {
                if (!eraserPopup.contains(e.target) && !e.target.closest('#eraserTool')) {
                    hideEraserSlider();
                }
            }
        }, true);

        function formatText(cmd) {
            if (cmd === 'superscript' || cmd === 'subscript') {
                const tag = cmd === 'superscript' ? 'sup' : 'sub';
                const oppositeTag = cmd === 'superscript' ? 'sub' : 'sup';
                const sel = window.getSelection();
                if (!sel || !sel.rangeCount) return;
                const range = sel.getRangeAt(0);

                // Знаходимо найближчий батьківський sup/sub для поточного курсору
                function findAncestor(tagName) {
                    let node = range.startContainer;
                    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
                    while (node && node !== editor) {
                        if (node.nodeName && node.nodeName.toLowerCase() === tagName) return node;
                        node = node.parentNode;
                    }
                    return null;
                }

                const ancestorSame = findAncestor(tag);

                // Якщо курсор всередині того ж тегу — знімаємо його повністю
                if (ancestorSame) {
                    const parent = ancestorSame.parentNode;
                    const frag = document.createDocumentFragment();
                    while (ancestorSame.firstChild) frag.appendChild(ancestorSame.firstChild);
                    parent.replaceChild(frag, ancestorSame);
                    parent.normalize();
                    saveState();
                    updateFormatButtons();
                    return;
                }

                if (range.collapsed) return;

                // Перевіряємо виділення: якщо будь-який вузол вже є цим тегом — знімаємо
                const fragment = range.cloneContents();
                const nodes = [...fragment.childNodes];
                const hasWrapped = nodes.some(n =>
                    n.nodeType === Node.ELEMENT_NODE && n.nodeName.toLowerCase() === tag
                );

                if (hasWrapped) {
                    const unwrapped = document.createDocumentFragment();
                    fragment.childNodes.forEach(n => {
                        if (n.nodeName.toLowerCase() === tag) {
                            n.childNodes.forEach(c => unwrapped.appendChild(c.cloneNode(true)));
                        } else {
                            unwrapped.appendChild(n.cloneNode(true));
                        }
                    });
                    range.deleteContents();
                    range.insertNode(unwrapped);
                } else {
                    // Знімаємо протилежний тег якщо є
                    const ancestorOpposite = findAncestor(oppositeTag);
                    if (ancestorOpposite) {
                        const parent = ancestorOpposite.parentNode;
                        const frag = document.createDocumentFragment();
                        while (ancestorOpposite.firstChild) frag.appendChild(ancestorOpposite.firstChild);
                        parent.replaceChild(frag, ancestorOpposite);
                        parent.normalize();
                    }

                    const el = document.createElement(tag);
                    el.appendChild(range.extractContents());
                    range.insertNode(el);

                    const anchor = document.createTextNode('');
                    el.after(anchor);
                    const newRange = document.createRange();
                    newRange.setStart(anchor, 0);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);
                }

                saveState();
                updateFormatButtons();
                return;
            }

            document.execCommand(cmd, false, null);
            saveState();
            updateFormatButtons();
        }

        function updateFormatButtons() {
            const cmds = [
                { id: 'fmtBold', cmd: 'bold' },
                { id: 'fmtUnderline', cmd: 'underline' },
                { id: 'fmtStrike', cmd: 'strikethrough' },
            ];
            cmds.forEach(({ id, cmd }) => {
                const btn = document.getElementById(id);
                if (!btn) return;
                try { btn.classList.toggle('active', document.queryCommandState(cmd)); } catch (e) { }
            });

            // Вирівнювання — перевіряємо через CSS поточного блока (queryCommandState ненадійний)
            const sel = window.getSelection();
            let align = '';
            if (sel && sel.rangeCount) {
                let node = sel.getRangeAt(0).startContainer;
                if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
                while (node && node !== editor) {
                    const ta = window.getComputedStyle(node).textAlign;
                    if (ta && ta !== 'start' && ta !== 'left' && ta !== '') { align = ta; break; }
                    if (ta === 'left' || ta === 'start') { align = 'left'; break; }
                    node = node.parentNode;
                }
            }
            document.getElementById('fmtLeft')?.classList.toggle('active', align === 'left' || align === 'start' || align === '');
            document.getElementById('fmtCenter')?.classList.toggle('active', align === 'center');
            document.getElementById('fmtRight')?.classList.toggle('active', align === 'right');

            // sup/sub — перевіряємо через DOM
            let inSup = false, inSub = false;
            if (sel && sel.rangeCount) {
                let node = sel.getRangeAt(0).startContainer;
                if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
                while (node && node !== editor) {
                    const tag = node.nodeName && node.nodeName.toLowerCase();
                    if (tag === 'sup') inSup = true;
                    if (tag === 'sub') inSub = true;
                    node = node.parentNode;
                }
            }
            document.getElementById('fmtSup')?.classList.toggle('active', inSup);
            document.getElementById('fmtSub')?.classList.toggle('active', inSub);
        }

        document.addEventListener('selectionchange', () => {
            if (document.activeElement === editor || editor.contains(document.activeElement)) {
                updateFormatButtons();
            }
        });

        // --- MOBILE-FRIENDLY BOARD MODE (no Fullscreen API dependency) ---
        var isBoardMode = false;

        function handleCardClick(e) {
            // Only open if NOT already in board mode (check both flag and class for desktop/fullscreen)
            const inBoardMode = isBoardMode || document.body.classList.contains('board-mode');
            if (!inBoardMode) {
                toggleBoardMode();
            }
        }

        function toggleBoardMode() {
            const isMobile = window.innerWidth <= 900 || ('ontouchstart' in window);

            if (isMobile) {
                // Mobile: use custom board mode without fullscreen API
                isBoardMode = !isBoardMode;

                function _afterBoardClose() {
                    updateDateHeaderVisibility();
                    var _sp = (window._collabRole==='student'&&window._collabProtect);
                    editor.setAttribute('contenteditable', 'false');
                    document.getElementById('displayDate').setAttribute('contenteditable', 'false');
                    document.getElementById('displayType').setAttribute('contenteditable', 'false');
                    setDrawMode('off');
                    document.body.style.overflow = '';
                    if (stickerMode) toggleStickerMode();
                    if (freetextMode) toggleFreetextMode();
                    if (boardPages[currentPageIndex]) {
                        boardPages[currentPageIndex].html = editor.innerHTML;
                        localStorage.setItem('board_pages', JSON.stringify(boardPages));
                    }
                    updateWordCounter();
                }

                if (!isBoardMode) {
                    // Анімація закриття: додаємо closing-клас, знімаємо board-mode після анімації
                    document.body.classList.add('board-closing');
                    setTimeout(function() {
                        document.body.classList.remove('board-mode');
                        document.body.classList.remove('board-closing');
                        _afterBoardClose();
                    }, 360);
                } else {
                    document.body.classList.remove('board-closing');
                    document.body.classList.add('board-mode');

                    updateDateHeaderVisibility();
                    var _sp = (window._collabRole==='student'&&window._collabProtect);
                    if (!_sp) editor.setAttribute('contenteditable', 'true');
                    document.getElementById('displayDate').setAttribute('contenteditable', String(!_sp));
                    document.getElementById('displayType').setAttribute('contenteditable', String(!_sp));

                    setDrawMode('off');
                    document.body.style.overflow = 'hidden';
                    setTimeout(() => {
                        const pageData = boardPages[currentPageIndex];
                        syncCanvasSize((pageData && pageData.canvas) || null);
                        editor.focus();
                    }, 120);
                }
            } else {
                // Desktop: use fullscreen API
                toggleFullscreen();
            }
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
                else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen();
            } else {
                // Зберігаємо лише текст перед виходом.
                if (boardPages[currentPageIndex]) {
                    boardPages[currentPageIndex].html = editor.innerHTML;
                    localStorage.setItem('board_pages', JSON.stringify(boardPages));
                }
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            }
        }

        var suppressFullscreenChange = false;

        document.onfullscreenchange = () => {
            if (suppressFullscreenChange) return;
            const isFull = !!document.fullscreenElement;
            // Only apply fullscreen-based board-mode on desktop
            if (window.innerWidth > 900 && !('ontouchstart' in window)) {
                document.body.classList.toggle('board-mode', isFull);
                updateDateHeaderVisibility();
                var _sp2 = (window._collabRole==='student'&&window._collabProtect);
                if (!_sp2) editor.setAttribute('contenteditable', isFull);
                document.getElementById('displayDate').setAttribute('contenteditable', isFull && !_sp2);
                document.getElementById('displayType').setAttribute('contenteditable', isFull && !_sp2);

                if (isFull) {
                    setDrawMode('off');
                    setTimeout(() => {
                        const pageData = boardPages[currentPageIndex];
                        syncCanvasSize((pageData && pageData.canvas) || null);
                        editor.focus();
                    }, 400);
                } else {
                    // Зберігаємо поточний стан перед виходом з режиму редагування
                    if (boardPages[currentPageIndex]) {
                        boardPages[currentPageIndex].html = editor.innerHTML;
                        localStorage.setItem('board_pages', JSON.stringify(boardPages));
                    }
                    setDrawMode('off');
                    if (stickerMode) toggleStickerMode();
                    // Оновлюємо відображення редактора (текст залишається видимим)
                    updateWordCounter();
                }
            }
        };

        // --- ОНОВЛЕНЕ МАЛЮВАННЯ (Згладжування, Безьє, Делікатна товщина) ---
        var isDrawing = false;
        var snapshot;

        var smoothedCoords = { x: 0, y: 0 };
        var smoothing = 0.65; // Фільтр згладжування (0.0 - 0.9)
        var lastMid = { x: 0, y: 0 };

        function drawCanvasDataUrlToCurrentSize(dataUrl, onDone) {
            if (!dataUrl || dataUrl === 'data:,') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (onDone) onDone();
                return;
            }
            const dpr = window.devicePixelRatio || 1;
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
                if (onDone) onDone();
            };
            img.src = dataUrl;
        }

        function syncCanvasSize(preferredDataUrl = null) {
            const dpr = window.devicePixelRatio || 1;
            const width = card.clientWidth;
            const height = card.scrollHeight;

            let oldContent = null;
            if (canvas.width > 0 && (canvas.width !== width * dpr || canvas.height !== height * dpr)) {
                oldContent = canvas.toDataURL();
            }

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // На ресайзі зберігаємо саме поточний стан canvas,
            // а не останній збережений у localStorage.
            const source = preferredDataUrl || oldContent;
            if (source) drawCanvasDataUrlToCurrentSize(source);
        }

        // === PEN SIZE (continuous slider) ===
        // brushSize is the actual pixel radius base value
        var brushSize = parseFloat(localStorage.getItem('board_brush_size')) || 3;

        // Legacy PEN_SIZES kept for eraser logic compatibility
        var PEN_SIZES = { 1: [0.8, 2.5], 2: [1.5, 4.5], 3: [3, 8], 4: [6, 16] };
        // penSizeLevel kept for eraser (always use level 2 range feel)
        var penSizeLevel = 2;

        function setBrushSize(val) {
            brushSize = parseFloat(val);
            localStorage.setItem('board_brush_size', brushSize);
            const slider = document.getElementById('brushSizeSlider');
            const label = document.getElementById('brushSizeLabel');
            const dot = document.getElementById('brushPreviewDot');
            if (slider) slider.value = brushSize;
            if (label) label.textContent = Math.round(brushSize);
            const dotSize = Math.max(3, Math.min(28, brushSize * 1.4));
            if (dot) { dot.style.width = dotSize + 'px'; dot.style.height = dotSize + 'px'; }
        }

        function onBrushSliderInput(val) {
            setBrushSize(val);
        }

        // === ERASER SIZE ===
        var eraserSize = parseFloat(localStorage.getItem('board_eraser_size')) || 30;

        function setEraserSize(val) {
            eraserSize = parseFloat(val);
            localStorage.setItem('board_eraser_size', eraserSize);
            const slider = document.getElementById('eraserSizeSlider');
            const label = document.getElementById('eraserSizeLabel');
            const dot = document.getElementById('eraserPreviewDot');
            if (slider) slider.value = eraserSize;
            if (label) label.textContent = Math.round(eraserSize);
            const dotSize = Math.max(10, Math.min(56, eraserSize * 0.8));
            if (dot) { dot.style.width = dotSize + 'px'; dot.style.height = dotSize + 'px'; }
        }

        function onEraserSliderInput(val) {
            setEraserSize(val);
        }

        function showEraserSlider() {
            const popup = document.getElementById('eraserSliderPopup');
            popup.classList.add('visible');
        }

        function hideEraserSlider() {
            const popup = document.getElementById('eraserSliderPopup');
            popup.classList.remove('visible');
        }

        // Apply stored eraser size on load
        setEraserSize(eraserSize);

        // Legacy setPenSize — kept in case called elsewhere, maps to slider levels
        function setPenSize(level) {
            const map = { 1: 1.5, 2: 3, 3: 6, 4: 12 };
            setBrushSize(map[level] || 3);
        }

        // Apply stored size on load
        setBrushSize(brushSize);

        // === MATH PANEL (grid mode only) ===
        var MATH_SYMBOLS = ['+', '-', '±', '×', '÷', '=', '≠', '≈', '∞', 'π', '√', '∛', '∑', '∏', '∫', '∂', '∆', '∇', '≤', '≥', '∠', '°', '′', '″', '→', '↔', '⊂', '⊃', '∩', '∪', '⊥', '∥'];
        var MATH_TEMPLATES = [
            { label: 'a²+b²', value: 'a²+b²=c²' },
            { label: '(a+b)²', value: '(a+b)²=a²+2ab+b²' },
            { label: 'x₁,x₂', value: 'x₁, x₂' },
            { label: '√x', value: '√x' },
            { label: '∛x', value: '∛x' },
            { label: 'a/b', value: 'a/b' },
            { label: '∑', value: '∑' },
            { label: 'lim', value: 'lim x→∞' },
            { label: 'рівняння', value: '2x+5=17' }
        ];
        var lastEditorRange = null;

        function isGridModeActive() {
            return state.bg === 'bg-grid';
        }

        var symPanelVisible = localStorage.getItem('board_sym_panel_visible') === 'true';

        function toggleSymPanel() {
            symPanelVisible = !symPanelVisible;
            localStorage.setItem('board_sym_panel_visible', symPanelVisible);
            const btn = document.getElementById('symPanelBtn');
            if (btn) btn.classList.toggle('active', symPanelVisible);
            updateGridSymBar();
            updateTextSymBar();
        }

        document.addEventListener('DOMContentLoaded', () => {
            const btn = document.getElementById('symPanelBtn');
            if (btn && symPanelVisible) btn.classList.add('active');
        });

        function updateMathToolAvailability() {
            const btn = document.getElementById('mathTool');
            if (btn) btn.classList.remove('disabled');

            /* Показуємо/ховаємо кнопки Таблиця і Математика залежно від режиму */
            const gridActive = isGridModeActive();
            document.body.classList.toggle('grid-mode', gridActive);

            /* Закриваємо панелі, якщо режим клітинки вимкнено */
            if (!gridActive) {
                const mathPanel = document.getElementById('mathPanel');
                const mathBtn = document.getElementById('mathEditorTool');
                if (mathPanel && mathPanel.classList.contains('visible')) {
                    mathPanel.classList.remove('visible');
                    if (mathBtn) mathBtn.classList.remove('active');
                }
            }

            updateGridSymBar();
            updateTextSymBar();
        }

        function addSymBtnListeners(btn, action) {
            // mousedown: prevent focus loss on desktop
            btn.addEventListener('mousedown', (e) => { e.preventDefault(); });
            // touchend: fires after touchstart's preventDefault, so click won't fire — use touchend instead
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                action();
            }, { passive: false });
            // click: for desktop mouse
            btn.addEventListener('click', (e) => {
                // On touch devices click fires after touchend — skip to avoid double insert
                if (e.detail === 0) return; // synthetic click from touch, already handled
                action();
            });
        }

        function buildGridSymBar() {
            const bar = document.getElementById('gridSymBar');
            if (!bar || bar.childElementCount > 0) return;
            MATH_SYMBOLS.forEach(sym => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'grid-sym-btn';
                b.textContent = sym;
                b.title = sym;
                addSymBtnListeners(b, () => insertMathText(sym));
                bar.appendChild(b);
            });

            // Роздільник
            const sep = document.createElement('div');
            sep.style.cssText = 'width:1px;height:24px;background:#e2e8f0;flex-shrink:0;margin:0 2px';
            bar.appendChild(sep);

            // Кнопка Математика (шаблони/дріб)
            const mathBtn = document.createElement('button');
            mathBtn.type = 'button';
            mathBtn.id = 'mathTool';
            mathBtn.className = 'grid-sym-btn';
            mathBtn.title = 'Математика';
            mathBtn.style.cssText = 'min-width:34px;background:#f0f9ff;border-color:#bae6fd';
            mathBtn.innerHTML = `<svg viewBox="0 0 24 24" width="17" height="17" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h8"/><path d="M4 17h8"/><path d="M8 3v8"/><path d="M4 13l8 8"/><path d="M12 13l-8 8"/><path d="M16 6h4"/><path d="M18 4v4"/><path d="M16 16h4"/></svg>`;
            addSymBtnListeners(mathBtn, () => toggleMathPanel());
            bar.appendChild(mathBtn);
        }

        function updateGridSymBar() {
            const bar = document.getElementById('gridSymBar');
            if (!bar) return;
            const show = isGridModeActive() && document.body.classList.contains('board-mode') && symPanelVisible;
            if (show) {
                buildGridSymBar();
                bar.classList.add('visible');
                positionSymBar();
            } else {
                bar.classList.remove('visible');
            }
        }

        // ── Позиціонування над віртуальною клавіатурою (mobile) ──
        function positionSymBar() {
            const bar = document.getElementById('gridSymBar');
            if (!bar || !bar.classList.contains('visible')) return;

            const isMobile = window.innerWidth <= 768;
            if (!isMobile) {
                bar.style.bottom = '';
                return;
            }

            const vv = window.visualViewport;
            if (!vv) {
                bar.style.bottom = '120px';
                return;
            }

            const kbHeight = Math.max(0, window.innerHeight - (vv.offsetTop + vv.height));
            const GAP = 8;
            const MIN_BOTTOM = 120;
            bar.style.bottom = (kbHeight > 50 ? kbHeight + GAP : MIN_BOTTOM) + 'px';
        }

        // Слухаємо зміни visualViewport (відкриття/закриття клавіатури)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', positionSymBar);
            window.visualViewport.addEventListener('scroll', positionSymBar);
        }

        // Слухаємо зміни board-mode класу на body
        new MutationObserver(() => { updateGridSymBar(); updateTextSymBar(); })
            .observe(document.body, { attributeFilter: ['class'] });

        // === TEXT SYMBOL BAR (лінійка / коса / чистий режим) ===
        var TEXT_SYMBOLS = [
            { sym: '—', title: 'Тире' },
            { sym: '§', title: 'Параграф' },
            { sym: '«', title: 'Відкрити лапки' },
            { sym: '»', title: 'Закрити лапки' },
            { sym: '„', title: 'Відкрити лапки (нижні)' },
            { sym: '"', title: 'Закрити лапки (верхні)' },
            { sym: '•', title: 'Маркер списку' },
            { sym: '№', title: 'Номер' },
            { sym: '°', title: 'Градус' },
            { sym: '′', title: 'Хвилина / штрих' },
            { sym: '″', title: 'Секунда / двоштрих' },
            { sym: '≈', title: 'Приблизно' },
            { sym: '≠', title: 'Не дорівнює' },
            { sym: '×', title: 'Множення' },
            { sym: '÷', title: 'Ділення' },
            { sym: '±', title: 'Плюс-мінус' },
            { sym: '→', title: 'Стрілка вправо' },
            { sym: '←', title: 'Стрілка вліво' },
            { sym: '↑', title: 'Стрілка вгору' },
            { sym: '↓', title: 'Стрілка вниз' },
            { sym: '↔', title: 'Двостороння стрілка' },
            { sym: '★', title: 'Зірка' },
            { sym: '✓', title: 'Галочка' },
            { sym: '✗', title: 'Хрестик' },
        ];

        function insertTextSym(sym) {
            const ed = document.getElementById('boardEditor');
            if (!ed) return;
            ed.focus();
            // Restore selection if lost (e.g. after touch)
            const sel = window.getSelection();
            if (lastEditorRange && (!sel.rangeCount || !ed.contains(sel.getRangeAt(0).startContainer))) {
                sel.removeAllRanges();
                sel.addRange(lastEditorRange);
            }
            document.execCommand('insertText', false, sym);
            rememberEditorRange();
            saveState();
        }

        function buildTextSymBar() {
            const bar = document.getElementById('textSymBar');
            if (!bar || bar.childElementCount > 0) return;
            TEXT_SYMBOLS.forEach(({ sym, title }) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'text-sym-btn';
                b.textContent = sym;
                b.title = title;
                addSymBtnListeners(b, () => insertTextSym(sym));
                bar.appendChild(b);
            });
        }

        function updateTextSymBar() {
            const bar = document.getElementById('textSymBar');
            if (!bar) return;
            const show = !isGridModeActive() && document.body.classList.contains('board-mode') && symPanelVisible;
            if (show) {
                buildTextSymBar();
                bar.classList.add('visible');
                positionTextSymBar();
            } else {
                bar.classList.remove('visible');
            }
        }

        function positionTextSymBar() {
            const bar = document.getElementById('textSymBar');
            if (!bar || !bar.classList.contains('visible')) return;
            const isMobile = window.innerWidth <= 768;
            if (!isMobile) {
                bar.style.bottom = '';
                return;
            }
            const vv = window.visualViewport;
            if (!vv) { bar.style.bottom = '120px'; return; }
            const kbHeight = Math.max(0, window.innerHeight - (vv.offsetTop + vv.height));
            bar.style.bottom = (kbHeight > 50 ? kbHeight + 8 : 120) + 'px';
        }

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', positionTextSymBar);
            window.visualViewport.addEventListener('scroll', positionTextSymBar);
        }

        function rememberEditorRange() {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            if (editor.contains(range.startContainer)) {
                lastEditorRange = range.cloneRange();
            }
        }

        function restoreEditorRange() {
            if (!lastEditorRange) return;
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(lastEditorRange);
        }

        function buildMathPanel() {
            const tmplGrid = document.getElementById('mathTemplateGrid');
            if (!tmplGrid || tmplGrid.childElementCount > 0) return;

            MATH_TEMPLATES.forEach(item => {
                const b = document.createElement('button');
                b.type = 'button';
                b.className = 'math-chip template';
                b.textContent = item.label;
                b.addEventListener('mousedown', (e) => e.preventDefault());
                b.addEventListener('click', () => insertMathExpression(item.value));
                tmplGrid.appendChild(b);
            });
        }

        function showMathToast() {
            const t = uiText[state.lang] || uiText.ua;
            showOcrToast(t.mathGridOnly, '#0f172a');
        }

        function toggleMathPanel() {
            const panel = document.getElementById('mathPanel');
            const btn = document.getElementById('mathTool');
            const toolbarBtn = document.getElementById('mathEditorTool');
            if (!panel) return;
            buildMathPanel();
            const visible = panel.classList.contains('visible');
            if (visible) {
                closeMathPanel();
                return;
            }
            rememberEditorRange();
            panel.classList.add('visible');
            if (btn) btn.classList.add('active');
            if (toolbarBtn) toolbarBtn.classList.add('active');
        }

        function closeMathPanel() {
            const panel = document.getElementById('mathPanel');
            const btn = document.getElementById('mathTool');
            const toolbarBtn = document.getElementById('mathEditorTool');
            if (panel) panel.classList.remove('visible');
            if (btn) btn.classList.remove('active');
            if (toolbarBtn) toolbarBtn.classList.remove('active');
        }

        function ensureEditorFocusForMath() {
            editor.focus();
            const sel = window.getSelection();
            if (lastEditorRange) {
                restoreEditorRange();
            } else if (!sel.rangeCount || !editor.contains(sel.anchorNode)) {
                const range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }

        // Вставляє один символ як .gc span, коректно розбиваючи текстовий вузол
        function insertGcSpan(ch) {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;

            const range = sel.getRangeAt(0);
            range.deleteContents();

            const span = document.createElement('span');
            span.className = 'gc';
            span.setAttribute('contenteditable', 'false');
            span.textContent = ch;

            const container = range.startContainer;
            const offset = range.startOffset;

            if (container.nodeType === Node.TEXT_NODE) {
                // Розбиваємо текстовий вузол: [before][span][after]
                const before = container.textContent.substring(0, offset);
                const after = container.textContent.substring(offset);
                container.textContent = before;
                const afterNode = document.createTextNode(after || '\u200B');
                container.after(span);
                span.after(afterNode);
                const nr = document.createRange();
                nr.setStart(afterNode, after ? 0 : 1);
                nr.collapse(true);
                sel.removeAllRanges();
                sel.addRange(nr);
            } else {
                // Cursor між елементами — вставляємо через insertBefore для
                // надійного збереження сусідніх вузлів (range.insertNode може
                // зрушити DOM і загубити порожній afterNode).
                const parent = container;
                const refNode = parent.childNodes[offset] || null;
                parent.insertBefore(span, refNode);
                const afterNode = document.createTextNode('\u200B');
                parent.insertBefore(afterNode, span.nextSibling);
                const nr = document.createRange();
                nr.setStart(afterNode, 1);
                nr.collapse(true);
                sel.removeAllRanges();
                sel.addRange(nr);
            }
        }

        function insertPlainGridText(text) {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount || !text) return;
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const node = document.createTextNode(text);
            range.insertNode(node);
            const nr = document.createRange();
            nr.setStart(node, node.length);
            nr.collapse(true);
            sel.removeAllRanges();
            sel.addRange(nr);
        }

        function insertEditorHtml(html) {
            const sel = window.getSelection();
            if (!sel || !sel.rangeCount) return;
            const range = sel.getRangeAt(0);
            const template = document.createElement('template');
            template.innerHTML = html;
            const fragment = document.createDocumentFragment();
            let lastNode = null;
            Array.from(template.content.childNodes).forEach(node => {
                lastNode = fragment.appendChild(node);
            });
            range.deleteContents();
            range.insertNode(fragment);
            if (lastNode) {
                const nr = document.createRange();
                nr.setStartAfter(lastNode);
                nr.collapse(true);
                sel.removeAllRanges();
                sel.addRange(nr);
            }
        }

        function insertGridMixedText(text, gridCharRe) {
            for (const ch of text) {
                if (gridCharRe.test(ch)) insertGcSpan(ch);
                else insertPlainGridText(ch === ' ' ? '\u00A0' : ch);
            }
        }

        function insertMathText(text) {
            if (!isGridModeActive()) {
                showMathToast();
                return;
            }
            ensureEditorFocusForMath();

            for (const ch of text) {
                insertGcSpan(ch);
            }

            rememberEditorRange();
            editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
            saveState();
        }

        function escapeMathHtml(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }

        function insertFraction(num, den) {
            const top = escapeMathHtml((num || '').trim() || '□');
            const bottom = escapeMathHtml((den || '').trim() || '□');
            ensureEditorFocusForMath();
            const html = `<span class="math-fraction"><span class="num">${top}</span><span class="bar"></span><span class="den">${bottom}</span></span>`;
            insertEditorHtml(html);
            rememberEditorRange();
            saveState();
        }

        function insertFractionFromInputs() {
            const numInput = document.getElementById('mathFracNum');
            const denInput = document.getElementById('mathFracDen');
            if (!numInput || !denInput) return;
            insertFraction(numInput.value, denInput.value);
            numInput.value = '';
            denInput.value = '';
        }

        function insertMathQuickInput() {
            const input = document.getElementById('mathQuickInput');
            if (!input) return;
            const val = (input.value || '').trim();
            if (!val) return;
            insertMathExpression(val);
            input.value = '';
        }

        function splitMathToken(token) {
            const m = String(token).match(/^([([{]*)(.*?)([)\]},.;:!?]*)$/);
            return m ? { lead: m[1], core: m[2], trail: m[3] } : { lead: '', core: token, trail: '' };
        }

        function renderMathToken(token) {
            if (/^\s+$/.test(token)) return token.replace(/ /g, '&nbsp;');
            const parts = splitMathToken(token);
            const lead = escapeMathHtml(parts.lead);
            const trail = escapeMathHtml(parts.trail);
            const core = parts.core;
            let m = core.match(/^sqrt\((.+)\)$/i);
            if (m) {
                return lead + `<span class="math-root"><span>√</span><span class="radicand">${escapeMathHtml(m[1])}</span></span>` + trail;
            }
            m = core.match(/^root3\((.+)\)$/i);
            if (m) {
                return lead + `<span class="math-root"><sup>3</sup><span>√</span><span class="radicand">${escapeMathHtml(m[1])}</span></span>` + trail;
            }
            m = core.match(/^(.+?)\/(.+)$/);
            if (m && m[1] && m[2] && core.indexOf('://') === -1) {
                return lead + `<span class="math-fraction"><span class="num">${escapeMathHtml(m[1])}</span><span class="bar"></span><span class="den">${escapeMathHtml(m[2])}</span></span>` + trail;
            }
            m = core.match(/^(.+?)\^(.+)$/);
            if (m) {
                return lead + `<span class="math-power"><span>${escapeMathHtml(m[1])}</span><span class="exp">${escapeMathHtml(m[2])}</span></span>` + trail;
            }
            m = core.match(/^(.+?)_(.+)$/);
            if (m) {
                return lead + `<span>${escapeMathHtml(m[1])}<sub>${escapeMathHtml(m[2])}</sub></span>` + trail;
            }
            return lead + escapeMathHtml(core).replace(/-&gt;/g, '→').replace(/\*/g, '×') + trail;
        }

        function renderMathSide(raw) {
            return String(raw).split(/(\s+)/).map(renderMathToken).join('');
        }

        function mathExpressionToHtml(expr) {
            const parts = String(expr).trim().split(/\s+=\s+/);
            const body = parts.map(part => `<span>${renderMathSide(part)}</span>`).join('<span>=</span>');
            const cls = parts.length > 1 ? 'math-equation' : 'math-inline';
            return `<span class="${cls}" contenteditable="false">${body}</span>`;
        }

        function insertMathExpression(expr) {
            if (isGridModeActive()) {
                insertMathText(expr);
            } else {
                insertTextSym(expr);
            }
        }


        editor.addEventListener('mouseup', rememberEditorRange);
        editor.addEventListener('keyup', rememberEditorRange);
        document.addEventListener('pointerdown', (e) => {
            const panel = document.getElementById('mathPanel');
            const btn = document.getElementById('mathTool');
            const toolbarBtn = document.getElementById('mathEditorTool');
            if (!panel || !panel.classList.contains('visible')) return;
            if (panel.contains(e.target) || (btn && btn.contains(e.target)) || (toolbarBtn && toolbarBtn.contains(e.target))) return;
            closeMathPanel();
        });
        var mathQuickInput = document.getElementById('mathQuickInput');
        if (mathQuickInput) {
            mathQuickInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    insertMathQuickInput();
                }
            });
        }
        var mathFracNumEl = document.getElementById('mathFracNum');
        var mathFracDenEl = document.getElementById('mathFracDen');
        [mathFracNumEl, mathFracDenEl].forEach((el) => {
            if (!el) return;
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    insertFractionFromInputs();
                }
            });
        });

        // === SHAPES ===
        var currentShape = 'rect';

        function toggleShapePicker() {
            if (window._collabRole === 'student') return;
            closeMathPanel();
            const picker = document.getElementById('shapePicker');
            const visible = picker.classList.contains('visible');
            if (visible) {
                picker.classList.remove('visible');
                setDrawMode('off');
            } else {
                picker.classList.add('visible');
                // set draw mode to shape without toggling off
                drawMode = 'shape';
                document.body.classList.add('drawing-active');
                syncDrawModeButtons();
            }
        }

        function selectShape(shape) {
            currentShape = shape;
            document.getElementById('shapePicker').classList.remove('visible');
            document.querySelectorAll('.shape-opt').forEach(b =>
                b.classList.toggle('active', b.dataset.shape === shape));
            drawMode = 'shape';
            document.body.classList.add('drawing-active');
            syncDrawModeButtons();
        }

        // === SVG DOM SHAPES SYSTEM ===
        var allShapes = JSON.parse(localStorage.getItem('board_shapes')) || {};

        function saveShapes() {
            try {
                localStorage.setItem('board_shapes', JSON.stringify(allShapes));
            } catch (e) {
                console.warn('Не вдалось зберегти фігури:', e);
            }
        }

        function getPageShapes() {
            return allShapes[currentPageIndex] || [];
        }

        function setPageShapes(list) {
            allShapes[currentPageIndex] = list;
        }

        function buildSvgPath(shape, w, h) {
            const x1 = 0, y1 = 0, x2 = w, y2 = h;
            const cx = w / 2, cy = h / 2, rx = w / 2, ry = h / 2;
            switch (shape) {
                case 'rect': return `<rect x="0" y="0" width="${w}" height="${h}"/>`;
                case 'round-rect': {
                    const r = Math.min(w, h) * 0.15;
                    return `<rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}"/>`;
                }
                case 'circle': {
                    const R = Math.min(rx, ry);
                    return `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${R}"/>`;
                }
                case 'ellipse': return `<ellipse cx="${cx}" cy="${cy}" rx="${Math.max(1, rx)}" ry="${Math.max(1, ry)}"/>`;
                case 'triangle': return `<polygon points="${cx},${y1} ${x2},${y2} ${x1},${y2}"/>`;
                case 'right-triangle': return `<polygon points="${x1},${y1} ${x1},${y2} ${x2},${y2}"/>`;
                case 'diamond': return `<polygon points="${cx},${y1} ${x2},${cy} ${cx},${y2} ${x1},${cy}"/>`;
                case 'star': {
                    const R = Math.min(rx, ry), r2 = R * 0.4;
                    let pts = '';
                    for (let i = 0; i < 10; i++) {
                        const a = (i * Math.PI / 5) - Math.PI / 2;
                        const rad = i % 2 === 0 ? R : r2;
                        pts += (cx + Math.cos(a) * rad) + ',' + (cy + Math.sin(a) * rad) + (i < 9 ? ' ' : '');
                    }
                    return `<polygon points="${pts}"/>`;
                }
                case 'arrow-r': {
                    const aw = w, ah = h, hd = Math.min(aw * 0.4, ah), th = ah * 0.4;
                    return `<polygon points="${x1},${cy - th / 2} ${x2 - hd},${cy - th / 2} ${x2 - hd},${y1} ${x2},${cy} ${x2 - hd},${y2} ${x2 - hd},${cy + th / 2} ${x1},${cy + th / 2}"/>`;
                }
                case 'double-arrow': {
                    const aw = w, ah = h, hd = Math.min(aw * 0.25, ah), th = ah * 0.35;
                    return `<polygon points="${x1},${cy} ${x1 + hd},${y1} ${x1 + hd},${cy - th / 2} ${x2 - hd},${cy - th / 2} ${x2 - hd},${y1} ${x2},${cy} ${x2 - hd},${y2} ${x2 - hd},${cy + th / 2} ${x1 + hd},${cy + th / 2} ${x1 + hd},${y2}"/>`;
                }
                case 'heart': {
                    const s = Math.min(rx, ry);
                    return `<path d="M${cx},${cy + s * 0.8} C${cx - s * 1.5},${cy - s * 0.2} ${cx - s * 2},${cy - s} ${cx},${cy - s * 0.4} C${cx + s * 2},${cy - s} ${cx + s * 1.5},${cy - s * 0.2} ${cx},${cy + s * 0.8}Z"/>`;
                }
                case 'hexagon': {
                    const R = Math.min(rx, ry);
                    let pts = '';
                    for (let i = 0; i < 6; i++) {
                        const a = (Math.PI / 3) * i - Math.PI / 6;
                        pts += (cx + Math.cos(a) * R) + ',' + (cy + Math.sin(a) * R) + (i < 5 ? ' ' : '');
                    }
                    return `<polygon points="${pts}"/>`;
                }
                default: return `<rect x="0" y="0" width="${w}" height="${h}"/>`;
            }
        }

        function createShapeEl(data) {
            const el = document.createElement('div');
            el.className = 'board-shape';
            el.id = 'bshp-' + data.id;
            el.style.left = data.x + 'px';
            el.style.top = data.y + 'px';
            el.style.width = data.w + 'px';
            el.style.height = data.h + 'px';

            const svgNS = 'http://www.w3.org/2000/svg';
            const svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('viewBox', `0 0 ${data.w} ${data.h}`);
            svg.setAttribute('preserveAspectRatio', 'none');
            svg.innerHTML = buildSvgPath(data.shape, data.w, data.h);
            svg.querySelector('*').setAttribute('fill', 'none');
            svg.querySelector('*').setAttribute('stroke', data.color);
            svg.querySelector('*').setAttribute('stroke-width', data.strokeWidth || 2);
            svg.querySelector('*').setAttribute('stroke-linecap', 'round');
            svg.querySelector('*').setAttribute('stroke-linejoin', 'round');
            el.appendChild(svg);

            const delBtn = document.createElement('button');
            delBtn.className = 'board-shape-delete';
            delBtn.title = 'Видалити фігуру';
            delBtn.textContent = '×';
            delBtn.addEventListener('pointerdown', e => e.stopPropagation());
            delBtn.addEventListener('click', e => {
                e.stopPropagation();
                deleteShape(data.id, el);
            });
            el.appendChild(delBtn);

            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'board-shape-resize';
            resizeHandle.title = 'Змінити розмір';
            makeShapeResizable(el, resizeHandle, data, svg);
            el.appendChild(resizeHandle);

            makeShapeDraggable(el, data);

            el.addEventListener('pointerdown', () => {
                document.querySelectorAll('.board-shape.selected').forEach(b => b.classList.remove('selected'));
                el.classList.add('selected');
            });

            return el;
        }

        function makeShapeDraggable(el, data) {
            let startX, startY, origLeft, origTop, dragging = false;

            function onStart(e) {
                if (e.target.classList.contains('board-shape-resize') ||
                    e.target.classList.contains('board-shape-delete')) return;
                e.preventDefault();
                dragging = true;
                const pt = e.touches ? e.touches[0] : e;
                startX = pt.clientX; startY = pt.clientY;
                origLeft = parseInt(el.style.left) || 0;
                origTop = parseInt(el.style.top) || 0;
                el.style.zIndex = 62;
                el.style.cursor = 'grabbing';
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchend', onEnd);
            }

            function onMove(e) {
                if (!dragging) return;
                e.preventDefault();
                const pt = e.touches ? e.touches[0] : e;
                el.style.left = (origLeft + pt.clientX - startX) + 'px';
                el.style.top = (origTop + pt.clientY - startY) + 'px';
            }

            function onEnd() {
                if (!dragging) return;
                dragging = false;
                el.style.zIndex = 52;
                el.style.cursor = 'grab';
                data.x = parseInt(el.style.left) || 0;
                data.y = parseInt(el.style.top) || 0;
                saveShapes();
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchend', onEnd);
            }

            el.addEventListener('mousedown', onStart);
            el.addEventListener('touchstart', onStart, { passive: false });
        }

        function makeShapeResizable(el, handle, data, svg) {
            let startX, startY, startW, startH, resizing = false;

            function onStart(e) {
                e.preventDefault(); e.stopPropagation();
                resizing = true;
                const pt = e.touches ? e.touches[0] : e;
                startX = pt.clientX; startY = pt.clientY;
                startW = parseInt(el.style.width) || 100;
                startH = parseInt(el.style.height) || 100;
                el.style.zIndex = 63;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchend', onEnd);
            }

            function onMove(e) {
                if (!resizing) return;
                e.preventDefault();
                const pt = e.touches ? e.touches[0] : e;
                const newW = Math.max(40, startW + pt.clientX - startX);
                const newH = Math.max(40, startH + pt.clientY - startY);
                el.style.width = newW + 'px';
                el.style.height = newH + 'px';
                svg.setAttribute('viewBox', `0 0 ${newW} ${newH}`);
                svg.innerHTML = buildSvgPath(data.shape, newW, newH);
                svg.querySelector('*').setAttribute('fill', 'none');
                svg.querySelector('*').setAttribute('stroke', data.color);
                svg.querySelector('*').setAttribute('stroke-width', data.strokeWidth || 2);
                svg.querySelector('*').setAttribute('stroke-linecap', 'round');
                svg.querySelector('*').setAttribute('stroke-linejoin', 'round');
            }

            function onEnd() {
                if (!resizing) return;
                resizing = false;
                el.style.zIndex = 52;
                data.w = parseInt(el.style.width) || 100;
                data.h = parseInt(el.style.height) || 100;
                saveShapes();
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchend', onEnd);
            }

            handle.addEventListener('mousedown', onStart);
            handle.addEventListener('touchstart', onStart, { passive: false });
        }

        function deleteShape(id, el) {
            el.style.transition = 'all 0.2s ease';
            el.style.transform = 'scale(0.8)';
            el.style.opacity = '0';
            setTimeout(() => {
                el.remove();
                const list = getPageShapes().filter(s => s.id !== id);
                setPageShapes(list);
                saveShapes();
            }, 200);
        }

        function renderShapes(pageIndex) {
            document.querySelectorAll('.board-shape').forEach(s => s.remove());
            const list = allShapes[pageIndex] || [];
            list.forEach(data => {
                const el = createShapeEl(data);
                card.appendChild(el);
            });
        }

        function addShapeToPage(x1, y1, x2, y2) {
            const x = Math.min(x1, x2);
            const y = Math.min(y1, y2);
            const w = Math.max(40, Math.abs(x2 - x1));
            const h = Math.max(40, Math.abs(y2 - y1));
            const id = Date.now();
            const data = {
                id, shape: currentShape,
                x, y, w, h,
                color: currentColor,
                strokeWidth: Math.max(1.5, brushSize * 0.75)
            };
            const list = getPageShapes();
            list.push(data);
            setPageShapes(list);
            saveShapes();
            const el = createShapeEl(data);
            card.appendChild(el);
            // Select it immediately
            document.querySelectorAll('.board-shape.selected').forEach(b => b.classList.remove('selected'));
            el.classList.add('selected');
        }

        function syncDrawModeButtons() {
            document.getElementById('pencilTool').classList.toggle('active', drawMode === 'pencil');
            document.getElementById('eraserTool').classList.toggle('active', drawMode === 'eraser');
            document.getElementById('lineTool').classList.toggle('active', drawMode === 'line');
            document.getElementById('shapeTool').classList.toggle('active', drawMode === 'shape');
        }

        function drawShapeOnCanvas(ctx, shape, x1, y1, x2, y2) {
            const w = x2 - x1, h = y2 - y1;
            const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
            const rx = Math.abs(w) / 2, ry = Math.abs(h) / 2;
            ctx.beginPath();
            switch (shape) {
                case 'rect': ctx.rect(x1, y1, w, h); break;
                case 'round-rect': {
                    const r = Math.min(Math.abs(w), Math.abs(h)) * 0.15;
                    if (ctx.roundRect) ctx.roundRect(x1, y1, w, h, r);
                    else ctx.rect(x1, y1, w, h);
                    break;
                }
                case 'circle': {
                    ctx.arc(cx, cy, Math.max(rx, ry), 0, Math.PI * 2); break;
                }
                case 'ellipse': ctx.ellipse(cx, cy, rx || 1, ry || 1, 0, 0, Math.PI * 2); break;
                case 'triangle':
                    ctx.moveTo(cx, y1); ctx.lineTo(x2, y2); ctx.lineTo(x1, y2); ctx.closePath(); break;
                case 'right-triangle':
                    ctx.moveTo(x1, y1); ctx.lineTo(x1, y2); ctx.lineTo(x2, y2); ctx.closePath(); break;
                case 'diamond':
                    ctx.moveTo(cx, y1); ctx.lineTo(x2, cy); ctx.lineTo(cx, y2); ctx.lineTo(x1, cy); ctx.closePath(); break;
                case 'star': {
                    const R = Math.min(rx, ry), r2 = R * 0.4;
                    for (let i = 0; i < 10; i++) {
                        const a = (i * Math.PI / 5) - Math.PI / 2;
                        const rad = i % 2 === 0 ? R : r2;
                        const px = cx + Math.cos(a) * rad, py = cy + Math.sin(a) * rad;
                        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                    }
                    ctx.closePath(); break;
                }
                case 'arrow-r': {
                    const aw = Math.abs(w), ah = Math.abs(h), hd = Math.min(aw * 0.4, ah), th = ah * 0.4, dx = w >= 0 ? 1 : -1;
                    ctx.moveTo(x1, cy - th / 2); ctx.lineTo(x1 + dx * (aw - hd), cy - th / 2);
                    ctx.lineTo(x1 + dx * (aw - hd), cy - ah / 2); ctx.lineTo(x2, cy);
                    ctx.lineTo(x1 + dx * (aw - hd), cy + ah / 2); ctx.lineTo(x1 + dx * (aw - hd), cy + th / 2);
                    ctx.lineTo(x1, cy + th / 2); ctx.closePath(); break;
                }
                case 'double-arrow': {
                    const aw = Math.abs(w), ah = Math.abs(h), hd = Math.min(aw * 0.25, ah), th = ah * 0.35, dx = w >= 0 ? 1 : -1;
                    ctx.moveTo(x1, cy); ctx.lineTo(x1 + dx * hd, cy - ah / 2); ctx.lineTo(x1 + dx * hd, cy - th / 2);
                    ctx.lineTo(x2 - dx * hd, cy - th / 2); ctx.lineTo(x2 - dx * hd, cy - ah / 2); ctx.lineTo(x2, cy);
                    ctx.lineTo(x2 - dx * hd, cy + ah / 2); ctx.lineTo(x2 - dx * hd, cy + th / 2);
                    ctx.lineTo(x1 + dx * hd, cy + th / 2); ctx.lineTo(x1 + dx * hd, cy + ah / 2); ctx.closePath(); break;
                }
                case 'heart': {
                    const s = Math.min(rx, ry);
                    ctx.moveTo(cx, cy + s * 0.8);
                    ctx.bezierCurveTo(cx - s * 1.5, cy - s * 0.2, cx - s * 2, cy - s, cx, cy - s * 0.4);
                    ctx.bezierCurveTo(cx + s * 2, cy - s, cx + s * 1.5, cy - s * 0.2, cx, cy + s * 0.8);
                    break;
                }
                case 'hexagon': {
                    const R = Math.min(rx, ry);
                    for (let i = 0; i < 6; i++) {
                        const a = (Math.PI / 3) * i - Math.PI / 6;
                        const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
                        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                    }
                    ctx.closePath(); break;
                }
            }
        }

        function setDrawMode(mode) {
            /* Учні не можуть малювати/стирати */
            if (window._collabRole === 'student') { mode = 'off'; }
            if (drawMode === mode) {
                drawMode = 'off';
                document.body.classList.remove('drawing-active');
            } else {
                drawMode = mode;
                if (mode !== 'off') document.body.classList.add('drawing-active');
                else document.body.classList.remove('drawing-active');
            }
            // Деактивувати стікери при виборі будь-якого іншого інструменту
            if (stickerMode && drawMode !== 'off') {
                stickerMode = false;
                document.getElementById('stickerTool').classList.remove('active');
                document.body.classList.remove('sticker-mode');
            }
            if (drawMode !== 'shape') document.getElementById('shapePicker').classList.remove('visible');
            syncDrawModeButtons();
            // Show/hide brush slider only when pencil is toggled
            if (mode === 'pencil') {
                if (drawMode === 'pencil') {
                    showBrushSlider();
                } else {
                    hideBrushSlider();
                }
                hideEraserSlider();
            } else if (mode === 'eraser') {
                if (drawMode === 'eraser') {
                    showEraserSlider();
                } else {
                    hideEraserSlider();
                }
                hideBrushSlider();
            } else {
                hideBrushSlider();
                hideEraserSlider();
            }
        }

        function getCoordinates(e) {
            const rect = canvas.getBoundingClientRect();
            let clientX = e.clientX;
            let clientY = e.clientY;
            if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            return { x: clientX - rect.left, y: clientY - rect.top };
        }

        function startDrawing(e) {
            if (drawMode === 'off') return;
            isDrawing = true;

            const coords = getCoordinates(e);

            // Ініціалізація змінних згладжування для нового мазка
            smoothedCoords = { x: coords.x, y: coords.y };
            lastMid = { x: coords.x, y: coords.y };
            lastTime = Date.now();
            points = [{ x: coords.x, y: coords.y, time: lastTime }];
            lastWidth = brushSize * 0.5; // Делікатна початкова товщина

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (drawMode === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = currentColor;
                ctx.fillStyle = currentColor;
            }

            snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Початкова точка
            if (drawMode === 'pencil' || drawMode === 'eraser') {
                ctx.beginPath();
                ctx.arc(coords.x, coords.y, (drawMode === 'eraser' ? eraserSize : brushSize * 0.5) / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(coords.x, coords.y);
            }
        }

        function draw(e) {
            if (!isDrawing) return;
            e.preventDefault();
            const rawCoords = getCoordinates(e);
            const now = Date.now();

            if (drawMode === 'pencil' || drawMode === 'eraser') {
                // 1. Фільтр згладжування (Експоненціальне середнє - EMA)
                smoothedCoords.x = smoothedCoords.x * smoothing + rawCoords.x * (1 - smoothing);
                smoothedCoords.y = smoothedCoords.y * smoothing + rawCoords.y * (1 - smoothing);

                const lastPoint = points[points.length - 1];
                const dt = Math.max(1, now - lastPoint.time);

                const dx = smoothedCoords.x - lastPoint.x;
                const dy = smoothedCoords.y - lastPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const velocity = distance / dt;

                const sMin = brushSize * 0.5;
                const sMax = brushSize * 1.6;
                let targetWidth;
                if (drawMode === 'eraser') {
                    targetWidth = eraserSize;
                } else {
                    targetWidth = Math.min(sMax, Math.max(sMin, sMin + velocity * 2.5));
                }

                // Плавна зміна самої товщини
                const currentWidth = lastWidth + (targetWidth - lastWidth) * 0.15;

                // 2. Побудова кривої Безьє замість прямої лінії
                const currentMid = {
                    x: (lastPoint.x + smoothedCoords.x) / 2,
                    y: (lastPoint.y + smoothedCoords.y) / 2
                };

                ctx.beginPath();
                ctx.moveTo(lastMid.x, lastMid.y);
                ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, currentMid.x, currentMid.y);

                ctx.lineWidth = currentWidth;
                ctx.stroke();

                lastWidth = currentWidth;
                lastMid = currentMid;
                points.push({ x: smoothedCoords.x, y: smoothedCoords.y, time: now });

            } else if (drawMode === 'line') {
                ctx.putImageData(snapshot, 0, 0);
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                ctx.lineTo(rawCoords.x, rawCoords.y);
                ctx.lineWidth = brushSize * 0.75;
                ctx.stroke();
            } else if (drawMode === 'shape') {
                ctx.putImageData(snapshot, 0, 0);
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = Math.max(1.5, brushSize * 0.75);
                drawShapeOnCanvas(ctx, currentShape, points[0].x, points[0].y, rawCoords.x, rawCoords.y);
                ctx.stroke();
            }
        }

        function stopDrawing(e) {
            if (!isDrawing) return;
            isDrawing = false;
            // Скасовуємо дебаунс тексту — стан буде збережено нижче з актуальним canvas
            clearTimeout(textDebounceTimeout);
            if (drawMode === 'shape' && points.length > 0) {
                // Restore canvas without the preview shape
                ctx.putImageData(snapshot, 0, 0);
                // Get end coords
                const rawCoords = e ? getCoordinates(e) : points[points.length - 1];
                const endX = rawCoords.x !== undefined ? rawCoords.x : (points[points.length - 1] ? points[points.length - 1].x : points[0].x);
                const endY = rawCoords.y !== undefined ? rawCoords.y : (points[points.length - 1] ? points[points.length - 1].y : points[0].y);
                // Only create shape if it has meaningful size
                const dx = Math.abs(endX - points[0].x);
                const dy = Math.abs(endY - points[0].y);
                if (dx > 10 || dy > 10) {
                    // Convert canvas coords to card-relative coords
                    const cardRect = card.getBoundingClientRect();
                    const canvasRect = canvas.getBoundingClientRect();
                    const offsetX = canvasRect.left - cardRect.left;
                    const offsetY = canvasRect.top - cardRect.top + card.scrollTop;
                    addShapeToPage(
                        points[0].x + offsetX, points[0].y + offsetY,
                        endX + offsetX, endY + offsetY
                    );
                    // Після малювання фігури — повертаємо режим тексту, кнопка відтискається
                    setDrawMode('off');
                    editor.focus();
                }
                saveState();
            } else {
                saveState();
            }
            points = [];
        }

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        canvas.addEventListener('touchcancel', stopDrawing);

        // === ДОВІЛЬНИЙ ТЕКСТ ===
        var freetextMode = false;
        var freetextPendingPos = null; // {x, y} where the click happened
        var allFreetexts = JSON.parse(localStorage.getItem('board_freetexts')) || {};

        function saveFreetexts() {
            try { localStorage.setItem('board_freetexts', JSON.stringify(allFreetexts)); } catch (e) { }
        }

        function getPageFreetexts() { return allFreetexts[currentPageIndex] || []; }
        function setPageFreetexts(list) { allFreetexts[currentPageIndex] = list; }

        function toggleFreetextMode() {
            freetextMode = !freetextMode;
            const btn = document.getElementById('freetextTool');
            btn.classList.toggle('active', freetextMode);
            if (freetextMode) {
                setDrawMode('off');
                if (stickerMode) toggleStickerMode();
                document.body.classList.add('sticker-mode'); // reuse pointer-event blocking
            } else {
                document.body.classList.remove('sticker-mode');
            }
        }

        var embedPendingAction = null;
        var embedPendingPos = null;

        function openEmbedModal(action, x, y) {
            embedPendingAction = action;
            embedPendingPos = { x, y };
            const modal = document.getElementById('embedModal');
            const title = document.getElementById('embedModalTitleText');
            const iconWrap = document.getElementById('embedModalIconWrapper');
            const input = document.getElementById('embedInput');

            input.value = '';

            const _embedT = (uiText[state.lang] || uiText.ua);
            title.textContent = _embedT.embedTitle;
            iconWrap.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
            input.placeholder = _embedT.embedPlaceholder;
            const _embedCancelBtn = document.getElementById('embedCancelBtn');
            if (_embedCancelBtn) _embedCancelBtn.textContent = _embedT.embedCancel;
            const _embedOkBtn = document.getElementById('embedOkBtn');
            if (_embedOkBtn) _embedOkBtn.textContent = _embedT.embedOk;

            modal.classList.add('visible');
            setTimeout(() => input.focus(), 100);
        }

        function closeEmbedModal() {
            document.getElementById('embedModal').classList.remove('visible');
            embedPendingAction = null;
        }

        function confirmEmbedInput() {
            const input = document.getElementById('embedInput').value;
            const action = embedPendingAction;
            const pos = embedPendingPos || { x: 100, y: 100 };
            closeEmbedModal();
            
            if (!input.trim() || !action) return;

            const ytMatch = input.trim().match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
            
            const id = Date.now();
            const card = document.getElementById('notebookCard');
            let data;

            if (ytMatch && !input.trim().includes('<iframe') && !input.trim().includes('<html')) {
                // YouTube Link
                const videoId = ytMatch[1];
                data = { id, videoId, x: pos.x, y: pos.y, w: 420 };
            } else {
                // iFrame, HTML snippet, or general URL
                let finalHtml = input.trim();
                if (/^https?:\/\/[^\s<]+$/.test(finalHtml)) {
                    finalHtml = `<iframe src="${finalHtml}" width="100%" height="100%" frameborder="0"></iframe>`;
                }
                data = { id, htmlContent: finalHtml, x: pos.x, y: pos.y, w: 420 };
            }

            const list = getPageYtWindows();
            list.push(data);
            setPageYtWindows(list);
            saveYtWindows();
            createYoutubeFloatWindow(data, card);
        }

        function openFreetextModal(x, y) {
            freetextPendingPos = { x, y };
            const modal = document.getElementById('freetextModal');
            const input = document.getElementById('freetextInput');
            // Set font to match current card font
            const isHand = card.classList.contains('font-hand');
            const isPrint = card.classList.contains('font-print');
            if (isHand) {
                input.style.fontFamily = "'Propysy', cursive";
                input.style.fontSize = '22px';
            } else if (isPrint) {
                input.style.fontFamily = "'Georgia', serif";
                input.style.fontStyle = 'italic';
                input.style.fontSize = '18px';
            } else {
                input.style.fontFamily = '';
                input.style.fontStyle = '';
                input.style.fontSize = '';
            }
            input.value = '';
            modal.classList.add('visible');
            setTimeout(() => input.focus(), 100);
        }

        function closeFreetextModal() {
            document.getElementById('freetextModal').classList.remove('visible');
            freetextPendingPos = null;
        }

        function confirmFreetextInput() {
            const input = document.getElementById('freetextInput');
            const text = input.value.trim();
            if (!text || !freetextPendingPos) { closeFreetextModal(); return; }
            const { x, y } = freetextPendingPos;
            closeFreetextModal();
            addFreetextToPage(x, y, text);
        }

        function addFreetextToPage(x, y, text) {
            const id = Date.now();
            // Detect current font
            const fontClass = card.classList.contains('font-hand') ? 'font-hand'
                : card.classList.contains('font-print') ? 'font-print' : 'font-print';
            const color = currentColor || '#497bb8';
            const data = { id, text, x, y, w: 180, h: null, rotation: 0, fontClass, color, fontSize: null };
            const list = getPageFreetexts();
            list.push(data);
            setPageFreetexts(list);
            saveFreetexts();

            const el = createFreetextEl(data);
            card.appendChild(el);
        }

        function getFontStyleForData(data) {
            if (data.fontClass === 'font-hand') {
                return { fontFamily: "'Propysy', cursive", fontSize: data.fontSize || '24px', fontStyle: 'normal' };
            }
            return { fontFamily: "'Georgia', serif", fontSize: data.fontSize || '26px', fontStyle: 'italic' };
        }

        function createFreetextEl(data) {
            const el = document.createElement('div');
            el.className = 'board-freetext';
            el.id = 'bft-' + data.id;
            el.style.left = data.x + 'px';
            el.style.top = data.y + 'px';
            el.style.width = data.w + 'px';
            if (data.h) el.style.height = data.h + 'px';
            if (data.rotation) el.style.transform = `rotate(${data.rotation}deg)`;
            el.textContent = data.text;

            const fs = getFontStyleForData(data);
            el.style.fontFamily = fs.fontFamily;
            el.style.fontSize = fs.fontSize;
            el.style.fontStyle = fs.fontStyle;
            el.style.color = data.color || '#497bb8';

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'board-freetext-delete';
            delBtn.title = 'Видалити текст';
            delBtn.textContent = '×';
            delBtn.addEventListener('pointerdown', e => e.stopPropagation());
            delBtn.addEventListener('click', e => {
                e.stopPropagation();
                el.style.transform = el.style.transform + ' scale(0.8)';
                el.style.opacity = '0';
                el.style.transition = 'all 0.2s ease';
                setTimeout(() => {
                    el.remove();
                    const list = getPageFreetexts().filter(f => f.id !== data.id);
                    setPageFreetexts(list);
                    saveFreetexts();
                }, 200);
            });
            el.appendChild(delBtn);

            // Resize handle
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'board-freetext-resize';
            resizeHandle.title = 'Змінити розмір';
            makeFreetextResizable(el, resizeHandle, data);
            el.appendChild(resizeHandle);

            // Rotate handle
            const rotateHandle = document.createElement('div');
            rotateHandle.className = 'board-freetext-rotate';
            rotateHandle.title = 'Обертати';
            rotateHandle.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
            makeFreetextRotatable(el, rotateHandle, data);
            el.appendChild(rotateHandle);

            makeFreetextDraggable(el, data);

            el.addEventListener('pointerdown', () => {
                document.querySelectorAll('.board-freetext.selected').forEach(b => b.classList.remove('selected'));
            });

            // Подвійний клік — редагування тексту на місці
            el.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                if (el.classList.contains('editing')) return;

                el.classList.add('editing');
                el.contentEditable = 'true';
                el.focus();

                // Ставимо курсор у місці кліку
                const range = document.caretRangeFromPoint
                    ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
                if (range) {
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else {
                    const sel = window.getSelection();
                    const r = document.createRange();
                    r.selectNodeContents(el);
                    r.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(r);
                }

                function finishEdit() {
                    if (!el.classList.contains('editing')) return;
                    el.classList.remove('editing');
                    el.contentEditable = 'false';

                    // Збираємо текст, ігноруючи кнопки-нащадки
                    let newText = '';
                    el.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE) newText += node.textContent;
                        else if (node.tagName === 'BR') newText += '\n';
                        else if (node.classList &&
                            !node.classList.contains('board-freetext-delete') &&
                            !node.classList.contains('board-freetext-resize') &&
                            !node.classList.contains('board-freetext-rotate')) {
                            newText += node.textContent;
                        }
                    });
                    newText = newText.trim();

                    if (!newText) {
                        el.remove();
                        setPageFreetexts(getPageFreetexts().filter(f => f.id !== data.id));
                    } else {
                        data.text = newText;
                        // Замінюємо текстові вузли одним чистим
                        el.childNodes.forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
                        });
                        el.insertBefore(document.createTextNode(newText), el.firstChild);
                        const list = getPageFreetexts();
                        const found = list.find(f => f.id === data.id);
                        if (found) found.text = newText;
                        setPageFreetexts(list);
                    }
                    saveFreetexts();
                }

                function onKey(ev) {
                    if (ev.key === 'Escape') {
                        ev.preventDefault();
                        el.removeEventListener('keydown', onKey);
                        document.removeEventListener('pointerdown', onOutside);
                        el.classList.remove('editing');
                        el.contentEditable = 'false';
                        // Відновлюємо оригінал
                        el.childNodes.forEach(node => {
                            if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
                        });
                        el.insertBefore(document.createTextNode(data.text), el.firstChild);
                    }
                }

                function onOutside(ev) {
                    if (!el.contains(ev.target)) {
                        el.removeEventListener('keydown', onKey);
                        document.removeEventListener('pointerdown', onOutside);
                        finishEdit();
                    }
                }

                el.addEventListener('keydown', onKey);
                setTimeout(() => document.addEventListener('pointerdown', onOutside), 0);
            });

            return el;
        }

        function makeFreetextDraggable(el, data) {
            let startX, startY, origLeft, origTop, isDragging = false;

            el.addEventListener('pointerdown', function (e) {
                if (e.target !== el) return;
                if (el.classList.contains('editing')) return;
                isDragging = true;
                startX = e.clientX; startY = e.clientY;
                origLeft = parseInt(el.style.left) || 0;
                origTop = parseInt(el.style.top) || 0;
                el.setPointerCapture(e.pointerId);
                el.style.zIndex = 65;
                e.preventDefault();
            });

            el.addEventListener('pointermove', function (e) {
                if (!isDragging) return;
                el.style.left = (origLeft + e.clientX - startX) + 'px';
                el.style.top = (origTop + e.clientY - startY) + 'px';
            });

            el.addEventListener('pointerup', function (e) {
                if (!isDragging) return;
                isDragging = false;
                data.x = parseInt(el.style.left) || 0;
                data.y = parseInt(el.style.top) || 0;
                saveFreetexts();
                el.style.zIndex = '';
            });
        }

        function makeFreetextResizable(el, handle, data) {
            let startX, startY, origW, origH, isDragging = false;

            handle.addEventListener('pointerdown', function (e) {
                e.preventDefault(); e.stopPropagation();
                isDragging = true;
                startX = e.clientX; startY = e.clientY;
                origW = el.offsetWidth; origH = el.offsetHeight;
                handle.setPointerCapture(e.pointerId);
            });

            handle.addEventListener('pointermove', function (e) {
                if (!isDragging) return;
                const newW = Math.max(60, origW + e.clientX - startX);
                const newH = Math.max(20, origH + e.clientY - startY);
                el.style.width = newW + 'px';
                el.style.height = newH + 'px';
            });

            handle.addEventListener('pointerup', function (e) {
                if (!isDragging) return;
                isDragging = false;
                data.w = el.offsetWidth;
                data.h = el.offsetHeight;
                saveFreetexts();
            });
        }

        function makeFreetextRotatable(el, handle, data) {
            let isDragging = false;

            handle.addEventListener('pointerdown', function (e) {
                e.preventDefault(); e.stopPropagation();
                isDragging = true;
                handle.setPointerCapture(e.pointerId);
            });

            handle.addEventListener('pointermove', function (e) {
                if (!isDragging) return;
                const rect = el.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90;
                data.rotation = Math.round(angle);
                el.style.transform = `rotate(${data.rotation}deg)`;
            });

            handle.addEventListener('pointerup', function () {
                if (!isDragging) return;
                isDragging = false;
                saveFreetexts();
            });
        }

        function renderFreetexts(pageIndex) {
            document.querySelectorAll('.board-freetext').forEach(el => el.remove());
            const list = allFreetexts[pageIndex] || [];
            list.forEach(data => card.appendChild(createFreetextEl(data)));
        }

        // Click on card to trigger freetext modal
        // Клік по зошиту поза режимом редагування — відкрити знову якщо є текст
        // (card click to open board mode is handled via onclick="handleCardClick(event)" in HTML)

        card.addEventListener('click', (e) => {
            if (!freetextMode) return;
            if (e.target.closest('.board-freetext') || e.target.closest('.sticker')) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top + card.scrollTop;
            openFreetextModal(x - 10, y - 10);
            // Exit freetext mode after placing
            toggleFreetextMode();
        });

        // Keyboard confirmation in modal
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('freetextModal').classList.contains('visible')) {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    confirmFreetextInput();
                }
            }
        });

        // === СТІКЕРИ ===
        var stickerMode = false;
        var allStickers = JSON.parse(localStorage.getItem('board_stickers')) || {}; // { pageIndex: [{id, text, x, y}] }

        function saveStickers() {
            localStorage.setItem('board_stickers', JSON.stringify(allStickers));
        }

        function getPageStickers() {
            return allStickers[currentPageIndex] || [];
        }

        function setPageStickers(list) {
            allStickers[currentPageIndex] = list;
        }

        function toggleStickerMode() {
            stickerMode = !stickerMode;
            const btn = document.getElementById('stickerTool');
            btn.classList.toggle('active', stickerMode);

            if (stickerMode) {
                setDrawMode('off');
                document.body.classList.add('sticker-mode');
            } else {
                document.body.classList.remove('sticker-mode');
            }
        }

        function createStickerEl(data) {
            const el = document.createElement('div');
            el.className = 'sticker';
            el.id = 'sticker-' + data.id;
            el.style.left = data.x + 'px';
            el.style.top = data.y + 'px';

            const delBtn = document.createElement('button');
            delBtn.className = 'sticker-delete';
            delBtn.title = 'Видалити стікер';
            delBtn.textContent = '×';
            delBtn.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSticker(data.id, el);
            });

            const textArea = document.createElement('div');
            textArea.className = 'sticker-text';
            textArea.contentEditable = 'true';
            textArea.spellcheck = false;
            textArea.textContent = data.text || '';
            textArea.addEventListener('input', () => {
                data.text = textArea.textContent;
                saveStickers();
            });
            // Only allow plain text — block image paste
            textArea.addEventListener('paste', (e) => {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                if (text) document.execCommand('insertText', false, text);
            });
            // Block image drops into sticker
            textArea.addEventListener('dragover', (e) => e.preventDefault());
            textArea.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const text = e.dataTransfer && e.dataTransfer.getData('text/plain');
                if (text) document.execCommand('insertText', false, text);
            });
            // Prevent drag when clicking text
            textArea.addEventListener('mousedown', (e) => e.stopPropagation());
            textArea.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

            el.appendChild(delBtn);
            el.appendChild(textArea);

            var _isStudent = typeof window.getCollabRole === 'function' && window.getCollabRole() === 'student';
            if (_isStudent) {
                // Учень не може видаляти чи переміщувати стікери вчителя
                delBtn.style.display = 'none';
                el.style.cursor = 'default';
                textArea.contentEditable = 'false';
            } else {
                makeDraggable(el, data);
            }

            return el;
        }

        function makeDraggable(el, data) {
            let startX, startY, origLeft, origTop;

            function onMouseDown(e) {
                if (e.target.classList.contains('sticker-delete') || e.target.classList.contains('sticker-text')) return;
                e.preventDefault();
                startX = e.clientX;
                startY = e.clientY;
                origLeft = parseInt(el.style.left) || 0;
                origTop = parseInt(el.style.top) || 0;
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                el.style.zIndex = 60;
            }

            function onMouseMove(e) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                el.style.left = (origLeft + dx) + 'px';
                el.style.top = (origTop + dy) + 'px';
            }

            function onMouseUp() {
                data.x = parseInt(el.style.left) || 0;
                data.y = parseInt(el.style.top) || 0;
                saveStickers();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                el.style.zIndex = 50;
            }

            // Touch support
            function onTouchStart(e) {
                if (e.target.classList.contains('sticker-delete') || e.target.classList.contains('sticker-text')) return;
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                origLeft = parseInt(el.style.left) || 0;
                origTop = parseInt(el.style.top) || 0;
                document.addEventListener('touchmove', onTouchMove, { passive: false });
                document.addEventListener('touchend', onTouchEnd);
                el.style.zIndex = 60;
            }

            function onTouchMove(e) {
                e.preventDefault();
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                el.style.left = (origLeft + dx) + 'px';
                el.style.top = (origTop + dy) + 'px';
            }

            function onTouchEnd() {
                data.x = parseInt(el.style.left) || 0;
                data.y = parseInt(el.style.top) || 0;
                saveStickers();
                document.removeEventListener('touchmove', onTouchMove);
                document.removeEventListener('touchend', onTouchEnd);
                el.style.zIndex = 50;
            }

            el.addEventListener('mousedown', onMouseDown);
            el.addEventListener('touchstart', onTouchStart, { passive: true });
        }

        function addStickerToPage(x, y) {
            const id = Date.now();
            const data = { id, text: '', x, y };
            const list = getPageStickers();
            list.push(data);
            setPageStickers(list);
            saveStickers();

            const el = createStickerEl(data);
            card.appendChild(el);

            // Focus text immediately
            setTimeout(() => el.querySelector('.sticker-text').focus(), 50);
        }
        window.addStickerToPage = addStickerToPage;
        window.toggleStickerMode = toggleStickerMode;
        window._getStickerMode = function() { return stickerMode; };
        window._setStickerMode = function(v) { stickerMode = v; };

        function deleteSticker(id, el) {
            el.style.transform = 'scale(0.8)';
            el.style.opacity = '0';
            el.style.transition = 'all 0.2s ease';
            setTimeout(() => {
                el.remove();
                const list = getPageStickers().filter(s => s.id !== id);
                setPageStickers(list);
                saveStickers();
            }, 200);
        }

        function renderStickers(pageIndex) {
            // Remove existing stickers from DOM
            document.querySelectorAll('.sticker').forEach(s => s.remove());
            const list = allStickers[pageIndex] || [];
            list.forEach(data => {
                const el = createStickerEl(data);
                card.appendChild(el);
            });
        }

        // Click on card to add sticker in sticker mode
        card.addEventListener('click', (e) => {
            if (!stickerMode) return;
            if (e.target.closest('.sticker')) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top + card.scrollTop;
            addStickerToPage(x, y);
        });

        function clearBoard() {
            if (boardPages.length > 1) {
                // Видалити стікери та зображення поточної сторінки, перенумерувати решту
                if (allStickers[currentPageIndex] !== undefined) {
                    delete allStickers[currentPageIndex];
                }
                const newStickers = {};
                Object.keys(allStickers).forEach(k => {
                    const ki = parseInt(k);
                    newStickers[ki > currentPageIndex ? ki - 1 : ki] = allStickers[k];
                });
                allStickers = newStickers;
                saveStickers();

                if (allImages[currentPageIndex] !== undefined) {
                    delete allImages[currentPageIndex];
                }
                const newImages = {};
                Object.keys(allImages).forEach(k => {
                    const ki = parseInt(k);
                    newImages[ki > currentPageIndex ? ki - 1 : ki] = allImages[k];
                });
                allImages = newImages;
                saveImages();

                if (allYtWindows[currentPageIndex] !== undefined) {
                    delete allYtWindows[currentPageIndex];
                }
                const newYtWindows = {};
                Object.keys(allYtWindows).forEach(k => {
                    const ki = parseInt(k);
                    newYtWindows[ki > currentPageIndex ? ki - 1 : ki] = allYtWindows[k];
                });
                allYtWindows = newYtWindows;
                saveYtWindows();

                if (allShapes[currentPageIndex] !== undefined) {
                    delete allShapes[currentPageIndex];
                }
                const newShapes = {};
                Object.keys(allShapes).forEach(k => {
                    const ki = parseInt(k);
                    newShapes[ki > currentPageIndex ? ki - 1 : ki] = allShapes[k];
                });
                allShapes = newShapes;
                saveShapes();

                if (allFreetexts[currentPageIndex] !== undefined) {
                    delete allFreetexts[currentPageIndex];
                }
                const newFreetexts = {};
                Object.keys(allFreetexts).forEach(k => {
                    const ki = parseInt(k);
                    newFreetexts[ki > currentPageIndex ? ki - 1 : ki] = allFreetexts[k];
                });
                allFreetexts = newFreetexts;
                saveFreetexts();

                document.querySelectorAll('.sticker').forEach(s => s.remove());
                document.querySelectorAll('.board-image').forEach(el => el.remove());
                document.querySelectorAll('.board-shape').forEach(el => el.remove());
                document.querySelectorAll('.board-freetext').forEach(el => el.remove());
                document.querySelectorAll('.paste-marker').forEach(m => m.remove());
                document.querySelectorAll('.yt-float-window').forEach(w => { var f = w.querySelector('iframe'); if (f) f.remove(); w.remove(); });
                document.querySelectorAll('.nb-floating-table').forEach(el => el.remove());

                // Видалити поточну сторінку
                boardPages.splice(currentPageIndex, 1);
                if (currentPageIndex >= boardPages.length) currentPageIndex = boardPages.length - 1;
                localStorage.setItem('board_pages', JSON.stringify(boardPages));
                localStorage.setItem('board_page_index', currentPageIndex);

                // Завантажити нову поточну сторінку
                historyStack = [];
                currentStep = -1;
                const pageData = boardPages[currentPageIndex];
                editor.innerHTML = pageData.html || '';
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (pageData.canvas) {
                    drawCanvasDataUrlToCurrentSize(pageData.canvas, saveState);
                } else {
                    saveState();
                }

                renderStickers(currentPageIndex);
                renderImages(currentPageIndex);
                renderFreetexts(currentPageIndex);
            } else {
                // Єдина сторінка — просто очистити вміст
                editor.innerHTML = '';
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                boardPages = [{ html: '', canvas: '' }];
                currentPageIndex = 0;
                localStorage.setItem('board_pages', JSON.stringify(boardPages));
                localStorage.setItem('board_page_index', 0);
                localStorage.removeItem('global_board_text');

                allStickers = {};
                saveStickers();
                document.querySelectorAll('.sticker').forEach(s => s.remove());

                allImages = {};
                saveImages();
                document.querySelectorAll('.board-image').forEach(el => el.remove());

                allYtWindows = {};
                saveYtWindows();
                document.querySelectorAll('.yt-float-window').forEach(el => { var f = el.querySelector('iframe'); if (f) f.remove(); el.remove(); });

                allShapes = {};
                saveShapes();
                document.querySelectorAll('.board-shape').forEach(el => el.remove());

                allFreetexts = {};
                saveFreetexts();
                document.querySelectorAll('.board-freetext').forEach(el => el.remove());

                document.querySelectorAll('.nb-floating-table').forEach(el => el.remove());
                if (boardPages[0]) boardPages[0].tables = [];

                historyStack = [];
                currentStep = -1;
                saveState();

                document.querySelectorAll('.paste-marker').forEach(m => m.remove());
                document.querySelectorAll('.yt-float-window').forEach(w => { var f = w.querySelector('iframe'); if (f) f.remove(); w.remove(); });
                setBrushSize(3);
            }

            updatePageIndicator();
            updateDateHeaderVisibility();
            updateWordCounter();
            setDrawMode('off');
            if (stickerMode) toggleStickerMode();

            setTimeout(() => { editor.focus(); }, 50);
        }

        // === ЗОБРАЖЕННЯ ===
        var allImages = JSON.parse(localStorage.getItem('board_images')) || {};

        function saveImages() {
            try {
                localStorage.setItem('board_images', JSON.stringify(allImages));
            } catch (e) {
                // localStorage може переповнитись через base64 — тихо ігноруємо
                console.warn('Не вдалось зберегти зображення:', e);
            }
        }

        function getPageImages() {
            return allImages[currentPageIndex] || [];
        }

        function setPageImages(list) {
            allImages[currentPageIndex] = list;
        }

