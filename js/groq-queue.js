    (function () {
        'use strict';

        /* ════════════════════════════════════
           НАЛАШТУВАННЯ
        ════════════════════════════════════ */
        var MAX_CONCURRENT    = 1;
        var MIN_INTERVAL_MS   = 800;
        var MAX_RETRIES       = 3;
        var RETRY_DELAY_MS    = 3000;
        var TPM_LOW_THRESHOLD = 500;   // залишок токенів, нижче якого — fallback

        /* ── Ланцюжки моделей ── */
        var MODEL_CHAINS = {
            'text':   [
                'llama-3.3-70b-versatile',
                'qwen-qwq-32b',
                'llama-3.1-8b-instant'
            ],
            'vision': [
                'meta-llama/llama-4-scout-17b-16e-instruct',
                'meta-llama/llama-4-maverick-17b-128e-instruct',
                'llama-3.2-11b-vision-preview'
            ]
        };

        /* ── Стан вичерпаності моделей: { modelName → exhaustedUntil (timestamp ms) } ── */
        var _exhausted = {};

        /* ── Допоміжна: чи вичерпана модель прямо зараз ── */
        function _isExhausted(model) {
            var until = _exhausted[model];
            if (!until) return false;
            if (Date.now() >= until) { delete _exhausted[model]; return false; }
            return true;
        }

        /* ── Позначити модель вичерпаною ── */
        function _markExhausted(model, resetHeader) {
            var waitMs = RETRY_DELAY_MS;
            if (resetHeader) {
                /* Парсимо "2s", "500ms", "1m30s" тощо */
                var m;
                var total = 0;
                if ((m = resetHeader.match(/(\d+(?:\.\d+)?)m(?:in)?/))) total += parseFloat(m[1]) * 60000;
                if ((m = resetHeader.match(/(\d+(?:\.\d+)?)s/)))        total += parseFloat(m[1]) * 1000;
                if ((m = resetHeader.match(/(\d+(?:\.\d+)?)ms/)))       total += parseFloat(m[1]);
                if (total > 0) waitMs = total;
            }
            _exhausted[model] = Date.now() + waitMs;
            console.warn('[GroqQueue] Model exhausted:', model, '→ cooldown', Math.round(waitMs / 1000) + 's');
        }

        /* ── Вибрати актуальну модель для tier ── */
        function _pickModel(tier) {
            var chain = MODEL_CHAINS[tier] || MODEL_CHAINS['text'];
            for (var i = 0; i < chain.length; i++) {
                if (!_isExhausted(chain[i])) return { model: chain[i], index: i };
            }
            /* Всі вичерпані — беремо останній і чекатимемо */
            return { model: chain[chain.length - 1], index: chain.length - 1 };
        }

        /* ── Внутрішній стан черги ── */
        var _queue   = [];
        var _running = 0;
        var _lastStart = 0;

        function _delay(ms) {
            return new Promise(function (r) { setTimeout(r, ms); });
        }

        /* ── Читаємо заголовки відповіді та оновлюємо стан моделі ── */
        function _updateModelState(response, model) {
            var remaining = parseInt(response.headers.get('x-ratelimit-remaining-tokens') || '-1', 10);
            var reset     = response.headers.get('x-ratelimit-reset-tokens') || '';

            if (remaining >= 0 && remaining < TPM_LOW_THRESHOLD) {
                console.warn('[GroqQueue] TPM low for', model, '— remaining:', remaining, '— marking exhausted');
                _markExhausted(model, reset);
            }
        }

        /* ── Виконати один запит (з fallback і ретраями) ── */
        async function _execute(job) {
            var tier    = job.tier || 'text';
            var attempt = 0;

            while (true) {
                /* Вибираємо модель для цього спроби */
                var picked = _pickModel(tier);
                var model  = picked.model;

                /* Підставляємо модель в тіло запиту */
                var bodyObj = JSON.parse(job.options.body);
                var originalModel = bodyObj.model;
                bodyObj.model = model;
                var patchedOptions = Object.assign({}, job.options, { body: JSON.stringify(bodyObj) });

                if (model !== originalModel) {
                    console.log('[GroqQueue] Fallback:', originalModel, '→', model, '(tier:', tier + ')');
                }

                try {
                    var response = await fetch(job.url, patchedOptions);

                    /* 429 — позначаємо модель вичерпаною і повторюємо */
                    if (response.status === 429) {
                        var retryAfter = response.headers.get('retry-after') || response.headers.get('x-ratelimit-reset-tokens') || '';
                        _markExhausted(model, retryAfter);

                        if (attempt < MAX_RETRIES) {
                            attempt++;
                            var wait = (parseInt(retryAfter, 10) || 0) * 1000 || RETRY_DELAY_MS;
                            console.warn('[GroqQueue] 429 on', model, '— retry', attempt, 'after', wait, 'ms');
                            await _delay(wait);
                            continue;
                        }
                        /* Всі ретраї вичерпано — повертаємо відповідь як є */
                        job.resolve(response);
                        return;
                    }

                    /* Успіх — читаємо заголовки щоб відстежити TPM */
                    _updateModelState(response, model);

                    /* Якщо модель майже вичерпана — зберігаємо, але відповідь все одно повертаємо */
                    job.resolve(response);
                    return;

                } catch (err) {
                    if (attempt < MAX_RETRIES) {
                        attempt++;
                        console.warn('[GroqQueue] Network error (attempt', attempt + '):', err.message);
                        await _delay(RETRY_DELAY_MS);
                    } else {
                        job.reject(err);
                        return;
                    }
                }
            }
        }

        /* ── Цикл черги ── */
        async function _pump() {
            if (_running >= MAX_CONCURRENT || _queue.length === 0) return;

            var now = Date.now();
            var since = now - _lastStart;
            if (since < MIN_INTERVAL_MS) {
                setTimeout(_pump, MIN_INTERVAL_MS - since);
                return;
            }

            var job = _queue.shift();
            _running++;
            _lastStart = Date.now();

            _execute(job).finally(function () {
                _running--;
                _pump();
            });

            _pump();
        }

        /* ════════════════════════════════════
           ПУБЛІЧНИЙ API
        ════════════════════════════════════ */
        window.GroqQueue = {
            /**
             * enqueue(url, options, label, tier) → Promise<Response>
             *
             *   url     — 'https://api.groq.com/openai/v1/chat/completions'
             *   options — { method, headers, body }  (як у fetch)
             *   label   — рядок для логів (необов'язково)
             *   tier    — 'text' | 'vision'  (необов'язково, default: 'text')
             *
             * Модель у body.model використовується як БАЖАНА (primary),
             * але може бути замінена на fallback якщо TPM вичерпано.
             */
            enqueue: function (url, options, label, tier) {
                return new Promise(function (resolve, reject) {
                    var t = tier || 'text';
                    _queue.push({ url: url, options: options, label: label || 'req', tier: t, resolve: resolve, reject: reject });
                    var picked = _pickModel(t);
                    console.log('[GroqQueue] +queue:', label || 'req',
                        '| tier:', t,
                        '| model:', picked.model,
                        '| queue:', _queue.length);
                    _pump();
                });
            },

            /* Поточний стан (для дебагу) */
            status: function () {
                var s = { queued: _queue.length, running: _running, exhausted: {} };
                Object.keys(_exhausted).forEach(function (m) {
                    s.exhausted[m] = Math.max(0, Math.round((_exhausted[m] - Date.now()) / 1000)) + 's';
                });
                return s;
            },

            /* Примусово скинути стан exhausted (для тестування) */
            reset: function () { _exhausted = {}; console.log('[GroqQueue] Exhausted state cleared.'); },

            /* Ланцюжки моделей (read-only довідка) */
            chains: MODEL_CHAINS
        };
    })();
