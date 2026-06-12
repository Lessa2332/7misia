    (function () {
        var modal      = document.getElementById('translateModal');
        var srcEl      = document.getElementById('trSource');
        var resEl      = document.getElementById('trResult');
        var statusEl   = document.getElementById('trStatus');
        var insertBtn  = document.getElementById('trInsertBtn');
        var translateBtn = document.getElementById('trTranslateBtn');
        var fromSel    = document.getElementById('trLangFrom');
        var toSel      = document.getElementById('trLangTo');
        var trMicBtn   = document.getElementById('trMicBtn');
        var _savedRange = null;
        var _debounceTimer = null;
        var isTrDictating = false;
        var trRecognition = null;

        var langMap = {
            'uk': 'uk-UA',
            'en': 'en-US',
            'de': 'de-DE',
            'fr': 'fr-FR',
            'pl': 'pl-PL',
            'ru': 'ru-RU',
            'es': 'es-ES',
            'it': 'it-IT',
            'cs': 'cs-CZ',
            'sk': 'sk-SK'
        };

        if (window.SpeechRecognition || window.webkitSpeechRecognition) {
            var SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            trRecognition = new SpeechRec();
            trRecognition.continuous = true;
            trRecognition.interimResults = true;

            trRecognition.onresult = function(e) {
                var finalTranscript = '';
                var interimTranscript = '';
                for (var i = e.resultIndex; i < e.results.length; ++i) {
                    if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript;
                    else interimTranscript += e.results[i][0].transcript;
                }
                
                if (finalTranscript) {
                    var val = srcEl.value;
                    if (val && !val.endsWith(' ') && !val.endsWith('\n')) val += ' ';
                    srcEl.value = val + finalTranscript;
                    srcEl.scrollTop = srcEl.scrollHeight;
                    
                    var event = new Event('input', { bubbles: true });
                    srcEl.dispatchEvent(event);
                }
            };

            trRecognition.onend = function() {
                if (isTrDictating) {
                    try { trRecognition.start(); }
                    catch(e) {
                        isTrDictating = false;
                        if (trMicBtn) trMicBtn.classList.remove('active');
                    }
                }
            };
        } else {
            if (trMicBtn) trMicBtn.style.display = 'none';
        }

        window.toggleTrDictation = function() {
            if (!trRecognition) {
                showOcrToast((uiText[state.lang] || uiText.ua).alertVoiceNotSupported, '#ef4444');
                return;
            }
            if (isTrDictating) {
                stopTrDictation();
            } else {
                startTrDictation();
            }
        };

        function startTrDictation() {
            var fromLang = fromSel.value;
            var recognizeLang = fromLang;
            if (recognizeLang === 'auto') {
                recognizeLang = (typeof state !== 'undefined' && state.lang) ? state.lang : 'uk';
            }
            var locale = langMap[recognizeLang] || 'uk-UA';
            trRecognition.lang = locale;

            try {
                trRecognition.start();
                isTrDictating = true;
                if (trMicBtn) trMicBtn.classList.add('active');
                srcEl.focus();
            } catch(e) {
                console.error(e);
            }
        }

        window.stopTrDictation = function() {
            if (trRecognition && isTrDictating) {
                isTrDictating = false;
                trRecognition.stop();
                if (trMicBtn) trMicBtn.classList.remove('active');
            }
        };

        // Live translation: auto-translate 600ms after user stops typing
        srcEl.addEventListener('input', function() {
            clearTimeout(_debounceTimer);
            var text = srcEl.value.trim();
            if (!text) {
                resEl.value = '';
                statusEl.textContent = '';
                statusEl.className = '';
                insertBtn.disabled = true;
                return;
            }
            statusEl.textContent = '…';
            statusEl.className = 'loading';
            _debounceTimer = setTimeout(doTranslate, 600);
        });

        // Re-translate when language changes
        fromSel.addEventListener('change', function() {
            if (isTrDictating) {
                isTrDictating = false;
                trRecognition.stop();
                setTimeout(function() {
                    if (modal.classList.contains('visible')) {
                        startTrDictation();
                    }
                }, 200);
            }
            if (srcEl.value.trim()) { clearTimeout(_debounceTimer); doTranslate(); }
        });
        toSel.addEventListener('change', function() {
            if (srcEl.value.trim()) { clearTimeout(_debounceTimer); doTranslate(); }
        });

        window.openTranslateModal = function(text, savedRange) {
            srcEl.value    = text || '';
            resEl.value    = '';
            statusEl.textContent = '';
            statusEl.className   = '';
            insertBtn.disabled   = true;
            _savedRange = savedRange || null;
            modal.classList.add('visible');
            // auto-translate if text provided, else focus input for manual entry
            if (text && text.trim()) {
                setTimeout(doTranslate, 180);
            } else {
                setTimeout(function() { srcEl.focus(); }, 120);
            }
        };

        window.closeTranslateModal = function() {
            stopTrDictation();
            modal.classList.remove('visible');
        };

        window.trSwapLangs = function() {
            var fromVal = fromSel.value;
            var toVal   = toSel.value;
            if (fromVal === 'auto') return;
            fromSel.value = toVal;
            toSel.value   = fromVal;
            // swap texts too if result exists
            if (resEl.value.trim()) {
                var tmp = srcEl.value;
                srcEl.value = resEl.value;
                resEl.value = tmp;
                insertBtn.disabled = !resEl.value.trim();
            }
        };

        window.doTranslate = function() {
            var text = srcEl.value.trim();
            if (!text) return;
            var from = fromSel.value;
            var to   = toSel.value;
            var _lang = (typeof state !== 'undefined' && state.lang) ? state.lang : ((window._state && window._state.lang) ? window._state.lang : 'ua');
            var _t = (typeof uiText !== 'undefined' && uiText[_lang]) ? uiText[_lang] : null;

            statusEl.textContent = (_t && _t.trTranslating) ? _t.trTranslating : 'Перекладаємо…';
            statusEl.className   = 'loading';
            resEl.value          = '';
            insertBtn.disabled   = true;
            translateBtn.disabled = true;

            // MyMemory API — безкоштовний, без ключа
            var langPair = (from === 'auto' ? 'auto' : from) + '|' + to;
            var url = 'https://api.mymemory.translated.net/get?q=' +
                      encodeURIComponent(text.slice(0, 500)) +
                      '&langpair=' + encodeURIComponent(langPair) +
                      '&de=notebook@translate.ua';

            fetch(url)
                .then(function(r) { return r.json(); })
                .then(function(data) {
                    translateBtn.disabled = false;
                    if (data && data.responseStatus === 200 && data.responseData) {
                        var translated = data.responseData.translatedText || '';
                        // MyMemory sometimes returns HTML entities
                        var tmp = document.createElement('textarea');
                        tmp.innerHTML = translated;
                        resEl.value = tmp.value;
                        statusEl.textContent = '';
                        statusEl.className   = '';
                        insertBtn.disabled   = !resEl.value.trim();
                    } else {
                        statusEl.textContent = (_t && _t.trError) ? _t.trError : 'Не вдалося перекласти. Спробуйте ще раз.';
                        statusEl.className   = 'error';
                    }
                })
                .catch(function() {
                    translateBtn.disabled = false;
                    statusEl.textContent = (_t && _t.trNetError) ? _t.trNetError : 'Помилка з\u02bcєднання. Перевірте інтернет.';
                    statusEl.className   = 'error';
                });
        };

        window.trInsertResult = function() {
            var text = resEl.value.trim();
            if (!text) return;
            closeTranslateModal();
            // restore cursor position in editor
            setTimeout(function() {
                var editor = document.getElementById('boardEditor');
                if (!editor) return;
                editor.focus();
                if (_savedRange) {
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(_savedRange);
                }
                document.execCommand('insertText', false, text);
            }, 80);
        };

        // close on overlay click / Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('visible')) closeTranslateModal();
        });
    })();
