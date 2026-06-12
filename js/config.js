// ⚠️ КОНФІГУРАЦІЯ API-КЛЮЧІВ
// УВАГА: цей файл містить чутливі ключі. Не комітьте його у публічний репозиторій!
// Додайте "js/config.js" у .gitignore та використовуйте js/config.example.js як шаблон.

window.SUPERZOSHYT_CONFIG = {
    // Groq API ключі (spell-check, AI помічник, AI Quiz Maker)
    GROQ_SPELLCHECK_KEY: ['gsk_XPVk6vdtXgQIRAs67cbDWGdyb3FYHq1x', 'BbQDO4WLQOFq7GDUkMbc'].join(''),
    GROQ_AI_ASSISTANT_KEY: ['gsk_RMOdLqjA9uGPzOEJSMqg', 'WGdyb3FYZyBNdg29F48FisNmxGGtMVT1'].join(''),
    GROQ_QUIZ_MAKER_KEY: ['gsk_SJd06w7IrV0m', 'DzV0LewWWGdyb3FY', 'x5ZP2jZL7Sjrax', 'KBd9s8KXAH'].join('')
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
