        /* ══ COLLAB (Firebase Realtime DB) ══ */
        (function () {
            var _role = null, _code = null, _myUid = null;
            /* Експортуємо для доступу з toggleBoardMode */
            Object.defineProperty(window, '_collabRole', { get: function(){ return _role; } });
            Object.defineProperty(window, '_collabProtect', { get: function(){ return _role === 'student'; } });
            var _db = null, _sessionRef = null, _studentsRef = null;
            var _locked = false, _btimer = null;
            var _lastTeacherEditAt = 0;
            var _zoneHistory = {};
            var _pendingTeacherState = null; // стан вчителя, що чекає поки учень завершить друкування
            var _applyingRemote = false; // true поки застосовуються чужі зміни — MutationObserver не скидає таймер
            var _isComposing = false; // true під час IME-композиції (мобільна клавіатура)
            var _pendingTimer = null; // таймер для повторних спроб застосувати _pendingTeacherState
            var _lastStudentInputAt = 0; // мітка останнього введення тексту учнем
            var _students = {};
            var _zoneCounter = 0;          // лічильник зон для data-zone-id

            function _syncZoneCounter() {
                var max = _zoneCounter;
                var ed = document.getElementById('boardEditor');
                if (ed) {
                    ed.querySelectorAll('.student-editable[data-zone-id]').forEach(function(z) {
                        var m = /^z(\d+)$/.exec(z.getAttribute('data-zone-id') || '');
                        if (m) max = Math.max(max, parseInt(m[1], 10) || 0);
                    });
                }
                if (typeof boardPages !== 'undefined' && Array.isArray(boardPages)) {
                    boardPages.forEach(function(page) {
                        var html = page && page.html ? String(page.html) : '';
                        html.replace(/data-zone-id=["']z(\d+)["']/g, function(_, n) {
                            max = Math.max(max, parseInt(n, 10) || 0);
                            return _;
                        });
                    });
                }
                _zoneCounter = max;
            }

            function _rangeTouchesEditableZone(range, ed) {
                if (!range || !ed || typeof range.intersectsNode !== 'function') return false;
                var zones = ed.querySelectorAll('.student-editable');
                for (var i = 0; i < zones.length; i++) {
                    try {
                        if (range.intersectsNode(zones[i])) return true;
                    } catch(e) {}
                }
                return false;
            }

            /* Хелпер локалізації (використовує глобальний state.lang) */
            function _t(key) {
                var lang = (typeof state !== 'undefined' && state.lang) ? state.lang : 'ua';
                var dict = (typeof uiText !== 'undefined') ? uiText[lang] : null;
                if (dict && dict[key] !== undefined) return dict[key];
                var ua = (typeof uiText !== 'undefined') ? uiText.ua : {};
                return ua[key] || key;
            }

            /* ── Ініціалізація Firebase ── */
            function _initFirebase() {
                if (!window.firebase || !firebase.database || !firebase.auth) {
                    _db = null;
                    return;
                }
                if (!firebase.apps || firebase.apps.length === 0) {
                    firebase.initializeApp(FIREBASE_CONFIG);
                }
                _db = firebase.database();
                /* Анонімна авторизація — без реєстрації */
                firebase.auth().signInAnonymously().then(function (cred) {
                    _myUid = cred.user.uid;
                }).catch(function (e) { console.warn('Firebase auth:', e); });
            }

            function _genCode() {
                var c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = '';
                for (var i = 0; i < 6; i++) r += c[Math.floor(Math.random() * c.length)];
                return r;
            }
            function _esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
            function _safeHtml(html) {
                if (typeof window.sanitizeNotebookHtml === 'function') return window.sanitizeNotebookHtml(html);
                return _esc(html);
            }
            function _safeStateValue(key, value) {
                if (key !== 'board_pages') return value;
                try {
                    var pages = JSON.parse(value);
                    if (!Array.isArray(pages)) return value;
                    pages.forEach(function(page) {
                        if (page && page.html !== undefined) page.html = _safeHtml(page.html);
                    });
                    return JSON.stringify(pages);
                } catch (e) {
                    return value;
                }
            }
            function _findZoneById(ed, zid) {
                if (!ed) return null;
                var zones = ed.querySelectorAll('.student-editable[data-zone-id]');
                for (var i = 0; i < zones.length; i++) {
                    if (zones[i].getAttribute('data-zone-id') === String(zid)) return zones[i];
                }
                return null;
            }

            function _getState() {
                var keys = ['board_lang', 'board_type', 'board_font', 'board_bg', 'board_pages',
                    'board_page_index', 'board_shapes', 'board_freetexts', 'board_stickers', 'board_timers'];
                var s = {};
                keys.forEach(function (k) { var v = localStorage.getItem(k); if (v !== null) s[k] = _safeStateValue(k, v); });
                /* Перевизначаємо board_timers живим станом щоб isRunning передавався коректно */
                if (typeof allTimers !== 'undefined') {
                    s['board_timers'] = JSON.stringify(allTimers);
                }
                /* Перевизначаємо board_stickers живим станом (allStickers в пам'яті свіжіший за localStorage) */
                if (typeof allStickers !== 'undefined') {
                    s['board_stickers'] = JSON.stringify(allStickers);
                }
                /* Перевизначаємо board_yt_windows живим станом */
                if (typeof allYtWindows !== 'undefined') {
                    s['board_yt_windows'] = JSON.stringify(allYtWindows);
                }
                s._protect = true;
                var ed = document.getElementById('boardEditor');
                if (ed) {
                    if (_role === 'student') {
                        /* Учень: надсилаємо лише вміст своєї зони */
                        var zones = {};
                        ed.querySelectorAll('.student-editable[data-zone-id]').forEach(function(z) {
                            var zoneUid = z.getAttribute('data-student-uid');
                            if (!zoneUid || zoneUid === _myUid) {
                                var zid = z.getAttribute('data-zone-id');
                                zones[zid] = _safeHtml(z.innerHTML);
                                if (!_zoneHistory[zid]) _zoneHistory[zid] = [];
                                _zoneHistory[zid].push(zones[zid]);
                                if (_zoneHistory[zid].length > 15) _zoneHistory[zid].shift();
                            }
                        });
                        s._studentZones = JSON.stringify(zones);
                        s._studentName = _myStudentName;
                        s._studentOnly = true;
                        /* Надсилаємо вміст комірок таблиць (лише html, не позицію/розмір) */
                        if (typeof window.saveTablesState === 'function') {
                            try {
                                var _sTables = window.saveTablesState().map(function(t) {
                                    return { rows: t.rows };
                                });
                                s._studentTables = JSON.stringify(_sTables);
                            } catch(e) {}
                        }
                    } else {
                        /* Вчитель: надсилаємо HTML із вмістом зон.
                           Також окремо надсилаємо вміст кожної зони через _teacherZones —
                           учень використає це щоб застосувати правки вчителя поверх своїх. */
                        s._h = _safeHtml(ed.innerHTML);
                        s._preserveZones = true;
                        /* Збираємо вміст усіх зон окремо */
                        var tzones = {};
                        ed.querySelectorAll('.student-editable[data-zone-id]').forEach(function(z) {
                            tzones[z.getAttribute('data-zone-id')] = _safeHtml(z.innerHTML);
                        });
                        s._teacherZones = JSON.stringify(tzones);
                        /* Вбудовуємо живий стан таблиць поточної сторінки в board_pages */
                        if (typeof window.saveTablesState === 'function') {
                            try {
                                var _lsPages = JSON.parse(localStorage.getItem('board_pages') || '[]');
                                if (Array.isArray(_lsPages)) {
                                    var _pidx = parseInt(localStorage.getItem('board_page_index') || '0') || 0;
                                    if (_lsPages[_pidx]) {
                                        _lsPages[_pidx].tables = window.saveTablesState();
                                        s['board_pages'] = JSON.stringify(_lsPages);
                                    }
                                }
                            } catch(e) {}
                        }
                    }
                }
                var dd = document.getElementById('displayDate'); if (dd) s._d = _safeHtml(dd.innerHTML);
                var dt = document.getElementById('displayType'); if (dt) s._t = _safeHtml(dt.innerHTML);
                return s;
            }

            function _applyState(s) {
                if (!s) return;
                /* _studentOnly стани обробляються через peer listener — ігноруємо тут */
                if (s._studentOnly) return;
                _locked = true;
                var keys = ['board_lang', 'board_type', 'board_font', 'board_bg', 'board_pages',
                    'board_page_index', 'board_shapes', 'board_freetexts', 'board_stickers', 'board_timers'];
                keys.forEach(function (k) { if (s[k] !== undefined) localStorage.setItem(k, _safeStateValue(k, s[k])); });

                /* ── Синхронізуємо глобальний state та UI-перемикачі ── */
                if (typeof state !== 'undefined') {
                    if (s['board_lang'] !== undefined) state.lang = s['board_lang'];
                    if (s['board_type'] !== undefined) state.type = s['board_type'];
                    if (s['board_font'] !== undefined) state.font = s['board_font'];
                    if (s['board_bg']   !== undefined) state.bg   = s['board_bg'];

                    /* Оновлюємо активний клас на кнопках-перемикачах */
                    var _toggleMap = { langToggle: 'lang', typeToggle: 'type', fontToggle: 'font', bgToggle: 'bg' };
                    Object.keys(_toggleMap).forEach(function(tid) {
                        var tkey = _toggleMap[tid];
                        var tcont = document.getElementById(tid);
                        if (!tcont) return;
                        tcont.querySelectorAll('.segmented-btn').forEach(function(btn) {
                            btn.classList.toggle('active', btn.dataset.val === state[tkey]);
                        });
                    });

                    /* Застосовуємо клас картки (зошит/фон/шрифт) і мову UI,
                       але НЕ перегенеруємо дату — вона вже встановлена через s._d */
                    var _syncCard = document.getElementById('notebookCard');
                    if (_syncCard) _syncCard.className = 'card ' + state.bg + ' ' + state.font;
                    if (typeof applyUiLanguage === 'function') applyUiLanguage();
                    if (typeof updateMathToolAvailability === 'function') updateMathToolAvailability();
                    if (typeof updateAllPills === 'function') updateAllPills();
                }

                var ed = document.getElementById('boardEditor');
                if (ed && s._h !== undefined) {
                    if (_role === 'student') {
                        /* Зберігаємо лише СВІЙ вміст зони перед оновленням вчителя */
                        var myZoneContents = {};
                        ed.querySelectorAll('.student-editable[data-zone-id]').forEach(function(z) {
                            var zoneUid = z.getAttribute('data-student-uid');
                            var isMyZone = !zoneUid || zoneUid === _myUid;
                            if (isMyZone) {
                                myZoneContents[z.getAttribute('data-zone-id')] = z.innerHTML;
                            }
                        });

                        /* Розпаковуємо _teacherZones — що вчитель написав у кожну зону */
                        var teacherZones = {};
                        try {
                            if (s._teacherZones) teacherZones = JSON.parse(s._teacherZones);
                        } catch(e) {}

                        ed.setAttribute('contenteditable', 'false');
                        /* Вставляємо HTML вчителя — там є його правки у зонах інших учнів */
                        ed.innerHTML = _safeHtml(s._h);
                        /* Видаляємо віджети таймерів — учень бачить лише badge-відлік, не повний віджет */
                        ed.querySelectorAll('.board-timer').forEach(function(t) { t.remove(); });

                        /* Визначаємо вміст кожної зони:
                           - якщо вчитель змінив зону (_teacherZones[zid] відрізняється від того що учень бачив)
                             → беремо версію вчителя (вона вже є в ed.innerHTML після вставки s._h)
                           - якщо вчитель не чіпав зону → відновлюємо власний текст учня */
                        ed.querySelectorAll('.student-editable[data-zone-id]').forEach(function(z) {
                            var zid = z.getAttribute('data-zone-id');
                            var zoneUid = z.getAttribute('data-student-uid');
                            var isMyZone = !zoneUid || zoneUid === _myUid;
                            if (isMyZone) {
                                var teacherWrote = teacherZones[zid] !== undefined ? teacherZones[zid] : null;
                                var myWrote = myZoneContents[zid] !== undefined ? myZoneContents[zid] : null;
                                
                                /* Зберігаємо базову лінію вчителя (що він знає про нашу зону) */
                                if (!_zoneHistory[zid]) _zoneHistory[zid] = [];
                                _zoneHistory[zid].push(teacherWrote !== null ? teacherWrote : z.innerHTML);

                                /* Якщо вчитель змінив вміст зони — його версія має пріоритет */
                                if (teacherWrote !== null && teacherWrote !== myWrote) {
                                    z.innerHTML = _safeHtml(teacherWrote);
                                    _zoneHistory[zid].push(z.innerHTML);
                                } else if (myWrote !== null && myWrote !== '') {
                                    /* Вчитель не чіпав зону — відновлюємо власний текст учня */
                                    z.innerHTML = myWrote;
                                }
                                /* Інакше залишаємо те що вже є в s._h */
                                z.setAttribute('contenteditable', 'true');
                            } else {
                                /* Чужа/вчительська зона — залишаємо текст з s._h */
                                z.removeAttribute('contenteditable');
                            }
                            var assignedName = z.getAttribute('data-assigned-to');
                            if (assignedName) z.setAttribute('data-edited-by', assignedName);
                        });
                    } else {
                        /* Звичайний режим: відновлюємо нормальний contenteditable на редакторі */
                        ed.setAttribute('contenteditable', 'true');
                        ed.querySelectorAll('.student-editable').forEach(function(z) {
                            z.removeAttribute('contenteditable');
                        });
                        ed.innerHTML = _safeHtml(s._h);
                    }
                }
                var dd = document.getElementById('displayDate'); if (dd && s._d !== undefined) dd.innerHTML = _safeHtml(s._d);
                var dt = document.getElementById('displayType'); if (dt && s._t !== undefined) dt.innerHTML = _safeHtml(s._t);

                /* ── Синхронізуємо масив сторінок та індекс ── */
                if (s['board_pages'] !== undefined) {
                    try {
                        var _syncPages = JSON.parse(s['board_pages']);
                        if (Array.isArray(_syncPages)) {
                            boardPages.length = 0;
                            _syncPages.forEach(function(p) { boardPages.push(p); });
                        }
                    } catch(e) {}
                }
                var idx = parseInt(localStorage.getItem('board_page_index') || '0');
                if (!isNaN(idx) && idx >= 0 && idx < boardPages.length) {
                    currentPageIndex = idx;
                    /* Оновлюємо збережений HTML поточної сторінки живим вмістом від вчителя */
                    if (s._h !== undefined && boardPages[idx]) boardPages[idx].html = _safeHtml(s._h);
                }
                if (typeof updatePageIndicator === 'function') updatePageIndicator();
                if (typeof updateDateHeaderVisibility === 'function') updateDateHeaderVisibility();

                /* ── Рендеримо елементи ── */
                /* Таймери: вчитель бачить повний віджет; учень — лише текстовий відлік */
                if (_role === 'student') {
                    _renderStudentTimers(s['board_timers'], idx);
                } else {
                    if (typeof window.renderTimers === 'function') window.renderTimers(idx);
                }
                if (typeof window.renderShapes === 'function') window.renderShapes(idx);
                if (typeof window.renderFreeTexts === 'function') window.renderFreeTexts(idx);

                /* ── Стікери: оновлюємо in-memory allStickers перед рендером ── */
                if (s['board_stickers'] !== undefined) {
                    try {
                        var _syncedStickers = JSON.parse(s['board_stickers']);
                        if (typeof allStickers !== 'undefined' && _syncedStickers && typeof _syncedStickers === 'object') {
                            Object.keys(allStickers).forEach(function(k) { delete allStickers[k]; });
                            Object.keys(_syncedStickers).forEach(function(k) { allStickers[k] = _syncedStickers[k]; });
                        }
                    } catch(e) {}
                }
                if (typeof window.renderStickers === 'function') window.renderStickers(idx);

                /* Таблиці: відновлюємо з board_pages поточної сторінки */
                if (typeof window.restoreTablesState === 'function') {
                    var _tablesData = [];
                    try {
                        var _pagesRaw = s['board_pages'] || localStorage.getItem('board_pages');
                        if (_pagesRaw) {
                            var _pages = JSON.parse(_pagesRaw);
                            if (Array.isArray(_pages) && _pages[idx]) {
                                _tablesData = _pages[idx].tables || [];
                            }
                        }
                    } catch(e) {}
                    window.restoreTablesState(_tablesData);
                }

                /* ── Відео / iFrame / HTML-віджети ── */
                if (s['board_yt_windows'] !== undefined) {
                    try {
                        var _syncedYt = JSON.parse(s['board_yt_windows']);
                        if (typeof allYtWindows !== 'undefined' && _syncedYt && typeof _syncedYt === 'object') {
                            Object.keys(allYtWindows).forEach(function(k) { delete allYtWindows[k]; });
                            Object.keys(_syncedYt).forEach(function(k) { allYtWindows[k] = _syncedYt[k]; });
                        }
                    } catch(e) {}
                    if (typeof renderYtWindows === 'function') renderYtWindows(idx);
                }

                setTimeout(function () { _locked = false; }, 400);
            }

            /* ── Перевірка чи учень зараз активно друкує ── */
            function _isStudentActivelyEditing() {
                if (_role !== 'student') return false;
                if (_isComposing) return true;
                var ed = document.getElementById('boardEditor');
                var activeEl = document.activeElement;
                if (!ed || !activeEl) return false;
                /* Якщо фокус у редакторі — ЗАВЖДИ вважаємо, що учень редагує.
                   На мобільному будь-яка заміна innerHTML скине фокус і закриє клавіатуру,
                   навіть якщо учень просто зробив паузу щоб подумати. */
                if (ed.contains(activeEl)) {
                    return true;
                }
                return false;
            }

            /* ── Відкладене застосування стану вчителя ──
               Викликається тільки коли учень НЕ знаходиться у текстовому полі.
               Це запобігає деактивації клавіатури під час введення тексту. */
            function _tryApplyPendingTeacherState() {
                if (!_pendingTeacherState || _locked) return;
                /* Якщо учень активно друкує — не чіпаємо, пробуємо пізніше */
                if (_isStudentActivelyEditing()) {
                    _schedulePendingRetry();
                    return;
                }
                var s = _pendingTeacherState;
                _pendingTeacherState = null;
                clearTimeout(_pendingTimer);
                _pendingTimer = null;
                _locked = false;
                _applyState(s);
                _updateStudentLockedHint();
            }

            /* ── Планувальник повторних спроб застосувати відкладений стан ── */
            function _schedulePendingRetry() {
                clearTimeout(_pendingTimer);
                _pendingTimer = setTimeout(_tryApplyPendingTeacherState, 1200);
            }

            /* ── «М'яке» оновлення зон інших учнів без заміни innerHTML ──
               Дозволяє оновити DOM без втрати фокусу / клавіатури.
               Повертає true якщо вдалося оновити хоча б частково. */
            function _softUpdateZones(s) {
                if (!s || !s._h) return false;
                var ed = document.getElementById('boardEditor');
                if (!ed) return false;

                /* Оновлюємо зони ІНШИХ учнів з HTML вчителя —
                   парсимо s._h у тимчасовий DocumentFragment */
                var tmpDiv = document.createElement('div');
                _applyingRemote = true;
                try {
                    tmpDiv.innerHTML = _safeHtml(s._h);
                    /* Знаходимо зони інших учнів у поточному DOM і оновлюємо їх вміст */
                    var currentZones = ed.querySelectorAll('.student-editable[data-zone-id]');
                    currentZones.forEach(function(z) {
                        var zid = z.getAttribute('data-zone-id');
                        var zoneUid = z.getAttribute('data-student-uid');
                        var isMyZone = !zoneUid || zoneUid === _myUid;
                        
                        /* Знаходимо відповідну зону в HTML вчителя */
                        var remoteZone = tmpDiv.querySelector('.student-editable[data-zone-id="' + zid + '"]');
                        if (!remoteZone) return;

                        if (isMyZone) {
                            var hist = _zoneHistory[zid] || [];
                            var histIdx = hist.indexOf(remoteZone.innerHTML);
                            /* Якщо версія вчителя збігається з чимось із нашої недавньої історії, 
                               це старе відлуння через затримку мережі. Ігноруємо. */
                            if (histIdx !== -1) {
                                _zoneHistory[zid] = hist.slice(histIdx);
                                return;
                            }
                        }

                        if (z.innerHTML !== remoteZone.innerHTML) {
                            z.innerHTML = _safeHtml(remoteZone.innerHTML);
                            var an = z.getAttribute('data-assigned-to');
                            if (an) z.setAttribute('data-edited-by', an);
                            if (isMyZone) {
                                if (!_zoneHistory[zid]) _zoneHistory[zid] = [];
                                _zoneHistory[zid].push(z.innerHTML);
                            }
                        }
                    });

                    /* Оновлюємо решту стану (localStorage, стікери, таймери тощо)
                       без заміни ed.innerHTML */
                    var keys = ['board_lang', 'board_type', 'board_font', 'board_bg', 'board_pages',
                        'board_page_index', 'board_shapes', 'board_freetexts', 'board_stickers', 'board_timers'];
                    keys.forEach(function (k) { if (s[k] !== undefined) localStorage.setItem(k, _safeStateValue(k, s[k])); });

                    /* Рендеримо стікери, таймери, фігури */
                    var idx = parseInt(localStorage.getItem('board_page_index') || '0');
                    if (_role === 'student') {
                        _renderStudentTimers(s['board_timers'], idx);
                    }
                    if (typeof window.renderShapes === 'function') window.renderShapes(idx);
                    if (typeof window.renderFreeTexts === 'function') window.renderFreeTexts(idx);

                    /* Стікери */
                    if (s['board_stickers'] !== undefined) {
                        try {
                            var _ss = JSON.parse(s['board_stickers']);
                            if (typeof allStickers !== 'undefined' && _ss && typeof _ss === 'object') {
                                Object.keys(allStickers).forEach(function(k) { delete allStickers[k]; });
                                Object.keys(_ss).forEach(function(k) { allStickers[k] = _ss[k]; });
                            }
                        } catch(e) {}
                    }
                    if (typeof window.renderStickers === 'function') window.renderStickers(idx);

                } catch(e) {}
                setTimeout(function() { _applyingRemote = false; }, 50);
                return true;
            }

            /* ── Застосування стану вчителя — безпечне для мобільних пристроїв ──
               Якщо учень зараз друкує — відкладаємо повне оновлення і робимо лише
               «м'яке» оновлення зон інших учнів. Ніколи не робимо blur() під час
               активного набору тексту на мобільному. */
            function _applyStateFromTeacher(s) {
                if (!s) return;

                /* Якщо учень активно друкує — відкладаємо повне оновлення */
                if (_isStudentActivelyEditing()) {
                    _pendingTeacherState = s;
                    /* М'яко оновлюємо зони інших учнів без заміни innerHTML */
                    _softUpdateZones(s);
                    _schedulePendingRetry();
                    return;
                }

                /* Учень не друкує — можемо безпечно оновити повністю */
                _pendingTeacherState = null;
                clearTimeout(_pendingTimer);
                _pendingTimer = null;
                _locked = false;
                _applyState(s);
                _updateStudentLockedHint();
            }

            var _stimer = null, _myStudentRef = null, _myStudentCode = null;
            var _myStudentName = '';
            var _cursorTimer = null;
            var _studentCursors = {}; // uid -> DOM element
            var _teacherCursorEl = null;
            var _lastTeacherCursorSent = 0;
            var _lastStudentCursorSent = 0;
            var _CURSOR_COLORS = [
                '#e11d48', '#7c3aed', '#0891b2', '#059669',
                '#d97706', '#db2777', '#2563eb', '#16a34a'
            ];
            var _uidColorMap = {};
            var _colorIdx = 0;
            function _colorFor(uid) {
                if (!_uidColorMap[uid]) {
                    _uidColorMap[uid] = _CURSOR_COLORS[_colorIdx % _CURSOR_COLORS.length];
                    _colorIdx++;
                }
                return _uidColorMap[uid];
            }
            function _pageIndex() {
                return (typeof currentPageIndex === 'number' && isFinite(currentPageIndex)) ? currentPageIndex : 0;
            }
            function _zoneFromNode(node) {
                var ed = document.getElementById('boardEditor');
                var cur = node && (node.nodeType === 1 ? node : node.parentNode);
                while (cur && cur !== ed) {
                    if (cur.nodeType === 1 && cur.classList && cur.classList.contains('student-editable')) return cur;
                    cur = cur.parentNode;
                }
                return null;
            }
            function _caretPointFromSelection() {
                var ed = document.getElementById('boardEditor');
                var card = document.getElementById('notebookCard');
                var sel = window.getSelection();
                if (!ed || !card || !sel || !sel.rangeCount) return null;
                var range = sel.getRangeAt(0);
                if (!ed.contains(range.startContainer)) return null;
                var zone = _zoneFromNode(range.startContainer);
                /* Collapsed range для точної позиції каретки (початок виділення) */
                var caretRange = range.cloneRange();
                caretRange.collapse(true);
                var rects = caretRange.getClientRects();
                var rect = (rects && rects.length) ? rects[0] : caretRange.getBoundingClientRect();
                if ((!rect || (!rect.width && !rect.height)) && zone) rect = zone.getBoundingClientRect();
                if (!rect) return null;
                var cardRect = card.getBoundingClientRect();
                return {
                    x: Math.round(rect.left - cardRect.left + card.scrollLeft),
                    y: Math.round(rect.top - cardRect.top + card.scrollTop),
                    h: Math.round(rect.height) || 18,
                    zoneId: zone ? zone.getAttribute('data-zone-id') : '',
                    editing: !!zone
                };
            }
            function _sendCaretFromSelection() {
                if (_role !== 'student') return;
                var p = _caretPointFromSelection();
                if (p) _sendCursor(p.x, p.y, { zoneId: p.zoneId, editing: p.editing, caret: true, h: p.h || 18 });
            }

            /* ── CSS для таймера-учня (ін'єктується один раз) ── */
            function _injectStudentTimerStyle() {
                if (document.getElementById('_stb-style')) return;
                var s = document.createElement('style');
                s.id = '_stb-style';
                var css = '';
                css += '.student-timer-badge{';
                css += 'position:absolute;z-index:55;';
                css += 'display:flex;align-items:center;gap:10px;';
                css += 'background:rgba(15,23,42,0.88);color:#f1f5f9;';
                css += 'border-radius:16px;padding:10px 22px 10px 18px;';
                css += 'font-size:32px;font-weight:800;';
                css += 'font-variant-numeric:tabular-nums;letter-spacing:0.04em;';
                css += 'box-shadow:0 4px 24px rgba(0,0,0,0.22),0 1px 0 rgba(255,255,255,0.06) inset;';
                css += 'backdrop-filter:blur(6px);pointer-events:none;user-select:none;';
                css += 'transition:background 0.35s;}';
                css += '.student-timer-badge.stb-warn{background:rgba(153,27,27,0.90);}';
                css += '.student-timer-badge.stb-done{background:rgba(120,27,27,0.84);color:#fca5a5;}';
                css += '.student-timer-badge .stb-icon{font-size:24px;line-height:1;flex-shrink:0;}';
                css += '.student-timer-badge .stb-col{display:flex;flex-direction:column;}';
                css += '.student-timer-badge .stb-label{';
                css += 'font-size:11px;font-weight:600;letter-spacing:0.10em;';
                css += 'text-transform:uppercase;opacity:0.5;';
                css += 'display:block;line-height:1;margin-bottom:2px;}';
                css += '.student-timer-badge .stb-time{line-height:1;}';
                /* Mobile: fixed, small, top-left corner */
                css += '.student-timer-badge.stb-mobile{';
                css += 'position:fixed !important;';
                css += 'top:12px;left:70px;right:auto !important;bottom:auto !important;';
                css += 'z-index:9999;';
                css += 'gap:5px;padding:5px 11px 5px 9px;';
                css += 'font-size:16px;border-radius:10px;';
                css += 'box-shadow:0 2px 10px rgba(0,0,0,0.28);}';
                css += '.student-timer-badge.stb-mobile .stb-icon{font-size:13px;}';
                css += '.student-timer-badge.stb-mobile .stb-label{font-size:8px;margin-bottom:1px;}';
                css += '.student-timer-badge.stb-mobile .stb-time{font-size:14px;font-weight:800;letter-spacing:0.03em;}';
                s.textContent = css;
                document.head.appendChild(s);
            }

            /* ── Живий відлік таймера для учня ── */
            var _studentTimers = {}; /* id → { rem, total, interval, badge, timeEl, iconEl, lblEl, lastRem } */

            function _clearStudentTimers() {
                Object.keys(_studentTimers).forEach(function(id) {
                    clearInterval(_studentTimers[id].interval);
                    if (_studentTimers[id].badge) _studentTimers[id].badge.remove();
                });
                _studentTimers = {};
            }

            /* Оновлює DOM одного значка, не перестворюючи елемент */
            function _updateSTBDisplay(d) {
                var rem = Math.max(0, d.rem);
                var m = Math.floor(rem / 60), sc = rem % 60;
                d.timeEl.textContent = m.toString().padStart(2,'0') + ':' + sc.toString().padStart(2,'0');
                var isEn = (typeof state !== 'undefined' && state.lang === 'en');
                var isDe = (typeof state !== 'undefined' && state.lang === 'de');
                if (rem <= 0) {
                    d.badge.classList.remove('stb-warn');
                    d.badge.classList.add('stb-done');
                    d.iconEl.textContent = '\u23F0'; /* ⏰ */
                    d.lblEl.textContent  = isEn ? "TIME'S UP" : isDe ? 'ZEIT!' : '\u0427\u0410\u0421!';
                    d.timeEl.textContent = '00:00';
                } else {
                    d.badge.classList.remove('stb-done');
                    d.iconEl.textContent = '\u23F1'; /* ⏱ */
                    d.lblEl.textContent  = isEn || isDe ? 'TIMER' : '\u0422\u0410\u0419\u041C\u0415\u0420';
                    d.badge.classList.toggle('stb-warn', d.total > 0 && rem / d.total < 0.2);
                }
            }

            function _renderStudentTimers(timersJson, pageIdx) {
                if (!timersJson) { _clearStudentTimers(); return; }
                var allT;
                try { allT = JSON.parse(timersJson); } catch(e) { _clearStudentTimers(); return; }
                var list = allT[pageIdx] || allT[String(pageIdx)] || [];
                var isMobile = window.innerWidth <= 768;
                var card = document.getElementById('notebookCard');

                /* Прибираємо значки таймерів, яких більше немає на цій сторінці */
                var activeIds = {};
                list.forEach(function(t) { if (t.totalSeconds > 0) activeIds[t.id] = true; });
                Object.keys(_studentTimers).forEach(function(id) {
                    if (!activeIds[id]) {
                        clearInterval(_studentTimers[id].interval);
                        if (_studentTimers[id].badge) _studentTimers[id].badge.remove();
                        delete _studentTimers[id];
                    }
                });

                var mobileBottom = 70;
                list.forEach(function(t) {
                    if (!t.totalSeconds) return;
                    var rem = t.remainingSeconds || 0;
                    var total = t.totalSeconds;
                    var id = t.id;
                    var isRunning = (t.isRunning === true) && rem > 0;
                    /* Показуємо значок якщо таймер вже тікав (rem < total) або завершився (rem===0),
                       але НЕ показуємо якщо вчитель ще не запускав (rem === total і не running) */
                    var hasStarted = (rem < total) || rem === 0;

                    /* Не показуємо значок поки вчитель не запустив таймер */
                    if (!isRunning && !hasStarted) {
                        /* Якщо значок вже є — ховаємо */
                        var existing = _studentTimers[id];
                        if (existing) {
                            clearInterval(existing.interval);
                            existing.badge.style.display = 'none';
                        }
                        return;
                    }

                    var d = _studentTimers[id];

                    if (!d) {
                        /* ── Перший раз: будуємо значок ── */
                        var badge = document.createElement('div');
                        badge.className = 'student-timer-badge';

                        var icon = document.createElement('span'); icon.className = 'stb-icon';
                        var col  = document.createElement('span'); col.className  = 'stb-col';
                        var lbl  = document.createElement('span'); lbl.className  = 'stb-label';
                        var timeEl = document.createElement('span'); timeEl.className = 'stb-time';

                        col.appendChild(lbl);
                        col.appendChild(timeEl);
                        badge.appendChild(icon);
                        badge.appendChild(col);

                        if (isMobile) {
                            badge.classList.add('stb-mobile');
                            document.body.appendChild(badge);
                        } else {
                            badge.style.left = ((t.x || 20) + 10) + 'px';
                            badge.style.top  = ((t.y || 20) + 10) + 'px';
                            if (card) card.appendChild(badge);
                        }

                        d = { rem: rem, total: total, interval: null,
                              badge: badge, timeEl: timeEl, iconEl: icon, lblEl: lbl };
                        _studentTimers[id] = d;
                    } else {
                        /* Переконуємось що значок видимий */
                        d.badge.style.display = '';
                        /* Оновлюємо позицію якщо таймер перетягнули */
                        if (!isMobile && card) {
                            d.badge.style.left = ((t.x || 20) + 10) + 'px';
                            d.badge.style.top  = ((t.y || 20) + 10) + 'px';
                        }
                        if (isMobile) { /* позиція задана через CSS */ }
                    }

                    /* Визначаємо стан: запущений лише якщо вчитель явно запустив таймер */
                    d.lastRem = rem;
                    d.rem     = rem;
                    d.total   = total;

                    /* Одразу показуємо синхронізоване значення */
                    _updateSTBDisplay(d);

                    /* ── Локальний інтервал для плавного щосекундного тіку ── */
                    if (isRunning && rem > 0) {
                        /* Перезапускаємо інтервал щоб не накопичувався drift */
                        if (d.interval) clearInterval(d.interval);
                        d.interval = setInterval(function() {
                            d.rem = Math.max(0, d.rem - 1);
                            _updateSTBDisplay(d);
                            if (d.rem <= 0) { clearInterval(d.interval); d.interval = null; }
                        }, 1000);
                    } else if (!isRunning && d.interval) {
                        /* Вчитель поставив на паузу — зупиняємо локальний тік */
                        clearInterval(d.interval);
                        d.interval = null;
                    }

                    if (isMobile) mobileBottom += 52;
                });
            }

            function _broadcast() {
                if (_role !== 'teacher' || !_sessionRef) return;
                _sessionRef.child('state').set(_getState());
            }
            function _scheduleBroadcast(ms) { clearTimeout(_btimer); _btimer = setTimeout(_broadcast, ms || 700); }

            /* ── Учень надсилає свій стан вчителю ── */
            function _studentBroadcast() {
                if (_role !== 'student' || !_myStudentRef) return;
                _myStudentRef.child('state').set(_getState());
            }
            function _scheduleStudentBroadcast(ms) { clearTimeout(_stimer); _stimer = setTimeout(_studentBroadcast, ms || 700); }

            /* ── Надсилання позиції курсорів у Firebase ── */
            function _sendCursor(x, y, meta) {
                if (_role !== 'student' || !_myStudentRef) return;
                var now = Date.now();
                /* Для каретного курсору (друкування) — частіше, для миші — рідше */
                var minInterval = (meta && meta.caret) ? 40 : 60;
                if (now - _lastStudentCursorSent < minInterval) return;
                _lastStudentCursorSent = now;
                meta = meta || {};
                _myStudentRef.child('cursor').set({
                    x: x,
                    y: y,
                    h: meta.h || 18,
                    t: now,
                    page: _pageIndex(),
                    zoneId: meta.zoneId || '',
                    editing: !!meta.editing,
                    caret: !!meta.caret
                });
            }
            function _sendTeacherCursor(x, y) {
                if (_role !== 'teacher' || !_sessionRef) return;
                var now = Date.now();
                if (now - _lastTeacherCursorSent < 60) return;
                _lastTeacherCursorSent = now;
                _sessionRef.child('teacherCursor').set({ x: x, y: y, t: now, page: _pageIndex() });
            }
            function _hookCollabCursor() {
                var card = document.getElementById('notebookCard');
                if (!card) return;
                function onMove(e) {
                    var r = card.getBoundingClientRect();
                    var cx = (e.touches ? e.touches[0].clientX : e.clientX);
                    var cy = (e.touches ? e.touches[0].clientY : e.clientY);
                    var x = Math.round(cx - r.left + card.scrollLeft);
                    var y = Math.round(cy - r.top + card.scrollTop);
                    if (_role === 'student') {
                        var zone = _zoneFromNode(e.target);
                        _sendCursor(x, y, { zoneId: zone ? zone.getAttribute('data-zone-id') : '', editing: !!zone });
                    }
                    else if (_role === 'teacher') _sendTeacherCursor(x, y);
                }
                card.addEventListener('mousemove', onMove, { passive: true });
                card.addEventListener('touchmove', onMove, { passive: true });
            }

            /* ── Вчитель ── */
            function _initTeacher() {
                if (!_db) { _tStatus('err', _t('collabErrNoFirebase')); return; }
                _tStatus('wait', _t('collabConnecting'));
                _code = _genCode();

                _sessionRef = _db.ref('sessions/' + _code);
                _studentsRef = _sessionRef.child('students');

                /* Записуємо сесію і сховуємо її при виході */
                _sessionRef.child('active').set(true);
                _sessionRef.child('active').onDisconnect().remove();
                _sessionRef.onDisconnect().remove(); /* при закритті вкладки — видаляємо всю сесію */
                _sessionRef.child('state').set(_getState());

                _role = 'teacher';
                document.getElementById('cCodeEl').textContent = _code;
                /* Автоматично вмикаємо захист — зони завжди відображаються у вчителя */
                var _edT = document.getElementById('boardEditor'); if (_edT) _edT.classList.add('protect-on');

                /* QR-код */
                var url = location.href.split('?')[0] + '?join=' + _code;
                var wrap = document.getElementById('cQrWrap');
                if (wrap && typeof QRCode !== 'undefined') {
                    try {
                        /* Очищаємо тільки QR, не чіпаємо посилання */
                        var oldInner = document.getElementById('cQrInner');
                        if (oldInner) oldInner.innerHTML = '';
                        else {
                            var newInner = document.createElement('div');
                            newInner.id = 'cQrInner';
                            newInner.style.cssText = 'border-radius:8px;overflow:hidden;';
                            wrap.insertBefore(newInner, wrap.firstChild);
                        }
                        new QRCode(document.getElementById('cQrInner'), {
                            text: url,
                            width: 160,
                            height: 160,
                            colorDark: '#1d4ed8',
                            colorLight: '#eff6ff',
                            correctLevel: QRCode.CorrectLevel.M
                        });
                    } catch (e) { console.warn('QR error:', e); }
                }
                var urlEl = document.getElementById('cJoinUrl');
                if (urlEl) urlEl.textContent = url;

                /* Слухаємо учнів — реєстрацію і стан */
                _studentsRef.on('child_added', function (snap) {
                    var uid = snap.key;
                    var data = snap.val() || {};
                    var studentName = (data.name || '').trim() || _t('collabDefaultName');
                    _students[uid] = studentName;
                    _peersUpdate();

                    /* Слухаємо ЛИШЕ зони учня — не весь стан, щоб не затерти інших */
                    (function (uid, studentName) {
                        snap.ref.child('state').on('value', function (statSnap) {
                            if (!statSnap.exists() || _role !== 'teacher') return;
                            var s = statSnap.val();
                            if (!s || !s._studentOnly || !s._studentZones) return;
                            /* Оновлюємо лише зони цього учня — нічого більше не чіпаємо */
                            var ed2 = document.getElementById('boardEditor');
                            if (!ed2) return;
                            /* Встановлюємо прапор, щоб MutationObserver не скидав таймер вчителя */
                            _applyingRemote = true;
                            try {
                                var zones = JSON.parse(s._studentZones);
                                Object.keys(zones).forEach(function(zid) {
                                    var zEl = _findZoneById(ed2, zid);
                                    if (zEl) {
                                        zEl.innerHTML = _safeHtml(zones[zid]);
                                        var an = zEl.getAttribute('data-assigned-to');
                                        if (an) zEl.setAttribute('data-edited-by', an);
                                    }
                                });
                            } catch(e) {}
                            /* Оновлюємо вміст комірок таблиць від учня */
                            if (s._studentTables && typeof window.saveTablesState === 'function') {
                                try {
                                    var sTables = JSON.parse(s._studentTables);
                                    var card2 = document.getElementById('notebookCard');
                                    if (card2) {
                                        var wraps2 = card2.querySelectorAll('.nb-floating-table');
                                        sTables.forEach(function(tData, ti) {
                                            var wrap2 = wraps2[ti];
                                            if (!wrap2 || !tData.rows) return;
                                            var trs2 = wrap2.querySelectorAll('tr');
                                            tData.rows.forEach(function(rowData, ri) {
                                                var tr2 = trs2[ri];
                                                if (!tr2) return;
                                                var tds2 = tr2.querySelectorAll('td');
                                                rowData.forEach(function(cellData, ci) {
                                                    var td2 = tds2[ci];
                                                    if (!td2 || cellData.html === undefined) return;
                                                    var colSep2 = td2.querySelector('.nbt-col-sep');
                                                    var rowSep2 = td2.querySelector('.nbt-row-sep');
                                                    td2.innerHTML = _safeHtml(cellData.html);
                                                    if (colSep2) td2.appendChild(colSep2);
                                                    if (rowSep2) td2.appendChild(rowSep2);
                                                });
                                            });
                                        });
                                        /* Зберігаємо оновлений стан і транслюємо іншим учням */
                                        if (typeof saveState === 'function') saveState();
                                        _scheduleBroadcast(300);
                                    }
                                } catch(e) {}
                            }
                            setTimeout(function() { _applyingRemote = false; }, 50);
                            _showAuthor(studentName);
                            /* НЕ робимо _broadcast() — це затерло б зони інших учнів */
                        });
                        /* Курсор учня */
                        snap.ref.child('cursor').on('value', function (curSnap) {
                            if (!curSnap.exists() || _role !== 'teacher') return;
                            var d = curSnap.val();
                            if (!d || Date.now() - (d.t || 0) > 10000) return;
                            if (d.page !== undefined && parseInt(d.page, 10) !== _pageIndex()) {
                                _removeStudentCursor(uid);
                                _removeStudentTextCaret(uid);
                                return;
                            }
                            var color = _colorFor(uid);
                            if (d.caret) {
                                /* Текстовий каретний курсор — учень друкує */
                                _drawStudentTextCaret(uid, studentName, d.x, d.y, d.h || 18, color);
                            } else {
                                /* Курсор миші — учень рухає мишею */
                                _removeStudentTextCaret(uid);
                                _drawStudentCursor(uid, studentName, d.x, d.y, d);
                            }
                        });
                    })(uid, studentName);
                });
                _studentsRef.on('child_changed', function (snap) {
                    var data = snap.val() || {};
                    _students[snap.key] = (data.name || '').trim() || _t('collabDefaultName');
                    _peersUpdate();
                });
                _studentsRef.on('child_removed', function (snap) {
                    delete _students[snap.key];
                    _removeStudentCursor(snap.key);
                    _removeStudentTextCaret(snap.key);
                    _peersUpdate();
                });

                _tStatus('ok', _t('collabReady'));
                _floatUpdate();
            }

            function _tStatus(cls, txt) {
                var d = document.getElementById('cTDot'), s = document.getElementById('cTStatus');
                if (!d || !s) return;
                d.className = 'cdot' + (cls === 'ok' ? ' ok' : cls === 'wait' ? ' wait' : cls === 'err' ? ' err' : '');
                s.textContent = txt;
            }

            function _peersUpdate() {
                var el = document.getElementById('cPeers'); if (!el) return;
                var uids = Object.keys(_students);
                if (uids.length === 0) {
                    el.textContent = _t('collabNoPeers');
                    _tStatus('ok', _t('collabReady'));
                } else {
                    var html = '<div class="cpeer-title">' + _esc(_t('collabStudentsListTitle')) + '</div><div class="cpeer-list">';
                    uids.forEach(function(uid) {
                        var name = _students[uid] || _t('collabDefaultName');
                        html += '<div class="cpeer-row">'
                            + '<span class="cpeer-name">' + _esc(name) + '</span>'
                            + '<button type="button" class="cpeer-remove" data-uid="' + _esc(uid) + '">' + _esc(_t('collabRemoveStudentBtn')) + '</button>'
                            + '</div>';
                    });
                    html += '</div>';
                    el.innerHTML = html;
                    _tStatus('ok', _t('collabStudentsCount') + uids.length);
                }
                _floatUpdate();
            }

            function _removeStudentFromSession(uid) {
                if (_role !== 'teacher' || !_studentsRef || !uid) return;
                var name = _students[uid] || _t('collabDefaultName');
                window.showConfirmModal(
                    _t('collabConfirmRemoveStudent'),
                    function () { _studentsRef.child(uid).remove(); },
                    { subText: name, yesColor: '#ef4444' }
                );
            }

            /* ── Учень ── */
            window.cJoin = function () {
                var code = (document.getElementById('cCodeIn').value || '').trim().toUpperCase();
                var nameEl = document.getElementById('cName');
                var name = (nameEl && nameEl.value ? nameEl.value : '').trim().replace(/\s+/g, ' ');
                var hasFullName = name.split(' ').filter(Boolean).length >= 2;
                if (!hasFullName) {
                    _sStatus('err', _t('collabErrNoName'));
                    if (nameEl) {
                        nameEl.value = name;
                        nameEl.focus();
                    }
                    return;
                }
                if (code.length !== 6) { _sStatus('err', _t('collabErrNoCode')); return; }
                /* Зберігаємо ім'я локально — наступного разу підставимо автоматично */
                try { localStorage.setItem('collab_student_name', name); } catch(e) {}
                if (!_db) { _sStatus('err', _t('collabErrNoFirebase')); return; }

                var btn = document.getElementById('cJoinBtn'); if (btn) btn.disabled = true;
                _sStatus('wait', _t('collabConnecting'));

                var sessRef = _db.ref('sessions/' + code);
                sessRef.child('active').once('value', function (snap) {
                    if (!snap.exists() || !snap.val()) {
                        _sStatus('err', _t('collabErrNotFound'));
                        if (btn) btn.disabled = false;
                        return;
                    }
                    /* Реєструємо учня */
                    var uid = _myUid || ('s_' + Date.now());
                    _myUid = uid; /* зберігаємо uid для порівняння зон */
                    var myRef = sessRef.child('students/' + uid);
                    myRef.set({ name: name });
                    myRef.onDisconnect().remove();
                    myRef.on('value', function(mySnap) {
                        if (_role === 'student' && !mySnap.exists()) {
                            _handleStudentRemovedFromSession(btn);
                        }
                    });
                    _myStudentRef = myRef;
                    _myStudentCode = code;
                    _myStudentName = name;

                    _role = 'student';
                    _floatUpdate();
                    _hideStudentDangerBtns();
                    /* Одразу блокуємо редактор — _applyState відкриє лише дозволені зони */
                    var _ed0 = document.getElementById('boardEditor');
                    if (_ed0) _ed0.setAttribute('contenteditable', 'false');
                    /* Показуємо підказку учню */
                    _showStudentLockedHint();

                    /* Отримуємо поточний стан від вчителя */
                    sessRef.child('state').once('value', function (statSnap) {
                        if (statSnap.exists()) _applyStateFromTeacher(statSnap.val());
                        _updateStudentLockedHint();
                        _sStatus('ok', _t('collabSynced'));
                        var b = document.getElementById('cBanner'); if (b) b.classList.add('on');
                        /* Автоматично відкриваємо зошит у режимі редагування */
                        var _alreadyBoard = (typeof isBoardMode !== 'undefined' && isBoardMode)
                            || document.body.classList.contains('board-mode');
                        if (!_alreadyBoard) {
                            var _isMobileStudent = window.innerWidth <= 900 || ('ontouchstart' in window);
                            if (_isMobileStudent) {
                                /* Мобільний: звичайний toggleBoardMode() */
                                if (typeof toggleBoardMode === 'function') toggleBoardMode();
                            } else {
                                /* Десктоп: активуємо board-mode БЕЗ fullscreen,
                                   бо requestFullscreen() вимагає прямого жесту користувача
                                   і буде відхилений у Firebase-callback'і */
                                document.body.classList.add('board-mode');
                                if (typeof updateDateHeaderVisibility === 'function') updateDateHeaderVisibility();
                                var _spDesk = (window._collabRole === 'student' && window._collabProtect);
                                var _edDesk = document.getElementById('boardEditor');
                                if (_edDesk && !_spDesk) _edDesk.setAttribute('contenteditable', 'true');
                                var _ddDesk = document.getElementById('displayDate');
                                var _dtDesk = document.getElementById('displayType');
                                if (_ddDesk) _ddDesk.setAttribute('contenteditable', String(!_spDesk));
                                if (_dtDesk) _dtDesk.setAttribute('contenteditable', String(!_spDesk));
                                if (typeof setDrawMode === 'function') setDrawMode('off');
                                setTimeout(function() {
                                    if (typeof syncCanvasSize === 'function') {
                                        var _pd = typeof boardPages !== 'undefined' && boardPages[typeof currentPageIndex !== 'undefined' ? currentPageIndex : 0];
                                        syncCanvasSize((_pd && _pd.canvas) || null);
                                    }
                                    if (_edDesk) _edDesk.focus();
                                }, 300);
                            }
                        }
                        setTimeout(cCloseModal, 2000);
                    });

                    /* Слухаємо оновлення стану від вчителя */
                    sessRef.child('state').on('value', function (statSnap) {
                        if (!statSnap.exists()) return;
                        var s = statSnap.val();
                        if (!s || s._studentOnly) return;
                        /* _applyStateFromTeacher сам вирішує: якщо учень друкує —
                           відкладає повне оновлення і робить м'який патч зон;
                           якщо ні — застосовує негайно. */
                        _applyStateFromTeacher(s);
                    });

                    /* ── Учень слухає зони ІНШИХ учнів напряму (peer sync) ──
                       Це дозволяє всім одночасно редагувати без конфліктів:
                       кожен пише лише у свою зону, але бачить чужі в реальному часі */
                    sessRef.child('students').on('child_added', function(peerSnap) {
                        var peerUid = peerSnap.key;
                        if (peerUid === uid) return; /* своє не слухаємо */
                        peerSnap.ref.child('state').on('value', function(peerStatSnap) {
                            if (_role !== 'student' || !peerStatSnap.exists()) return;
                            var ps = peerStatSnap.val();
                            if (!ps || !ps._studentOnly || !ps._studentZones) return;
                            var ed3 = document.getElementById('boardEditor');
                            if (!ed3) return;
                            _applyingRemote = true;
                            try {
                                var peerZones = JSON.parse(ps._studentZones);
                                Object.keys(peerZones).forEach(function(zid) {
                                    var zEl = _findZoneById(ed3, zid);
                                    if (zEl) {
                                        /* Не перезаписуємо свою зону чужими даними */
                                        var zoneUid = zEl.getAttribute('data-student-uid');
                                        if (zoneUid === _myUid) return;
                                        zEl.innerHTML = _safeHtml(peerZones[zid]);
                                        var an = zEl.getAttribute('data-assigned-to');
                                        if (an) zEl.setAttribute('data-edited-by', an);
                                    }
                                });
                            } catch(e) {}
                            setTimeout(function() { _applyingRemote = false; }, 50);
                        });
                    });

                    /* Учень бачить курсор вчителя */
                    sessRef.child('teacherCursor').on('value', function (curSnap) {
                        if (_role !== 'student') return;
                        if (!curSnap.exists()) { _removeTeacherCursor(); return; }
                        var d = curSnap.val();
                        if (!d || Date.now() - (d.t || 0) > 10000) return;
                        if (d.page !== undefined && parseInt(d.page, 10) !== _pageIndex()) {
                            _removeTeacherCursor();
                            return;
                        }
                        _drawTeacherCursor(d.x, d.y);
                    });

                    /* Якщо вчитель закрив сесію */
                    sessRef.child('active').on('value', function (aSnap) {
                        if (!aSnap.exists() || !aSnap.val()) {
                            _sStatus('err', _t('collabTeacherEnded'));
                            var b = document.getElementById('cBanner'); if (b) b.classList.remove('on');
                            _role = null; _floatUpdate();
                            _restoreStudentDangerBtns();
                            _removeStudentLockedHint();
                            _removeTeacherCursor();
                            if (btn) btn.disabled = false;
                            cCloseModal();
                            _showSessionEndToast();
                        }
                    });
                });
            };

            /* ── Підказка учню що зошит заблоковано ── */
            function _showStudentLockedHint() {
                if (document.getElementById('studentLockedHint')) return;
                /* Інжектуємо стилі */
                var st = document.createElement('style');
                st.id = 'studentLockedHintStyle';
                st.textContent = [
                    '#studentLockedHint{',
                    '  position:fixed;bottom:80px;left:50%;transform:translateX(-50%);',
                    '  z-index:99999;',
                    '  background:rgba(15,23,42,0.92);color:#f1f5f9;',
                    '  border-radius:14px;padding:12px 22px;',
                    '  font-size:14px;font-weight:600;',
                    '  box-shadow:0 4px 24px rgba(0,0,0,0.28);',
                    '  display:flex;align-items:center;gap:10px;',
                    '  pointer-events:none;',
                    '  white-space:nowrap;',
                    '  animation:_slh_in .35s cubic-bezier(.34,1.4,.64,1) both;',
                    '}',
                    '#studentLockedHint .slh-icon{font-size:18px;flex-shrink:0;}',
                    '@keyframes _slh_in{from{opacity:0;transform:translateX(-50%) translateY(14px)}',
                    '  to{opacity:1;transform:translateX(-50%) translateY(0)}}',
                    '#studentLockedHint.slh-has-zone{',
                    '  background:rgba(5,96,42,0.93);',
                    '}',
                    '#studentLockedHint{transition:opacity .5s ease;}',
                    '#studentLockedHint.slh-fading{opacity:0;}'
                ].join('');
                document.head.appendChild(st);
                var hint = document.createElement('div');
                hint.id = 'studentLockedHint';
                hint.innerHTML = '<span class="slh-icon">✏️</span><span id="slhText">Можете редагувати виділений текст</span>';
                hint.style.display = 'none';
                document.body.appendChild(hint);
            }
            var _studentLockedHintTimer = null;
            function _updateStudentLockedHint() {
                /* Викликається після _applyState щоб оновити текст підказки */
                if (_role !== 'student') return;
                var hint = document.getElementById('studentLockedHint');
                if (!hint) return;
                var ed = document.getElementById('boardEditor');
                var hasZone = ed && ed.querySelector('.student-editable[contenteditable="true"]');
                var icon = hint.querySelector('.slh-icon');
                var txt = document.getElementById('slhText');
                if (hasZone) {
                    hint.classList.add('slh-has-zone');
                    hint.style.display = 'flex';
                    if (icon) icon.textContent = '✏️';
                    if (txt) txt.textContent = 'Можете редагувати виділений текст';
                    /* Автоматично ховаємо плашку через 5 секунд */
                    if (_studentLockedHintTimer) clearTimeout(_studentLockedHintTimer);
                    hint.classList.remove('slh-fading');
                    _studentLockedHintTimer = setTimeout(function() {
                        hint.classList.add('slh-fading');
                        setTimeout(function() {
                            hint.style.display = 'none';
                            hint.classList.remove('slh-fading');
                            _studentLockedHintTimer = null;
                        }, 500);
                    }, 5000);
                } else {
                    /* Немає зони — просто ховаємо підказку, нічого не показуємо */
                    if (_studentLockedHintTimer) { clearTimeout(_studentLockedHintTimer); _studentLockedHintTimer = null; }
                    hint.style.display = 'none';
                }
            }
            function _removeStudentLockedHint() {
                var h = document.getElementById('studentLockedHint');
                if (h) h.remove();
                var s = document.getElementById('studentLockedHintStyle');
                if (s) s.remove();
            }

            /* ── Приховати небезпечні кнопки для учня ── */
            function _hideStudentDangerBtns() {
                var ids = ['deletePageBtn', 'clearBoardBtn'];
                ids.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });
                /* Ховаємо кнопку додавання сторінки */
                var addPageBtn = document.querySelector('.page-btn[onclick="addPage()"]');
                if (addPageBtn) addPageBtn.style.display = 'none';
                /* Ховаємо інструменти малювання/стирання для учнів на всіх пристроях */
                var studentHideIds = [
                    'imageTool', 'qrTool', 'timerTool', 'mathEditorTool',
                    'stickerTool', 'pencilTool', 'eraserTool',
                    'lineTool', 'shapeTool', 'freetextTool', 'aiAssistantBtn',
                    'dividerDrawing', 'dividerBeforeAI', 'dividerAfterAI'
                ];
                studentHideIds.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) { el.style.display = 'none'; el.dataset.studentHidden = '1'; }
                });
                /* Вимикаємо малювання якщо було активне */
                if (typeof setDrawMode === 'function') setDrawMode('off');
            }
            function _restoreStudentDangerBtns() {
                var ids = ['deletePageBtn', 'clearBoardBtn'];
                ids.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el) el.style.display = '';
                });
                /* Відновлюємо кнопку додавання сторінки */
                var addPageBtn = document.querySelector('.page-btn[onclick="addPage()"]');
                if (addPageBtn) addPageBtn.style.display = '';
                /* Відновлюємо всі кнопки тулбару */
                var studentHideIds = [
                    'imageTool', 'qrTool', 'timerTool', 'mathEditorTool',
                    'stickerTool', 'pencilTool', 'eraserTool',
                    'lineTool', 'shapeTool', 'freetextTool', 'aiAssistantBtn',
                    'dividerDrawing', 'dividerBeforeAI', 'dividerAfterAI'
                ];
                studentHideIds.forEach(function(id) {
                    var el = document.getElementById(id);
                    if (el && el.dataset.studentHidden) { el.style.display = ''; delete el.dataset.studentHidden; }
                });
            }

            function _sStatus(cls, txt) {
                var bar = document.getElementById('cSSBar'), d = document.getElementById('cSDot'), s = document.getElementById('cSStatus');
                if (!bar || !d || !s) return;
                bar.style.display = 'flex';
                d.className = 'cdot' + (cls === 'ok' ? ' ok' : cls === 'wait' ? ' wait' : cls === 'err' ? ' err' : '');
                s.textContent = txt;
            }

            function _handleStudentRemovedFromSession(btn) {
                _sStatus('err', _t('collabStudentRemoved'));
                var b = document.getElementById('cBanner'); if (b) b.classList.remove('on');
                _role = null;
                _myStudentRef = null;
                _myStudentCode = null;
                _myStudentName = '';
                _floatUpdate();
                _restoreStudentDangerBtns();
                _removeStudentLockedHint();
                _removeTeacherCursor();
                _clearStudentTimers();
                if (btn) btn.disabled = false;
                window.cTab('s');
                document.getElementById('collabOverlay').classList.add('on');
                _showStudentRemovedToast();
            }

            function _showStudentRemovedToast() {
                var lang = (window._state && window._state.lang) || 'ua';
                var titleEl = document.getElementById('srtTitle');
                var msgEl = document.getElementById('srtMsg');
                var toast = document.getElementById('studentRemovedToast');
                if (!toast) return;
                if (lang === 'en' || lang === 'de') {
                    if (titleEl) titleEl.textContent = _t('collabRemovedToastTitle') || (lang === 'de' ? 'Sie wurden vom Lehrer getrennt' : 'You were disconnected by the teacher');
                    if (msgEl) msgEl.textContent = _t('collabRemovedToastMsg') || (lang === 'de' ? 'Der Lehrer hat Sie aus diesem Heft entfernt.' : 'The teacher has removed you from this notebook.');
                } else {
                    if (titleEl) titleEl.textContent = _t('collabRemovedToastTitle') || 'Вас від\'єднав вчитель';
                    if (msgEl) msgEl.textContent = _t('collabRemovedToastMsg') || 'Вчитель вилучив вас із цього зошита.';
                }
                toast.classList.add('show');
                clearTimeout(toast._hideTimer);
                toast._hideTimer = setTimeout(function () { toast.classList.remove('show'); }, 9000);
            }

            function _showSessionEndToast() {
                var t = _t;
                var title = document.getElementById('setTitle');
                var msg = document.getElementById('setMsg');
                var toast = document.getElementById('sessionEndToast');
                if (!toast) return;
                /* Локалізовані тексти */
                var lang = (window._state && window._state.lang) || 'ua';
                if (lang === 'en') {
                    if (title) title.textContent = 'Session ended';
                    if (msg) msg.textContent = 'The teacher has closed shared access to the notebook.';
                } else if (lang === 'de') {
                    if (title) title.textContent = 'Sitzung beendet';
                    if (msg) msg.textContent = 'Der Lehrer hat den gemeinsamen Zugriff auf das Heft geschlossen.';
                } else {
                    if (title) title.textContent = 'Сесію завершено';
                    if (msg) msg.textContent = 'Вчитель закрив спільний доступ до зошита.';
                }
                toast.classList.add('show');
                /* Автоприховати через 8 секунд */
                clearTimeout(toast._hideTimer);
                toast._hideTimer = setTimeout(function () { toast.classList.remove('show'); }, 8000);
            }

            /* ── CSS для текстового каретного курсору (ін'єктується один раз) ── */
            function _injectTextCaretStyle() {
                if (document.getElementById('_tcaret-style')) return;
                var s = document.createElement('style');
                s.id = '_tcaret-style';
                s.textContent = [
                    '.student-text-caret{',
                    '  position:absolute;',
                    '  width:2px;',
                    '  pointer-events:none;',
                    '  z-index:9999;',
                    '  border-radius:1px;',
                    '  transition:left .08s linear, top .08s linear, height .08s linear;',
                    '}',
                    '.student-text-caret::after{',
                    '  content:"";',
                    '  position:absolute;',
                    '  left:0; top:0; width:100%; height:100%;',
                    '  animation:_stc_blink 1.1s step-start infinite;',
                    '}',
                    '@keyframes _stc_blink{0%,100%{opacity:1}50%{opacity:0}}',
                    '.student-text-caret-label{',
                    '  position:absolute;',
                    '  bottom:100%;',
                    '  left:0;',
                    '  white-space:nowrap;',
                    '  font-size:10px;font-weight:700;',
                    '  color:#fff;',
                    '  padding:1px 5px;',
                    '  border-radius:3px 3px 3px 0;',
                    '  line-height:1.5;',
                    '  pointer-events:none;',
                    '  opacity:0.92;',
                    '  margin-bottom:2px;',
                    '  max-width:120px;overflow:hidden;text-overflow:ellipsis;',
                    '}',
                ].join('');
                document.head.appendChild(s);
            }

            /* ── Текстові каретні курсори учнів (для вчителя) ── */
            var _studentTextCarets = {}; /* uid -> DOM element */

            function _drawStudentTextCaret(uid, name, x, y, h, color) {
                _injectTextCaretStyle();
                var card = document.getElementById('notebookCard');
                if (!card) return;
                var el = _studentTextCarets[uid];
                if (!el) {
                    el = document.createElement('div');
                    el.className = 'student-text-caret';
                    var lbl = document.createElement('div');
                    lbl.className = 'student-text-caret-label';
                    el.appendChild(lbl);
                    card.appendChild(el);
                    _studentTextCarets[uid] = el;
                }
                el.style.background = color;
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                el.style.height = (h || 18) + 'px';
                el.style.opacity = '1';
                var lbl = el.querySelector('.student-text-caret-label');
                if (lbl) {
                    lbl.textContent = name;
                    lbl.style.background = color;
                }
                clearTimeout(el._hideTimer);
                el._hideTimer = setTimeout(function () { if (el) el.style.opacity = '0'; }, 6000);
            }
            function _removeStudentTextCaret(uid) {
                var el = _studentTextCarets[uid];
                if (el) { el.remove(); delete _studentTextCarets[uid]; }
            }
            function _removeAllStudentTextCarets() {
                Object.keys(_studentTextCarets).forEach(_removeStudentTextCaret);
            }

            /* ── Курсор учня на дошці вчителя ── */
            function _drawStudentCursor(uid, name, x, y, meta) {
                var card = document.getElementById('notebookCard');
                if (!card) return;
                meta = meta || {};
                var color = _colorFor(uid);
                var el = _studentCursors[uid];
                if (!el) {
                    el = document.createElement('div');
                    el.className = 'student-cursor';
                    el.innerHTML =
                        '<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">'
                        + '<path d="M2 2L2 17L6.5 13L9.5 19.5L11.5 18.5L8.5 12L14 12L2 2Z" fill="' + color + '" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>'
                        + '</svg>'
                        + '<div class="student-cursor-label" style="background:' + color + '">' + _esc(name) + '</div>';
                    card.appendChild(el);
                    _studentCursors[uid] = el;
                }
                el.classList.toggle('editing', !!meta.editing);
                var label = el.querySelector('.student-cursor-label');
                if (label) label.setAttribute('data-status', meta.editing ? _t('collabEditing') : '');
                if (meta.zoneId) el.setAttribute('data-zone-id', meta.zoneId);
                else el.removeAttribute('data-zone-id');
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                /* Ховаємо курсор якщо учень не рухається 8с */
                clearTimeout(el._hideTimer);
                el.style.opacity = '1';
                el._hideTimer = setTimeout(function () { el.style.opacity = '0'; }, 8000);
            }
            function _removeStudentCursor(uid) {
                var el = _studentCursors[uid];
                if (el) { el.remove(); delete _studentCursors[uid]; }
            }

            function _drawTeacherCursor(x, y) {
                var card = document.getElementById('notebookCard');
                if (!card) return;
                if (!_teacherCursorEl) {
                    _teacherCursorEl = document.createElement('div');
                    _teacherCursorEl.className = 'student-cursor teacher-cursor';
                    _teacherCursorEl.innerHTML =
                        '<svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg">'
                        + '<path d="M2 2L2 17L6.5 13L9.5 19.5L11.5 18.5L8.5 12L14 12L2 2Z" fill="#1d4ed8" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>'
                        + '</svg>'
                        + '<div class="student-cursor-label" style="background:#1d4ed8">' + _esc(_t('collabTeacherCursorName')) + '</div>';
                    card.appendChild(_teacherCursorEl);
                }
                _teacherCursorEl.style.left = x + 'px';
                _teacherCursorEl.style.top = y + 'px';
                clearTimeout(_teacherCursorEl._hideTimer);
                _teacherCursorEl.style.opacity = '1';
                _teacherCursorEl._hideTimer = setTimeout(function () { _teacherCursorEl.style.opacity = '0'; }, 8000);
            }
            function _removeTeacherCursor() {
                if (_teacherCursorEl) {
                    _teacherCursorEl.remove();
                    _teacherCursorEl = null;
                }
            }

            var _authorTimer = null;
            function _showAuthor(name) {
                var tag = document.getElementById('editAuthorTag');
                var lbl = document.getElementById('editAuthorName');
                if (!tag || !lbl) return;
                lbl.textContent = '✏️ ' + name + _t('collabEditing');
                tag.classList.add('on');
                clearTimeout(_authorTimer);
                _authorTimer = setTimeout(function () {
                    tag.classList.remove('on');
                }, 3500);
            }

            function _floatUpdate() {
                var d = document.getElementById('cFloatDot'), l = document.getElementById('cFloatLbl');
                if (!d || !l) return;
                if (_role === 'teacher') {
                    var n = Object.keys(_students).length;
                    d.className = 'cfdot ok';
                    if (n > 0) {
                        var noun = n === 1 ? _t('collabStudentSingular') : _t('collabStudentPlural');
                        l.textContent = '👥 ' + n + ' ' + noun;
                    } else {
                        l.textContent = _t('collabAccessLabel');
                    }
                }
                else if (_role === 'student') { d.className = 'cfdot ok'; l.textContent = _t('collabConnected'); }
                else { d.className = 'cfdot'; l.textContent = _t('collabAccessLabel'); }
            }

            /* ── Публічний API ── */
            window.getCollabRole = function () { return _role; };
            window.cOpenModal = function () {
                document.getElementById('collabOverlay').classList.add('on');
                var joinCode = new URLSearchParams(location.search).get('join');
                if (joinCode && joinCode.length >= 6 && _role !== 'teacher') {
                    window.cTab('s');
                    var codeInput = document.getElementById('cCodeIn');
                    if (codeInput) codeInput.value = joinCode.toUpperCase().slice(0, 6);
                    return;
                }
                if (_role !== 'student' && !_sessionRef) _initTeacher();
            };
            window.cCloseModal = function () { document.getElementById('collabOverlay').classList.remove('on'); };

            /* Notebook-style confirm dialog */
            function _nbConfirm(onConfirm) {
                var overlay = document.getElementById('nbConfirmOverlay');
                var okBtn = document.getElementById('nbcOk');
                var cancelBtn = document.getElementById('nbcCancel');
                var title = document.getElementById('nbcTitle');
                var msg = document.getElementById('nbcMsg');
                if (!overlay) { onConfirm(); return; }
                /* Локалізація */
                var lang = (window._state && window._state.lang) || 'ua';
                if (lang === 'en') {
                    if (title) title.textContent = 'Revoke access?';
                    if (msg) msg.textContent = 'All students will be disconnected from the notebook.';
                    if (okBtn) okBtn.textContent = 'Revoke';
                    if (cancelBtn) cancelBtn.textContent = 'Cancel';
                } else if (lang === 'de') {
                    if (title) title.textContent = 'Zugriff widerrufen?';
                    if (msg) msg.textContent = 'Alle Schüler werden vom Heft getrennt.';
                    if (okBtn) okBtn.textContent = 'Widerrufen';
                    if (cancelBtn) cancelBtn.textContent = 'Abbrechen';
                } else {
                    if (title) title.textContent = 'Припинити доступ?';
                    if (msg) msg.textContent = 'Усі учні будуть від\'єднані від зошита.';
                    if (okBtn) okBtn.textContent = 'Припинити';
                    if (cancelBtn) cancelBtn.textContent = 'Скасувати';
                }
                overlay.classList.add('show');
                function close(confirmed) {
                    overlay.classList.remove('show');
                    okBtn.removeEventListener('click', onOk);
                    cancelBtn.removeEventListener('click', onCancel);
                    overlay.removeEventListener('click', onBg);
                    if (confirmed) onConfirm();
                }
                function onOk() { close(true); }
                function onCancel() { close(false); }
                function onBg(e) { if (e.target === overlay) close(false); }
                okBtn.addEventListener('click', onOk);
                cancelBtn.addEventListener('click', onCancel);
                overlay.addEventListener('click', onBg);
            }

            /* Припинити сесію (вчитель) */
            window.cStopSession = function () {
                if (!_sessionRef) { cCloseModal(); return; }
                _nbConfirm(function () {
                    /* Повідомляємо учнів про завершення і видаляємо весь вузол сесії з Firebase */
                    _sessionRef.child('active').set(false);
                    setTimeout(function() { _sessionRef.remove(); }, 3000); /* затримка щоб учні встигли отримати active:false */
                    /* Прибираємо курсори */
                    Object.keys(_studentCursors).forEach(function (uid) { _removeStudentCursor(uid); });
                    _removeAllStudentTextCarets();
                    _students = {};
                    _role = null; _code = null;
                    _sessionRef = null; _studentsRef = null;
                    _floatUpdate();
                    /* Скидаємо UI */
                    document.getElementById('cPeers').textContent = _t('collabNoPeers');
                    document.getElementById('cCodeEl').textContent = '------';
                    var urlEl = document.getElementById('cJoinUrl'); if (urlEl) urlEl.textContent = '— посилання з\'явиться тут —';
                    var qrIn = document.getElementById('cQrInner'); if (qrIn) qrIn.innerHTML = '';
                    /* Прибираємо protect-on з редактора */
                    var edStop = document.getElementById('boardEditor'); if (edStop) edStop.classList.remove('protect-on');
                    _tStatus('wait', _t('collabSessionEnded'));
                    cCloseModal();
                });
            };

            /* ── Допоміжні функції захисту — зони редагування ── */

            /* Огортає поточне виділення в <span class="student-editable"> */
            function _wrapSelectionAsEditable(studentUid, studentName) {
                /* Використовуємо збережений Range напряму — він живий навіть після зникнення Selection */
                var range = _pickerSavedRange;
                if (!range) {
                    var sel = window.getSelection();
                    if (!sel || sel.isCollapsed || !sel.rangeCount) { return; }
                    range = sel.getRangeAt(0);
                }
                var ed = document.getElementById('boardEditor');
                if (!ed || !ed.contains(range.commonAncestorContainer)) { return; }
                if (_rangeTouchesEditableZone(range, ed)) {
                    showOcrToast(_t('collabErrZoneOverlap'), '#f59e0b');
                    _pickerSavedRange = null;
                    _hideStudentPicker();
                    _hideAllowBtn();
                    return;
                }

                var span = document.createElement('span');
                span.className = 'student-editable';
                _syncZoneCounter();
                var zid = 'z' + (++_zoneCounter);
                span.setAttribute('data-zone-id', zid);
                if (studentUid) span.setAttribute('data-student-uid', studentUid);
                /* data-assigned-to — незмінне ім'я, яке вчитель призначив зоні.
                   data-edited-by — CSS ::before читає звідси для підпису. */
                if (studentName) {
                    span.setAttribute('data-assigned-to', studentName);
                    span.setAttribute('data-edited-by', studentName);
                }

                /* ── Спеціальна обробка для OL/UL: span не може містити LI як прямих дітей ──
                   Якщо виділення знаходиться всередині списку або охоплює весь список,
                   обгортаємо відповідну частину. Якщо виділено лише частину пунктів —
                   виділені LI виокремлюємо у новий підсписок і обгортаємо лише його. */
                var _listContainer = null;
                var _selectedLIs = [];    /* тільки виділені LI (підмножина) */
                var _isPartialList = false;

                (function detectList() {
                    /* Шукаємо OL/UL серед commonAncestorContainer та його предків */
                    var anc = range.commonAncestorContainer;
                    if (anc.nodeType === Node.TEXT_NODE) anc = anc.parentNode;

                    /* ── Перевірка: чи виділення повністю всередині одного LI? ──
                       Якщо так — це інлайн-виділення (частина тексту рядка),
                       його НЕ потрібно обробляти як список. */
                    var insideSingleLI = false;
                    var checkLI = anc;
                    while (checkLI && checkLI !== ed) {
                        if (checkLI.nodeName === 'LI') {
                            /* Перевіримо, чи range не виходить за межі цього LI */
                            var liRange = document.createRange();
                            liRange.selectNodeContents(checkLI);
                            /* startContainer і endContainer обидва мають бути всередині цього LI */
                            if (checkLI.contains(range.startContainer) && checkLI.contains(range.endContainer)) {
                                /* Додатково: range не охоплює ВЕСЬ вміст LI —
                                   порівнюємо toString() щоб визначити чи це повне виділення */
                                var rangeText = range.toString();
                                var liText = checkLI.textContent || '';
                                if (rangeText.length < liText.trim().length) {
                                    insideSingleLI = true;
                                }
                            }
                            break;
                        }
                        checkLI = checkLI.parentNode;
                    }
                    if (insideSingleLI) return; /* залишаємо _listContainer = null → інлайн обробка */

                    var cur = anc;
                    while (cur && cur !== ed) {
                        if (cur.nodeName === 'OL' || cur.nodeName === 'UL') {
                            _listContainer = cur;
                            break;
                        }
                        cur = cur.parentNode;
                    }
                    /* Або якщо виділення охоплює OL/UL як дочірній елемент */
                    if (!_listContainer) {
                        var frag = range.cloneContents();
                        var listInFrag = frag.querySelector('ol, ul');
                        if (listInFrag) {
                            /* Знаходимо реальний OL/UL всередині editor що відповідає цьому */
                            var allLists = ed.querySelectorAll('ol, ul');
                            allLists.forEach(function(l) {
                                if (range.intersectsNode(l)) _listContainer = l;
                            });
                        }
                    }

                    /* Визначаємо, чи виділено лише частину пунктів списку */
                    if (_listContainer) {
                        var allLIs = Array.from(_listContainer.children).filter(function(c) {
                            return c.nodeName === 'LI';
                        });
                        allLIs.forEach(function(li) {
                            if (range.intersectsNode(li)) _selectedLIs.push(li);
                        });
                        /* Якщо виділено менше пунктів ніж є в списку — це часткове виділення */
                        if (_selectedLIs.length > 0 && _selectedLIs.length < allLIs.length) {
                            _isPartialList = true;
                        }
                    }
                })();

                if (_listContainer && _isPartialList) {
                    /* ── Часткове виділення: розбиваємо список на до 3 частини ── */
                    var parentEl = _listContainer.parentNode;
                    var tagName = _listContainer.nodeName; /* OL або UL */
                    var startAttr = _listContainer.getAttribute('start'); /* для OL з нестандартним start */
                    var allLIs = Array.from(_listContainer.children).filter(function(c) {
                        return c.nodeName === 'LI';
                    });

                    /* Індекси виділених LI */
                    var firstIdx = allLIs.indexOf(_selectedLIs[0]);
                    var lastIdx = allLIs.indexOf(_selectedLIs[_selectedLIs.length - 1]);

                    /* Частина ПЕРЕД виділенням */
                    var beforeLIs = allLIs.slice(0, firstIdx);
                    /* Частина ПІСЛЯ виділення */
                    var afterLIs = allLIs.slice(lastIdx + 1);

                    var refNode = _listContainer; /* позиція для вставки */

                    /* 1) Список "до" */
                    if (beforeLIs.length > 0) {
                        var beforeList = document.createElement(tagName);
                        if (startAttr) beforeList.setAttribute('start', startAttr);
                        /* Копіюємо стилі оригінального списку */
                        if (_listContainer.getAttribute('style')) {
                            beforeList.setAttribute('style', _listContainer.getAttribute('style'));
                        }
                        beforeLIs.forEach(function(li) { beforeList.appendChild(li); });
                        parentEl.insertBefore(beforeList, refNode);
                    }

                    /* 2) Виділений список — обгорнутий у span */
                    var selectedList = document.createElement(tagName);
                    /* Зберігаємо правильну нумерацію: start = позиція першого виділеного */
                    if (tagName === 'OL') {
                        var realStart = parseInt(startAttr, 10) || 1;
                        selectedList.setAttribute('start', String(realStart + firstIdx));
                    }
                    if (_listContainer.getAttribute('style')) {
                        selectedList.setAttribute('style', _listContainer.getAttribute('style'));
                    }
                    _selectedLIs.forEach(function(li) { selectedList.appendChild(li); });
                    span.appendChild(selectedList);
                    parentEl.insertBefore(span, refNode);

                    /* 3) Список "після" */
                    if (afterLIs.length > 0) {
                        var afterList = document.createElement(tagName);
                        if (tagName === 'OL') {
                            var realStart2 = parseInt(startAttr, 10) || 1;
                            afterList.setAttribute('start', String(realStart2 + lastIdx + 1));
                        }
                        if (_listContainer.getAttribute('style')) {
                            afterList.setAttribute('style', _listContainer.getAttribute('style'));
                        }
                        afterLIs.forEach(function(li) { afterList.appendChild(li); });
                        parentEl.insertBefore(afterList, refNode);
                    }

                    /* Видаляємо оригінальний (тепер порожній) список */
                    parentEl.removeChild(_listContainer);

                } else if (_listContainer) {
                    /* Обгортаємо весь OL/UL у span — виділено всі пункти */
                    _listContainer.parentNode.insertBefore(span, _listContainer);
                    span.appendChild(_listContainer);
                } else {
                    try {
                        range.surroundContents(span);
                    } catch(e) {
                        var frag = range.extractContents();
                        span.appendChild(frag);
                        range.insertNode(span);
                    }
                    /* Виносимо хвостові <br> за межі зони: браузер часто включає їх у виділення,
                       через що підсвічування зони захоплювало порожній рядок нижче. */
                    (function moveTailingBrs() {
                        var lc = span.lastChild;
                        while (lc && lc.nodeName === 'BR') {
                            span.after(lc);
                            lc = span.lastChild;
                        }
                    })();
                }
                _pickerSavedRange = null;
                try { window.getSelection().removeAllRanges(); } catch(e) {}
                _hideStudentPicker();
                _hideAllowBtn();
                /* Оновлюємо дошку вчителя */
                _scheduleBroadcast(300);
            }

            /* Видаляє всі зони (remove spans, залишаємо текст всередині) */
            function _clearEditableZones() {
                var ed = document.getElementById('boardEditor');
                if (!ed) return;
                ed.querySelectorAll('.student-editable').forEach(function(z) {
                    var parent = z.parentNode;
                    while (z.firstChild) parent.insertBefore(z.firstChild, z);
                    parent.removeChild(z);
                });
                ed.setAttribute('contenteditable', 'true');
                ed.normalize();
                _scheduleBroadcast(300);
            }

            /* Плаваюча кнопка */
            var _allowBtn = null;
            function _showAllowBtn(x, y) {
                if (!_allowBtn) _allowBtn = document.getElementById('allowEditBtn');
                if (!_allowBtn) return;
                _allowBtn.style.left = x + 'px';
                _allowBtn.style.top  = (y - 44) + 'px';
                _allowBtn.classList.add('show');
            }
            function _hideAllowBtn() {
                if (!_allowBtn) _allowBtn = document.getElementById('allowEditBtn');
                if (_allowBtn) _allowBtn.classList.remove('show');
            }

            /* ── Пікер учня ── */
            var _pickerSavedRange = null;

            function _showStudentPicker(x, y) {
                var picker = document.getElementById('studentPickerMenu');
                if (!picker) return;

                /* Range збережено на mouseup (показ кнопки) та на mousedown кнопки як резерв.
                   Якщо з якоїсь причини він відсутній — відновлюємо з поточного selection */
                if (!_pickerSavedRange) {
                    var sel = window.getSelection();
                    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
                        _pickerSavedRange = sel.getRangeAt(0).cloneRange();
                    }
                }

                /* Заповнюємо список учнів */
                var list = document.getElementById('studentPickerList');
                list.innerHTML = '';
                var uids = Object.keys(_students);
                if (uids.length === 0) {
                    var empty = document.createElement('div');
                    empty.style.cssText = 'padding:10px 14px;color:#94a3b8;font-size:13px;text-align:center;';
                    empty.textContent = 'Немає підключених учнів';
                    list.appendChild(empty);
                } else {
                    uids.forEach(function(uid) {
                        var name = _students[uid];
                        var item = document.createElement('button');
                        item.type = 'button';
                        item.style.cssText = 'display:flex;align-items:center;gap:9px;width:100%;padding:9px 14px;border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:600;color:#0f172a;text-align:left;border-radius:8px;transition:background .15s;';
                        item.onmouseenter = function(){ this.style.background='#f0fdf4'; };
                        item.onmouseleave = function(){ this.style.background='transparent'; };
                        var dot = document.createElement('span');
                        dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:'+_colorFor(uid)+';flex-shrink:0;';
                        item.appendChild(dot);
                        item.appendChild(document.createTextNode(name));
                        item.addEventListener('mousedown', function(e) {
                            e.preventDefault();  /* критично: не дає браузеру скинути selection */
                            e.stopPropagation(); /* не дає спрацювати глобальному mousedown → _hideStudentPicker */
                            /* _pickerSavedRange вже містить правильний range з mouseup.
                               _wrapSelectionAsEditable використає його напряму, без відновлення selection */
                            _wrapSelectionAsEditable(uid, name);
                        });
                        list.appendChild(item);
                    });
                }

                picker.style.left = Math.max(8, x - 90) + 'px';
                picker.style.top  = y + 'px';
                picker.style.display = 'flex';
                picker.style.animation = '_picker_in .18s cubic-bezier(.34,1.56,.64,1) both';
            }

            function _hideStudentPicker() {
                var picker = document.getElementById('studentPickerMenu');
                if (picker) picker.style.display = 'none';
                /* НЕ скидаємо _pickerSavedRange тут — він потрібен _wrapSelectionAsEditable */
            }
            /* Скидаємо range лише після успішного використання або явного скасування */
            function _clearPickerRange() {
                _pickerSavedRange = null;
            }

            /* Ініціалізуємо плаваючу кнопку */
            function _initAllowBtn() {
                var btn = document.getElementById('allowEditBtn');
                if (!btn) return;
                _allowBtn = btn;

                /* Створюємо пікер учнів якщо нема */
                if (!document.getElementById('studentPickerMenu')) {
                    var picker = document.createElement('div');
                    picker.id = 'studentPickerMenu';
                    picker.style.cssText = [
                        'position:fixed',
                        'z-index:100000',
                        'background:#fff',
                        'border:1.5px solid #e2e8f0',
                        'border-radius:12px',
                        'box-shadow:0 8px 32px rgba(0,0,0,.18)',
                        'min-width:180px',
                        'max-height:min(320px, calc(100vh - 60px))',
                        'overflow-y:auto',
                        'display:none',          /* початково сховано */
                        'flex-direction:column',
                        'padding:6px',
                        'gap:2px'
                    ].join(';');
                    var style = document.createElement('style');
                    style.textContent = [
                        '@keyframes _picker_in{from{opacity:0;transform:scale(.9) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}',
                        '#studentPickerMenu .spicker-title{font-size:11px;font-weight:700;color:#64748b;padding:4px 14px 6px;letter-spacing:.04em;text-transform:uppercase;border-bottom:1px solid #f1f5f9;margin-bottom:2px;}'
                    ].join('');
                    document.head.appendChild(style);
                    var title = document.createElement('div');
                    title.className = 'spicker-title';
                    title.textContent = 'Хто редагує?';
                    picker.appendChild(title);
                    var list = document.createElement('div');
                    list.id = 'studentPickerList';
                    picker.appendChild(list);
                    document.body.appendChild(picker);
                }

                /* Резервне збереження range на mousedown кнопки —
                   основне збереження відбувається раніше, на mouseup документа (показ кнопки) */
                btn.addEventListener('mousedown', function(e) {
                    e.preventDefault(); /* не знімає виділення */
                    e.stopPropagation();
                    /* Перезаписуємо лише якщо selection ще активний */
                    var sel = window.getSelection();
                    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
                        _pickerSavedRange = sel.getRangeAt(0).cloneRange();
                    }
                    /* Якщо selection вже скинуто — _pickerSavedRange із mouseup залишається актуальним */
                });
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    /* Показуємо пікер під кнопкою */
                    var rect = btn.getBoundingClientRect();
                    _showStudentPicker(rect.left + rect.width / 2, rect.bottom + 8);
                });

                /* Слухаємо mouseup на документі */
                document.addEventListener('mouseup', function(e) {
                    if (_role !== 'teacher') return;
                    if (e.target === btn) return; /* клік по кнопці — не ховаємо */
                    var picker = document.getElementById('studentPickerMenu');
                    if (picker && picker.contains(e.target)) return; /* клік по пікеру — не ховаємо */
                    setTimeout(function() {
                        var sel = window.getSelection();
                        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
                            var range = sel.getRangeAt(0);
                            var ed = document.getElementById('boardEditor');
                            if (ed && ed.contains(range.commonAncestorContainer)) {
                                /* ★ Зберігаємо range тут (mouseup) — до того як браузер
                                   може скинути selection при кліку на кнопку */
                                _pickerSavedRange = range.cloneRange();
                                var rect = range.getBoundingClientRect();
                                /* Кнопка завжди з'являється над фактичним виділенням */
                                var _btnY = rect.top;
                                var _btnX = rect.left + rect.width / 2 - 80;
                                _showAllowBtn(_btnX, _btnY);
                                _hideStudentPicker();
                                return;
                            }
                        }
                        _hideAllowBtn();
                        _hideStudentPicker();
                    }, 10);
                });
                /* Приховуємо при скиданні виділення */
                document.addEventListener('selectionchange', function() {
                    if (_role !== 'teacher') return;
                    var sel = window.getSelection();
                    if (!sel || sel.isCollapsed) {
                        /* Невелика затримка — дозволяє click на кнопці спрацювати до зникнення */
                        setTimeout(function() {
                            var sel2 = window.getSelection();
                            if (!sel2 || sel2.isCollapsed) {
                                _hideAllowBtn();
                                /* Скидаємо range лише якщо пікер вже закритий */
                                var p2 = document.getElementById('studentPickerMenu');
                                if (!p2 || p2.style.display !== 'flex') _clearPickerRange();
                            }
                        }, 150);
                    }
                });
                /* Закриваємо пікер при кліку поза ним */
                document.addEventListener('mousedown', function(e) {
                    var picker = document.getElementById('studentPickerMenu');
                    if (!picker) return;
                    if (!picker.contains(e.target) && e.target !== btn) {
                        _hideStudentPicker();
                        /* Скидаємо range лише при закритті без вибору учня */
                        _clearPickerRange();
                    }
                });
            }

            /* Захист тексту вчителя — завжди увімкнений, функція залишена для сумісності */
            window.cToggleProtect = function () { /* no-op: захист завжди активний для учнів */ };
            window.cTab = function (t) {
                document.getElementById('cTabT').classList.toggle('on', t === 't');
                document.getElementById('cTabS').classList.toggle('on', t === 's');
                document.getElementById('cPanelT').classList.toggle('on', t === 't');
                document.getElementById('cPanelS').classList.toggle('on', t === 's');
                /* Підставляємо збережене ім'я учня */
                if (t === 's') {
                    try {
                        var saved = localStorage.getItem('collab_student_name');
                        var nameEl = document.getElementById('cName');
                        if (saved && nameEl && !nameEl.value) nameEl.value = saved;
                    } catch(e) {}
                }
            };
            document.getElementById('cPeers').addEventListener('click', function(e) {
                var btn = e.target.closest('.cpeer-remove');
                if (!btn) return;
                _removeStudentFromSession(btn.getAttribute('data-uid'));
            });
            window.cCopyCode = function () {
                if (!_code) return;
                try { navigator.clipboard.writeText(_code); } catch (e) { }
                var el = document.getElementById('cCodeEl');
                if (el) { el.style.background = '#dcfce7'; setTimeout(function () { el.style.background = ''; }, 700); }
            };
            window.cCopyUrl = function () {
                var el = document.getElementById('cJoinUrl');
                if (!el || !el.textContent || el.textContent.indexOf('?join=') === -1) return;
                try { navigator.clipboard.writeText(el.textContent); } catch (e) { }
                el.classList.add('copied');
                el.textContent = '✓ Скопійовано!';
                setTimeout(function () {
                    el.classList.remove('copied');
                    var url = location.href.split('?')[0] + '?join=' + _code;
                    el.textContent = url;
                }, 1500);
            };

            /* ── Слухачі змін (вчитель і учень) ── */
            function _hookChanges() {
                var ed = document.getElementById('boardEditor');

                /* ── Відстеження IME-композиції (мобільні клавіатури) ── */
                if (ed) {
                    ed.addEventListener('compositionstart', function() {
                        _isComposing = true;
                    }, true);
                    ed.addEventListener('compositionend', function() {
                        _isComposing = false;
                        _lastStudentInputAt = Date.now();
                    }, true);
                    /* Відстеження активного набору тексту */
                    ed.addEventListener('input', function() {
                        if (_role === 'student' && !_applyingRemote) {
                            _lastStudentInputAt = Date.now();
                        }
                    }, true);
                    /* touchstart у зоні учня — вважаємо потенційним початком набору */
                    ed.addEventListener('touchstart', function(e) {
                        if (_role !== 'student') return;
                        var zone = _zoneFromNode(e.target);
                        if (zone && zone.getAttribute('contenteditable') === 'true') {
                            _lastStudentInputAt = Date.now();
                        }
                    }, { passive: true, capture: true });
                }

                if (ed) new MutationObserver(function () {
                    if (_locked || _applyingRemote) return;
                    if (_role === 'teacher') {
                        _lastTeacherEditAt = Date.now();
                        _scheduleBroadcast(800);
                    }
                    else if (_role === 'student') _scheduleStudentBroadcast(800);
                }).observe(ed, { childList: true, subtree: true, characterData: true });

                /* Стежимо за змінами в комірках плаваючих таблиць */
                var card3 = document.getElementById('notebookCard');
                if (card3) new MutationObserver(function(mutations) {
                    if (_locked || _applyingRemote) return;
                    var inTable = mutations.some(function(m) {
                        var t = m.target;
                        while (t && t !== card3) {
                            if (t.classList && t.classList.contains('nb-floating-table')) return true;
                            t = t.parentElement;
                        }
                        return false;
                    });
                    if (!inTable) return;
                    if (_role === 'teacher') { _lastTeacherEditAt = Date.now(); _scheduleBroadcast(800); }
                    else if (_role === 'student') _scheduleStudentBroadcast(800);
                }).observe(card3, { childList: true, subtree: true, characterData: true });

                var orig = localStorage.setItem.bind(localStorage);
                localStorage.setItem = function (k, v) {
                    orig(k, v);
                    if (_locked) return;
                    if (_role === 'teacher' && k.startsWith('board_')) {
                        _lastTeacherEditAt = Date.now();
                        _scheduleBroadcast(700);
                    }
                    else if (_role === 'student' && k.startsWith('board_')) _scheduleStudentBroadcast(700);
                };

                /* Учень: блокуємо будь-яке редагування поза зонами .student-editable */
                if (ed) ed.addEventListener('keydown', function(e) {
                    if (_role !== 'student') return;
                    /* Перевіряємо, чи курсор всередині .student-editable[contenteditable] */
                    var sel = window.getSelection();
                    if (!sel || !sel.rangeCount) { e.preventDefault(); return; }
                    var node = sel.getRangeAt(0).startContainer;
                    var inZone = false, cur = node;
                    while (cur && cur !== ed) {
                        if (cur.nodeType === 1 &&
                            cur.classList && cur.classList.contains('student-editable') &&
                            cur.getAttribute('contenteditable') === 'true') {
                            inZone = true; break;
                        }
                        cur = cur.parentNode;
                    }
                    if (!inZone) { e.preventDefault(); return; }

                    /* Учень у своїй зоні: Enter → вставляємо <br> замість <div>/<p> */
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        var range = sel.getRangeAt(0);
                        range.deleteContents();
                        var br = document.createElement('br');
                        var anchor = document.createTextNode('\u200B');
                        range.insertNode(anchor);
                        range.insertNode(br);
                        var nr = document.createRange();
                        nr.setStartAfter(br);
                        nr.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(nr);
                        ed.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertParagraph' }));
                    }
                }, true);

                /* Вчитель: Enter — новий чистий рядок без зони; Shift+Enter — <br> всередині поточного контексту */
                if (ed) ed.addEventListener('keydown', function(e) {
                    if (_role !== 'teacher') return;
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    e.stopImmediatePropagation(); /* зупиняємо всі наступні listeners на цьому елементі (зокрема grid-mode handler) */

                    var sel = window.getSelection();
                    if (!sel || !sel.rangeCount) return;
                    var range = sel.getRangeAt(0);
                    range.deleteContents();

                    if (e.shiftKey) {
                        /* Shift+Enter: вставляємо <br> прямо на місці курсора, зберігаючи поточний контекст (зону учня) */
                        var brS = document.createElement('br');
                        var anchorS = document.createTextNode('');
                        range.insertNode(anchorS);
                        range.insertNode(brS);
                        var nrS = document.createRange();
                        nrS.setStart(anchorS, 0);
                        nrS.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(nrS);
                        ed.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertParagraph' }));
                        return;
                    }

                    /* Enter без Shift: вставити чистий <br> поза будь-якою .student-editable зоною */
                    /* Піднімаємося вгору, щоб знайти місце вставки поза .student-editable */
                    var insertAfter = range.endContainer;
                    /* Якщо курсор всередині .student-editable — знаходимо саму зону */
                    var cur = insertAfter.nodeType === Node.TEXT_NODE ? insertAfter.parentNode : insertAfter;
                    var zone = null, liEl = null;
                    while (cur && cur !== ed) {
                        if (cur.classList && cur.classList.contains('student-editable')) { zone = cur; }
                        if (cur.nodeName === 'LI') { liEl = cur; }
                        cur = cur.parentNode;
                    }

                    if (zone) {
                        /* Вставляємо <br> та курсор після зони, на рівні editor */
                        var br = document.createElement('br');
                        var anchor = document.createTextNode('\u200B'); /* zero-width space — щоб курсор тут «стояв» */
                        zone.after(anchor);
                        zone.after(br);
                        var nr = document.createRange();
                        nr.setStart(anchor, 0);
                        nr.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(nr);
                    } else if (liEl) {
                        /* Курсор всередині <li> (поза зоною) — створюємо новий <li> після поточного */
                        var newLi = document.createElement('li');
                        /* Якщо курсор не в кінці <li> — переносимо частину тексту після курсора */
                        var afterRange = document.createRange();
                        afterRange.setStart(range.endContainer, range.endOffset);
                        afterRange.setEnd(liEl, liEl.childNodes.length);
                        var fragment = afterRange.extractContents();
                        if (fragment.textContent || fragment.childNodes.length) {
                            newLi.appendChild(fragment);
                        }
                        liEl.after(newLi);
                        var nr = document.createRange();
                        if (newLi.firstChild) {
                            nr.setStart(newLi.firstChild, 0);
                        } else {
                            nr.setStart(newLi, 0);
                        }
                        nr.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(nr);
                    } else {
                        /* Курсор не в зоні і не в списку — звичайний clean <br> */
                        var br2 = document.createElement('br');
                        var anchor2 = document.createTextNode('');
                        range.insertNode(anchor2);
                        range.insertNode(br2);
                        var nr2 = document.createRange();
                        nr2.setStart(anchor2, 0);
                        nr2.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(nr2);
                    }

                    ed.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertParagraph' }));
                }, true);

                /* Учень: забороняємо вставку поза зонами */
                if (ed) ed.addEventListener('paste', function(e) {
                    if (_role !== 'student') return;
                    var sel = window.getSelection();
                    if (!sel || !sel.rangeCount) { e.preventDefault(); return; }
                    var node = sel.getRangeAt(0).startContainer;
                    var inZone = false, cur = node;
                    while (cur && cur !== ed) {
                        if (cur.nodeType === 1 &&
                            cur.classList && cur.classList.contains('student-editable') &&
                            cur.getAttribute('contenteditable') === 'true') {
                            inZone = true; break;
                        }
                        cur = cur.parentNode;
                    }
                    if (!inZone) e.preventDefault();
                }, true);

                if (ed) {
                    var caretTick = null;
                    var scheduleCaret = function() {
                        if (_role !== 'student') return;
                        clearTimeout(caretTick);
                        caretTick = setTimeout(_sendCaretFromSelection, 35);
                    };
                    ed.addEventListener('focusin', scheduleCaret, true);
                    ed.addEventListener('keyup', scheduleCaret, true);
                    ed.addEventListener('input', scheduleCaret, true);
                    ed.addEventListener('pointerup', scheduleCaret, true);
                    document.addEventListener('selectionchange', scheduleCaret);

                    /* Коли учень виходить з текстового поля — застосовуємо відкладений стан вчителя */
                    ed.addEventListener('blur', function () {
                        if (_role !== 'student') return;
                        setTimeout(_tryApplyPendingTeacherState, 300);
                    }, true);
                }

                /* Запасний інтервал: застосовуємо відкладений стан якщо учень не друкує вже 2 секунди.
                   Важливо для випадку коли blur не спрацював (напр. мобільний браузер). */
                setInterval(function () {
                    if (_role !== 'student' || !_pendingTeacherState || _locked) return;
                    var ed2 = document.getElementById('boardEditor');
                    var activeEl = document.activeElement;
                    if (!ed2 || !activeEl || !ed2.contains(activeEl)) {
                        _tryApplyPendingTeacherState();
                    }
                }, 2000);

                /* Підпис зони керується виключно data-assigned-to (встановлено вчителем).
                   focusin більше не змінює data-edited-by. */
            }

            /* ── Авто-join за URL ── */
            function _autoJoin() {
                var p = new URLSearchParams(location.search), code = p.get('join');
                if (code && code.length >= 6) {
                    window.cTab('s');
                    var inp = document.getElementById('cCodeIn'); if (inp) inp.value = code.toUpperCase().slice(0, 6);
                    setTimeout(cOpenModal, 1200);
                }
            }

            /* ── Кнопка в панелі керування ── */
            function _addPanelBtn() {
                var panel = document.querySelector('.controls-panel'); if (!panel) return;
                var btn = document.createElement('button');
                btn.id = 'collabOpenBtn';
                btn.title = 'Спільне редагування';
                btn.onclick = function (e) { e.stopPropagation(); cOpenModal(); };
                btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
                panel.appendChild(btn);
            }

            /* ── Закрити оверлей по кліку на тло ── */
            document.getElementById('collabOverlay').addEventListener('click', function (e) {
                if (e.target === this) cCloseModal();
            });

            /* ── Запуск ── */
            _injectStudentTimerStyle();
            _initFirebase();
            _hookChanges();
            _autoJoin();
            _addPanelBtn();
            _initAllowBtn();
            /* Хук курсора запускаємо після повного завантаження сторінки */
            window.addEventListener('load', function () { _hookCollabCursor(); });

        })();
