/**
 * ════════════════════════════════════════════════════════════════
 *  Суперзошит — Groq API проксі (Cloudflare Worker)
 * ════════════════════════════════════════════════════════════════
 *
 *  Що робить:
 *   - Приймає запити з браузера на /groq/v1/chat/completions
 *   - Якщо клієнт надіслав власний Groq-ключ (BYOK, "Свій ключ" у зошиті) —
 *     пропускає його як є.
 *   - Якщо ключа немає — підставляє секретний ключ зі змінної середовища
 *     GROQ_API_KEY (зберігається в Cloudflare, ніколи не йде в браузер).
 *   - Прозоро передає тіло запиту та відповідь (включно з rate-limit
 *     заголовками, які потрібні GroqQueue для fallback-логіки).
 *
 *  Налаштування деплою:
 *   1. npm install -g wrangler   (якщо ще не встановлено)
 *   2. wrangler login
 *   3. У цій папці: wrangler secret put GROQ_API_KEY   (вставити свій ключ)
 *   4. wrangler deploy
 *   5. Скопіювати URL воркера (https://....workers.dev) і підставити
 *      його в js/*.js замість https://api.groq.com/openai/v1/chat/completions
 *      (див. groq-proxy.example у коментарях нижче)
 *
 *  Захист від зловживань (опційно, рекомендовано):
 *   - Перевірка ALLOWED_ORIGIN — дозволяє запити лише з твого сайту
 *   - Простий rate-limit за IP можна додати через Cloudflare KV
 * ════════════════════════════════════════════════════════════════
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Звідки дозволено робити запити. Встанови свій GitHub Pages домен.
// '*' дозволяє з будь-якого сайту (простіше для старту, але менш безпечно).
const ALLOWED_ORIGIN = '*'; // напр.: 'https://твій-нік.github.io'

export default {
  async fetch(request, env, ctx) {
    // ── CORS preflight ──
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    // ── Дозволяємо лише POST на /groq/v1/chat/completions ──
    const url = new URL(request.url);
    if (request.method !== 'POST' || !url.pathname.startsWith('/groq/v1/chat/completions')) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      });
    }

    // ── (опційно) перевірка Origin ──
    if (ALLOWED_ORIGIN !== '*') {
      const origin = request.headers.get('Origin') || '';
      if (origin !== ALLOWED_ORIGIN) {
        return new Response(JSON.stringify({ error: 'Forbidden origin' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() }
        });
      }
    }

    // ── Визначаємо, який ключ використати ──
    // Якщо клієнт передав власний ключ (BYOK) — пропускаємо його.
    // Інакше — підставляємо секретний ключ воркера.
    const incomingAuth = request.headers.get('Authorization') || '';
    const hasUserKey = /^Bearer\s+gsk_/.test(incomingAuth);
    const authHeader = hasUserKey ? incomingAuth : `Bearer ${env.GROQ_API_KEY}`;

    // ── Читаємо тіло запиту як є (GroqQueue вже підставив потрібну модель) ──
    const body = await request.text();

    // ── Проксі-запит до Groq ──
    let groqResponse;
    try {
      groqResponse = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Upstream fetch failed', detail: String(err) }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      });
    }

    // ── Передаємо відповідь назад, зберігаючи важливі заголовки ──
    // GroqQueue читає x-ratelimit-* та retry-after для fallback-логіки.
    const headersToForward = [
      'content-type',
      'x-ratelimit-remaining-tokens',
      'x-ratelimit-reset-tokens',
      'x-ratelimit-remaining-requests',
      'x-ratelimit-reset-requests',
      'retry-after'
    ];

    const outHeaders = new Headers(corsHeaders());
    headersToForward.forEach((h) => {
      const v = groqResponse.headers.get(h);
      if (v) outHeaders.set(h, v);
    });

    return new Response(groqResponse.body, {
      status: groqResponse.status,
      headers: outHeaders
    });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}
