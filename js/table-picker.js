    /* === TABLE PICKER === */
    (function () {
        var picker    = document.getElementById('ctxTablePicker');
        var grid      = document.getElementById('tpkGrid');
        var label     = document.getElementById('tpkLabel');
        var rowsInput = document.getElementById('tpkRows');
        var colsInput = document.getElementById('tpkCols');

        var ROWS = 12, COLS = 12;
        var _savedRange = null;
        var _hoverRow = 0, _hoverCol = 0;

        // Build grid cells
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                var cell = document.createElement('div');
                cell.className = 'tpk-cell';
                cell.dataset.r = r + 1;
                cell.dataset.c = c + 1;
                grid.appendChild(cell);
            }
        }

        function highlight(rows, cols) {
            _hoverRow = rows;
            _hoverCol = cols;
            Array.from(grid.children).forEach(function(cell) {
                var cr = +cell.dataset.r;
                var cc = +cell.dataset.c;
                cell.classList.toggle('hovered', cr <= rows && cc <= cols);
            });
            label.textContent = (rows && cols) ? rows + ' × ' + cols : '—';
            rowsInput.value = rows || rowsInput.value;
            colsInput.value = cols || colsInput.value;
        }

        grid.addEventListener('mousemove', function(e) {
            var cell = e.target.closest('.tpk-cell');
            if (!cell) return;
            highlight(+cell.dataset.r, +cell.dataset.c);
        });

        grid.addEventListener('mouseleave', function() {
            highlight(_hoverRow, _hoverCol);
        });

        grid.addEventListener('click', function(e) {
            var cell = e.target.closest('.tpk-cell');
            if (!cell) return;
            doInsertTable(+cell.dataset.r, +cell.dataset.c);
        });

        // Manual input sync
        function onManualInput() {
            var r = Math.min(Math.max(1, parseInt(rowsInput.value) || 1), 20);
            var c = Math.min(Math.max(1, parseInt(colsInput.value) || 1), 20);
            highlight(Math.min(r, ROWS), Math.min(c, COLS));
        }
        rowsInput.addEventListener('input', onManualInput);
        colsInput.addEventListener('input', onManualInput);

        window.insertTableManual = function() {
            var r = Math.min(Math.max(1, parseInt(rowsInput.value) || 3), 20);
            var c = Math.min(Math.max(1, parseInt(colsInput.value) || 3), 20);
            doInsertTable(r, c);
        };

        var _insertClickX = 0, _insertClickY = 0;

        function doInsertTable(rows, cols) {
            hidePicker();
            var card = document.getElementById('notebookCard');
            if (!card) return;

            var tblLang = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
            var tTitle = tblLang === 'en' ? 'Table ' : tblLang === 'de' ? 'Tabelle ' : 'Таблиця ';
            var tDrag = tblLang === 'en' ? 'Drag table' : tblLang === 'de' ? 'Tabelle verschieben' : 'Перетягнути таблицю';
            var tDel = tblLang === 'en' ? 'Delete table' : tblLang === 'de' ? 'Tabelle löschen' : 'Видалити таблицю';
            var tRow = tblLang === 'en' ? '+ Row' : tblLang === 'de' ? '+ Zeile' : '+ Ряд';
            var tCol = tblLang === 'en' ? '+ Col' : tblLang === 'de' ? '+ Spalte' : '+ Стовп';
            var tAddRow = tblLang === 'en' ? 'Add row' : tblLang === 'de' ? 'Zeile hinzufügen' : 'Додати рядок';
            var tAddCol = tblLang === 'en' ? 'Add column' : tblLang === 'de' ? 'Spalte hinzufügen' : 'Додати стовпчик';

            // Build floating wrapper
            var wrap = document.createElement('div');
            wrap.className = 'nb-floating-table';

            // Default position: where user right-clicked on the card, offset slightly
            var cardRect = card.getBoundingClientRect();
            var initLeft = Math.max(8, _insertClickX || 80);
            var initTop  = Math.max(8, _insertClickY || 80);
            wrap.style.left = initLeft + 'px';
            wrap.style.top  = initTop  + 'px';
            wrap.style.width = Math.max(160, cols * 90) + 'px';

            // Header (drag handle)
            var header = document.createElement('div');
            header.className = 'nbt-header';
            header.title = tDrag;
            header.innerHTML =
                '<div class="nbt-title">' +
                '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
                '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>' +
                '<line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/><line x1="15" y1="9" x2="15" y2="21"/>' +
                '</svg>' +
                '<span class="nbt-title-text">' + tTitle + rows + '×' + cols + '</span>' +
                '</div>' +
                '<div class="nbt-header-btns">' +
                '<button class="nbt-add nbt-add-row" title="' + tAddRow + '">' + tRow + '</button>' +
                '<button class="nbt-add nbt-add-col" title="' + tAddCol + '">' + tCol + '</button>' +
                '<button class="nbt-del" title="' + tDel + '">×</button>' +
                '</div>';
            wrap.appendChild(header);

            // Table scroll area
            var tableWrap = document.createElement('div');
            tableWrap.className = 'nbt-table-wrap';

            // Build table
            var tbl = document.createElement('table');
            tbl.style.borderCollapse = 'collapse';
            tbl.style.tableLayout = 'fixed';
            tbl.style.width = '100%';
            for (var r = 0; r < rows; r++) {
                var tr = document.createElement('tr');
                for (var c = 0; c < cols; c++) {
                    var td = document.createElement('td');
                    td.contentEditable = 'true';
                    td.style.cssText = 'border:1px solid #cbd5e1;padding:5px 7px;vertical-align:top;outline:none;min-width:30px;word-break:break-word;font-size:13px;position:relative;';
                    td.innerHTML = '\u200B'; // zero-width space

                    // Column resize handle (right edge of each cell)
                    var colSep = document.createElement('div');
                    colSep.className = 'nbt-col-sep';
                    td.appendChild(colSep);

                    // Row resize handle (bottom edge of every row)
                    var rowSep = document.createElement('div');
                    rowSep.className = 'nbt-row-sep';
                    td.appendChild(rowSep);

                    tr.appendChild(td);
                }
                tbl.appendChild(tr);
            }
            tableWrap.appendChild(tbl);
            wrap.appendChild(tableWrap);

            // SE resize corner
            var seHandle = document.createElement('div');
            seHandle.className = 'nbt-resize-se';
            seHandle.title = 'Змінити розмір';
            wrap.appendChild(seHandle);

            card.appendChild(wrap);
            // Save state after table is created
            setTimeout(function() { if (typeof saveState === 'function') saveState(); }, 50);

            // Focus first cell
            var firstCell = tbl.querySelector('td');
            if (firstCell) {
                setTimeout(function() { firstCell.focus(); }, 30);
            }

            // ── Drag (header) ──
            (function() {
                var dragging = false, ox = 0, oy = 0;
                function onDown(e) {
                    if (typeof window.getCollabRole === 'function' && window.getCollabRole() === 'student') return;
                    if (e.target.closest('.nbt-del')) return;
                    if (e.target.closest('.nbt-title')) return;
                    dragging = true;
                    var rect = wrap.getBoundingClientRect();
                    var px = e.touches ? e.touches[0].clientX : e.clientX;
                    var py = e.touches ? e.touches[0].clientY : e.clientY;
                    ox = px - rect.left;
                    oy = py - rect.top;
                    wrap.classList.add('nbt-selected');
                    e.preventDefault();
                }
                function onMove(e) {
                    if (!dragging) return;
                    var px = e.touches ? e.touches[0].clientX : e.clientX;
                    var py = e.touches ? e.touches[0].clientY : e.clientY;
                    var cardR = card.getBoundingClientRect();
                    var newLeft = Math.max(0, px - cardR.left - ox);
                    var newTop  = Math.max(0, py - cardR.top  - oy + card.scrollTop);
                    wrap.style.left = newLeft + 'px';
                    wrap.style.top  = newTop  + 'px';
                }
                function onUp() { if (dragging && typeof saveState === 'function') saveState(); dragging = false; }
                header.addEventListener('mousedown', onDown);
                header.addEventListener('touchstart', onDown, { passive: false });
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onUp);
                document.addEventListener('touchend', onUp);
            })();

            // ── Delete button ──
            header.querySelector('.nbt-del').addEventListener('click', function() {
                if (typeof window.getCollabRole === 'function' && window.getCollabRole() === 'student') return;
                wrap.remove();
                if (typeof saveState === 'function') saveState();
            });

            // ── Add Row ──
            header.querySelector('.nbt-add-row').addEventListener('click', function(e) {
                e.stopPropagation();
                var rowsList = tbl.querySelectorAll('tr');
                if (!rowsList.length) return;
                var colsCount = rowsList[0].querySelectorAll('td').length;
                
                var tr = document.createElement('tr');
                for (var c = 0; c < colsCount; c++) {
                    var td = document.createElement('td');
                    td.contentEditable = 'true';
                    td.style.cssText = 'border:1px solid #cbd5e1;padding:5px 7px;vertical-align:top;outline:none;min-width:30px;word-break:break-word;font-size:13px;position:relative;';
                    var baseTd = rowsList[0].querySelectorAll('td')[c];
                    if (baseTd) {
                        td.style.width = baseTd.style.width;
                        td.style.minWidth = baseTd.style.minWidth;
                    }
                    td.innerHTML = '\u200B';
                    var colSep = document.createElement('div'); colSep.className = 'nbt-col-sep'; td.appendChild(colSep);
                    var rowSep = document.createElement('div'); rowSep.className = 'nbt-row-sep'; td.appendChild(rowSep);
                    tr.appendChild(td);
                }
                tbl.appendChild(tr);
                
                var currentTblH = tbl.offsetHeight;
                wrap.style.height = (currentTblH + header.offsetHeight) + 'px';
                tableWrap.style.height = currentTblH + 'px';
                
                // Оновлення заголовку з кількістю
                var titleTextEl = header.querySelector('.nbt-title-text');
                if (titleTextEl && (titleTextEl.textContent.indexOf('Таблиця') !== -1 || titleTextEl.textContent.indexOf('Table') !== -1 || titleTextEl.textContent.indexOf('Tabelle') !== -1)) {
                    var tblLang2 = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
                    titleTextEl.textContent = (tblLang2 === 'en' ? 'Table ' : tblLang2 === 'de' ? 'Tabelle ' : 'Таблиця ') + tbl.querySelectorAll('tr').length + '×' + colsCount;
                }
                if (typeof saveState === 'function') saveState();
            });

            // ── Add Column ──
            header.querySelector('.nbt-add-col').addEventListener('click', function(e) {
                e.stopPropagation();
                var rowsList = tbl.querySelectorAll('tr');
                if (!rowsList.length) return;
                
                // Fix ALL column widths explicitly so browser won't redistribute them
                rowsList.forEach(function(tr) {
                    Array.from(tr.querySelectorAll('td')).forEach(function(cell) {
                        cell.style.width = cell.offsetWidth + 'px';
                        cell.style.minWidth = cell.offsetWidth + 'px';
                    });
                });
                
                var baseColIdx = rowsList[0].querySelectorAll('td').length - 1;
                var baseTd = rowsList[0].querySelectorAll('td')[baseColIdx];
                var newColW = baseTd ? baseTd.offsetWidth : 50;
                
                var currentTblW = tbl.offsetWidth;
                var currentWrapW = wrap.offsetWidth;
                
                rowsList.forEach(function(tr) {
                    var td = document.createElement('td');
                    td.contentEditable = 'true';
                    td.style.cssText = 'border:1px solid #cbd5e1;padding:5px 7px;vertical-align:top;outline:none;word-break:break-word;font-size:13px;position:relative;';
                    td.style.width = newColW + 'px';
                    td.style.minWidth = newColW + 'px';
                    td.innerHTML = '\u200B';
                    var colSep = document.createElement('div'); colSep.className = 'nbt-col-sep'; td.appendChild(colSep);
                    var rowSep = document.createElement('div'); rowSep.className = 'nbt-row-sep'; td.appendChild(rowSep);
                    tr.appendChild(td);
                });
                
                tbl.style.width = (currentTblW + newColW) + 'px';
                wrap.style.width = (currentWrapW + newColW) + 'px';
                
                // Оновлення заголовку з кількістю
                var colsCount = rowsList[0].querySelectorAll('td').length;
                var titleTextEl = header.querySelector('.nbt-title-text');
                if (titleTextEl && (titleTextEl.textContent.indexOf('Таблиця') !== -1 || titleTextEl.textContent.indexOf('Table') !== -1 || titleTextEl.textContent.indexOf('Tabelle') !== -1)) {
                    var tblLang3 = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
                    titleTextEl.textContent = (tblLang3 === 'en' ? 'Table ' : tblLang3 === 'de' ? 'Tabelle ' : 'Таблиця ') + rowsList.length + '×' + colsCount;
                }
                if (typeof saveState === 'function') saveState();
            });

            // ── Rename table (click on title text) ──
            (function() {
                var titleEl = header.querySelector('.nbt-title');
                var titleTextEl = titleEl ? titleEl.querySelector('.nbt-title-text') : null;
                if (!titleEl) return;

                function startRename(e) {
                    if (e.target.tagName === 'INPUT') return;
                    if (typeof window.getCollabRole === 'function' && window.getCollabRole() === 'student') return;
                    e.stopPropagation();
                    e.preventDefault();

                    var currentText = titleTextEl ? titleTextEl.textContent : '';
                    var input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'nbt-title-input';
                    input.value = currentText;

                    // Hide text, show input
                    if (titleTextEl) titleTextEl.style.display = 'none';
                    titleEl.appendChild(input);
                    input.focus();
                    input.select();

                    function finish() {
                        var val = input.value.trim();
                        if (!val) val = currentText;
                        input.remove();
                        if (titleTextEl) {
                            titleTextEl.textContent = val;
                            titleTextEl.style.display = '';
                        }
                    }

                    input.addEventListener('blur', finish);
                    input.addEventListener('keydown', function(ev) {
                        if (ev.key === 'Enter') { input.blur(); ev.preventDefault(); }
                        if (ev.key === 'Escape') { input.value = currentText; input.blur(); ev.preventDefault(); }
                        ev.stopPropagation();
                    });
                    input.addEventListener('mousedown', function(ev) { ev.stopPropagation(); });
                }

                titleEl.addEventListener('click', startRename);
            })();

            // ── SE resize (whole table) ──
            (function() {
                var resizing = false, startX = 0, startY = 0, startW = 0, startH = 0;
                var initialRowHeights = [];
                var initialColWidths = [];
                var initialBodyH = 0;
                var initialTblW = 0;

                function onDown(e) {
                    if (typeof window.getCollabRole === 'function' && window.getCollabRole() === 'student') return;
                    resizing = true;
                    startX = e.touches ? e.touches[0].clientX : e.clientX;
                    startY = e.touches ? e.touches[0].clientY : e.clientY;
                    startW = wrap.offsetWidth;
                    startH = wrap.offsetHeight;
                    
                    initialBodyH = tableWrap.offsetHeight;
                    initialTblW = tbl.offsetWidth;
                    
                    var trs = Array.from(tbl.querySelectorAll('tr'));
                    initialRowHeights = trs.map(function(tr) {
                        var td = tr.querySelector('td');
                        return td ? td.offsetHeight : 0;
                    });
                    
                    var firstRow = tbl.querySelector('tr');
                    if (firstRow) {
                        initialColWidths = Array.from(firstRow.querySelectorAll('td')).map(function(td) {
                            return td.offsetWidth;
                        });
                    } else {
                        initialColWidths = [];
                    }

                    e.preventDefault();
                    e.stopPropagation();
                }
                function onMove(e) {
                    if (!resizing) return;
                    var px = e.touches ? e.touches[0].clientX : e.clientX;
                    var py = e.touches ? e.touches[0].clientY : e.clientY;
                    var newW = Math.max(100, startW + (px - startX));
                    var newH = Math.max(60,  startH + (py - startY));
                    wrap.style.width  = newW + 'px';
                    wrap.style.height = newH + 'px';
                    var bodyH = newH - header.offsetHeight;
                    tableWrap.style.height = bodyH + 'px';
                    
                    // Розтягуємо рядки пропорційно
                    var trs = Array.from(tbl.querySelectorAll('tr'));
                    if (trs.length && initialBodyH > 0) {
                        var hRatio = bodyH / initialBodyH;
                        trs.forEach(function(tr, i) {
                            var rowH = Math.max(24, Math.floor(initialRowHeights[i] * hRatio));
                            Array.from(tr.querySelectorAll('td')).forEach(function(cell) {
                                cell.style.height = rowH + 'px';
                            });
                        });
                    }
                    
                    // Розтягуємо колонки пропорційно
                    var firstRow = tbl.querySelector('tr');
                    if (firstRow && initialTblW > 0) {
                        var wRatio = newW / initialTblW;
                        Array.from(tbl.querySelectorAll('tr')).forEach(function(tr) {
                            Array.from(tr.querySelectorAll('td')).forEach(function(cell, j) {
                                var colW = Math.max(30, Math.floor(initialColWidths[j] * wRatio));
                                cell.style.width = colW + 'px';
                                cell.style.minWidth = colW + 'px';
                            });
                        });
                    }
                    tbl.style.width = newW + 'px';
                }
                function onUp() { if (resizing && typeof saveState === 'function') saveState(); resizing = false; }
                seHandle.addEventListener('mousedown', onDown);
                seHandle.addEventListener('touchstart', onDown, { passive: false });
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onUp);
                document.addEventListener('touchend', onUp);
            })();

            // ── Column resize (nbt-col-sep) — Word-style: only dragged column changes, others stay fixed ──
            (function() {
                var active = null, startX = 0, startW = 0, colIndex = -1;

                tableWrap.addEventListener('mousedown', function(e) {
                    if (!e.target.classList.contains('nbt-col-sep')) return;
                    active = e.target;
                    startX = e.clientX;
                    var td = active.parentElement;
                    startW = td.offsetWidth;

                    // Fix ALL column widths explicitly so browser won't redistribute them
                    var rows = Array.from(tbl.querySelectorAll('tr'));
                    rows.forEach(function(tr) {
                        Array.from(tr.querySelectorAll('td')).forEach(function(cell) {
                            cell.style.width = cell.offsetWidth + 'px';
                            cell.style.minWidth = cell.offsetWidth + 'px';
                        });
                    });

                    // Fix table width explicitly
                    tbl.style.width = tbl.offsetWidth + 'px';
                    wrap.style.width = wrap.offsetWidth + 'px';

                    // Find column index of dragged cell
                    var firstRow = tbl.querySelector('tr');
                    if (firstRow) {
                        colIndex = Array.from(firstRow.querySelectorAll('td')).indexOf(td);
                        if (colIndex === -1) {
                            // td might be in a different row, find by position
                            var allRows = tbl.querySelectorAll('tr');
                            for (var ri = 0; ri < allRows.length; ri++) {
                                var idx = Array.from(allRows[ri].querySelectorAll('td')).indexOf(td);
                                if (idx !== -1) { colIndex = idx; break; }
                            }
                        }
                    }

                    active.classList.add('dragging');
                    e.preventDefault();
                });

                document.addEventListener('mousemove', function(e) {
                    if (!active || colIndex === -1) return;
                    var delta = e.clientX - startX;
                    var newW = Math.max(30, startW + delta);

                    // Change only the dragged column cells across all rows
                    var allRows = Array.from(tbl.querySelectorAll('tr'));
                    allRows.forEach(function(tr) {
                        var cells = tr.querySelectorAll('td');
                        if (cells[colIndex]) {
                            cells[colIndex].style.width = newW + 'px';
                            cells[colIndex].style.minWidth = newW + 'px';
                        }
                    });

                    // Expand table width by the same delta (so other columns don't shift)
                    var currentTblW = parseFloat(tbl.style.width) || tbl.offsetWidth;
                    var newTblW = Math.max(100, currentTblW + (newW - startW - (parseFloat(tbl.style.width) !== currentTblW ? 0 : 0)));
                    // Recalculate: table width = sum of all column widths
                    var firstRow = tbl.querySelector('tr');
                    if (firstRow) {
                        var totalW = 0;
                        Array.from(firstRow.querySelectorAll('td')).forEach(function(cell) {
                            totalW += parseFloat(cell.style.width) || cell.offsetWidth;
                        });
                        tbl.style.width = totalW + 'px';
                        wrap.style.width = totalW + 'px';
                    }
                });

                document.addEventListener('mouseup', function() {
                    if (active) { active.classList.remove('dragging'); if (typeof saveState === 'function') saveState(); active = null; colIndex = -1; }
                });

                // Touch support
                tableWrap.addEventListener('touchstart', function(e) {
                    if (!e.target.classList.contains('nbt-col-sep')) return;
                    active = e.target;
                    startX = e.touches[0].clientX;
                    var td = active.parentElement;
                    startW = td.offsetWidth;
                    var rows = Array.from(tbl.querySelectorAll('tr'));
                    rows.forEach(function(tr) {
                        Array.from(tr.querySelectorAll('td')).forEach(function(cell) {
                            cell.style.width = cell.offsetWidth + 'px';
                            cell.style.minWidth = cell.offsetWidth + 'px';
                        });
                    });
                    tbl.style.width = tbl.offsetWidth + 'px';
                    wrap.style.width = wrap.offsetWidth + 'px';
                    var allRows = tbl.querySelectorAll('tr');
                    for (var ri = 0; ri < allRows.length; ri++) {
                        var idx = Array.from(allRows[ri].querySelectorAll('td')).indexOf(td);
                        if (idx !== -1) { colIndex = idx; break; }
                    }
                    active.classList.add('dragging');
                    e.preventDefault();
                }, { passive: false });

                document.addEventListener('touchmove', function(e) {
                    if (!active || colIndex === -1) return;
                    var delta = e.touches[0].clientX - startX;
                    var newW = Math.max(30, startW + delta);
                    var allRows = Array.from(tbl.querySelectorAll('tr'));
                    allRows.forEach(function(tr) {
                        var cells = tr.querySelectorAll('td');
                        if (cells[colIndex]) {
                            cells[colIndex].style.width = newW + 'px';
                            cells[colIndex].style.minWidth = newW + 'px';
                        }
                    });
                    var firstRow = tbl.querySelector('tr');
                    if (firstRow) {
                        var totalW = 0;
                        Array.from(firstRow.querySelectorAll('td')).forEach(function(cell) {
                            totalW += parseFloat(cell.style.width) || cell.offsetWidth;
                        });
                        tbl.style.width = totalW + 'px';
                        wrap.style.width = totalW + 'px';
                    }
                    e.preventDefault();
                }, { passive: false });

                document.addEventListener('touchend', function() {
                    if (active) { active.classList.remove('dragging'); active = null; colIndex = -1; }
                });
            })();

            // ── Row resize (nbt-row-sep) ──
            (function() {
                var active = null, startY = 0, startH = 0;
                tableWrap.addEventListener('mousedown', function(e) {
                    if (!e.target.classList.contains('nbt-row-sep')) return;
                    active = e.target;
                    startY = e.clientY;
                    startH = active.parentElement.offsetHeight;
                    active.classList.add('dragging');
                    e.preventDefault();
                });
                document.addEventListener('mousemove', function(e) {
                    if (!active) return;
                    var row = active.parentElement.closest('tr');
                    if (!row) return;
                    var newH = Math.max(24, startH + (e.clientY - startY));
                    Array.from(row.querySelectorAll('td')).forEach(function(cell) {
                        cell.style.height = newH + 'px';
                    });
                    // Синхронізуємо висоту обгортки з реальною висотою таблиці
                    var totalH = tbl.offsetHeight + header.offsetHeight;
                    wrap.style.height = totalH + 'px';
                    tableWrap.style.height = tbl.offsetHeight + 'px';
                });
                document.addEventListener('mouseup', function() {
                    if (active) { active.classList.remove('dragging'); if (typeof saveState === 'function') saveState(); active = null; }
                });
            })();

            // ── Save on cell input ──
            var _tblInputTimer = null;
            tbl.addEventListener('input', function() {
                clearTimeout(_tblInputTimer);
                _tblInputTimer = setTimeout(function() {
                    if (typeof saveState === 'function') saveState();
                }, 800);
            });

            // ── Tab navigation ──
            tbl.addEventListener('keydown', function(e) {
                if (e.key !== 'Tab') return;
                var cells = Array.from(tbl.querySelectorAll('td'));
                var idx = cells.indexOf(document.activeElement);
                if (idx === -1) return;
                e.preventDefault();
                var next = e.shiftKey ? cells[idx - 1] : cells[idx + 1];
                if (next) {
                    next.focus();
                    var s = window.getSelection();
                    var range = document.createRange();
                    range.selectNodeContents(next);
                    range.collapse(false);
                    s.removeAllRanges();
                    s.addRange(range);
                }
            });

            // ── Helper: sync wrap/tableWrap dimensions to actual table size ──
            function _syncWrapSize() {
                // Let browser reflow first
                requestAnimationFrame(function() {
                    var tblH = tbl.offsetHeight;
                    var tblW = tbl.offsetWidth;
                    tableWrap.style.height = tblH + 'px';
                    wrap.style.height = (tblH + header.offsetHeight) + 'px';
                    wrap.style.width  = tblW + 'px';
                    tbl.style.width   = tblW + 'px';
                    // Update title counter (only if it still shows auto-generated label)
                    var titleTextEl = header.querySelector('.nbt-title-text');
                    if (titleTextEl) {
                        var txt = titleTextEl.textContent;
                        var isAuto = txt.indexOf('Таблиця') !== -1 || txt.indexOf('Table') !== -1 || txt.indexOf('Tabelle') !== -1;
                        if (isAuto) {
                            var tl = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
                            var rowCount = tbl.querySelectorAll('tr').length;
                            var colCount = tbl.querySelector('tr') ? tbl.querySelector('tr').querySelectorAll('td').length : 0;
                            titleTextEl.textContent = (tl === 'en' ? 'Table ' : tl === 'de' ? 'Tabelle ' : 'Таблиця ') + rowCount + '×' + colCount;
                        }
                    }
                });
            }

            // ── Cell right-click context menu ──
            (function() {
                var tblLang5 = function() {
                    return (typeof state !== 'undefined' && state.lang) ? state.lang :
                           ((window._state && window._state.lang) ? window._state.lang : 'ua');
                };
                var L = function(ua, en, de) {
                    var l = tblLang5();
                    return l === 'en' ? en : l === 'de' ? de : ua;
                };

                function removeNbtCtx() {
                    var old = document.getElementById('_nbtCtxMenu');
                    if (old) old.remove();
                }

                tbl.addEventListener('contextmenu', function(e) {
                    var td = e.target.closest('td');
                    if (!td) return;
                    e.preventDefault();
                    e.stopPropagation();
                    if (typeof window.getCollabRole === 'function' && window.getCollabRole() === 'student') return;
                    removeNbtCtx();

                    // Find row/col index
                    var tr = td.closest('tr');
                    var allRows = Array.from(tbl.querySelectorAll('tr'));
                    var rowIdx = allRows.indexOf(tr);
                    var colIdx = Array.from(tr.querySelectorAll('td')).indexOf(td);

                    var menu = document.createElement('div');
                    menu.className = 'nbt-ctx';
                    menu.id = '_nbtCtxMenu';

                    function item(icon, label, cls, fn) {
                        var btn = document.createElement('button');
                        btn.className = 'nbt-ctx-item' + (cls ? ' ' + cls : '');
                        btn.innerHTML = icon + '<span>' + label + '</span>';
                        btn.addEventListener('mousedown', function(ev) { ev.stopPropagation(); });
                        btn.addEventListener('click', function(ev) {
                            ev.stopPropagation();
                            removeNbtCtx();
                            fn();
                        });
                        return btn;
                    }
                    function sep() {
                        var d = document.createElement('div');
                        d.className = 'nbt-ctx-sep';
                        return d;
                    }

                    var svgRow = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>';
                    var svgCol = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>';
                    var svgAdd = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
                    var svgDel = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

                    // Insert row above
                    menu.appendChild(item(svgAdd, L('Вставити рядок вище', 'Insert row above', 'Zeile darüber'), '', function() {
                        var newTr = document.createElement('tr');
                        var colsCount = tr.querySelectorAll('td').length;
                        for (var c = 0; c < colsCount; c++) {
                            var newTd = document.createElement('td');
                            newTd.contentEditable = 'true';
                            newTd.style.cssText = 'border:1px solid #cbd5e1;padding:5px 7px;vertical-align:top;outline:none;min-width:30px;word-break:break-word;font-size:13px;position:relative;';
                            var baseTd = tr.querySelectorAll('td')[c];
                            if (baseTd) { newTd.style.width = baseTd.style.width; newTd.style.minWidth = baseTd.style.minWidth; }
                            newTd.innerHTML = '\u200B';
                            var cs = document.createElement('div'); cs.className = 'nbt-col-sep'; newTd.appendChild(cs);
                            var rs = document.createElement('div'); rs.className = 'nbt-row-sep'; newTd.appendChild(rs);
                            newTr.appendChild(newTd);
                        }
                        tbl.insertBefore(newTr, tr);
                        _syncWrapSize();
                        if (typeof saveState === 'function') saveState();
                    }));

                    // Insert row below
                    menu.appendChild(item(svgAdd, L('Вставити рядок нижче', 'Insert row below', 'Zeile darunter'), '', function() {
                        var newTr = document.createElement('tr');
                        var colsCount = tr.querySelectorAll('td').length;
                        for (var c = 0; c < colsCount; c++) {
                            var newTd = document.createElement('td');
                            newTd.contentEditable = 'true';
                            newTd.style.cssText = 'border:1px solid #cbd5e1;padding:5px 7px;vertical-align:top;outline:none;min-width:30px;word-break:break-word;font-size:13px;position:relative;';
                            var baseTd = tr.querySelectorAll('td')[c];
                            if (baseTd) { newTd.style.width = baseTd.style.width; newTd.style.minWidth = baseTd.style.minWidth; }
                            newTd.innerHTML = '\u200B';
                            var cs = document.createElement('div'); cs.className = 'nbt-col-sep'; newTd.appendChild(cs);
                            var rs = document.createElement('div'); rs.className = 'nbt-row-sep'; newTd.appendChild(rs);
                            newTr.appendChild(newTd);
                        }
                        tr.insertAdjacentElement('afterend', newTr);
                        _syncWrapSize();
                        if (typeof saveState === 'function') saveState();
                    }));

                    menu.appendChild(sep());

                    // Insert col left
                    menu.appendChild(item(svgAdd, L('Вставити стовпець зліва', 'Insert column left', 'Spalte links'), '', function() {
                        Array.from(tbl.querySelectorAll('tr')).forEach(function(row, ri) {
                            var newTd = document.createElement('td');
                            newTd.contentEditable = 'true';
                            newTd.style.cssText = 'border:1px solid #cbd5e1;padding:5px 7px;vertical-align:top;outline:none;word-break:break-word;font-size:13px;position:relative;';
                            var refTd = row.querySelectorAll('td')[colIdx];
                            if (refTd) { newTd.style.width = refTd.style.width || refTd.offsetWidth + 'px'; newTd.style.minWidth = newTd.style.width; }
                            newTd.innerHTML = '\u200B';
                            var cs = document.createElement('div'); cs.className = 'nbt-col-sep'; newTd.appendChild(cs);
                            var rs = document.createElement('div'); rs.className = 'nbt-row-sep'; newTd.appendChild(rs);
                            if (refTd) row.insertBefore(newTd, refTd);
                            else row.appendChild(newTd);
                        });
                        _syncWrapSize();
                        if (typeof saveState === 'function') saveState();
                    }));

                    // Insert col right
                    menu.appendChild(item(svgAdd, L('Вставити стовпець справа', 'Insert column right', 'Spalte rechts'), '', function() {
                        Array.from(tbl.querySelectorAll('tr')).forEach(function(row) {
                            var newTd = document.createElement('td');
                            newTd.contentEditable = 'true';
                            newTd.style.cssText = 'border:1px solid #cbd5e1;padding:5px 7px;vertical-align:top;outline:none;word-break:break-word;font-size:13px;position:relative;';
                            var refTd = row.querySelectorAll('td')[colIdx];
                            if (refTd) { newTd.style.width = refTd.style.width || refTd.offsetWidth + 'px'; newTd.style.minWidth = newTd.style.width; }
                            newTd.innerHTML = '\u200B';
                            var cs = document.createElement('div'); cs.className = 'nbt-col-sep'; newTd.appendChild(cs);
                            var rs = document.createElement('div'); rs.className = 'nbt-row-sep'; newTd.appendChild(rs);
                            if (refTd && refTd.nextSibling) row.insertBefore(newTd, refTd.nextSibling);
                            else row.appendChild(newTd);
                        });
                        _syncWrapSize();
                        if (typeof saveState === 'function') saveState();
                    }));

                    menu.appendChild(sep());

                    // Delete row
                    menu.appendChild(item(svgRow + svgDel, L('Видалити рядок', 'Delete row', 'Zeile löschen'), 'danger', function() {
                        if (tbl.querySelectorAll('tr').length <= 1) { wrap.remove(); if (typeof saveState === 'function') saveState(); return; }
                        tr.remove();
                        _syncWrapSize();
                        if (typeof saveState === 'function') saveState();
                    }));

                    // Delete column
                    menu.appendChild(item(svgCol + svgDel, L('Видалити стовпець', 'Delete column', 'Spalte löschen'), 'danger', function() {
                        var allR = Array.from(tbl.querySelectorAll('tr'));
                        if (allR.length && allR[0].querySelectorAll('td').length <= 1) { wrap.remove(); if (typeof saveState === 'function') saveState(); return; }
                        allR.forEach(function(row) {
                            var cells = row.querySelectorAll('td');
                            if (cells[colIdx]) cells[colIdx].remove();
                        });
                        _syncWrapSize();
                        if (typeof saveState === 'function') saveState();
                    }));

                    // Position menu
                    document.body.appendChild(menu);
                    var vw = window.innerWidth, vh = window.innerHeight;
                    var mw = menu.offsetWidth || 190, mh = menu.offsetHeight || 200;
                    var left = e.clientX + 4;
                    var top  = e.clientY + 4;
                    if (left + mw > vw - 8) left = e.clientX - mw - 4;
                    if (top  + mh > vh - 8) top  = e.clientY - mh - 4;
                    menu.style.left = Math.max(4, left) + 'px';
                    menu.style.top  = Math.max(4, top)  + 'px';

                    // Close on outside click
                    function onOutside(ev) {
                        if (!menu.contains(ev.target)) { removeNbtCtx(); document.removeEventListener('mousedown', onOutside); }
                    }
                    setTimeout(function() { document.addEventListener('mousedown', onOutside); }, 0);
                });
            })();

            // ── Click to select/deselect ──
            wrap.addEventListener('mousedown', function(e) {
                document.querySelectorAll('.nb-floating-table.nbt-selected').forEach(function(el) {
                    if (el !== wrap) el.classList.remove('nbt-selected');
                });
                wrap.classList.add('nbt-selected');
            });
            document.addEventListener('mousedown', function(e) {
                if (!wrap.contains(e.target)) wrap.classList.remove('nbt-selected');
            });
        }

        function hidePicker() {
            picker.classList.remove('visible');
            picker.style.display = '';
        }

        window.openTablePicker = function(savedRange, clickX, clickY) {
            _savedRange = savedRange || null;
            _insertClickX = clickX || 0;
            _insertClickY = clickY || 0;
            highlight(0, 0);

            var tblLang4 = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
            var picker = document.getElementById('ctxTablePicker');
            if (picker) {
                var titleEl = picker.querySelector('.tpk-title');
                if (titleEl) titleEl.textContent = tblLang4 === 'en' ? 'Choose table size' : tblLang4 === 'de' ? 'Tabellengröße wählen' : 'Оберіть розмір таблиці';
                var rowsInp = document.getElementById('tpkRows');
                if (rowsInp) rowsInp.title = tblLang4 === 'en' ? 'Rows' : tblLang4 === 'de' ? 'Zeilen' : 'Рядки';
                var colsInp = document.getElementById('tpkCols');
                if (colsInp) colsInp.title = tblLang4 === 'en' ? 'Columns' : tblLang4 === 'de' ? 'Spalten' : 'Стовпці';
                var insBtn = picker.querySelector('.tpk-insert-btn');
                if (insBtn) insBtn.textContent = tblLang4 === 'en' ? 'Insert' : tblLang4 === 'de' ? 'Einfügen' : 'Вставити';
            }

            // Position near the context menu position or center of screen
            var menu = document.getElementById('editorContextMenu');
            var mx = parseFloat(menu.style.left) || (window.innerWidth / 2);
            var my = parseFloat(menu.style.top) || (window.innerHeight / 2);

            picker.style.display = 'flex';
            picker.classList.add('visible');
            picker.style.animation = 'none';
            requestAnimationFrame(function() { picker.style.animation = ''; });

            var vw = window.innerWidth, vh = window.innerHeight;
            var pw = picker.offsetWidth || 220, ph = picker.offsetHeight || 260;
            var left = (mx + pw > vw - 8) ? vw - pw - 8 : mx;
            var top  = (my + ph > vh - 8) ? my - ph : my;
            picker.style.left = Math.max(8, left) + 'px';
            picker.style.top  = Math.max(8, top) + 'px';
        };

        // ── Expose doInsertTable for restoring saved tables ──
        window._nbDoInsertTable = doInsertTable;

        // ── Serialize all floating tables for saving ──
        window.saveTablesState = function() {
            var card = document.getElementById('notebookCard');
            if (!card) return [];
            return Array.from(card.querySelectorAll('.nb-floating-table')).map(function(wrap) {
                var tbl = wrap.querySelector('table');
                var titleEl = wrap.querySelector('.nbt-title-text');
                var rows = [];
                if (tbl) {
                    Array.from(tbl.querySelectorAll('tr')).forEach(function(tr) {
                        var cells = [];
                        Array.from(tr.querySelectorAll('td')).forEach(function(td) {
                            var clone = td.cloneNode(true);
                            clone.querySelectorAll('.nbt-col-sep, .nbt-row-sep').forEach(function(s) { s.remove(); });
                            cells.push({
                                html: clone.innerHTML,
                                w: td.style.width,
                                mw: td.style.minWidth,
                                h: td.style.height
                            });
                        });
                        rows.push(cells);
                    });
                }
                return {
                    left: wrap.style.left,
                    top: wrap.style.top,
                    width: wrap.style.width,
                    height: wrap.style.height,
                    title: titleEl ? titleEl.textContent : '',
                    tblWidth: tbl ? tbl.style.width : '',
                    rows: rows
                };
            });
        };

        // ── Recreate all floating tables from saved data ──
        window.restoreTablesState = function(tables) {
            var card = document.getElementById('notebookCard');
            if (!card) return;
            // Remove any existing floating tables
            Array.from(card.querySelectorAll('.nb-floating-table')).forEach(function(el) { el.remove(); });
            if (!tables || !tables.length) return;
            tables.forEach(function(data) {
                if (!data.rows || !data.rows.length || !data.rows[0].length) return;
                var numRows = data.rows.length;
                var numCols = data.rows[0].length;
                // Create table with all its event listeners
                window._nbDoInsertTable(numRows, numCols);
                // Get the just-added wrap
                var wraps = card.querySelectorAll('.nb-floating-table');
                var wrap = wraps[wraps.length - 1];
                if (!wrap) return;
                // Restore position and outer size
                if (data.left)   wrap.style.left   = data.left;
                if (data.top)    wrap.style.top    = data.top;
                if (data.width)  wrap.style.width  = data.width;
                if (data.height) wrap.style.height = data.height;
                // Restore title text
                var titleEl = wrap.querySelector('.nbt-title-text');
                if (titleEl && data.title) titleEl.textContent = data.title;
                // Restore table width and scroll area height
                var tbl = wrap.querySelector('table');
                if (tbl && data.tblWidth) tbl.style.width = data.tblWidth;
                var tableWrapEl = wrap.querySelector('.nbt-table-wrap');
                var header = wrap.querySelector('.nbt-header');
                if (tableWrapEl && data.height) {
                    var bodyH = parseFloat(data.height) - (header ? header.offsetHeight : 40);
                    tableWrapEl.style.height = Math.max(30, bodyH) + 'px';
                }
                // Restore cell content, widths and heights
                var trs = wrap.querySelectorAll('tr');
                data.rows.forEach(function(rowData, ri) {
                    var tr = trs[ri];
                    if (!tr) return;
                    var tds = tr.querySelectorAll('td');
                    rowData.forEach(function(cellData, ci) {
                        var td = tds[ci];
                        if (!td) return;
                        var colSep = td.querySelector('.nbt-col-sep');
                        var rowSep = td.querySelector('.nbt-row-sep');
                        td.innerHTML = cellData.html || '\u200B';
                        if (cellData.w)  td.style.width    = cellData.w;
                        if (cellData.mw) td.style.minWidth = cellData.mw;
                        if (cellData.h)  td.style.height   = cellData.h;
                        if (colSep) td.appendChild(colSep);
                        if (rowSep) td.appendChild(rowSep);
                    });
                });
                // Для учня — ховаємо кнопки керування та cursor drag у шапці
                if (typeof window.getCollabRole === 'function' && window.getCollabRole() === 'student') {
                    wrap.querySelectorAll('.nbt-del, .nbt-add-row, .nbt-add-col').forEach(function(btn) {
                        btn.style.display = 'none';
                    });
                    var hdr = wrap.querySelector('.nbt-header');
                    if (hdr) hdr.style.cursor = 'default';
                    var seH = wrap.querySelector('.nbt-resize-se');
                    if (seH) seH.style.display = 'none';
                    wrap.querySelectorAll('.nbt-col-sep, .nbt-row-sep').forEach(function(sep) {
                        sep.style.display = 'none';
                    });
                }
            });
        };

        // Hide picker on outside click / Escape
        document.addEventListener('pointerdown', function(e) {
            if (!picker.contains(e.target) &&
                e.target.id !== 'ctxTable') {
                hidePicker();
            }
        }, true);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') hidePicker();
        });

        // Tab navigation between cells
        document.addEventListener('keydown', function(e) {
            if (e.key !== 'Tab') return;
            var active = document.activeElement;
            if (!active || active.tagName !== 'TD') return;
            var tbl = active.closest('table.nb-table');
            if (!tbl) return;
            e.preventDefault();
            var cells = Array.from(tbl.querySelectorAll('td'));
            var idx = cells.indexOf(active);
            var next = e.shiftKey ? cells[idx - 1] : cells[idx + 1];
            if (next) {
                next.focus();
                var s = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(next);
                range.collapse(false);
                s.removeAllRanges();
                s.addRange(range);
            }
        });
    })();
