    // ── AI Assistant via Groq ──
    (function() {
        var _aik = (window.SUPERZOSHYT_CONFIG && window.SUPERZOSHYT_CONFIG.GROQ_AI_ASSISTANT_KEY) || '';

        var popup = document.getElementById('aiPromptPopup');
        var input = document.getElementById('aiPromptInput');
        var sendBtn = document.getElementById('aiPromptSendBtn');
        var toolBtn = document.getElementById('aiAssistantBtn');
        var aiMicBtn = document.getElementById('aiPromptMicBtn');
        var isOpen = false;
        var isLoading = false;
        var isAiDictating = false;
        var aiRecognition = null;

        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            aiRecognition = new SpeechRec();
            aiRecognition.continuous = true;
            aiRecognition.interimResults = true;
            
            aiRecognition.onresult = function(e) {
                var finalTranscript = '';
                var interimTranscript = '';
                for (var i = e.resultIndex; i < e.results.length; ++i) {
                    if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
                    else interimTranscript += e.results[i][0].transcript;
                }
                
                if (finalTranscript) {
                    var val = input.value;
                    if (val && !val.endsWith(' ') && !val.endsWith('\n')) val += ' ';
                    input.value = val + finalTranscript;
                    input.scrollTop = input.scrollHeight;
                }
            };

            aiRecognition.onend = function() {
                if (isAiDictating) {
                    try { aiRecognition.start(); }
                    catch(e) { 
                        isAiDictating = false;
                        if (aiMicBtn) aiMicBtn.classList.remove('active');
                    }
                }
            };
        } else {
            if (aiMicBtn) aiMicBtn.style.display = 'none';
        }

        window.toggleAiDictation = function() {
            if (!aiRecognition) {
                _aiToast('Ваш браузер не підтримує розпізнавання голосу', '#ef4444');
                return;
            }
            if (isAiDictating) {
                isAiDictating = false;
                aiRecognition.stop();
                if (aiMicBtn) aiMicBtn.classList.remove('active');
            } else {
                var lang = typeof state !== 'undefined' ? state.lang : 'ua';
                aiRecognition.lang = lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : 'uk-UA';
                try {
                    aiRecognition.start();
                    isAiDictating = true;
                    if (aiMicBtn) aiMicBtn.classList.add('active');
                    input.focus();
                } catch(e) {
                    console.error(e);
                }
            }
        };

        // Enter to send, Shift+Enter for newline
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAiPrompt();
            }
            if (e.key === 'Escape') {
                closeAiPrompt();
            }
        });

        window.toggleAiPrompt = function() {
            if (isOpen) { closeAiPrompt(); }
            else { openAiPrompt(); }
        };

        window.openAiPrompt = function() {
            isOpen = true;
            popup.classList.add('visible');
            if (toolBtn) toolBtn.classList.add('active');
            setTimeout(function() { input.focus(); }, 120);
        };

        window.closeAiPrompt = function() {
            isOpen = false;
            popup.classList.remove('visible');
            if (toolBtn) toolBtn.classList.remove('active');
            if (isAiDictating && aiRecognition) {
                isAiDictating = false;
                aiRecognition.stop();
                if (aiMicBtn) aiMicBtn.classList.remove('active');
            }
        };

        // Close on click outside
        document.addEventListener('mousedown', function(e) {
            if (!isOpen) return;
            if (popup.contains(e.target)) return;
            if (toolBtn && toolBtn.contains(e.target)) return;
            closeAiPrompt();
        });

        function _aiToast(msg, color) {
            if (typeof showOcrToast === 'function') { showOcrToast(msg, color); return; }
            var t = document.createElement('div');
            t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:' + color + ';color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:11000;pointer-events:none;';
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(function() { t.remove(); }, 2500);
        }

        window.sendAiPrompt = async function() {
            if (isLoading) return;
            var prompt = input.value.trim();
            if (!prompt) { input.focus(); return; }

            isLoading = true;
            sendBtn.classList.add('loading');
            sendBtn.disabled = true;

            var _uiLang = (typeof state !== 'undefined' && state.lang) ? state.lang : 'ua';
            var _aiSystemPrompt = _uiLang === 'en'
                ? 'You are a student assistant. IMPORTANT: always respond exclusively in English, regardless of the language the user writes in. Give clear, helpful answers. Do not add unnecessary information about yourself. If asked to write a text — write it immediately. Format text as plain text without markdown markup.'
                : _uiLang === 'de'
                ? 'Du bist ein Schülerassistent. WICHTIG: Antworte ausschließlich auf Deutsch, unabhängig von der Sprache des Nutzers. Gib klare, hilfreiche Antworten. Füge keine unnötigen Informationen über dich hinzu. Wenn du gebeten wirst, einen Text zu schreiben — schreibe ihn sofort. Formatiere den Text als einfachen Text ohne Markdown.'
                : 'Ти — помічник учня. ВАЖЛИВО: якщо користувач просить написати текст певною мовою (англійською, німецькою тощо) — пиши САМЕ тією мовою, яку він вказав. Українською відповідай лише коли мова не вказана. Давай чіткі, корисні відповіді. Не додавай зайвих пояснень про себе. Якщо просять написати текст — пиши його одразу. Форматуй текст простим текстом без markdown-розмітки.';

            try {
                var res = await GroqQueue.enqueue('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + (window.getGroqUserKey ? (window.getGroqUserKey() || _aik) : _aik)
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',  /* fallback: qwen-qwq-32b → llama-3.1-8b-instant */
                        max_tokens: 4096,
                        temperature: 0.7,
                        messages: [
                            {
                                role: 'system',
                                content: _aiSystemPrompt
                            },
                            { role: 'user', content: prompt }
                        ]
                    })
                }, 'ai-assistant', 'text');

                if (res.status === 401) {
                    _aiToast('AI: помилка авторизації (401)', '#ef4444');
                    return;
                }

                if (!res.ok) {
                    var errData = await res.json().catch(function() { return {}; });
                    throw new Error(errData.error?.message || 'API error ' + res.status);
                }

                var json = await res.json();
                var text = (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content || '').trim();

                if (!text) {
                    _aiToast('AI не повернув результат', '#f59e0b');
                    return;
                }

                // Insert text into editor
                var editor = document.getElementById('boardEditor');
                if (!editor) return;

                if (typeof setDrawMode === 'function') setDrawMode('off');
                editor.focus();

                var sel = window.getSelection();
                if (!sel.rangeCount || !editor.contains(sel.anchorNode)) {
                    var range = document.createRange();
                    range.selectNodeContents(editor);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

                // Insert with line breaks preserved
                var lines = text.split('\n');
                var insertHtml = '';
                for (var i = 0; i < lines.length; i++) {
                    insertHtml += lines[i].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    if (i < lines.length - 1) insertHtml += '<br>';
                }
                document.execCommand('insertHTML', false, insertHtml);

                if (typeof saveState === 'function') saveState();

                input.value = '';
                closeAiPrompt();
                _aiToast('✓ Текст вставлено', '#10b981');

            } catch(e) {
                _aiToast('Помилка AI: ' + e.message, '#ef4444');
            } finally {
                isLoading = false;
                sendBtn.classList.remove('loading');
                sendBtn.disabled = false;
            }
        };
    })();
