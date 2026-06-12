    // ── Groq Key Modal ──
    (function() {
        function _getLang() {
            try { return (typeof state !== 'undefined' && state.lang) ? state.lang : (localStorage.getItem('lang') || 'ua'); } catch(e) { return 'ua'; }
        }

        var _i18n = {
            ua: {
                title: 'Власний API ключ Groq',
                subtitle: 'Використовуй безкоштовний API ключ з groq.com для всіх AI-функцій в Суперзошиті',
                stepsTitle: 'ЯК ОТРИМАТИ КЛЮЧ — ПОКРОКОВА ІНСТРУКЦІЯ',
                steps: [
                    'Перейди на сайт <a href="https://console.groq.com" target="_blank" rel="noopener">console.groq.com</a> та зареєструйся безкоштовно (через Google або email)',
                    'У лівому меню натисни <strong>«API Keys»</strong>',
                    'Натисни кнопку <strong>«Create API Key»</strong>, введи будь-яку назву (наприклад <code>supernotebook</code>) та натисни <strong>Submit</strong>',
                    'Скопіюй ключ — він починається з <code>gsk_</code>. Увага: ключ показується лише один раз!',
                    'Встав скопійований ключ у поле нижче та натисни <strong>«Зберегти»</strong>'
                ],
                keyLabel: 'Твій API ключ Groq',
                saveBtnText: 'Зберегти',
                savedOk: '✓ Ключ збережено! Всі AI-функції тепер використовують твій ключ.',
                savedCleared: '✓ Ключ видалено. Буде використовуватись вбудований демо-ключ.',
                errorEmpty: 'Будь ласка, введи API ключ.',
                errorFormat: 'Ключ має починатися з gsk_. Перевір правильність.',
                note: '💡 Ключ зберігається лише у твоєму браузері (localStorage) і нікуди не передається. Якщо ключ не введений — використовується вбудований демо-ключ із обмеженим лімітом.'
            },
            en: {
                title: 'Your Groq API Key',
                subtitle: 'Use your free API key from groq.com for all AI features in Supernotebook',
                stepsTitle: 'HOW TO GET YOUR KEY — STEP BY STEP',
                steps: [
                    'Go to <a href="https://console.groq.com" target="_blank" rel="noopener">console.groq.com</a> and sign up for free (via Google or email)',
                    'In the left menu click <strong>"API Keys"</strong>',
                    'Click <strong>"Create API Key"</strong>, enter any name (e.g. <code>supernotebook</code>) and click <strong>Submit</strong>',
                    'Copy the key — it starts with <code>gsk_</code>. Important: the key is shown only once!',
                    'Paste the copied key into the field below and click <strong>"Save"</strong>'
                ],
                keyLabel: 'Your Groq API Key',
                saveBtnText: 'Save',
                savedOk: '✓ Key saved! All AI features now use your key.',
                savedCleared: '✓ Key removed. The built-in demo key will be used.',
                errorEmpty: 'Please enter an API key.',
                errorFormat: 'The key must start with gsk_. Please check it.',
                note: '💡 The key is stored only in your browser (localStorage) and is never transmitted anywhere. If no key is set, the built-in demo key with limited quota is used.'
            },
            de: {
                title: 'Eigener Groq API-Schlüssel',
                subtitle: 'Verwende deinen kostenlosen API-Schlüssel von groq.com für alle KI-Funktionen',
                stepsTitle: 'SO ERHÄLTST DU DEINEN SCHLÜSSEL — SCHRITT FÜR SCHRITT',
                steps: [
                    'Gehe zu <a href="https://console.groq.com" target="_blank" rel="noopener">console.groq.com</a> und registriere dich kostenlos (über Google oder E-Mail)',
                    'Klicke im linken Menü auf <strong>„API Keys"</strong>',
                    'Klicke auf <strong>„Create API Key"</strong>, gib einen beliebigen Namen ein (z.B. <code>supernotebook</code>) und klicke auf <strong>Submit</strong>',
                    'Kopiere den Schlüssel — er beginnt mit <code>gsk_</code>. Achtung: Der Schlüssel wird nur einmal angezeigt!',
                    'Füge den kopierten Schlüssel in das Feld unten ein und klicke auf <strong>„Speichern"</strong>'
                ],
                keyLabel: 'Dein Groq API-Schlüssel',
                saveBtnText: 'Speichern',
                savedOk: '✓ Schlüssel gespeichert! Alle KI-Funktionen verwenden jetzt deinen Schlüssel.',
                savedCleared: '✓ Schlüssel entfernt. Der integrierte Demo-Schlüssel wird verwendet.',
                errorEmpty: 'Bitte gib einen API-Schlüssel ein.',
                errorFormat: 'Der Schlüssel muss mit gsk_ beginnen. Bitte überprüfe ihn.',
                note: '💡 Der Schlüssel wird nur in deinem Browser (localStorage) gespeichert und nirgendwo übertragen. Ohne eigenen Schlüssel wird der eingebaute Demo-Schlüssel mit begrenztem Kontingent verwendet.'
            }
        };

        window.openGroqKeyModal = function() {
            var lang = _getLang();
            var t = _i18n[lang] || _i18n.ua;
            var modal = document.getElementById('groqKeyModal');

            document.getElementById('gkmTitle').textContent = t.title;
            document.getElementById('gkmSubtitle').textContent = t.subtitle;
            document.getElementById('gkmStepsTitle').textContent = t.stepsTitle;
            document.getElementById('gkmKeyLabel').textContent = t.keyLabel;
            document.getElementById('gkmSaveBtn').textContent = t.saveBtnText;
            document.getElementById('gkmNote').textContent = t.note;
            document.getElementById('gkmStatus').textContent = '';
            document.getElementById('gkmStatus').className = 'gkm-status';

            // Fill steps
            var stepsContainer = document.querySelector('#groqKeyModal .gkm-steps');
            stepsContainer.innerHTML = '';
            t.steps.forEach(function(text, i) {
                var step = document.createElement('div');
                step.className = 'gkm-step';
                step.innerHTML = '<div class="gkm-step-num">' + (i+1) + '</div><div class="gkm-step-text">' + text + '</div>';
                stepsContainer.appendChild(step);
            });

            // Fill current key (masked)
            var saved = window.getGroqUserKey();
            var inp = document.getElementById('gkmKeyInput');
            inp.placeholder = 'gsk_xxxxxxxxxxxxxxxxxxxxxxxx';
            inp.value = saved || '';

            modal.style.display = 'flex';
            setTimeout(function() { inp.focus(); if (saved) { inp.select(); } }, 100);
        };

        window.closeGroqKeyModal = function() {
            document.getElementById('groqKeyModal').style.display = 'none';
        };

        window.saveGroqKey = function() {
            var lang = _getLang();
            var t = _i18n[lang] || _i18n.ua;
            var val = document.getElementById('gkmKeyInput').value.trim();
            var statusEl = document.getElementById('gkmStatus');

            if (!val) {
                // Clear key
                try { localStorage.removeItem('groq_user_api_key'); } catch(e) {}
                statusEl.className = 'gkm-status success';
                statusEl.textContent = t.savedCleared;
                return;
            }

            if (!val.startsWith('gsk_')) {
                statusEl.className = 'gkm-status error';
                statusEl.textContent = t.errorFormat;
                return;
            }

            try { localStorage.setItem('groq_user_api_key', val); } catch(e) {}
            statusEl.className = 'gkm-status success';
            statusEl.textContent = t.savedOk;

            setTimeout(function() { window.closeGroqKeyModal(); }, 1400);
        };

        // Close on backdrop click
        document.getElementById('groqKeyModal').addEventListener('click', function(e) {
            if (e.target === this) window.closeGroqKeyModal();
        });

        // Enter key in input
        document.getElementById('gkmKeyInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') window.saveGroqKey();
            if (e.key === 'Escape') window.closeGroqKeyModal();
        });

        // Global key getter — returns user key or null
        window.getGroqUserKey = function() {
            try { return localStorage.getItem('groq_user_api_key') || null; } catch(e) { return null; }
        };
    })();
