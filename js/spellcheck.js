    // ── Spell check via Groq ──
    (function() {
        var _spk = (window.SUPERZOSHYT_CONFIG && window.SUPERZOSHYT_CONFIG.GROQ_SPELLCHECK_KEY) || '';

        function _spDiff(orig, fixed) {
            var ow = orig.split(/(\s+)/);
            var fw = fixed.split(/(\s+)/);
            var m = ow.length, n = fw.length;
            var dp = [];
            for (var i = 0; i <= m; i++) { dp[i] = []; for (var j = 0; j <= n; j++) dp[i][j] = 0; }
            for (var i = 1; i <= m; i++)
                for (var j = 1; j <= n; j++)
                    dp[i][j] = ow[i-1] === fw[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
            var ops = [], i = m, j = n;
            while (i > 0 || j > 0) {
                if (i > 0 && j > 0 && ow[i-1] === fw[j-1]) { ops.unshift({t:'eq', v:ow[i-1]}); i--; j--; }
                else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) { ops.unshift({t:'ins', v:fw[j-1]}); j--; }
                else { ops.unshift({t:'del', v:ow[i-1]}); i--; }
            }
            return ops;
        }

        function _spBuildDiffHtml(orig, fixed) {
            if (orig === fixed) return '<span style="color:#64748b;font-style:italic;">Помилок не знайдено ✓</span>';
            var ops = _spDiff(orig, fixed);
            var html = '';
            ops.forEach(function(op) {
                var v = op.v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
                if      (op.t === 'eq')  html += '<span>' + v + '</span>';
                else if (op.t === 'del') html += '<span style="background:#fee2e2;color:#b91c1c;text-decoration:line-through;border-radius:3px;padding:0 2px;">' + v + '</span>';
                else                     html += '<span style="background:#dcfce7;color:#15803d;font-weight:600;border-radius:3px;padding:0 2px;">' + v + '</span>';
            });
            return html;
        }

        function _spShowToast(msg, color) {
            if (typeof showOcrToast === 'function') { showOcrToast(msg, color); return; }
            var t = document.createElement('div');
            t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:' + color + ';color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:11000;pointer-events:none;';
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(function() { t.remove(); }, 2500);
        }

        function _spShowDiff(orig, fixed, savedRange) {
            var diffHtml = _spBuildDiffHtml(orig, fixed);
            var hasChanges = orig !== fixed;

            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.5);backdrop-filter:blur(5px);z-index:10500;display:flex;align-items:center;justify-content:center;';

            var legendHtml = hasChanges
                ? '<div style="display:flex;gap:12px;margin-bottom:12px;flex-shrink:0;">'
                  + '<span style="font-size:12px;color:#64748b;display:flex;align-items:center;gap:4px;"><span style="background:#fee2e2;color:#b91c1c;border-radius:3px;padding:1px 6px;text-decoration:line-through;">було</span></span>'
                  + '<span style="font-size:12px;color:#64748b;display:flex;align-items:center;gap:4px;"><span style="background:#dcfce7;color:#15803d;border-radius:3px;padding:1px 6px;font-weight:600;">стало</span></span>'
                  + '</div>' : '';

            var applyBtn = hasChanges
                ? '<button id="spApply" style="flex:2;padding:10px;border:none;border-radius:10px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-size:13px;font-weight:700;cursor:pointer;">Замінити виправленим</button>'
                : '';

            overlay.innerHTML =
                '<div style="background:#fff;border-radius:20px;padding:26px 24px 20px;width:520px;max-width:94vw;max-height:82vh;display:flex;flex-direction:column;box-shadow:0 28px 70px rgba(0,0,0,0.22);font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;">'
              + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-shrink:0;">'
              +   '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#4f46e5);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">'
              +     '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>'
              +   '</div>'
              +   '<div style="flex:1;">'
              +     '<div style="font-weight:700;font-size:15px;color:#0f172a;">Перевірка орфографії</div>'
              +     '<div style="font-size:12px;margin-top:1px;">' + (hasChanges ? '<span style="color:#ef4444;">● є виправлення</span>' : '<span style="color:#10b981;">● без помилок</span>') + '</div>'
              +   '</div>'
              +   '<button id="spClose" style="width:30px;height:30px;border:none;background:#f1f5f9;border-radius:8px;cursor:pointer;color:#64748b;font-size:16px;display:flex;align-items:center;justify-content:center;">✕</button>'
              + '</div>'
              + legendHtml
              + '<div style="flex:1;overflow-y:auto;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:14px 16px;font-size:14px;line-height:1.75;color:#1e293b;word-break:break-word;">' + diffHtml + '</div>'
              + '<div style="display:flex;gap:10px;margin-top:16px;flex-shrink:0;">'
              +   '<button id="spCancel" style="flex:1;padding:10px;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;color:#64748b;font-size:13px;font-weight:600;cursor:pointer;">Залишити як є</button>'
              +   applyBtn
              + '</div>'
              + '</div>';

            document.body.appendChild(overlay);

            function closeOverlay() {
                overlay.style.opacity = '0';
                overlay.style.transition = 'opacity 0.18s';
                setTimeout(function() { overlay.remove(); }, 180);
            }

            overlay.querySelector('#spClose').addEventListener('click', closeOverlay);
            overlay.querySelector('#spCancel').addEventListener('click', closeOverlay);
            overlay.addEventListener('click', function(e) { if (e.target === overlay) closeOverlay(); });

            if (hasChanges) {
                overlay.querySelector('#spApply').addEventListener('click', function() {
                    closeOverlay();
                    var editor = document.getElementById('boardEditor');
                    if (!editor) return;
                    if (typeof setDrawMode === 'function') setDrawMode('off');
                    editor.focus();
                    var sel = window.getSelection();
                    if (savedRange) {
                        sel.removeAllRanges();
                        sel.addRange(savedRange);
                    } else {
                        var r = document.createRange();
                        r.selectNodeContents(editor);
                        sel.removeAllRanges();
                        sel.addRange(r);
                    }
                    document.execCommand('insertText', false, fixed);
                    if (typeof saveState === 'function') saveState();
                    _spShowToast('✓ Текст виправлено', '#10b981');
                });
            }
        }

        window.mfbOpenSpellCheck = async function() {
            // Зберігаємо range до будь-яких асинхронних операцій
            var sel = window.getSelection();
            var savedRange = (sel && !sel.isCollapsed && sel.rangeCount)
                ? sel.getRangeAt(0).cloneRange() : null;
            var text = savedRange ? savedRange.toString().trim() : '';

            if (!text) {
                var ed = document.getElementById('boardEditor');
                text = ed ? (ed.innerText || ed.textContent || '').trim() : '';
                savedRange = null;
            }
            if (!text) return;

            var btn = document.getElementById('mfbSpell');
            if (btn) { btn.style.opacity = '0.4'; btn.style.pointerEvents = 'none'; btn.title = 'Перевіряю...'; }

            var _uiLangSp = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
            var _spSystemPrompt = _uiLangSp === 'en'
                ? 'You are an English language proofreader. Fix spelling, punctuation, and grammar in the text below. Return ONLY the corrected text, with no explanations, comments, or quotes. Preserve the original style, paragraphs, and line breaks. If there are no errors — return the text unchanged.'
                : _uiLangSp === 'de'
                ? 'Du bist ein Korrekturleser für die deutsche Sprache. Korrigiere Rechtschreibung, Zeichensetzung und Grammatik im unten stehenden Text. Gib NUR den korrigierten Text zurück, ohne Erklärungen, Kommentare oder Anführungszeichen. Behalte den ursprünglichen Stil, Absätze und Zeilenumbrüche bei. Wenn keine Fehler vorhanden sind — gib den Text unverändert zurück.'
                : 'Ти — коректор української мови. Виправ орфографію, пунктуацію та граматику в тексті нижче. Поверни ТІЛЬКИ виправлений текст, без жодних пояснень, коментарів або лапок. Зберігай оригінальний стиль, абзаци та переноси рядків. Якщо помилок немає — поверни текст без змін.';

            try {
                var res = await GroqQueue.enqueue('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (window.getGroqUserKey ? (window.getGroqUserKey() || _spk) : _spk) },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',  /* fallback: qwen-qwq-32b → llama-3.1-8b-instant */
                        max_tokens: 2048,
                        temperature: 0,
                        messages: [
                            { role: 'system', content: _spSystemPrompt },
                            { role: 'user', content: text }
                        ]
                    })
                }, 'spell-check', 'text');
                var json = await res.json();
                var corrected = (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content || '').trim();
                if (!corrected) { _spShowToast('Groq не повернув результат', '#f59e0b'); return; }
                _spShowDiff(text, corrected, savedRange);
            } catch(e) {
                _spShowToast('Помилка перевірки: ' + e.message, '#ef4444');
            } finally {
                if (btn) { btn.style.opacity = ''; btn.style.pointerEvents = ''; btn.title = 'Перевірити орфографію'; }
            }
        };
    })();
