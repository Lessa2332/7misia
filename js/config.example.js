// Шаблон конфігурації. Скопіюйте у js/config.js
// js/config.js НЕ комітиться (див. .gitignore).

window.SUPERZOSHYT_CONFIG = {
    // URL твого Cloudflare Worker-проксі (після деплою worker/groq-proxy.js)
    GROQ_PROXY_URL: 'https://superzoshyt-groq-proxy.YOUR-SUBDOMAIN.workers.dev/groq/v1/chat/completions'
};

window.FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.YOUR_REGION.firebasedatabase.app",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
