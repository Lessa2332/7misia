    (function() {
        'use strict';

        /* ── i18n strings for the install banner ── */
        var _pwaText = {
            ua: {
                title: 'Встановити Суперзошит',
                subtitle: 'Додайте на головний екран — працює без інтернету',
                install: 'Встановити',
                iosHint: 'Щоб встановити: натисніть \uD83D\uDCE4 «Поділитися» → «На екран "Додому"»',
                installed: '✓ Додаток встановлено!'
            },
            en: {
                title: 'Install SuperNotebook',
                subtitle: 'Add to home screen — works offline',
                install: 'Install',
                iosHint: 'To install: tap \uD83D\uDCE4 Share → "Add to Home Screen"',
                installed: '✓ App installed!'
            },
            de: {
                title: 'Superheft installieren',
                subtitle: 'Zum Startbildschirm hinzufügen — funktioniert offline',
                install: 'Installieren',
                iosHint: 'Zum Installieren: \uD83D\uDCE4 Teilen → „Zum Home-Bildschirm"',
                installed: '✓ App installiert!'
            }
        };

        /* ── Detect iOS ── */
        var _isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
        var _isInStandaloneMode = ('standalone' in window.navigator) && window.navigator.standalone;

        /* ── PWA Manifest (injected as blob URL) ── */
        function _injectManifest(lang) {
            var name      = lang === 'en' ? 'SuperNotebook' : lang === 'de' ? 'Superheft' : 'Суперзошит';
            var shortName = lang === 'en' ? 'SuperNotebook' : lang === 'de' ? 'Heft' : 'Зошит';
            var desc      = lang === 'en'
                ? 'Interactive school notebook with AI assistant, drawing, and real-time collaboration'
                : lang === 'de'
                ? 'Interaktives Schulheft mit KI-Assistent, Zeichnen und Echtzeit-Zusammenarbeit'
                : 'Інтерактивний шкільний зошит з AI-помічником, малюванням та спільним редагуванням';
            var manifest = {
                name: name,
                short_name: shortName,
                description: desc,
                start_url: (location.href.split('?')[0]),
                display: 'standalone',
                background_color: '#e8d8c0',
                theme_color: '#e8d8c0',
                orientation: 'portrait-primary',
                lang: lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : 'uk-UA',
                icons: [
                    {
                        src: 'https://raw.githubusercontent.com/CodenameXXV/date/refs/heads/main/logo192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable'
                    },
                    {
                        src: 'https://raw.githubusercontent.com/CodenameXXV/date/refs/heads/main/logo512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ],
                categories: ['education', 'productivity']
            };
            var blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
            var url  = URL.createObjectURL(blob);
            var link = document.getElementById('pwaManifestLink');
            if (link) {
                if (link._prevUrl) URL.revokeObjectURL(link._prevUrl);
                link._prevUrl = url;
                link.href = url;
            }
        }

        /* ── Service Worker registration ── */
        function _registerSW() {
            if (!('serviceWorker' in navigator)) return;
            var swCode = [
                '"use strict";',
                'var CACHE = "superzoshyt-v1";',
                'self.addEventListener("install", function(e) {',
                '  self.skipWaiting();',
                '});',
                'self.addEventListener("activate", function(e) {',
                '  e.waitUntil(caches.keys().then(function(ks){',
                '    return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));',
                '  }));',
                '  self.clients.claim();',
                '});',
                'self.addEventListener("fetch", function(e) {',
                '  if (e.request.method !== "GET") return;',
                '  e.respondWith(',
                '    fetch(e.request).then(function(r){',
                '      var clone = r.clone();',
                '      caches.open(CACHE).then(function(c){ c.put(e.request, clone); });',
                '      return r;',
                '    }).catch(function(){ return caches.match(e.request); })',
                '  );',
                '});'
            ].join('\n');
            try {
                var blob = new Blob([swCode], { type: 'application/javascript' });
                var swUrl = URL.createObjectURL(blob);
                navigator.serviceWorker.register(swUrl, { scope: './' }).catch(function() {});
            } catch(e) {}
        }

        /* ── Banner helpers ── */
        var _banner    = null;
        var _deferredPrompt = null;
        var _dismissed = false;

        function _getBanner() {
            if (!_banner) _banner = document.getElementById('pwaInstallBanner');
            return _banner;
        }

        function _getLang() {
            try { if (typeof state !== 'undefined' && state.lang) return state.lang; } catch(e) {}
            try { var s = localStorage.getItem('board_lang'); if (s) return s; } catch(e) {}
            return 'ua';
        }

        function _updateBannerText() {
            var lang = _getLang();
            var t = _pwaText[lang] || _pwaText.ua;
            var el;
            el = document.getElementById('pwaBannerTitle');       if (el) el.textContent = t.title;
            el = document.getElementById('pwaBannerSubtitle');    if (el) el.textContent = t.subtitle;
            el = document.getElementById('pwaBannerInstall');     if (el) el.textContent = t.install;
            el = document.getElementById('pwaBannerIosText');     if (el) el.textContent = t.iosHint;
        }



        function _showBanner(isIos) {
            if (_dismissed) return;
            if (document.body.classList.contains('board-mode')) return;
            if (_isInStandaloneMode) return;
            var banner = _getBanner();
            if (!banner) return;
            var iosHint    = document.getElementById('pwaBannerIosHint');
            var installBtn = document.getElementById('pwaBannerInstall');
            if (iosHint)    iosHint.style.display    = isIos ? 'block' : 'none';
            if (installBtn) installBtn.style.display  = isIos ? 'none'  : '';
            _updateBannerText();
            banner.style.display = 'block';
            requestAnimationFrame(function() {
                requestAnimationFrame(function() { banner.classList.add('pwa-banner-visible'); });
            });
        }

        function _hideBanner(permanent) {
            _dismissed = true;
            var banner = _getBanner();
            if (!banner) return;
            banner.classList.remove('pwa-banner-visible');
            setTimeout(function() { banner.style.display = 'none'; }, 430);
            if (permanent) { try { localStorage.setItem('pwa_banner_dismissed', '1'); } catch(e) {} }
        }

        window._pwaInstall = function() {
            if (!_deferredPrompt) return;
            _deferredPrompt.prompt();
            _deferredPrompt.userChoice.then(function(result) {
                if (result.outcome === 'accepted') {
                    _hideBanner(true);
                    var t = _pwaText[_getLang()] || _pwaText.ua;
                    if (typeof showOcrToast === 'function') showOcrToast(t.installed, '#10b981');
                }
                _deferredPrompt = null;
            });
        };

        window._pwaDismiss = function() { _hideBanner(true); };

        function _wireBanner() {
            var ib = document.getElementById('pwaBannerInstall');
            var cb = document.getElementById('pwaBannerClose');
            if (ib) ib.addEventListener('click', window._pwaInstall);
            if (cb) cb.addEventListener('click', window._pwaDismiss);
        }

        function _watchBoardMode() {
            var banner = _getBanner();
            if (!banner) return;
            new MutationObserver(function() {
                if (document.body.classList.contains('board-mode')) {
                    banner.classList.remove('pwa-banner-visible');
                    banner.style.display = 'none';
                } else if (!_dismissed && _deferredPrompt) {
                    banner.style.display = 'block';
                    requestAnimationFrame(function() {
                        requestAnimationFrame(function() { banner.classList.add('pwa-banner-visible'); });
                    });
                }
            }).observe(document.body, { attributeFilter: ['class'] });
        }

        function _watchLangChanges() {
            var lt = document.getElementById('langToggle');
            if (!lt) return;
            lt.addEventListener('click', function() {
                setTimeout(function() {
                    var lang = _getLang();
                    _injectManifest(lang);
                    _updateBannerText();
                }, 120);
            });
        }

        /* ── Desktop install button ── */
        var _deskDismissed = false;

        function _isMobileDevice() {
            return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
        }

        function _showDesktopBtn() {
            if (_deskDismissed) return;
            if (_isInStandaloneMode) return;
            if (_isMobileDevice()) return;
            var btn = document.getElementById('pwaDesktopBtn');
            if (!btn) return;
            _updateDesktopBtnText();
            btn.classList.add('pwa-desk-visible');
        }

        function _hideDesktopBtn() {
            var btn = document.getElementById('pwaDesktopBtn');
            if (!btn) return;
            btn.classList.remove('pwa-desk-visible');
        }

        function _updateDesktopBtnText() {
            var lang = _getLang();
            var t = _pwaText[lang] || _pwaText.ua;
            var lbl = document.getElementById('pwaDesktopBtnLabel');
            var sub = document.getElementById('pwaDesktopBtnSub');
            var tip = document.getElementById('pwaDesktopTooltip');
            if (lbl) lbl.textContent = t.install;
            if (sub) sub.textContent = lang === 'en' ? 'add to desktop' : lang === 'de' ? 'zum Desktop hinzufügen' : 'додати на робочий стіл';
            if (tip) tip.textContent = lang === 'en'
                ? 'Visit the site once more in Chrome — then the install will be available'
                : lang === 'de'
                ? 'Besuchen Sie die Seite noch einmal in Chrome — dann wird die Installation verfügbar'
                : 'Відвідайте сайт ще раз у Chrome — тоді стане доступне встановлення';
        }

        function _showDesktopTooltip() {
            var tip = document.getElementById('pwaDesktopTooltip');
            if (!tip) return;
            tip.classList.add('pwa-tip-visible');
            clearTimeout(tip._timer);
            tip._timer = setTimeout(function() {
                tip.classList.remove('pwa-tip-visible');
            }, 3500);
        }

        function _showInstallGuide() {
            var lang = _getLang();
            var existing = document.getElementById('pwaInstallGuide');
            if (existing) { existing.remove(); }

            var overlay = document.createElement('div');
            overlay.id = 'pwaInstallGuide';
            overlay.style.cssText = [
                'position:fixed','top:0','left:0','width:100%','height:100%',
                'background:rgba(0,0,0,0.55)','z-index:999999',
                'display:flex','align-items:center','justify-content:center',
                'font-family:sans-serif','animation:pwaGuideFadeIn .2s ease'
            ].join(';');

            var box = document.createElement('div');
            box.style.cssText = [
                'background:#fff','border-radius:16px','padding:28px 32px',
                'max-width:420px','width:90%','box-shadow:0 8px 40px rgba(0,0,0,0.25)',
                'position:relative','text-align:left'
            ].join(';');

            var closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = [
                'position:absolute','top:12px','right:16px','background:none',
                'border:none','font-size:22px','cursor:pointer','color:#888','line-height:1'
            ].join(';');
            closeBtn.onclick = function() { overlay.remove(); };

            var title = document.createElement('div');
            title.style.cssText = 'font-size:17px;font-weight:700;margin-bottom:14px;color:#1a1a1a;padding-right:24px';
            title.textContent = lang === 'en' ? '📲 How to install the app' : lang === 'de' ? '📲 App installieren' : '📲 Як встановити додаток';

            var steps = document.createElement('ol');
            steps.style.cssText = 'margin:0;padding-left:20px;color:#333;font-size:14.5px;line-height:1.8';

            var list = lang === 'en' ? [
                'Open this page in <strong>Google Chrome</strong>',
                'Click the <strong>⋮</strong> menu (top right)',
                'Select <strong>"Cast, save, and share"</strong>',
                'Tap <strong>"Install"</strong>',
                'Click <strong>Install</strong> in the popup'
            ] : lang === 'de' ? [
                'Öffnen Sie diese Seite in <strong>Google Chrome</strong>',
                'Klicken Sie auf das Menü <strong>⋮</strong> (oben rechts)',
                'Wählen Sie <strong>„Übertragen, speichern und teilen"</strong>',
                'Tippen Sie auf <strong>„Installieren"</strong>',
                'Bestätigen Sie die Installation im Popup'
            ] : [
                'Відкрийте цю сторінку у <strong>Google Chrome</strong>',
                'Натисніть меню <strong>⋮</strong> (праворуч вгорі)',
                'Виберіть <strong>«Транслювати, зберегти і поділитися»</strong>',
                'Натисніть <strong>«Встановити»</strong>',
                'Підтвердіть встановлення у вікні'
            ];

            list.forEach(function(text) {
                var li = document.createElement('li');
                li.innerHTML = text;
                steps.appendChild(li);
            });

            var note = document.createElement('div');
            note.style.cssText = 'margin-top:14px;font-size:13px;color:#888;border-top:1px solid #eee;padding-top:12px';
            note.textContent = lang === 'en'
                ? 'If the menu item is missing, reload the page once and try again.'
                : lang === 'de'
                ? 'Wenn der Menüpunkt fehlt, laden Sie die Seite einmal neu und versuchen Sie es erneut.'
                : 'Якщо пункт меню відсутній — перезавантажте сторінку один раз і спробуйте знову.';

            var urlRow = document.createElement('div');
            urlRow.style.cssText = 'margin-top:10px;font-size:12px;color:#aaa';
            urlRow.textContent = '🌐 codenamexxv.github.io/date/';

            box.appendChild(closeBtn);
            box.appendChild(title);
            box.appendChild(steps);
            box.appendChild(note);
            box.appendChild(urlRow);
            overlay.appendChild(box);
            overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
            document.body.appendChild(overlay);

            if (!document.getElementById('pwaGuideFadeStyle')) {
                var st = document.createElement('style');
                st.id = 'pwaGuideFadeStyle';
                st.textContent = '@keyframes pwaGuideFadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}';
                document.head.appendChild(st);
            }
        }

        window._pwaDesktopInstall = function(e) {
            if (_deferredPrompt) {
                _deferredPrompt.prompt();
                _deferredPrompt.userChoice.then(function(result) {
                    if (result.outcome === 'accepted') {
                        _hideDesktopBtn();
                        _hideBanner(true);
                        _deskDismissed = true;
                        var t = _pwaText[_getLang()] || _pwaText.ua;
                        if (typeof showOcrToast === 'function') showOcrToast(t.installed, '#10b981');
                    }
                    _deferredPrompt = null;
                });
            } else {
                /* Not yet installable — show manual install instructions modal */
                _showInstallGuide();
            }
        };

        window._pwaDesktopDismiss = function() {
            _deskDismissed = true;
            _hideDesktopBtn();
            try { localStorage.setItem('pwa_desk_dismissed', '1'); } catch(e) {}
        };

        function _watchBoardModeDesk() {
            new MutationObserver(function() {
                if (!_deskDismissed && !_isInStandaloneMode && !_isMobileDevice()) {
                    if (!document.body.classList.contains('board-mode')) {
                        _showDesktopBtn();
                    }
                }
            }).observe(document.body, { attributeFilter: ['class'] });
        }

        function _init() {
            try { if (localStorage.getItem('pwa_banner_dismissed') === '1') return; } catch(e) {}
            if (_isInStandaloneMode) return;
            var lang = _getLang();
            _injectManifest(lang);
            _registerSW();
            _wireBanner();
            _watchBoardMode();
            _watchLangChanges();
            _watchBoardModeDesk();

            /* Desktop button: show after short delay on desktop */
            if (!_isMobileDevice() && !_isInStandaloneMode) {
                try { if (localStorage.getItem('pwa_desk_dismissed') === '1') { _deskDismissed = true; } } catch(e) {}
                if (!_deskDismissed) {
                    setTimeout(_showDesktopBtn, 1800);
                }
            }

            window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                _deferredPrompt = e;
                /* Mobile: bottom banner */
                if (_isMobileDevice()) {
                    setTimeout(function() { _showBanner(false); }, 2200);
                }
            });

            window.addEventListener('appinstalled', function() {
                _hideBanner(true);
                _hideDesktopBtn();
                _deferredPrompt = null;
            });

            if (_isIos && !_isInStandaloneMode) {
                setTimeout(function() { _showBanner(true); }, 2500);
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', _init);
        } else {
            _init();
        }

        window._pwaUpdateLang = function() {
            _injectManifest(_getLang());
            _updateBannerText();
            _updateDesktopBtnText();
        };

    })();
