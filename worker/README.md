# Суперзошит — налаштування Groq-проксі

## Навіщо це

Раніше Groq API-ключі лежали прямо в коді (`js/*.js`), і будь-хто міг
скопіювати їх з вихідного коду сторінки. Тепер запити до Groq йдуть
через невеликий проксі-сервер (Cloudflare Worker), який сам додає
секретний ключ. Ключ ніколи не потрапляє в браузер.

```
Браузер (зошит) → Cloudflare Worker → Groq API
                     (тут ключ)
```

## Крок 1 — деплой воркера

```bash
cd worker
npm install -g wrangler      # якщо ще не встановлено
wrangler login
wrangler secret put GROQ_API_KEY    # вставити свій реальний Groq-ключ
wrangler deploy
```

Після деплою wrangler видасть URL типу:

```
https://superzoshyt-groq-proxy.<твій-субдомен>.workers.dev
```

## Крок 2 — налаштувати клієнт

Скопіюй `js/config.example.js` → `js/config.js` і встав URL воркера
(додавши шлях `/groq/v1/chat/completions`):

```js
window.SUPERZOSHYT_CONFIG = {
    GROQ_PROXY_URL: 'https://superzoshyt-groq-proxy.<твій-субдомен>.workers.dev/groq/v1/chat/completions'
};
```

`js/config.js` НЕ є секретним (там немає ключів) — але він
середовище-залежний (різний URL для dev/prod), тому в `.gitignore`.
Якщо хочеш — можеш закомітити власний `config.js` з реальним URL
(тоді прибери рядок з `.gitignore`).

## Крок 3 (опційно) — обмежити доступ до воркера

У `worker/groq-proxy.js` зміни:

```js
const ALLOWED_ORIGIN = '*';
```

на свій домен GitHub Pages, наприклад:

```js
const ALLOWED_ORIGIN = 'https://твій-нік.github.io';
```

Це не дасть стороннім сайтам використовувати твій проксі (і твій ліміт
Groq) з інших джерел.

## "Свій ключ" (BYOK) — без змін

Функція "Свій Groq-ключ" (через `groq-key-modal.js`) продовжує
працювати: якщо учень/учитель вставить власний ключ, він
передається безпосередньо в Groq через той самий проксі, минаючи
секретний ключ воркера.

## ⚠️ Старі ключі

Старі ключі, які раніше були в коді (`gsk_XPVk6...`, `gsk_RMOdL...`,
`gsk_SJd06...`, `gsk_QWuN1...`), вважати скомпрометованими —
**відклич їх у [console.groq.com](https://console.groq.com)** і
згенеруй новий ключ для `wrangler secret put GROQ_API_KEY`.
