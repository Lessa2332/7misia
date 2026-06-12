    // ── AI Quiz Maker via Groq ──
    (function() {
        var _qk = (window.SUPERZOSHYT_CONFIG && window.SUPERZOSHYT_CONFIG.GROQ_QUIZ_MAKER_KEY) || '';
        var _currentQuestions = [];
        var _currentText = '';
        var _answered = {};

        var overlay = document.getElementById('quizMakerOverlay');
        var loadingArea = document.getElementById('quizLoadingArea');
        var questionsArea = document.getElementById('quizQuestionsArea');
        var footer = document.getElementById('quizFooter');
        var subtitle = document.getElementById('quizSubtitle');
        var scoreEl = document.getElementById('quizScore');

        function _toast(msg, color) {
            if (typeof showOcrToast === 'function') { showOcrToast(msg, color); return; }
            var t = document.createElement('div');
            t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:' + color + ';color:#fff;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:11500;pointer-events:none;';
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(function() { t.remove(); }, 2500);
        }

        window.closeQuizMaker = function() {
            overlay.style.display = 'none';
        };

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) window.closeQuizMaker();
        });

        function _showLoading() {
            loadingArea.style.display = 'flex';
            questionsArea.style.display = 'none';
            footer.style.display = 'none';
            subtitle.textContent = 'Генерую 7 запитань із виділеного тексту…';
        }

        function _updateScore() {
            var correct = 0, total = _currentQuestions.length;
            Object.keys(_answered).forEach(function(i) {
                if (_answered[i] === true) correct++;
            });
            var done = Object.keys(_answered).length;
            if (done === 0) {
                scoreEl.textContent = '';
            } else if (done < total) {
                scoreEl.textContent = 'Відповіли на ' + done + ' із ' + total;
            } else {
                scoreEl.textContent = '✓ Результат: ' + correct + ' / ' + total + ' правильно';
                scoreEl.style.color = correct === total ? '#15803d' : (correct >= total / 2 ? '#d97706' : '#dc2626');
            }
        }

        function _renderQuestions(questions) {
            _answered = {};
            questionsArea.innerHTML = '';
            questions.forEach(function(q, qi) {
                var card = document.createElement('div');
                card.className = 'quiz-q-card';
                var letters = ['А', 'Б', 'В', 'Г'];
                var btnsHtml = q.options.map(function(opt, oi) {
                    return '<button class="quiz-option-btn" id="qo_' + qi + '_' + oi + '" onclick="window._quizPickAnswer(' + qi + ',' + oi + ')">'
                        + '<span class="quiz-option-letter">' + letters[oi] + '</span>'
                        + '<span>' + opt.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>'
                        + '</button>';
                }).join('');
                card.innerHTML =
                    '<div class="quiz-q-text"><span class="quiz-q-num">' + (qi + 1) + '</span>' + q.question.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>'
                    + btnsHtml;
                questionsArea.appendChild(card);
            });
            loadingArea.style.display = 'none';
            questionsArea.style.display = 'block';
            footer.style.display = 'flex';
            subtitle.textContent = 'Тест готовий! Оберіть відповіді.';
            _updateScore();
        }

        window._quizPickAnswer = function(qi, oi) {
            if (_answered.hasOwnProperty(qi)) return; // вже відповіли
            var q = _currentQuestions[qi];
            _answered[qi] = (oi === q.correctIndex);
            var letters = ['А', 'Б', 'В', 'Г'];
            for (var i = 0; i < q.options.length; i++) {
                var btn = document.getElementById('qo_' + qi + '_' + i);
                if (!btn) continue;
                btn.disabled = true;
                if (i === q.correctIndex) btn.classList.add('correct');
                else if (i === oi) btn.classList.add('wrong');
            }
            _updateScore();
        };

        async function _generateQuiz(text) {
            _currentText = text;
            _currentQuestions = [];
            _showLoading();
            overlay.style.display = 'flex';

            var _uiLangQ = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
            var _quizSystemPrompt = _uiLangQ === 'en'
                ? 'You are a quiz generator for students. Based on the provided text, create exactly 7 questions with answer options. Respond ONLY with a JSON array in this format (no other text, markdown, or explanations):\n[\n  {\n    "question": "Question text?",\n    "options": ["Option A", "Option B", "Option C", "Option D"],\n    "correctIndex": 0\n  }\n]\ncorrectIndex is the index (0-3) of the correct answer among options. Questions must be varied, options clear, only one correct answer. Write everything exclusively in English.'
                : _uiLangQ === 'de'
                ? 'Du bist ein Testgenerator für Schüler. Erstelle auf Basis des bereitgestellten Textes genau 7 Fragen mit Antwortoptionen. Antworte NUR mit einem JSON-Array in diesem Format (kein anderer Text, kein Markdown, keine Erklärungen):\n[\n  {\n    "question": "Fragetext?",\n    "options": ["Option A", "Option B", "Option C", "Option D"],\n    "correctIndex": 0\n  }\n]\ncorrectIndex ist der Index (0-3) der richtigen Antwort unter options. Fragen müssen abwechslungsreich sein, Optionen klar, nur eine richtige Antwort. Schreibe alles ausschließlich auf Deutsch.'
                : 'Ти — генератор тестів для школярів. На основі наданого тексту створи рівно 7 запитань із варіантами відповідей. Відповідай ТІЛЬКИ JSON-масивом у такому форматі (без жодного іншого тексту, markdown або пояснень):\n[\n  {\n    "question": "Текст запитання?",\n    "options": ["Варіант А", "Варіант Б", "Варіант В", "Варіант Г"],\n    "correctIndex": 0\n  }\n]\ncorrectIndex — індекс (0-3) правильної відповіді серед options. Запитання мають бути різноманітними, варіанти чіткими, правильна відповідь — одна.';
            var _quizUserPrompt = _uiLangQ === 'en' ? 'Text for the quiz:\n\n' + text : _uiLangQ === 'de' ? 'Text für den Test:\n\n' + text : 'Текст для тесту:\n\n' + text;

            try {
                var res = await GroqQueue.enqueue('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + (window.getGroqUserKey ? (window.getGroqUserKey() || _qk) : _qk)
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',  /* fallback: qwen-qwq-32b → llama-3.1-8b-instant */
                        max_tokens: 2048,
                        temperature: 0.6,
                        messages: [
                            {
                                role: 'system',
                                content: _quizSystemPrompt
                            },
                            {
                                role: 'user',
                                content: _quizUserPrompt
                            }
                        ]
                    })
                }, 'quiz-maker', 'text');

                if (!res.ok) {
                    var err = await res.json().catch(function(){ return {}; });
                    throw new Error(err.error && err.error.message ? err.error.message : 'API error ' + res.status);
                }

                var json = await res.json();
                var raw = (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content || '').trim();

                // Strip markdown fences if present
                raw = raw.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/i, '').trim();

                var questions;
                try {
                    questions = JSON.parse(raw);
                } catch(e) {
                    // Try to extract JSON array from mixed text
                    var match = raw.match(/\[[\s\S]*\]/);
                    if (match) questions = JSON.parse(match[0]);
                    else throw new Error('Неможливо розпарсити відповідь AI');
                }

                if (!Array.isArray(questions) || questions.length === 0) {
                    throw new Error('AI повернув порожній список запитань');
                }

                // Validate and clamp
                questions = questions.slice(0, 7).map(function(q) {
                    return {
                        question: String(q.question || ''),
                        options: Array.isArray(q.options) ? q.options.slice(0, 4).map(String) : ['—','—','—','—'],
                        correctIndex: Math.max(0, Math.min(3, parseInt(q.correctIndex) || 0))
                    };
                });

                _currentQuestions = questions;
                _renderQuestions(questions);

            } catch(e) {
                loadingArea.style.display = 'none';
                subtitle.textContent = '⚠ Помилка: ' + e.message;
                questionsArea.innerHTML = '<div style="padding:24px;text-align:center;color:#ef4444;font-size:13px;">Не вдалося згенерувати тест.<br><br>' + e.message + '</div>';
                questionsArea.style.display = 'block';
                footer.style.display = 'flex';
            }
        }

        window.quizRegenerate = function() {
            if (_currentText) _generateQuiz(_currentText);
        };

        window.quizInsertIntoNotebook = function() {
            if (!_currentQuestions.length) return;
            var editor = document.getElementById('boardEditor');
            if (!editor) return;
            if (typeof setDrawMode === 'function') setDrawMode('off');
            editor.focus();

            var _uiLangIns = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
            var _quizTitle = _uiLangIns === 'en' ? '📝 Quiz' : _uiLangIns === 'de' ? '📝 Test' : '📝 Тест';
            var letters = _uiLangIns === 'en' || _uiLangIns === 'de' ? ['A', 'B', 'C', 'D'] : ['А', 'Б', 'В', 'Г'];

            var lines = [_quizTitle + '\n'];
            _currentQuestions.forEach(function(q, qi) {
                lines.push((qi + 1) + '. ' + q.question);
                q.options.forEach(function(opt, oi) {
                    lines.push('   ' + letters[oi] + ') ' + opt);
                });
                lines.push('');
            });

            // Collapse selection to END (after selected text) so we insert below it
            var sel = window.getSelection();
            if (sel.rangeCount && editor.contains(sel.anchorNode)) {
                var r = sel.getRangeAt(0);
                r.collapse(false); // false = collapse to end of selection
                sel.removeAllRanges();
                sel.addRange(r);
            } else {
                // No selection — append at end of editor
                var r = document.createRange();
                r.selectNodeContents(editor);
                r.collapse(false);
                sel.removeAllRanges();
                sel.addRange(r);
            }

            var insertHtml = '<br>' + lines.map(function(l) {
                return l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            }).join('<br>');
            document.execCommand('insertHTML', false, insertHtml);

            if (typeof saveState === 'function') saveState();
            window.closeQuizMaker();
            _toast('✓ Тест вставлено в зошит', '#10b981');
        };

        window.mfbOpenQuizMaker = function() {
            var sel = window.getSelection();
            var text = sel ? sel.toString().trim() : '';
            if (!text) {
                // fallback: entire editor text
                var ed = document.getElementById('boardEditor');
                text = ed ? (ed.innerText || ed.textContent || '').trim() : '';
            }
            if (!text) {
                _toast('Виділіть текст для генерації тесту', '#f59e0b');
                return;
            }
            _generateQuiz(text);
        };

    })();
