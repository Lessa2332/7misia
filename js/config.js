// ⚠️ КОНФІГУРАЦІЯ
// УВАГА: цей файл містить чутливі дані. Не комітьте його у публічний репозиторій!
// Додайте "js/config.js" у .gitignore та використовуйте js/config.example.js як шаблон.

window.SUPERZOSHYT_CONFIG = {
    // URL Cloudflare Worker-проксі для Groq API.
    // Деплой: див. worker/groq-proxy.js та worker/wrangler.toml
    // Реальний Groq-ключ зберігається ТІЛЬКИ на Cloudflare (secret), не тут.
    GROQ_PROXY_URL: 'https://superzoshyt-groq-proxy.YOUR-SUBDOMAIN.workers.dev/groq/v1/chat/completions'
};

// Firebase конфігурація для спільного редагування (Collab)
window.FIREBASE_CONFIG = {
    apiKey: "AIzaSyDYJSqqJCHW-V7DkeZDBAZafwwq64wsWw8",
    authDomain: "supernote-f2281.firebaseapp.com",
    databaseURL: "https://supernote-f2281-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "supernote-f2281",
    storageBucket: "supernote-f2281.firebasestorage.app",
    messagingSenderId: "602073469737",
    appId: "1:602073469737:web:ea633700f98c8502011d38"
};
