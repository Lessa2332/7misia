    // ── Double click to write on any line ──
    (function() {
        var editor = document.getElementById('boardEditor');
        if (!editor) return;
        /* Відкриваємо посилання в редакторі по Ctrl+клік (або просто клік якщо не виділення) */
        editor.addEventListener('click', function(e) {
            var a = e.target.closest('a[href]');
            if (!a) return;
            // Ctrl/Cmd+клік — завжди відкриваємо
            // Звичайний клік — відкриваємо тільки якщо немає виділення (не drag)
            var sel = window.getSelection();
            var hasSelection = sel && !sel.isCollapsed;
            if (e.ctrlKey || e.metaKey || !hasSelection) {
                e.preventDefault();
                window.open(a.href, '_blank', 'noopener,noreferrer');
            }
        });

        editor.addEventListener('dblclick', function(e) {
            if (editor.contentEditable !== 'true') return;
            // Only act if clicking empty space directly on the editor
            if (e.target !== editor) return;
            // Only act if at least one table is inserted in the notebook
            var card = document.getElementById('notebookCard');
            if (!card || !card.querySelector('.nb-floating-table')) return;

            var lh = 50;
            var style = window.getComputedStyle(editor);
            var lhStr = style.getPropertyValue('line-height');
            if (lhStr && lhStr !== 'normal') lh = parseFloat(lhStr) || 50;

            var rect = editor.getBoundingClientRect();
            var clickY = e.clientY - rect.top;

            var lastY = 0;
            if (editor.childNodes.length > 0) {
                var range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                var endRect = range.getBoundingClientRect();
                lastY = endRect.bottom - rect.top;
                if (endRect.height === 0 && endRect.bottom === 0) {
                    lastY = 0;
                }
            }

            var clickedLine = Math.floor(clickY / lh);
            var lastLine = Math.floor(lastY / lh);

            if (clickedLine > lastLine) {
                var linesToAdd = clickedLine - lastLine;
                for (var i = 0; i < linesToAdd; i++) {
                    editor.appendChild(document.createElement('br'));
                }
                
                var sel = window.getSelection();
                var r = document.createRange();
                r.selectNodeContents(editor);
                r.collapse(false);
                sel.removeAllRanges();
                sel.addRange(r);
                editor.focus();
            }
        });
    })();
