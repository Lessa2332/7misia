
        dateSelect.value = new Date().toISOString().split('T')[0];

        var uiText = {
            ua: {
                title: 'Суперзошит!',
                typeHome: 'Домашня',
                typeClass: 'Класна',
                typeClean: 'Чисто',
                fontPrint: 'Друк',
                fontHand: 'Пропис',
                bgLines: 'Лінійка',
                bgGrid: 'Клітинка',
                bgDiagonal: 'Коса',
                bgClean: 'Чистий',
                copyImage: 'Копіювати зображення',
                saveImage: 'Зберегти зображення',
                editBtn: 'Почати писати у зошиті',
                footer: 'Автор ',
                footerName: 'Ігор Шуляк',
                toastCopied: 'Скопійовано!',
                undo: 'Відмінити',
                redo: 'Повторити',
                bold: 'Жирний',
                underline: 'Підкреслений',
                strikethrough: 'Зачеркнутий',
                alignLeft: 'По лівому краю',
                alignCenter: 'По центру',
                alignRight: 'По правому краю',
                draw: 'Малювати',
                eraser: 'Стирачка',
                line: 'Лінія',
                math: 'Математика (лише клітинка)',
                symPanel: 'Спеціальні символи',
                sticker: 'Стікер',
                addImage: 'Додати зображення',
                mathPanel: 'Математика',
                mathTemplates: 'Шаблони',
                mathFraction: 'Дріб',
                mathNumerator: 'Чисельник',
                mathDenominator: 'Знаменник',
                mathInsertFraction: 'Дріб',
                mathQuickPlaceholder: 'Введіть формулу, напр. (a+b)^2',
                mathInsert: 'Вставити',
                mathGridOnly: 'Математика доступна лише в режимі "Клітинка"',
                dictation: 'Голосове введення',
                clear: 'Очистити',
                exit: 'Вийти',
                prevPage: 'Попередня сторінка',
                nextPage: 'Наступна сторінка',
                addPage: 'Додати сторінку',
                ocrLang: 'Мова розпізнавання',
                ocrUkrBtn: 'Українська',
                ocrEngBtn: 'Англійська',
                ocrCancel: 'Скасувати',
                delSticker: 'Видалити стікер',
                // toolbar extras
                superscript: 'Надрядковий',
                subscript: 'Підрядковий',
                shapes: 'Фігури',
                freetext: 'Довільний текст',
                qrGenerator: 'Генератор QR-коду',
                timer: 'Таймер',
                copyPage: 'Копіювати сторінку',
                downloadPage: 'Скачати сторінку',
                closeEditor: 'Закрити режим редагування',
                deletePage: 'Видалити сторінку',
                helpBtn: 'Довідка',
                shapeRoundedRect: 'Заокруглений прямокутник',
                shapeEllipse: 'Еліпс',
                shapeTriangle: 'Трикутник',
                shapeRightTriangle: 'Прямокутний трикутник',
                shapeDiamond: 'Ромб',
                shapeStar: 'Зірка',
                shapeArrowRight: 'Стрілка вправо',
                shapeArrowDouble: 'Двостороння стрілка',
                shapeHeart: 'Серце',
                shapeHexagon: 'Шестикутник',
                confirmDeletePage: 'Видалити поточну сторінку?',
                confirmNo: 'Скасувати',
                confirmYes: 'Видалити',
                confirmLoadTitle: 'Завантажити зошит?',
                confirmLoadSub: 'Поточний зошит буде замінено файлом. Цю дію не можна скасувати.',
                confirmLoadYes: 'Завантажити',
                confirmLoadNo: 'Скасувати',
                toastNotebookSaved: '💾 Зошит збережено!',
                toastNotebookLoaded: '✅ Зошит завантажено!',
                alertLoadError: 'Помилка відкриття файлу зошита',
                freetextTitle: '✏️ Довільний текст',
                freetextPlaceholder: 'Введіть текст...',
                freetextCancel: 'Скасувати',
                freetextOk: 'Вставити',
                qrTitle: 'Генератор QR-коду',
                qrInputPlaceholder: 'Посилання або текст...',
                qrPlaceholderText: 'Введіть текст — QR з\'явиться тут',
                qrSize: 'Розмір',
                qrCancel: 'Скасувати',
                qrInsert: 'Вставити в зошит',
                qrInserted: '✓ QR-код вставлено!',
                timerStart: '▶ Старт',
                timerPause: '⏸ Пауза',
                timerResume: '▶ Продовжити',
                timerFinished: '⏰ Час!',
                timerReset: 'Скинути',
                timerClickToEdit: 'Натисніть для зміни часу',
                cropApply: 'Застосувати обрізку',
                cropCancel: 'Скасувати',
                alertMicNotAllowed: 'Будь ласка, надайте дозвіл на використання мікрофона.',
                alertVoiceNotSupported: 'Голосове введення не підтримується у вашому браузері (рекомендуємо Google Chrome).',
                alertCopyNotSupported: 'Ваш браузер не підтримує копіювання зображень. Спробуйте скачати PNG.',
                alertSaveError: 'Помилка збереження. Спробуйте ще раз.',
                alertTesseractError: 'Tesseract.js не завантажився. Перевірте з\'єднання з інтернетом.',
                ocrPickerTitle: 'Мова розпізнавання',
                helpTitle: 'Можливості редагування',
                helpSubtitle: 'Суперзошит — повний довідник по всіх функціях',
                helpSectionText: '✏️ Текст та форматування',
                helpBold: 'Жирний текст',
                helpBoldDesc: 'Виділіть текст і натисніть B або Ctrl+B',
                helpUnderline: 'Підкреслений текст',
                helpUnderlineDesc: 'Виділіть текст і натисніть U або Ctrl+U',
                helpAlign: 'Вирівнювання',
                helpAlignDesc: 'Ліво, центр, право — кнопки вирівнювання на панелі інструментів',
                helpColor: 'Колір тексту',
                helpColorDesc: 'Виберіть колір (синій, чорний, червоний, зелений) на панелі — він застосується до нового тексту та малюнка',
                helpSectionDraw: '🖊️ Малювання',
                helpPencil: 'Олівець',
                helpPencilDesc: 'Вільне малювання рукою. Натисніть кнопку олівця, щоб активувати. Довге натискання — змінити розмір пензля',
                helpEraser: 'Стирачка',
                helpEraserDesc: 'Стирає намальоване. Довге натискання — змінити розмір стирачки',
                helpLine: 'Лінія',
                helpLineDesc: 'Малює рівну лінію від точки до точки',
                helpShapes: 'Фігури',
                helpShapesDesc: '12 фігур: прямокутники, кола, трикутники, зірка, серце, стрілки та інші. Фігури можна переміщувати і змінювати розмір',
                helpSectionElements: '📌 Елементи на сторінці',
                helpStickers: 'Стікери',
                helpStickersDesc: 'Жовті нотатки, які можна переміщувати по аркушу. Натисніть кнопку стікера, потім клікніть у будь-яке місце. Текст можна редагувати',
                helpImages: 'Зображення',
                helpImagesDesc: 'Вставляйте фото з файлів або через Ctrl+V. Зображення можна переміщувати, змінювати розмір та видаляти',
                helpOcr: 'OCR — розпізнавання тексту',
                helpOcrDesc: 'На вставленому зображенні натисніть синю кнопку T — текст буде розпізнаний і вставлений',
                helpSectionPages: '📄 Сторінки та навігація',
                helpNewPages: 'Нові сторінки',
                helpNewPagesDesc: 'Натисніть + у правому верхньому куті, щоб додати нову сторінку. Перемикайтесь стрілками',
                helpUndoRedo: 'Скасувати / Повторити',
                helpUndoRedoDesc: 'Ctrl+Z — скасувати, Ctrl+Shift+Z — повторити. Або кнопки ↩ ↪ на панелі',
                helpSectionVoice: '🎙️ Голос та мова',
                helpVoice: 'Голосове введення',
                helpVoiceDesc: 'Натисніть кнопку мікрофона — диктуйте текст голосом. Індикатор знизу показує активну розкладку клавіатури (УКР / ENG)',
                helpMath: 'Математичні підказки',
                helpMathDesc: 'Напишіть вираз на кшталт 2+2= і натисніть пробіл — з\'явиться підказка з результатом. Enter — вставити',
                helpSectionSettings: '⚙️ Налаштування зошита',
                helpDate: 'Дата',
                helpDateDesc: 'Виберіть дату через піктограму — заголовок зошита оновиться автоматично (UA або EN формат)',
                helpWorkType: 'Тип роботи',
                helpWorkTypeDesc: '«Домашня» або «Класна» — відображається у заголовку',
                helpFont: 'Шрифт',
                helpFontDesc: '«Друк» — Georgia курсив; «Пропис» — рукописний шрифт Propysy',
                helpBackground: 'Фон аркуша',
                helpBackgroundDesc: 'Лінійка, клітинка або чистий аркуш — обирайте відповідно до завдання',
                helpSectionSave: '💾 Збереження',
                helpAutosave: 'Автозбереження',
                helpAutosaveDesc: 'Усі дані автоматично зберігаються в браузері (localStorage) — відкривайте сторінку наступного разу і продовжуйте',
                helpSaveImage: 'Зберегти як зображення',
                helpSaveImageDesc: '«Копіювати зображення» — копіює у буфер обміну. «Зберегти зображення» — завантажує PNG (на мобільних)',
                helpNotebookFile: 'Файл зошита (.notebook)',
                helpNotebookFileDesc: 'Збережіть увесь зошит у файл кнопкою 💾 зліва на аркуші. Відновіть з файлу кнопкою 📁 — усі сторінки, малюнки та елементи повернуться',
                helpSectionTextExtra: '✏️ Додаткове форматування',
                helpStrikethrough: 'Закреслений текст',
                helpStrikethroughDesc: 'Виділіть текст і натисніть кнопку S із закресленням на панелі інструментів',
                helpSuperscript: 'Надрядковий (степінь)',
                helpSuperscriptDesc: 'Виділіть текст і натисніть x² на панелі — зручно для запису ступенів і показників',
                helpSubscript: 'Підрядковий (індекс)',
                helpSubscriptDesc: 'Виділіть текст і натисніть x₂ на панелі — для хімічних формул та індексів',
                helpSymPanel: 'Панель спецсимволів',
                helpSymPanelDesc: 'Натисніть кнопку Ω на панелі — з\'явиться набір математичних і наукових символів (√, π, ∞, ≤, °...). В режимі клітинки — математичні; у звичайному — загальні',
                helpSectionPageMgmt: '📄 Керування сторінками',
                helpCopyPage: 'Копіювати сторінку',
                helpCopyPageDesc: 'Кнопка «Копіювати сторінку» на панелі редагування — дублює поточну сторінку з усім вмістом на нову',
                helpDownloadPage: 'Скачати сторінку',
                helpDownloadPageDesc: 'Кнопка «Скачати сторінку» — зберігає поточний аркуш як PNG-зображення на пристрій',
                helpDeletePage: 'Видалити сторінку',
                helpDeletePageDesc: 'Кнопка видалення (червона) — видаляє поточну сторінку після підтвердження. Дію не можна скасувати',
                helpSectionAdvanced: '🧩 Розширені елементи',
                helpFreeText: 'Довільний текст',
                helpFreeTextDesc: 'Кнопка T на панелі — додає плаваючий текстовий блок. Можна переміщувати, змінювати розмір і обертати. Для видалення — ×',
                helpQr: 'QR-код',
                helpQrDesc: 'Кнопка QR у контекстному меню (права кнопка миші) — відкриває генератор. Введіть посилання або текст, оберіть розмір — QR-код вставиться на аркуш як зображення',
                helpTimer: 'Таймер',
                helpTimerDesc: 'Кнопка таймера на панелі — додає перетягуваний зворотній відлік. Натисніть на цифри, щоб змінити час. Є пресети: 1, 5, 10, 15 хвилин. Сигнал сповіщає про завершення',
                helpSectionImageAdv: '🖼️ Зображення: додаткові дії',
                helpCrop: 'Обрізка зображення',
                helpCropDesc: 'Натисніть на вставлене зображення — з\'явиться кнопка ✂️. Виділіть область для обрізки і натисніть «Застосувати»',
                helpSectionAI: '🤖 Штучний інтелект (AI)',
                helpAiAssistant: 'AI помічник',
                helpAiAssistantDesc: 'Натисніть кнопку із зірочкою на панелі — відкриється віконце. Напишіть або продиктуйте запит (наприклад, "Склади 5 речень англійською"), і AI згенерує текст прямо в зошит',
                helpSpellCheck: 'Перевірка граматики',
                helpSpellCheckDesc: 'Виділіть будь-який текст у зошиті та натисніть зелену кнопку з галочкою — AI автоматично виправить орфографічні та пунктуаційні помилки',
                helpSectionCollab: '🌐 Спільний доступ',
                helpCollab: 'Онлайн-редагування',
                helpCollabDesc: 'Натисніть кнопку "Доступ" на панелі зліва. Вчитель створює сесію і отримує код. Учні вводять цей код на своїх пристроях і приєднуються до зошита. Зміни синхронізуються',
                // Collab modal
                collabTitle: 'Спільне редагування',
                collabTabTeacher: '👩‍🏫 Вчитель',
                collabTabStudent: '🎓 Учень',
                collabCodeLabel: 'Код для учнів (натисніть щоб скопіювати):',
                collabCodeHint: 'або відскануйте QR-код нижче',
                collabStatusInit: 'Ініціалізація...',
                collabNoPeers: 'Учні ще не приєдналися',
                collabProtectLabel: '🔒 Захистити текст вчителя',
                collabStopBtn: '🛑 Припинити доступ',
                collabCloseBtn: 'Закрити',
                collabNameLabel: 'Ім\'я та прізвище:',
                collabNamePlaceholder: 'Наприклад: Даня Варенченко',
                collabCodeInputLabel: 'Код від вчителя:',
                collabJoinBtn: 'Приєднатися',
                collabConnecting: 'Підключення...',
                collabReady: 'Готово! Очікую учнів...',
                collabStudentsCount: 'Учнів: ',
                collabErrNoCode: '⚠️ Введіть 6-символьний код',
                collabErrNoName: '⚠️ Введіть ім\'я та прізвище',
                collabErrNoFirebase: '❌ Firebase не ініціалізовано',
                collabErrNotFound: '❌ Сесія не знайдена. Перевірте код.',
                collabSynced: '✅ Зошит синхронізовано!',
                collabTeacherEnded: '⚠️ Вчитель завершив сесію',
                collabStudentSingular: 'учень',
                collabStudentPlural: 'учнів',
                collabConnected: '🔗 Підключено',
                collabAccessLabel: 'Доступ',
                collabEditing: ' вносить зміни',
                collabConfirmStop: 'Припинити доступ для всіх учнів?',
                collabSessionEnded: 'Сесію завершено. Відкрийте меню для нової сесії.',
                collabConnectedPrefix: '👥 Підключено: ',
                collabStudentsListTitle: 'Учні у зошиті:',
                collabRemoveStudentBtn: 'Видалити',
                collabConfirmRemoveStudent: 'Видалити цього учня з зошита?',
                collabStudentRemoved: 'Вас видалено з цього зошита',
                collabRemovedToastTitle: 'Вас від\'єднав вчитель',
                collabRemovedToastMsg: 'Вчитель вилучив вас із цього зошита.',
                collabTeacherCursorName: 'Вчитель',
                collabErrZoneOverlap: 'Цей фрагмент уже має доступ. Виділіть інший текст або рядок.',
                collabDefaultName: 'Без імені',
                // Context menu
                ctxCopy: 'Копіювати',
                ctxCut: 'Вирізати',
                ctxPaste: 'Вставити',
                ctxQr: 'Генерувати QR',
                ctxQrSel: 'Генерувати QR з виділеного',
                ctxSticker: 'Вставити стікер',
                ctxTranslate: 'Перекласти',
                ctxTranslateSel: 'Перекласти виділене',
                ctxTransliterate: 'Транслітерація',
                ctxTransliterateSel: 'Транслітерувати виділене',
                trLitTitle: 'Транслітерація',
                trLitSource: 'Текст',
                trLitResult: 'Результат',
                trLitLangEn: '🇬🇧 Англійська',
                trLitLangDe: '🇩🇪 Німецька',
                trLitClose: 'Закрити',
                trLitInsert: 'Вставити в зошит',
                ctxList: 'Список',
                lspBullet: 'Маркований список',
                lspNumbered: 'Нумерований список',
                labelFile: 'Файл',
                labelLang: 'Мова',
                labelType: 'Тип роботи',
                labelFont: 'Шрифт',
                labelBg: 'Фон зошиту',
                aiTitle: 'AI помічник',
                aiSubtitle: 'Опишіть що згенерувати та вставити в зошит',
                aiPlaceholder: 'Напр.: Напиши вірш про весну, Склади 5 речень англійською, Поясни теорему Піфагора...',
                aiHint: 'Enter — надіслати &nbsp;·&nbsp; Shift+Enter — новий рядок',
                aiSendBtn: 'Надіслати',
                aiDictation: 'Голосове введення',
                trTitle: 'Переклад тексту',
                trDetectLang: 'Визначити мову',
                trSourcePlaceholder: 'Введіть текст для перекладу...',
                trResultPlaceholder: 'Переклад з\'явиться тут...',
                trTranslating: 'Перекладаємо…',
                trError: 'Не вдалося перекласти. Спробуйте ще раз.',
                trNetError: 'Помилка з\'єднання. Перевірте інтернет.',
                trCloseBtn: 'Закрити',
                trTranslateBtn: 'Перекласти',
                trInsertBtn: 'Вставити в зошит',
                ctxEmbed: 'Розумна вставка',
                embedTitle: 'Розумна вставка',
                embedPlaceholder: 'Вставте YouTube посилання, iFrame або HTML код...',
                embedCancel: 'Скасувати',
                embedOk: 'Вставити',
            },
            en: {
                title: 'Supernotebook!',
                typeHome: 'Homework',
                typeClass: 'Classwork',
                typeClean: 'Clean',
                fontPrint: 'Print',
                fontHand: 'Script',
                bgLines: 'Lines',
                bgGrid: 'Grid',
                bgDiagonal: 'Diagonal',
                bgClean: 'Clean',
                copyImage: 'Copy image',
                saveImage: 'Save image',
                editBtn: 'Edit',
                footer: 'Author ',
                footerName: 'Ihor Shuliak',
                toastCopied: 'Copied!',
                undo: 'Undo',
                redo: 'Redo',
                bold: 'Bold',
                underline: 'Underline',
                strikethrough: 'Strikethrough',
                alignLeft: 'Align left',
                alignCenter: 'Center',
                alignRight: 'Align right',
                draw: 'Draw',
                eraser: 'Eraser',
                line: 'Line',
                math: 'Math (grid only)',
                symPanel: 'Special characters',
                sticker: 'Sticker',
                addImage: 'Add image',
                mathPanel: 'Math',
                mathTemplates: 'Templates',
                mathFraction: 'Fraction',
                mathNumerator: 'Numerator',
                mathDenominator: 'Denominator',
                mathInsertFraction: 'Fraction',
                mathQuickPlaceholder: 'Enter formula, e.g. (a+b)^2',
                mathInsert: 'Insert',
                mathGridOnly: 'Math is available only in "Grid" mode',
                dictation: 'Voice input',
                clear: 'Clear',
                exit: 'Exit',
                prevPage: 'Previous page',
                nextPage: 'Next page',
                addPage: 'Add page',
                ocrLang: 'Recognition language',
                ocrUkrBtn: 'Ukrainian',
                ocrEngBtn: 'English',
                ocrCancel: 'Cancel',
                delSticker: 'Delete sticker',
                // toolbar extras
                superscript: 'Superscript',
                subscript: 'Subscript',
                shapes: 'Shapes',
                freetext: 'Free text',
                qrGenerator: 'QR Code Generator',
                timer: 'Timer',
                copyPage: 'Copy page',
                downloadPage: 'Download page',
                closeEditor: 'Close editor',
                deletePage: 'Delete page',
                helpBtn: 'Help',
                shapeRoundedRect: 'Rounded rectangle',
                shapeEllipse: 'Ellipse',
                shapeTriangle: 'Triangle',
                shapeRightTriangle: 'Right triangle',
                shapeDiamond: 'Diamond',
                shapeStar: 'Star',
                shapeArrowRight: 'Arrow right',
                shapeArrowDouble: 'Double arrow',
                shapeHeart: 'Heart',
                shapeHexagon: 'Hexagon',
                confirmDeletePage: 'Delete current page?',
                confirmNo: 'Cancel',
                confirmYes: 'Delete',
                confirmLoadTitle: 'Load notebook?',
                confirmLoadSub: 'The current notebook will be replaced with the file. This cannot be undone.',
                confirmLoadYes: 'Load',
                confirmLoadNo: 'Cancel',
                toastNotebookSaved: '💾 Notebook saved!',
                toastNotebookLoaded: '✅ Notebook loaded!',
                alertLoadError: 'Error opening notebook file',
                freetextTitle: '✏️ Free text',
                freetextPlaceholder: 'Enter text...',
                freetextCancel: 'Cancel',
                freetextOk: 'Insert',
                qrTitle: 'QR Code Generator',
                qrInputPlaceholder: 'Link or text...',
                qrPlaceholderText: 'Enter text — QR will appear here',
                qrSize: 'Size',
                qrCancel: 'Cancel',
                qrInsert: 'Insert into notebook',
                qrInserted: '✓ QR code inserted!',
                timerStart: '▶ Start',
                timerPause: '⏸ Pause',
                timerResume: '▶ Resume',
                timerFinished: "⏰ Time's up!",
                timerReset: 'Reset',
                timerClickToEdit: 'Click to change time',
                cropApply: 'Apply crop',
                cropCancel: 'Cancel',
                alertMicNotAllowed: 'Please allow microphone access.',
                alertVoiceNotSupported: 'Voice input is not supported in your browser (we recommend Google Chrome).',
                alertCopyNotSupported: 'Your browser does not support image copying. Try downloading the PNG instead.',
                alertSaveError: 'Save error. Please try again.',
                alertTesseractError: 'Tesseract.js failed to load. Check your internet connection.',
                ocrPickerTitle: 'Recognition language',
                helpTitle: 'Editor features',
                helpSubtitle: 'Supernotebook — full guide to all features',
                helpSectionText: '✏️ Text & Formatting',
                helpBold: 'Bold text',
                helpBoldDesc: 'Select text and press B or Ctrl+B',
                helpUnderline: 'Underlined text',
                helpUnderlineDesc: 'Select text and press U or Ctrl+U',
                helpAlign: 'Alignment',
                helpAlignDesc: 'Left, center, right — alignment buttons on the toolbar',
                helpColor: 'Text color',
                helpColorDesc: 'Choose a color (blue, black, red, green) on the toolbar — applies to new text and drawings',
                helpSectionDraw: '🖊️ Drawing',
                helpPencil: 'Pencil',
                helpPencilDesc: 'Free-hand drawing. Press the pencil button to activate. Long press — change brush size',
                helpEraser: 'Eraser',
                helpEraserDesc: 'Erases drawings. Long press — change eraser size',
                helpLine: 'Line',
                helpLineDesc: 'Draws a straight line from point to point',
                helpShapes: 'Shapes',
                helpShapesDesc: '12 shapes: rectangles, circles, triangles, star, heart, arrows and more. Shapes can be moved and resized',
                helpSectionElements: '📌 Page elements',
                helpStickers: 'Stickers',
                helpStickersDesc: 'Yellow notes that can be moved around the page. Click the sticker button, then click anywhere. Text is editable',
                helpImages: 'Images',
                helpImagesDesc: 'Insert photos from files or via Ctrl+V. Images can be moved, resized and deleted',
                helpOcr: 'OCR — text recognition',
                helpOcrDesc: 'On an inserted image, press the blue T button — text will be recognized and inserted',
                helpSectionPages: '📄 Pages & Navigation',
                helpNewPages: 'New pages',
                helpNewPagesDesc: 'Press + in the top right corner to add a new page. Switch with arrows',
                helpUndoRedo: 'Undo / Redo',
                helpUndoRedoDesc: 'Ctrl+Z — undo, Ctrl+Shift+Z — redo. Or use the ↩ ↪ buttons on the toolbar',
                helpSectionVoice: '🎙️ Voice & Language',
                helpVoice: 'Voice input',
                helpVoiceDesc: 'Press the microphone button — dictate text by voice. The indicator below shows active keyboard layout (UA / EN)',
                helpMath: 'Math hints',
                helpMathDesc: 'Type an expression like 2+2= and press space — a hint with the result appears. Enter to insert',
                helpSectionSettings: '⚙️ Notebook settings',
                helpDate: 'Date',
                helpDateDesc: 'Choose a date via the icon — the notebook header updates automatically (UA or EN format)',
                helpWorkType: 'Work type',
                helpWorkTypeDesc: '"Homework" or "Classwork" — shown in the header',
                helpFont: 'Font',
                helpFontDesc: '"Print" — Georgia italic; "Script" — handwritten Propysy font',
                helpBackground: 'Page background',
                helpBackgroundDesc: 'Lines, grid or clean page — choose based on your task',
                helpSectionSave: '💾 Saving',
                helpAutosave: 'Autosave',
                helpAutosaveDesc: 'All data is automatically saved in the browser (localStorage) — open the page next time and continue',
                helpSaveImage: 'Save as image',
                helpSaveImageDesc: '"Copy image" — copies to clipboard. "Save image" — downloads PNG (on mobile)',
                helpNotebookFile: 'Notebook file (.notebook)',
                helpNotebookFileDesc: 'Save the entire notebook to a file with the 💾 button on the top-left of the page. Restore from a file with 📁 — all pages, drawings and elements will return',
                helpSectionTextExtra: '✏️ Extra formatting',
                helpStrikethrough: 'Strikethrough text',
                helpStrikethroughDesc: 'Select text and press the strikethrough S button on the toolbar',
                helpSuperscript: 'Superscript (exponent)',
                helpSuperscriptDesc: 'Select text and press x² on the toolbar — useful for powers and exponents',
                helpSubscript: 'Subscript (index)',
                helpSubscriptDesc: 'Select text and press x₂ on the toolbar — for chemical formulas and indices',
                helpSymPanel: 'Special symbols panel',
                helpSymPanelDesc: 'Press the Ω button on the toolbar — a set of math and science symbols appears (√, π, ∞, ≤, °...). In grid mode — math symbols; otherwise — general',
                helpSectionPageMgmt: '📄 Page management',
                helpCopyPage: 'Copy page',
                helpCopyPageDesc: '"Copy page" button in the editor — duplicates the current page with all its content to a new page',
                helpDownloadPage: 'Download page',
                helpDownloadPageDesc: '"Download page" button — saves the current sheet as a PNG image to your device',
                helpDeletePage: 'Delete page',
                helpDeletePageDesc: 'The delete button (red) — removes the current page after confirmation. This action cannot be undone',
                helpSectionAdvanced: '🧩 Advanced elements',
                helpFreeText: 'Free text',
                helpFreeTextDesc: 'The T button on the toolbar — adds a floating text block. It can be moved, resized and rotated. Press × to delete',
                helpQr: 'QR code',
                helpQrDesc: 'The QR button on the toolbar — opens the generator. Enter a link or text, choose a size — the QR code is inserted on the sheet as an image',
                helpTimer: 'Timer',
                helpTimerDesc: 'The timer button on the toolbar — adds a draggable countdown. Click the digits to change the time. Presets available: 1, 5, 10, 15 minutes. A sound plays when time is up',
                helpSectionImageAdv: '🖼️ Images: extra actions',
                helpCrop: 'Crop image',
                helpCropDesc: 'Click an inserted image — the ✂️ button appears. Select the crop area and press "Apply"',
                helpSectionAI: '🤖 Artificial Intelligence (AI)',
                helpAiAssistant: 'AI Assistant',
                helpAiAssistantDesc: 'Click the star button on the toolbar to open the popup. Type or dictate a prompt, and the AI will generate text directly into your notebook',
                helpSpellCheck: 'Grammar check',
                helpSpellCheckDesc: 'Select any text in the notebook and click the green checkmark button — the AI will automatically correct spelling and punctuation mistakes',
                helpSectionCollab: '🌐 Collaboration',
                helpCollab: 'Online editing',
                helpCollabDesc: 'Click the 👥 button on the left panel. The teacher creates a session and gets a code. Students enter this code on their devices to join. Changes sync',
                // Collab modal
                collabTitle: 'Share notebook online',
                collabTabTeacher: '👩‍🏫 Teacher',
                collabTabStudent: '🎓 Student',
                collabCodeLabel: 'Code for students (click to copy):',
                collabCodeHint: 'or scan the QR code below',
                collabStatusInit: 'Initialising...',
                collabNoPeers: 'No students connected yet',
                collabProtectLabel: '🔒 Protect teacher\'s text',
                collabStopBtn: '🛑 Revoke access',
                collabCloseBtn: 'Close',
                collabNameLabel: 'First and last name:',
                collabNamePlaceholder: 'E.g.: Mary Smith',
                collabCodeInputLabel: 'Code from your teacher:',
                collabJoinBtn: 'Join',
                collabConnecting: 'Connecting...',
                collabReady: 'Ready! Waiting for students…',
                collabStudentsCount: 'Students: ',
                collabErrNoCode: '⚠️ Enter a 6-character code',
                collabErrNoName: '⚠️ Enter first and last name',
                collabErrNoFirebase: '❌ Firebase not initialised',
                collabErrNotFound: '❌ Session not found. Check the code.',
                collabSynced: '✅ Notebook synced!',
                collabTeacherEnded: '⚠️ The teacher ended the session',
                collabStudentSingular: 'student',
                collabStudentPlural: 'students',
                collabConnected: '🔗 Connected',
                collabAccessLabel: 'Share',
                collabEditing: ' is editing',
                collabConfirmStop: 'Revoke access for all students?',
                collabSessionEnded: 'Session ended. Open the menu to start a new one.',
                collabConnectedPrefix: '👥 Connected: ',
                collabStudentsListTitle: 'Students in notebook:',
                collabRemoveStudentBtn: 'Remove',
                collabConfirmRemoveStudent: 'Remove this student from the notebook?',
                collabStudentRemoved: 'You have been removed from this notebook',
                collabRemovedToastTitle: 'You were disconnected by the teacher',
                collabRemovedToastMsg: 'The teacher has removed you from this notebook.',
                collabTeacherCursorName: 'Teacher',
                collabErrZoneOverlap: 'This fragment already has access. Select another text or line.',
                collabDefaultName: 'No name',
                // Context menu
                ctxCopy: 'Copy',
                ctxCut: 'Cut',
                ctxPaste: 'Paste',
                ctxQr: 'Generate QR',
                ctxQrSel: 'Generate QR from selection',
                ctxSticker: 'Insert sticker',
                ctxTranslate: 'Translate',
                ctxTranslateSel: 'Translate selection',
                ctxTransliterate: 'Transliteration',
                ctxTransliterateSel: 'Transliterate selection',
                trLitTitle: 'Transliteration',
                trLitSource: 'Text',
                trLitResult: 'Result',
                trLitLangEn: '🇬🇧 English',
                trLitLangDe: '🇩🇪 German',
                trLitClose: 'Close',
                trLitInsert: 'Insert into notebook',
                ctxList: 'List',
                lspBullet: 'Bulleted list',
                lspNumbered: 'Numbered list',
                labelFile: 'File',
                labelLang: 'Language',
                labelType: 'Work type',
                labelFont: 'Font',
                labelBg: 'Ruling',
                aiTitle: 'AI Assistant',
                aiSubtitle: 'Describe what to generate and insert into the notebook',
                aiPlaceholder: 'E.g.: Write a poem about spring, Make 5 sentences in English, Explain the Pythagorean theorem...',
                aiHint: 'Enter — send &nbsp;·&nbsp; Shift+Enter — new line',
                aiSendBtn: 'Send',
                aiDictation: 'Voice input',
                trTitle: 'Text Translation',
                trDetectLang: 'Detect language',
                trSourcePlaceholder: 'Enter text to translate...',
                trResultPlaceholder: 'Translation will appear here...',
                trTranslating: 'Translating…',
                trError: 'Translation failed. Please try again.',
                trNetError: 'Connection error. Check your internet.',
                trCloseBtn: 'Close',
                trTranslateBtn: 'Translate',
                trInsertBtn: 'Insert into notebook',
                ctxEmbed: 'Smart Insert',
                embedTitle: 'Smart Insert',
                embedPlaceholder: 'Paste a YouTube link, iFrame, or HTML code...',
                embedCancel: 'Cancel',
                embedOk: 'Insert',
            },
            de: {
                title: 'Superheft!',
                typeHome: 'Hausarbeit',
                typeClass: 'Klassenarbeit',
                typeClean: 'Leer',
                fontPrint: 'Druck',
                fontHand: 'Schrift',
                bgLines: 'Liniert',
                bgGrid: 'Kariert',
                bgDiagonal: 'Schräg',
                bgClean: 'Leer',
                copyImage: 'Bild kopieren',
                saveImage: 'Bild speichern',
                editBtn: 'Bearbeiten',
                footer: 'Autor\u00a0',
                footerName: 'Ihor Shuliak',
                toastCopied: 'Kopiert!',
                undo: 'Rückgängig',
                redo: 'Wiederholen',
                bold: 'Fett',
                underline: 'Unterstrichen',
                strikethrough: 'Durchgestrichen',
                alignLeft: 'Links',
                alignCenter: 'Zentriert',
                alignRight: 'Rechts',
                draw: 'Zeichnen',
                eraser: 'Radiergummi',
                line: 'Linie',
                math: 'Mathematik (nur Kariert)',
                symPanel: 'Sonderzeichen',
                sticker: 'Notiz',
                addImage: 'Bild hinzufügen',
                mathPanel: 'Mathematik',
                mathTemplates: 'Vorlagen',
                mathFraction: 'Bruch',
                mathNumerator: 'Zähler',
                mathDenominator: 'Nenner',
                mathInsertFraction: 'Bruch',
                mathQuickPlaceholder: 'Formel eingeben, z.\u00a0B. (a+b)^2',
                mathInsert: 'Einfügen',
                mathGridOnly: 'Mathematik ist nur im Modus „Kariert" verfügbar',
                dictation: 'Spracheingabe',
                clear: 'Löschen',
                exit: 'Beenden',
                prevPage: 'Vorherige Seite',
                nextPage: 'Nächste Seite',
                addPage: 'Seite hinzufügen',
                ocrLang: 'Erkennungssprache',
                ocrUkrBtn: 'Ukrainisch',
                ocrEngBtn: 'Englisch',
                ocrCancel: 'Abbrechen',
                delSticker: 'Notiz löschen',
                superscript: 'Hochgestellt',
                subscript: 'Tiefgestellt',
                shapes: 'Formen',
                freetext: 'Freitext',
                qrGenerator: 'QR-Code-Generator',
                timer: 'Timer',
                copyPage: 'Seite kopieren',
                downloadPage: 'Seite herunterladen',
                closeEditor: 'Editor schließen',
                deletePage: 'Seite löschen',
                helpBtn: 'Hilfe',
                shapeRoundedRect: 'Abgerundetes Rechteck',
                shapeEllipse: 'Ellipse',
                shapeTriangle: 'Dreieck',
                shapeRightTriangle: 'Rechtwinkliges Dreieck',
                shapeDiamond: 'Raute',
                shapeStar: 'Stern',
                shapeArrowRight: 'Pfeil rechts',
                shapeArrowDouble: 'Doppelpfeil',
                shapeHeart: 'Herz',
                shapeHexagon: 'Sechseck',
                confirmDeletePage: 'Aktuelle Seite löschen?',
                confirmNo: 'Abbrechen',
                confirmYes: 'Löschen',
                confirmLoadTitle: 'Heft laden?',
                confirmLoadSub: 'Das aktuelle Heft wird durch die Datei ersetzt. Dies kann nicht rückgängig gemacht werden.',
                confirmLoadYes: 'Laden',
                confirmLoadNo: 'Abbrechen',
                toastNotebookSaved: '💾 Heft gespeichert!',
                toastNotebookLoaded: '✅ Heft geladen!',
                alertLoadError: 'Fehler beim Öffnen der Heftdatei',
                freetextTitle: '✏️ Freitext',
                freetextPlaceholder: 'Text eingeben...',
                freetextCancel: 'Abbrechen',
                freetextOk: 'Einfügen',
                qrTitle: 'QR-Code-Generator',
                qrInputPlaceholder: 'Link oder Text...',
                qrPlaceholderText: 'Text eingeben — QR erscheint hier',
                qrSize: 'Größe',
                qrCancel: 'Abbrechen',
                qrInsert: 'Ins Heft einfügen',
                qrInserted: '✓ QR-Code eingefügt!',
                timerStart: '▶ Start',
                timerPause: '⏸ Pause',
                timerResume: '▶ Fortsetzen',
                timerFinished: '⏰ Zeit abgelaufen!',
                timerReset: 'Zurücksetzen',
                timerClickToEdit: 'Klicken, um die Zeit zu ändern',
                cropApply: 'Zuschnitt anwenden',
                cropCancel: 'Abbrechen',
                alertMicNotAllowed: 'Bitte erlauben Sie den Mikrofonzugriff.',
                alertVoiceNotSupported: 'Spracheingabe wird in Ihrem Browser nicht unterstützt (wir empfehlen Google Chrome).',
                alertCopyNotSupported: 'Ihr Browser unterstützt das Kopieren von Bildern nicht. Versuchen Sie, die PNG herunterzuladen.',
                alertSaveError: 'Speicherfehler. Bitte versuchen Sie es erneut.',
                alertTesseractError: 'Tesseract.js konnte nicht geladen werden. Überprüfen Sie Ihre Internetverbindung.',
                ocrPickerTitle: 'Erkennungssprache',
                helpTitle: 'Bearbeitungsfunktionen',
                helpSubtitle: 'Superheft — vollständiger Leitfaden zu allen Funktionen',
                helpSectionText: '✏️ Text & Formatierung',
                helpBold: 'Fetter Text',
                helpBoldDesc: 'Text markieren und B oder Strg+B drücken',
                helpUnderline: 'Unterstrichener Text',
                helpUnderlineDesc: 'Text markieren und U oder Strg+U drücken',
                helpAlign: 'Ausrichtung',
                helpAlignDesc: 'Links, zentriert, rechts — Ausrichtungstasten in der Symbolleiste',
                helpColor: 'Textfarbe',
                helpColorDesc: 'Wählen Sie eine Farbe (blau, schwarz, rot, grün) in der Symbolleiste — gilt für neuen Text und Zeichnungen',
                helpSectionDraw: '🖊️ Zeichnen',
                helpPencil: 'Bleistift',
                helpPencilDesc: 'Freihandzeichnen. Bleistifttaste drücken zum Aktivieren. Langer Druck — Pinselgröße ändern',
                helpEraser: 'Radiergummi',
                helpEraserDesc: 'Löscht Zeichnungen. Langer Druck — Radiergröße ändern',
                helpLine: 'Linie',
                helpLineDesc: 'Zeichnet eine gerade Linie von Punkt zu Punkt',
                helpShapes: 'Formen',
                helpShapesDesc: '12 Formen: Rechtecke, Kreise, Dreiecke, Stern, Herz, Pfeile und mehr. Formen können verschoben und in der Größe geändert werden',
                helpSectionElements: '📌 Seitenelemente',
                helpStickers: 'Notizen',
                helpStickersDesc: 'Gelbe Notizen, die auf der Seite verschoben werden können. Notiztaste drücken, dann irgendwo klicken. Text ist bearbeitbar',
                helpImages: 'Bilder',
                helpImagesDesc: 'Fotos aus Dateien oder über Strg+V einfügen. Bilder können verschoben, in der Größe geändert und gelöscht werden',
                helpOcr: 'OCR — Texterkennung',
                helpOcrDesc: 'Auf einem eingefügten Bild die blaue T-Taste drücken — Text wird erkannt und eingefügt',
                helpSectionPages: '📄 Seiten & Navigation',
                helpNewPages: 'Neue Seiten',
                helpNewPagesDesc: 'Drücken Sie + oben rechts, um eine neue Seite hinzuzufügen. Mit Pfeilen wechseln',
                helpUndoRedo: 'Rückgängig / Wiederholen',
                helpUndoRedoDesc: 'Strg+Z — rückgängig, Strg+Umschalt+Z — wiederholen. Oder die ↩ ↪ Tasten in der Symbolleiste',
                helpSectionVoice: '🎙️ Sprache & Sprache',
                helpVoice: 'Spracheingabe',
                helpVoiceDesc: 'Mikrofontaste drücken — Text per Sprache diktieren. Die Anzeige unten zeigt das aktive Tastaturlayout (UA / EN / DE)',
                helpMath: 'Mathe-Hinweise',
                helpMathDesc: 'Ausdruck wie 2+2= eingeben und Leertaste drücken — ein Hinweis mit dem Ergebnis erscheint. Enter zum Einfügen',
                helpSectionSettings: '⚙️ Hefteinstellungen',
                helpDate: 'Datum',
                helpDateDesc: 'Datum über das Symbol wählen — die Heftüberschrift wird automatisch aktualisiert (UA-, EN- oder DE-Format)',
                helpWorkType: 'Arbeitstyp',
                helpWorkTypeDesc: '„Hausarbeit" oder „Klassenarbeit" — wird in der Überschrift angezeigt',
                helpFont: 'Schriftart',
                helpFontDesc: '„Druck" — Georgia kursiv; „Schrift" — handgeschriebene Propysy-Schrift',
                helpBackground: 'Seitenhintergrund',
                helpBackgroundDesc: 'Liniert, kariert oder leeres Blatt — je nach Aufgabe wählen',
                helpSectionSave: '💾 Speichern',
                helpAutosave: 'Automatisches Speichern',
                helpAutosaveDesc: 'Alle Daten werden automatisch im Browser (localStorage) gespeichert — Seite beim nächsten Mal öffnen und fortfahren',
                helpSaveImage: 'Als Bild speichern',
                helpSaveImageDesc: '„Bild kopieren" — kopiert in die Zwischenablage. „Bild speichern" — lädt PNG herunter (auf Mobilgeräten)',
                helpNotebookFile: 'Heftdatei (.notebook)',
                helpNotebookFileDesc: 'Gesamtes Heft mit der 💾 Taste oben links speichern. Mit 📁 aus Datei wiederherstellen — alle Seiten, Zeichnungen und Elemente kehren zurück',
                helpSectionTextExtra: '✏️ Zusätzliche Formatierung',
                helpStrikethrough: 'Durchgestrichener Text',
                helpStrikethroughDesc: 'Text markieren und die Durchstreichungs-S-Taste in der Symbolleiste drücken',
                helpSuperscript: 'Hochgestellt (Exponent)',
                helpSuperscriptDesc: 'Text markieren und x² in der Symbolleiste drücken — nützlich für Potenzen und Exponenten',
                helpSubscript: 'Tiefgestellt (Index)',
                helpSubscriptDesc: 'Text markieren und x₂ in der Symbolleiste drücken — für chemische Formeln und Indizes',
                helpSymPanel: 'Sonderzeichen-Panel',
                helpSymPanelDesc: 'Ω-Taste in der Symbolleiste drücken — Satz mathematischer und wissenschaftlicher Symbole (√, π, ∞, ≤, °...). Im Kariert-Modus — Mathe; sonst — allgemein',
                helpSectionPageMgmt: '📄 Seitenverwaltung',
                helpCopyPage: 'Seite kopieren',
                helpCopyPageDesc: '„Seite kopieren" im Editor — dupliziert die aktuelle Seite mit allem Inhalt auf eine neue Seite',
                helpDownloadPage: 'Seite herunterladen',
                helpDownloadPageDesc: '„Seite herunterladen" — speichert das aktuelle Blatt als PNG auf Ihrem Gerät',
                helpDeletePage: 'Seite löschen',
                helpDeletePageDesc: 'Löschtaste (rot) — entfernt die aktuelle Seite nach Bestätigung. Diese Aktion kann nicht rückgängig gemacht werden',
                helpSectionAdvanced: '🧩 Erweiterte Elemente',
                helpFreeText: 'Freitext',
                helpFreeTextDesc: 'T-Taste in der Symbolleiste — fügt einen schwebenden Textblock hinzu. Kann verschoben, in der Größe geändert und gedreht werden. × zum Löschen',
                helpQr: 'QR-Code',
                helpQrDesc: 'QR-Taste in der Symbolleiste — öffnet den Generator. Link oder Text eingeben, Größe wählen — QR-Code wird als Bild eingefügt',
                helpTimer: 'Timer',
                helpTimerDesc: 'Timer-Taste in der Symbolleiste — fügt einen verschiebbaren Countdown hinzu. Auf die Ziffern klicken, um die Zeit zu ändern. Voreinstellungen: 1, 5, 10, 15 Minuten. Signal bei Ablauf',
                helpSectionImageAdv: '🖼️ Bilder: zusätzliche Aktionen',
                helpCrop: 'Bild zuschneiden',
                helpCropDesc: 'Auf ein eingefügtes Bild klicken — ✂️ Taste erscheint. Zuschnittbereich wählen und „Anwenden" drücken',
                helpSectionAI: '🤖 Künstliche Intelligenz (KI)',
                helpAiAssistant: 'KI-Assistent',
                helpAiAssistantDesc: 'Stern-Taste in der Symbolleiste drücken — Popup öffnet sich. Anfrage eingeben oder diktieren, KI generiert Text direkt ins Heft',
                helpSpellCheck: 'Rechtschreibprüfung',
                helpSpellCheckDesc: 'Beliebigen Text im Heft markieren und die grüne Häkchen-Taste drücken — KI korrigiert automatisch Rechtschreib- und Zeichensetzungsfehler',
                helpSectionCollab: '🌐 Zusammenarbeit',
                helpCollab: 'Online-Bearbeitung',
                helpCollabDesc: '👥 Taste im linken Panel drücken. Lehrer erstellt Sitzung und erhält Code. Schüler geben Code auf ihren Geräten ein. Änderungen synchronisieren sich',
                collabTitle: 'Heft online teilen',
                collabTabTeacher: '👩‍🏫 Lehrer',
                collabTabStudent: '🎓 Schüler',
                collabCodeLabel: 'Code für Schüler (klicken zum Kopieren):',
                collabCodeHint: 'oder QR-Code unten scannen',
                collabStatusInit: 'Initialisierung...',
                collabNoPeers: 'Noch keine Schüler verbunden',
                collabProtectLabel: '🔒 Lehrertext schützen',
                collabStopBtn: '🛑 Zugriff widerrufen',
                collabCloseBtn: 'Schließen',
                collabNameLabel: 'Vor- und Nachname:',
                collabNamePlaceholder: 'Z.\u00a0B.: Max Mustermann',
                collabCodeInputLabel: 'Code vom Lehrer:',
                collabJoinBtn: 'Beitreten',
                collabConnecting: 'Verbinden...',
                collabReady: 'Bereit! Warte auf Schüler…',
                collabStudentsCount: 'Schüler: ',
                collabErrNoCode: '⚠️ 6-stelligen Code eingeben',
                collabErrNoName: '⚠️ Vor- und Nachname eingeben',
                collabErrNoFirebase: '❌ Firebase nicht initialisiert',
                collabErrNotFound: '❌ Sitzung nicht gefunden. Code überprüfen.',
                collabSynced: '✅ Heft synchronisiert!',
                collabTeacherEnded: '⚠️ Der Lehrer hat die Sitzung beendet',
                collabStudentSingular: 'Schüler',
                collabStudentPlural: 'Schüler',
                collabConnected: '🔗 Verbunden',
                collabAccessLabel: 'Teilen',
                collabEditing: ' bearbeitet',
                collabConfirmStop: 'Zugriff für alle Schüler widerrufen?',
                collabSessionEnded: 'Sitzung beendet. Menü öffnen für eine neue Sitzung.',
                collabConnectedPrefix: '👥 Verbunden: ',
                collabStudentsListTitle: 'Schüler im Heft:',
                collabRemoveStudentBtn: 'Entfernen',
                collabConfirmRemoveStudent: 'Diesen Schüler aus dem Heft entfernen?',
                collabStudentRemoved: 'Sie wurden aus diesem Heft entfernt',
                collabRemovedToastTitle: 'Sie wurden vom Lehrer getrennt',
                collabRemovedToastMsg: 'Der Lehrer hat Sie aus diesem Heft entfernt.',
                collabTeacherCursorName: 'Lehrer',
                collabErrZoneOverlap: 'Dieser Abschnitt hat bereits Zugriff. Anderen Text oder Zeile wählen.',
                collabDefaultName: 'Kein Name',
                ctxCopy: 'Kopieren',
                ctxCut: 'Ausschneiden',
                ctxPaste: 'Einfügen',
                ctxQr: 'QR generieren',
                ctxQrSel: 'QR aus Auswahl generieren',
                ctxSticker: 'Notiz einfügen',
                ctxTranslate: 'Übersetzen',
                ctxTranslateSel: 'Auswahl übersetzen',
                ctxTransliterate: 'Transliteration',
                ctxTransliterateSel: 'Auswahl transliterieren',
                trLitTitle: 'Transliteration',
                trLitSource: 'Text',
                trLitResult: 'Ergebnis',
                trLitLangEn: '🇬🇧 Englisch',
                trLitLangDe: '🇩🇪 Deutsch',
                trLitClose: 'Schließen',
                trLitInsert: 'Ins Heft einfügen',
                ctxList: 'Liste',
                lspBullet: 'Aufzählungsliste',
                lspNumbered: 'Nummerierte Liste',
                labelFile: 'Datei',
                labelLang: 'Sprache',
                labelType: 'Arbeitstyp',
                labelFont: 'Schriftart',
                labelBg: 'Hintergrund',
                aiTitle: 'KI-Assistent',
                aiSubtitle: 'Beschreiben Sie, was generiert und ins Heft eingefügt werden soll',
                aiPlaceholder: 'Z.\u00a0B.: Schreibe ein Gedicht über den Frühling, Bilde 5 Sätze auf Deutsch, Erkläre den Satz des Pythagoras...',
                aiHint: 'Enter — senden &nbsp;·&nbsp; Umschalt+Enter — neue Zeile',
                aiSendBtn: 'Senden',
                aiDictation: 'Spracheingabe',
                trTitle: 'Textübersetzung',
                trDetectLang: 'Sprache erkennen',
                trSourcePlaceholder: 'Text zum Übersetzen eingeben...',
                trResultPlaceholder: 'Übersetzung erscheint hier...',
                trTranslating: 'Übersetze…',
                trError: 'Übersetzung fehlgeschlagen. Bitte erneut versuchen.',
                trNetError: 'Verbindungsfehler. Internet überprüfen.',
                trCloseBtn: 'Schließen',
                trTranslateBtn: 'Übersetzen',
                trInsertBtn: 'Ins Heft einfügen',
                ctxEmbed: 'Intelligentes Einfügen',
                embedTitle: 'Intelligentes Einfügen',
                embedPlaceholder: 'YouTube-Link, iFrame oder HTML-Code einfügen...',
                embedCancel: 'Abbrechen',
                embedOk: 'Einfügen',
            }
        };

        function applyUiLanguage() {
            const t = uiText[state.lang] || uiText.ua;

            // Page title
            document.title = t.title;

            // Brand header title
            const brandTitle = document.querySelector('.brand-header__title');
            if (brandTitle) brandTitle.textContent = t.title;

            // ctrl-group labels
            const panel = document.querySelector('.controls-panel');
            if (panel) {
                const labels = panel.querySelectorAll('.ctrl-group-label');
                const keys = ['labelFile', 'labelLang', 'labelType', 'labelFont', 'labelBg'];
                labels.forEach((el, i) => { if (keys[i]) el.textContent = t[keys[i]] || el.textContent; });
            }

            // typeToggle buttons
            const typeToggle = document.getElementById('typeToggle');
            typeToggle.querySelectorAll('.segmented-btn').forEach(btn => {
                if (btn.dataset.val === 'home') btn.textContent = t.typeHome;
                if (btn.dataset.val === 'class') btn.textContent = t.typeClass;
                if (btn.dataset.val === 'clean') btn.textContent = t.typeClean;
            });

            // fontToggle buttons
            const fontToggle = document.getElementById('fontToggle');
            fontToggle.querySelectorAll('.segmented-btn').forEach(btn => {
                if (btn.dataset.val === 'font-print') btn.textContent = t.fontPrint;
                if (btn.dataset.val === 'font-hand') btn.textContent = t.fontHand;
            });

            // bgToggle buttons
            const bgToggle = document.getElementById('bgToggle');
            bgToggle.querySelectorAll('.segmented-btn').forEach(btn => {
                if (btn.dataset.val === 'bg-lines') btn.textContent = t.bgLines;
                if (btn.dataset.val === 'bg-grid') btn.textContent = t.bgGrid;
                if (btn.dataset.val === 'bg-diagonal') btn.textContent = t.bgDiagonal;
                if (btn.dataset.val === 'bg-clean') btn.textContent = t.bgClean;
            });

            // Action buttons (edit)
            const actionBtns = document.querySelectorAll('.actions-panel .action-btn');
            actionBtns.forEach(btn => {
                if (btn.id === 'boardModeBtn') {
                    const svg = btn.querySelector('svg');
                    btn.innerHTML = '';
                    if (svg) btn.appendChild(svg);
                    btn.appendChild(document.createTextNode(' ' + t.editBtn));
                }
            });

            // Footer
            const footer = document.querySelector('.author-footer');
            if (footer) {
                const link = footer.querySelector('a');
                if (link) {
                    link.textContent = t.footerName;
                    footer.childNodes[0].textContent = t.footer;
                }
            }

            // Toast default text
            const toast = document.getElementById('toast');
            if (toast && (toast.textContent === 'Скопійовано!' || toast.textContent === 'Copied!')) {
                toast.textContent = t.toastCopied;
            }

            // Board toolbar tool titles
            const toolbarBtns = document.querySelectorAll('.board-toolbar .tool-btn');
            toolbarBtns.forEach(btn => {
                const title = btn.getAttribute('title');
                const titleMap = {
                    'Відмінити': t.undo, 'Undo': t.undo,
                    'Повторити': t.redo, 'Redo': t.redo,
                    'Жирний': t.bold, 'Bold': t.bold,
                    'Підкреслений': t.underline, 'Underline': t.underline,
                    'Зачеркнутий': t.strikethrough, 'Strikethrough': t.strikethrough,
                    'По лівому краю': t.alignLeft, 'Align left': t.alignLeft,
                    'По центру': t.alignCenter, 'Center': t.alignCenter,
                    'По правому краю': t.alignRight, 'Align right': t.alignRight,
                    'Малювати': t.draw, 'Draw': t.draw,
                    'Стирачка': t.eraser, 'Eraser': t.eraser,
                    'Лінія': t.line, 'Line': t.line,
                    'Математика (лише клітинка)': t.math, 'Math (grid only)': t.math,
                    'Спеціальні символи': t.symPanel, 'Special characters': t.symPanel,
                    'Стікер': t.sticker, 'Sticker': t.sticker,
                    'Довільний текст': 'Довільний текст', 'Free text': 'Free text',
                    'Додати зображення': t.addImage, 'Add image': t.addImage,
                    'Голосове введення': t.dictation, 'Voice input': t.dictation,
                    'Очистити': t.clear, 'Clear': t.clear,
                    'Вийти': t.exit, 'Exit': t.exit,
                    'AI помічник': t.aiTitle, 'AI Assistant': t.aiTitle,
                };
                if (title && titleMap[title]) btn.setAttribute('title', titleMap[title]);
            });

            // Page switcher button titles
            const prevBtn = document.querySelector('.page-btn[onclick="prevPage()"]');
            const nextBtn = document.querySelector('.page-btn[onclick="nextPage()"]');
            const addPageBtn = document.querySelector('.page-btn[onclick="addPage()"]');
            if (prevBtn) prevBtn.setAttribute('title', t.prevPage);
            if (nextBtn) nextBtn.setAttribute('title', t.nextPage);
            if (addPageBtn) addPageBtn.setAttribute('title', t.addPage);

            const mathTitle = document.querySelector('#mathPanel .math-panel-title');
            if (mathTitle) mathTitle.textContent = t.mathPanel;
            const mathSub = document.querySelector('#mathPanel .math-panel-subtitle');
            if (mathSub) mathSub.textContent = t.mathTemplates;
            const mathFracTitle = document.getElementById('mathFractionTitle');
            if (mathFracTitle) mathFracTitle.textContent = t.mathFraction;
            const mathFracNum = document.getElementById('mathFracNum');
            if (mathFracNum) mathFracNum.placeholder = t.mathNumerator;
            const mathFracDen = document.getElementById('mathFracDen');
            if (mathFracDen) mathFracDen.placeholder = t.mathDenominator;
            const mathFracBtn = document.getElementById('mathFracBtn');
            if (mathFracBtn) mathFracBtn.textContent = t.mathInsertFraction;
            const mathInput = document.getElementById('mathQuickInput');
            if (mathInput) mathInput.placeholder = t.mathQuickPlaceholder;
            const mathInsertBtn = document.querySelector('#mathPanel .math-panel-input-row button');
            if (mathInsertBtn) mathInsertBtn.textContent = t.mathInsert;
            const mathEditorBtn = document.getElementById('mathEditorTool');
            if (mathEditorBtn) mathEditorBtn.setAttribute('title', t.mathPanel);

            // Extra toolbar tool titles
            const extraTitleMap = {
                'Надрядковий': t.superscript, 'Superscript': t.superscript,
                'Підрядковий': t.subscript, 'Subscript': t.subscript,
                'Фігури': t.shapes, 'Shapes': t.shapes,
                'Довільний текст': t.freetext, 'Free text': t.freetext,
                'Генератор QR-коду': t.qrGenerator, 'QR Code Generator': t.qrGenerator,
                'Таймер': t.timer, 'Timer': t.timer,
                'Копіювати сторінку': t.copyPage, 'Copy page': t.copyPage,
                'Скачати сторінку': t.downloadPage, 'Download page': t.downloadPage,
                'Закрити режим редагування': t.closeEditor, 'Close editor': t.closeEditor,
                'Видалити сторінку': t.deletePage, 'Delete page': t.deletePage,
                'Довідка': t.helpBtn, 'Help': t.helpBtn,
            };
            document.querySelectorAll('[title]').forEach(el => {
                const cur = el.getAttribute('title');
                if (extraTitleMap[cur]) el.setAttribute('title', extraTitleMap[cur]);
            });

            // Shape picker titles
            const shapeTitleMap = {
                'Заокруглений прямокутник': t.shapeRoundedRect, 'Rounded rectangle': t.shapeRoundedRect,
                'Еліпс': t.shapeEllipse, 'Ellipse': t.shapeEllipse,
                'Трикутник': t.shapeTriangle, 'Triangle': t.shapeTriangle,
                'Прямокутний трикутник': t.shapeRightTriangle, 'Right triangle': t.shapeRightTriangle,
                'Ромб': t.shapeDiamond, 'Diamond': t.shapeDiamond,
                'Зірка': t.shapeStar, 'Star': t.shapeStar,
                'Стрілка вправо': t.shapeArrowRight, 'Arrow right': t.shapeArrowRight,
                'Двостороння стрілка': t.shapeArrowDouble, 'Double arrow': t.shapeArrowDouble,
                'Серце': t.shapeHeart, 'Heart': t.shapeHeart,
                'Шестикутник': t.shapeHexagon, 'Hexagon': t.shapeHexagon,
            };
            document.querySelectorAll('.shape-opt[title]').forEach(el => {
                const cur = el.getAttribute('title');
                if (shapeTitleMap[cur]) el.setAttribute('title', shapeTitleMap[cur]);
            });

            // Confirm modal buttons
            const confirmNoBtn = document.getElementById('confirmNoBtn');
            if (confirmNoBtn) confirmNoBtn.textContent = t.confirmNo;
            const confirmYesBtn = document.getElementById('confirmYesBtn');
            if (confirmYesBtn) confirmYesBtn.textContent = t.confirmYes;

            // Freetext modal
            const freetextModalTitle = document.getElementById('freetextModalTitle');
            if (freetextModalTitle) freetextModalTitle.textContent = t.freetextTitle;
            const freetextInput = document.getElementById('freetextInput');
            if (freetextInput) freetextInput.placeholder = t.freetextPlaceholder;
            const freetextCancelBtn = document.getElementById('freetextCancelBtn');
            if (freetextCancelBtn) freetextCancelBtn.textContent = t.freetextCancel;
            const freetextOkBtn = document.getElementById('freetextOkBtn');
            if (freetextOkBtn) freetextOkBtn.textContent = t.freetextOk;

            // QR modal
            const qrModalTitle = document.getElementById('qrModalTitle');
            if (qrModalTitle) {
                const svg = qrModalTitle.querySelector('svg');
                qrModalTitle.innerHTML = '';
                if (svg) qrModalTitle.appendChild(svg);
                qrModalTitle.appendChild(document.createTextNode(' ' + t.qrTitle));
            }
            const qrInput = document.getElementById('qrInput');
            if (qrInput) qrInput.placeholder = t.qrInputPlaceholder;
            const qrPlaceholder = document.getElementById('qrPlaceholder');
            if (qrPlaceholder && qrPlaceholder.style.display !== 'none') qrPlaceholder.textContent = t.qrPlaceholderText;
            const qrSizeLabel = document.querySelector('#qrSizeRow span');
            if (qrSizeLabel) qrSizeLabel.textContent = t.qrSize + ':';
            const qrCancelBtn = document.getElementById('qrCancelBtn');
            if (qrCancelBtn) qrCancelBtn.textContent = t.qrCancel;
            const qrInsertBtn = document.getElementById('qrInsertBtn');
            if (qrInsertBtn && !qrInsertBtn._justInserted) qrInsertBtn.textContent = t.qrInsert;

            // Active timers — update button labels
            document.querySelectorAll('.board-timer').forEach(timerEl => {
                const startBtn = timerEl.querySelector('.timer-start-btn');
                if (startBtn) {
                    const cur = startBtn.textContent.trim();
                    const startLabels = ['▶ Старт', '▶ Start'];
                    const pauseLabels = ['⏸ Пауза', '⏸ Pause'];
                    const resumeLabels = ['▶ Продовжити', '▶ Resume'];
                    const finishedLabels = ['⏰ Час!', "⏰ Time's up!"];
                    if (startLabels.includes(cur)) startBtn.textContent = t.timerStart;
                    else if (pauseLabels.includes(cur)) startBtn.textContent = t.timerPause;
                    else if (resumeLabels.includes(cur)) startBtn.textContent = t.timerResume;
                    else if (finishedLabels.includes(cur)) startBtn.textContent = t.timerFinished;
                }
                const resetBtn = timerEl.querySelector('.timer-reset-btn');
                if (resetBtn) resetBtn.title = t.timerReset;
            });

            // Help modal
            const helpTitleEl = document.querySelector('.help-title');
            if (helpTitleEl) {
                const svg = helpTitleEl.querySelector('svg');
                helpTitleEl.innerHTML = '';
                if (svg) helpTitleEl.appendChild(svg);
                helpTitleEl.appendChild(document.createTextNode(' ' + t.helpTitle));
            }
            const helpSubtitle = document.querySelector('.help-subtitle');
            if (helpSubtitle) helpSubtitle.textContent = t.helpSubtitle;

            // Help sections — map by data index
            const helpSections = document.querySelectorAll('.help-section');
            const helpData = [
                // [sectionTitle, [[label, desc], ...]]
                [t.helpSectionText, [
                    [t.helpBold, t.helpBoldDesc],
                    [t.helpUnderline, t.helpUnderlineDesc],
                    [t.helpAlign, t.helpAlignDesc],
                    [t.helpColor, t.helpColorDesc],
                ]],
                [t.helpSectionDraw, [
                    [t.helpPencil, t.helpPencilDesc],
                    [t.helpEraser, t.helpEraserDesc],
                    [t.helpLine, t.helpLineDesc],
                    [t.helpShapes, t.helpShapesDesc],
                ]],
                [t.helpSectionElements, [
                    [t.helpStickers, t.helpStickersDesc],
                    [t.helpImages, t.helpImagesDesc],
                    [t.helpOcr, t.helpOcrDesc],
                ]],
                [t.helpSectionPages, [
                    [t.helpNewPages, t.helpNewPagesDesc],
                    [t.helpUndoRedo, t.helpUndoRedoDesc],
                ]],
                [t.helpSectionVoice, [
                    [t.helpVoice, t.helpVoiceDesc],
                    [t.helpMath, t.helpMathDesc],
                ]],
                [t.helpSectionSettings, [
                    [t.helpDate, t.helpDateDesc],
                    [t.helpWorkType, t.helpWorkTypeDesc],
                    [t.helpFont, t.helpFontDesc],
                    [t.helpBackground, t.helpBackgroundDesc],
                ]],
                [t.helpSectionSave, [
                    [t.helpAutosave, t.helpAutosaveDesc],
                    [t.helpSaveImage, t.helpSaveImageDesc],
                    [t.helpNotebookFile, t.helpNotebookFileDesc],
                ]],
                [t.helpSectionTextExtra, [
                    [t.helpStrikethrough, t.helpStrikethroughDesc],
                    [t.helpSuperscript, t.helpSuperscriptDesc],
                    [t.helpSubscript, t.helpSubscriptDesc],
                    [t.helpSymPanel, t.helpSymPanelDesc],
                ]],
                [t.helpSectionPageMgmt, [
                    [t.helpCopyPage, t.helpCopyPageDesc],
                    [t.helpDownloadPage, t.helpDownloadPageDesc],
                    [t.helpDeletePage, t.helpDeletePageDesc],
                ]],
                [t.helpSectionAdvanced, [
                    [t.helpFreeText, t.helpFreeTextDesc],
                    [t.helpQr, t.helpQrDesc],
                    [t.helpTimer, t.helpTimerDesc],
                ]],
                [t.helpSectionImageAdv, [
                    [t.helpCrop, t.helpCropDesc],
                ]],
                [t.helpSectionAI, [
                    [t.helpAiAssistant, t.helpAiAssistantDesc],
                    [t.helpSpellCheck, t.helpSpellCheckDesc],
                ]],
                [t.helpSectionCollab, [
                    [t.helpCollab, t.helpCollabDesc],
                ]],
            ];
            helpSections.forEach((section, si) => {
                if (!helpData[si]) return;
                const [secTitle, rows] = helpData[si];
                const titleEl = section.querySelector('.help-section-title');
                if (titleEl) titleEl.textContent = secTitle;
                const rowEls = section.querySelectorAll('.help-row');
                rowEls.forEach((row, ri) => {
                    if (!rows[ri]) return;
                    const labelEl = row.querySelector('.help-label');
                    const descEl = row.querySelector('.help-desc');
                    if (labelEl) labelEl.textContent = rows[ri][0];
                    if (descEl) {
                        // Preserve kbd elements, just update text nodes
                        const kbds = Array.from(descEl.querySelectorAll('.help-kbd'));
                        descEl.textContent = rows[ri][1];
                    }
                });
            });

            // ── Context menu ──
            const ctxCopyEl = document.getElementById('ctxCopy');
            if (ctxCopyEl) ctxCopyEl.childNodes[ctxCopyEl.childNodes.length - 1].textContent = ' ' + t.ctxCopy;
            const ctxCutEl = document.getElementById('ctxCut');
            if (ctxCutEl) ctxCutEl.childNodes[ctxCutEl.childNodes.length - 1].textContent = ' ' + t.ctxCut;
            const ctxPasteEl = document.getElementById('ctxPaste');
            if (ctxPasteEl) ctxPasteEl.childNodes[ctxPasteEl.childNodes.length - 1].textContent = ' ' + t.ctxPaste;
            const ctxQrEl = document.getElementById('ctxQr');
            if (ctxQrEl) {
                var ctxQrLast = ctxQrEl.childNodes[ctxQrEl.childNodes.length - 1];
                if (ctxQrLast && ctxQrLast.nodeType === 3)
                    ctxQrLast.textContent = ' ' + t.ctxQr;
                ctxQrEl._labelDefault = t.ctxQr;
                ctxQrEl._labelSel = t.ctxQrSel;
            }
            const ctxStickerEl = document.getElementById('ctxSticker');
            if (ctxStickerEl) ctxStickerEl.childNodes[ctxStickerEl.childNodes.length - 1].textContent = ' ' + t.ctxSticker;
            const ctxTranslateEl = document.getElementById('ctxTranslate');
            if (ctxTranslateEl) {
                var ctxTrLast = ctxTranslateEl.childNodes[ctxTranslateEl.childNodes.length - 1];
                if (ctxTrLast && ctxTrLast.nodeType === 3)
                    ctxTrLast.textContent = ' ' + t.ctxTranslate;
                ctxTranslateEl._labelDefault = t.ctxTranslate;
                ctxTranslateEl._labelSel = t.ctxTranslateSel;
            }
            const ctxTranslitEl = document.getElementById('ctxTranslit');
            if (ctxTranslitEl) {
                var ctxTlLast = ctxTranslitEl.childNodes[ctxTranslitEl.childNodes.length - 1];
                if (ctxTlLast && ctxTlLast.nodeType === 3)
                    ctxTlLast.textContent = ' ' + t.ctxTransliterate;
                ctxTranslitEl._labelDefault = t.ctxTransliterate;
                ctxTranslitEl._labelSel = t.ctxTransliterateSel;
            }
            const tlTitleEl = document.getElementById('translitModalTitle');
            if (tlTitleEl) {
                var tlTitleText = tlTitleEl.childNodes[tlTitleEl.childNodes.length - 1];
                if (tlTitleText && tlTitleText.nodeType === 3) tlTitleText.textContent = ' ' + t.trLitTitle;
            }
            const tlSrcLbl = document.getElementById('tlSourceLabel');
            if (tlSrcLbl) tlSrcLbl.textContent = t.trLitSource;
            const tlResLbl = document.getElementById('tlResultLabel');
            if (tlResLbl) tlResLbl.textContent = t.trLitResult;
            const tlLangEnBtn = document.getElementById('tlLangEn');
            if (tlLangEnBtn) tlLangEnBtn.textContent = t.trLitLangEn;
            const tlLangDeBtn = document.getElementById('tlLangDe');
            if (tlLangDeBtn) tlLangDeBtn.textContent = t.trLitLangDe;
            const tlCancelBtnEl = document.getElementById('tlCancelBtn');
            if (tlCancelBtnEl) tlCancelBtnEl.textContent = t.trLitClose;
            const tlInsertBtnEl = document.getElementById('tlInsertBtn');
            if (tlInsertBtnEl) tlInsertBtnEl.textContent = t.trLitInsert;
            const ctxListEl = document.getElementById('ctxList');
            if (ctxListEl) ctxListEl.childNodes[ctxListEl.childNodes.length - 1].textContent = ' ' + t.ctxList;
            const lspBtns = document.querySelectorAll('#ctxListPicker .lsp-btn');
            if (lspBtns[0]) lspBtns[0].childNodes[lspBtns[0].childNodes.length - 1].textContent = ' ' + t.lspBullet;
            if (lspBtns[1]) lspBtns[1].childNodes[lspBtns[1].childNodes.length - 1].textContent = ' ' + t.lspNumbered;

            // Embed (Smart Insert) context menu item + modal buttons
            const ctxEmbedEl = document.getElementById('ctxEmbed');
            if (ctxEmbedEl) ctxEmbedEl.childNodes[ctxEmbedEl.childNodes.length - 1].textContent = ' ' + t.ctxEmbed;
            const embedCancelBtnEl = document.getElementById('embedCancelBtn');
            if (embedCancelBtnEl) embedCancelBtnEl.textContent = t.embedCancel;
            const embedOkBtnEl = document.getElementById('embedOkBtn');
            if (embedOkBtnEl) embedOkBtnEl.textContent = t.embedOk;
            const mfbBulletEl = document.getElementById('mfbBulletList');
            if (mfbBulletEl) mfbBulletEl.title = t.lspBullet;
            const mfbNumberedEl = document.getElementById('mfbNumberedList');
            if (mfbNumberedEl) mfbNumberedEl.title = t.lspNumbered;

            const collabTitleEl = document.querySelector('#collabBox .ctitle');
            if (collabTitleEl) {
                const svg = collabTitleEl.querySelector('svg');
                collabTitleEl.innerHTML = '';
                if (svg) collabTitleEl.appendChild(svg);
                collabTitleEl.appendChild(document.createTextNode('\u00A0' + t.collabTitle));
            }
            const cTabT = document.getElementById('cTabT');
            if (cTabT) cTabT.textContent = t.collabTabTeacher;
            const cTabS = document.getElementById('cTabS');
            if (cTabS) cTabS.textContent = t.collabTabStudent;
            // Teacher panel — static labels
            const cCodeLabelEl = document.querySelector('#cPanelT .clabel');
            if (cCodeLabelEl) cCodeLabelEl.textContent = t.collabCodeLabel;
            const cCodeHintEl = document.querySelector('#cPanelT .chint');
            if (cCodeHintEl) cCodeHintEl.textContent = t.collabCodeHint;
            const cStopBtnEl = document.querySelector('#cPanelT .cbtn-red');
            if (cStopBtnEl) cStopBtnEl.textContent = t.collabStopBtn;
            document.querySelectorAll('#cPanelT .cbtn-gray, #cPanelS .cbtn-gray').forEach(btn => {
                btn.textContent = t.collabCloseBtn;
            });
            // Student panel
            const cPanelS = document.getElementById('cPanelS');
            if (cPanelS) {
                const sLabels = cPanelS.querySelectorAll('.clabel');
                if (sLabels[0]) sLabels[0].textContent = t.collabNameLabel;
                if (sLabels[1]) sLabels[1].textContent = t.collabCodeInputLabel;
                const cNameEl = document.getElementById('cName');
                if (cNameEl) cNameEl.placeholder = t.collabNamePlaceholder;
                const cJoinBtnEl = document.getElementById('cJoinBtn');
                if (cJoinBtnEl && cJoinBtnEl.textContent !== t.collabJoinBtn)
                    cJoinBtnEl.textContent = t.collabJoinBtn;
            }

            // AI Assistant popup
            const aiPromptPopup = document.getElementById('aiPromptPopup');
            if (aiPromptPopup) {
                const aiTitle = aiPromptPopup.querySelector('.ai-prompt-title');
                if (aiTitle) aiTitle.textContent = t.aiTitle;
                const aiSubtitle = aiPromptPopup.querySelector('.ai-prompt-subtitle');
                if (aiSubtitle) aiSubtitle.textContent = t.aiSubtitle;
                const aiInput = document.getElementById('aiPromptInput');
                if (aiInput) aiInput.placeholder = t.aiPlaceholder;
                const aiHint = aiPromptPopup.querySelector('.ai-prompt-hint');
                if (aiHint) aiHint.innerHTML = t.aiHint;
                const aiMicBtn = document.getElementById('aiPromptMicBtn');
                if (aiMicBtn) aiMicBtn.title = t.aiDictation;
                const aiSendBtn = document.getElementById('aiPromptSendBtn');
                if (aiSendBtn) {
                    const txtNode = Array.from(aiSendBtn.childNodes).find(n => n.nodeType === 3 && n.textContent.trim().length > 0);
                    if (txtNode) txtNode.textContent = ' ' + t.aiSendBtn;
                }
            }

            // Translator modal
            const trTitleEl = document.getElementById('translateModalTitle');
            if (trTitleEl) {
                const trTitleText = trTitleEl.childNodes[trTitleEl.childNodes.length - 1];
                if (trTitleText && trTitleText.nodeType === 3) trTitleText.textContent = ' ' + t.trTitle;
            }
            const trDetectOpt = document.querySelector('#trLangFrom option[value="auto"]');
            if (trDetectOpt) trDetectOpt.textContent = t.trDetectLang;
            const trSrcEl = document.getElementById('trSource');
            if (trSrcEl) trSrcEl.placeholder = t.trSourcePlaceholder;
            const trResEl = document.getElementById('trResult');
            if (trResEl) trResEl.placeholder = t.trResultPlaceholder;
            const trCancelBtnEl = document.getElementById('trCancelBtn');
            if (trCancelBtnEl) trCancelBtnEl.textContent = t.trCloseBtn;
            const trTranslateBtnEl = document.getElementById('trTranslateBtn');
            if (trTranslateBtnEl) trTranslateBtnEl.textContent = t.trTranslateBtn;
            const trInsertBtnEl = document.getElementById('trInsertBtn');
            if (trInsertBtnEl) trInsertBtnEl.textContent = t.trInsertBtn;
        }

        // === YOUTUBE ВІКНА ===
        var allYtWindows = JSON.parse(localStorage.getItem('board_yt_windows')) || {};

        function saveYtWindows() {
            try {
                localStorage.setItem('board_yt_windows', JSON.stringify(allYtWindows));
            } catch (e) {
                console.warn('Не вдалось зберегти YouTube вікна:', e);
            }
        }

        function getPageYtWindows() {
            return allYtWindows[currentPageIndex] || [];
        }

        function setPageYtWindows(list) {
            allYtWindows[currentPageIndex] = list;
        }

        function triggerImageUpload() {
            const wasBoardMode = document.body.classList.contains('board-mode');
            const isMobile = window.innerWidth <= 900 || ('ontouchstart' in window);
            // На десктопі відкриття file picker виходить з fullscreen — запам'ятовуємо стан
            let desktopRestorePending = false;

            if (wasBoardMode) {
                if (!isMobile) {
                    // Десктоп: file picker скидає fullscreen — ігноруємо наступний fullscreenchange
                    desktopRestorePending = true;
                    const onFsChange = () => {
                        if (!desktopRestorePending) return;
                        desktopRestorePending = false;
                        suppressFullscreenChange = true;
                        document.removeEventListener('fullscreenchange', onFsChange);
                        document.removeEventListener('webkitfullscreenchange', onFsChange);
                        // Відновлюємо board-mode без fullscreen після повернення фокусу
                        const restoreDesktop = () => {
                            suppressFullscreenChange = false;
                            isBoardMode = true;
                            document.body.classList.add('board-mode');
                            updateDateHeaderVisibility();
                            var _sp3 = (window._collabRole==='student'&&window._collabProtect);
                            if (!_sp3) editor.setAttribute('contenteditable', 'true');
                            document.getElementById('displayDate').setAttribute('contenteditable', !_sp3);
                            document.getElementById('displayType').setAttribute('contenteditable', !_sp3);
                            setTimeout(() => { syncCanvasSize(); editor.focus(); }, 100);
                            window.removeEventListener('focus', restoreDesktop);
                        };
                        window.addEventListener('focus', restoreDesktop, { once: true });
                    };
                    document.addEventListener('fullscreenchange', onFsChange);
                    document.addEventListener('webkitfullscreenchange', onFsChange);
                } else {
                    // Мобільний: відновлюємо через visibilitychange/focus
                    const restore = () => {
                        if (!document.body.classList.contains('board-mode')) {
                            document.body.classList.add('board-mode');
                            document.body.style.overflow = 'hidden';
                        }
                        document.removeEventListener('visibilitychange', restore);
                        window.removeEventListener('focus', restore);
                    };
                    document.addEventListener('visibilitychange', () => {
                        if (!document.hidden) restore();
                    });
                    window.addEventListener('focus', restore, { once: true });
                }
            }

            document.getElementById('imageFileInput').click();
        }

        function handleImageUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            e.target.value = '';

            // Гарантовано відновлюємо board-mode якщо він був
            if (isBoardMode && !document.body.classList.contains('board-mode')) {
                document.body.classList.add('board-mode');
                document.body.style.overflow = 'hidden';
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                const src = ev.target.result;
                const id = Date.now();
                const rect = card.getBoundingClientRect();
                const x = Math.round(card.scrollLeft + rect.width / 2 - 100);
                const y = Math.round(card.scrollTop + rect.height / 3);
                const data = { id, src, x, y, w: 200, h: 200 };

                const list = getPageImages();
                list.push(data);
                setPageImages(list);
                saveImages();

                const el = createImageEl(data);
                card.appendChild(el);

                // Ще раз після рендеру — на деяких iOS браузерах потрібна затримка
                if (isBoardMode) {
                    setTimeout(() => {
                        document.body.classList.add('board-mode');
                        document.body.style.overflow = 'hidden';
                    }, 100);
                }
            };
            reader.readAsDataURL(file);
        }

        function createImageEl(data) {
            const el = document.createElement('div');
            el.className = 'board-image';
            el.id = 'bimg-' + data.id;
            el.style.left = data.x + 'px';
            el.style.top = data.y + 'px';
            el.style.width = data.w + 'px';
            el.style.height = data.h + 'px';

            const img = document.createElement('img');
            img.src = data.src;
            img.draggable = false;

            const delBtn = document.createElement('button');
            delBtn.className = 'board-image-delete';
            delBtn.title = 'Видалити зображення';
            delBtn.textContent = '×';
            delBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteImage(data.id, el);
            });

            const ocrBtn = document.createElement('button');
            ocrBtn.className = 'board-image-ocr';
            ocrBtn.title = 'Розпізнати текст';
            ocrBtn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`;
            ocrBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
            ocrBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                recognizeImageText(data, ocrBtn);
            });

            const cropBtn = document.createElement('button');
            cropBtn.className = 'board-image-crop';
            cropBtn.title = 'Обрізати зображення';
            cropBtn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>`;
            cropBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
            cropBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openImageCropper(data, el, img);
            });

            const cutoutBtn = document.createElement('button');
            cutoutBtn.className = 'board-image-cutout';
            cutoutBtn.title = 'Вирізати фон (AI)';
            cutoutBtn.innerHTML = `✂`;
            cutoutBtn.style.fontSize = '13px';
            cutoutBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
            cutoutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeBgFromImage(data, el, img, cutoutBtn);
            });

            const flipBtn = document.createElement('button');
            flipBtn.className = 'board-image-flip';
            const _flipLang = (typeof state !== 'undefined' && state.lang) || 'ua';
            flipBtn.title = _flipLang === 'en' ? 'Mirror image' : _flipLang === 'de' ? 'Spiegeln' : 'Відобразити';
            flipBtn.innerHTML = `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M4 8l4 4-4 4"/><path d="M20 8l-4 4 4 4"/></svg>`;
            flipBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
            flipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                data.flipped = !data.flipped;
                img.style.transform = data.flipped ? 'scaleX(-1)' : '';
                saveImages();
            });


            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'board-image-resize';
            resizeHandle.title = 'Змінити розмір';
            makeResizable(el, resizeHandle, data);

            const resizeHandleTL = document.createElement('div');
            resizeHandleTL.className = 'board-image-resize-tl';
            resizeHandleTL.title = 'Змінити розмір';
            makeResizableTL(el, resizeHandleTL, data);

            const rotateHandle = document.createElement('div');
            rotateHandle.className = 'board-image-rotate';
            rotateHandle.title = 'Повернути зображення';
            rotateHandle.innerHTML = `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`;
            makeRotatable(el, rotateHandle, data);

            // Apply saved rotation
            if (data.rotation) {
                el.style.transform = `rotate(${data.rotation}deg)`;
            }

            // Apply saved flip
            if (data.flipped) {
                img.style.transform = 'scaleX(-1)';
            }

            el.appendChild(img);
            el.appendChild(delBtn);
            el.appendChild(ocrBtn);
            el.appendChild(cropBtn);
            el.appendChild(cutoutBtn);
            el.appendChild(flipBtn);
            el.appendChild(resizeHandle);
            el.appendChild(resizeHandleTL);
            el.appendChild(rotateHandle);

            makeImageDraggable(el, data);

            // Click to select / deselect
            el.addEventListener('pointerdown', () => {
                document.querySelectorAll('.board-image.selected').forEach(b => b.classList.remove('selected'));
                el.classList.add('selected');
            });

            return el;
        }

        // === YOUTUBE FLOATING WINDOW ===
        function createYoutubeFloatWindow(data, cardEl) {
            const win = document.createElement('div');
            win.className = 'yt-float-window';

            win.style.left = data.x + 'px';
            win.style.top = data.y + 'px';
            if (data.w) win.style.width = data.w + 'px';

            // Header bar
            const header = document.createElement('div');
            header.className = 'yt-float-header';

            const icon = document.createElement('div');
            icon.className = 'yt-float-header-icon';
            if (data.videoId) {
                icon.innerHTML = '<svg viewBox="0 0 28 20" fill="none"><rect width="28" height="20" rx="5" fill="#FF0000"/><polygon points="11,4.5 11,15.5 20,10" fill="#fff"/></svg>';
            } else {
                icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>';
            }

            const title = document.createElement('div');
            title.className = 'yt-float-title';
            title.textContent = data.videoId ? 'YouTube' : 'Віджет';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'yt-float-close';
            closeBtn.title = 'Закрити';
            closeBtn.textContent = '\u00d7';
            closeBtn.addEventListener('pointerdown', function(e) { e.stopPropagation(); });
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                win.classList.add('yt-closing');
                var ifrm = win.querySelector('iframe');
                if (ifrm) ifrm.remove();
                
                const list = getPageYtWindows().filter(w => w.id !== data.id);
                setPageYtWindows(list);
                saveYtWindows();
                
                win.addEventListener('animationend', function() { win.remove(); }, { once: true });
            });

            header.appendChild(icon);
            header.appendChild(title);
            header.appendChild(closeBtn);

            // Video body
            const body = document.createElement('div');
            body.className = 'yt-float-body';

            const iframe = document.createElement('iframe');
            if (data.videoId) {
                iframe.src = 'https://www.youtube.com/embed/' + data.videoId + '?rel=0';
                iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            } else if (data.htmlContent) {
                const srcMatch = data.htmlContent.match(/^<iframe[^>]+src=["']([^"']+)["']/i);
                if (srcMatch) {
                    iframe.src = srcMatch[1];
                } else {
                    iframe.srcdoc = data.htmlContent;
                }
                iframe.style.background = '#fff';
            }
            iframe.allowFullscreen = true;
            body.appendChild(iframe);

            // Resize handle
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'yt-float-resize';

            win.appendChild(header);
            win.appendChild(body);
            win.appendChild(resizeHandle);

            // ── Drag by header ──
            var dragStartX, dragStartY, dragOrigLeft, dragOrigTop, ytDragging = false;

            function onYtDragStart(e) {
                if (e.target === closeBtn || e.target.closest('.yt-float-close')) return;
                e.preventDefault();
                ytDragging = true;
                win.classList.add('yt-dragging');
                var pt = e.touches ? e.touches[0] : e;
                dragStartX = pt.clientX;
                dragStartY = pt.clientY;
                dragOrigLeft = parseInt(win.style.left) || 0;
                dragOrigTop = parseInt(win.style.top) || 0;
                win.style.zIndex = 75;
                document.addEventListener('mousemove', onYtDragMove);
                document.addEventListener('touchmove', onYtDragMove, { passive: false });
                document.addEventListener('mouseup', onYtDragEnd);
                document.addEventListener('touchend', onYtDragEnd);
            }

            function onYtDragMove(e) {
                if (!ytDragging) return;
                e.preventDefault();
                var pt = e.touches ? e.touches[0] : e;
                win.style.left = (dragOrigLeft + pt.clientX - dragStartX) + 'px';
                win.style.top = (dragOrigTop + pt.clientY - dragStartY) + 'px';
            }

            function onYtDragEnd() {
                if (!ytDragging) return;
                ytDragging = false;
                win.classList.remove('yt-dragging');
                win.style.zIndex = 70;
                
                data.x = parseInt(win.style.left) || 0;
                data.y = parseInt(win.style.top) || 0;
                saveYtWindows();
                
                document.removeEventListener('mousemove', onYtDragMove);
                document.removeEventListener('touchmove', onYtDragMove);
                document.removeEventListener('mouseup', onYtDragEnd);
                document.removeEventListener('touchend', onYtDragEnd);
            }

            header.addEventListener('mousedown', onYtDragStart);
            header.addEventListener('touchstart', onYtDragStart, { passive: false });

            // ── Resize ──
            var resStartX, resStartW, ytResizing = false;

            function onYtResizeStart(e) {
                e.preventDefault();
                e.stopPropagation();
                ytResizing = true;
                win.classList.add('yt-resizing');
                var pt = e.touches ? e.touches[0] : e;
                resStartX = pt.clientX;
                resStartW = win.offsetWidth;
                document.addEventListener('mousemove', onYtResizeMove);
                document.addEventListener('touchmove', onYtResizeMove, { passive: false });
                document.addEventListener('mouseup', onYtResizeEnd);
                document.addEventListener('touchend', onYtResizeEnd);
            }

            function onYtResizeMove(e) {
                if (!ytResizing) return;
                e.preventDefault();
                var pt = e.touches ? e.touches[0] : e;
                var newW = Math.max(280, resStartW + pt.clientX - resStartX);
                win.style.width = newW + 'px';
            }

            function onYtResizeEnd() {
                if (!ytResizing) return;
                ytResizing = false;
                win.classList.remove('yt-resizing');
                
                data.w = parseInt(win.style.width) || 420;
                saveYtWindows();
                
                document.removeEventListener('mousemove', onYtResizeMove);
                document.removeEventListener('touchmove', onYtResizeMove);
                document.removeEventListener('mouseup', onYtResizeEnd);
                document.removeEventListener('touchend', onYtResizeEnd);
            }

            resizeHandle.addEventListener('mousedown', onYtResizeStart);
            resizeHandle.addEventListener('touchstart', onYtResizeStart, { passive: false });

            // Bring to front on click
            win.addEventListener('pointerdown', function() {
                cardEl.querySelectorAll('.yt-float-window').forEach(function(w) { w.style.zIndex = 70; });
                win.style.zIndex = 75;
            });

            /* Для учня — блокуємо переміщення, зміну розміру і закриття */
            if (typeof window.getCollabRole === 'function' && window.getCollabRole() === 'student') {
                closeBtn.style.display = 'none';
                resizeHandle.style.display = 'none';
                header.style.cursor = 'default';
                header.removeEventListener('mousedown', onYtDragStart);
                header.removeEventListener('touchstart', onYtDragStart);
            }

            cardEl.appendChild(win);
        }

        function makeImageDraggable(el, data) {
            let startX, startY, origLeft, origTop, dragging = false;
            // Alt+drag: активний елемент для перетягування (може бути клон)
            let dragEl = el;
            let dragData = data;

            function onStart(e) {
                if (el.classList.contains('cropping')) return;
                // Ignore resize handle and delete button
                if (e.target.classList.contains('board-image-resize') ||
                    e.target.classList.contains('board-image-resize-tl') ||
                    e.target.classList.contains('board-image-delete') ||
                    e.target.classList.contains('board-image-ocr') ||
                    e.target.classList.contains('board-image-crop') ||
                    e.target.classList.contains('board-image-cutout') ||
                    e.target.classList.contains('board-image-flip') ||
                    e.target.classList.contains('board-image-rotate') ||
                    e.target.closest('.board-image-crop') ||
                    e.target.closest('.board-image-ocr')) return;
                e.preventDefault();
                dragging = true;
                const pt = e.touches ? e.touches[0] : e;
                startX = pt.clientX;
                startY = pt.clientY;

                // ── Alt+drag: копіюємо зображення ──────────────────────────
                if (e.altKey) {
                    // Оригінал залишається на місці; перетягуємо клон
                    const cloneData = {
                        id: Date.now(),
                        src: data.src,
                        x: data.x,
                        y: data.y,
                        w: data.w,
                        h: data.h,
                        rotation: data.rotation || 0,
                        flipped: data.flipped || false
                    };
                    const cloneEl = createImageEl(cloneData);
                    card.appendChild(cloneEl);

                    // Зберігаємо клон у списку сторінки
                    const list = getPageImages();
                    list.push(cloneData);
                    setPageImages(list);
                    saveImages();

                    dragEl = cloneEl;
                    dragData = cloneData;

                    // Коротка анімація «відриву» клона від оригіналу
                    cloneEl.style.transition = 'box-shadow 0.15s ease, outline 0.15s ease';
                    cloneEl.style.outline = '2px dashed #6b9de8';
                    setTimeout(() => { cloneEl.style.outline = ''; cloneEl.style.transition = ''; }, 500);
                } else {
                    dragEl = el;
                    dragData = data;
                }
                // ────────────────────────────────────────────────────────────

                origLeft = parseInt(dragEl.style.left) || 0;
                origTop = parseInt(dragEl.style.top) || 0;
                dragEl.style.zIndex = 62;
                dragEl.style.cursor = 'grabbing';
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchend', onEnd);
            }

            function onMove(e) {
                if (!dragging) return;
                e.preventDefault();
                const pt = e.touches ? e.touches[0] : e;
                dragEl.style.left = (origLeft + pt.clientX - startX) + 'px';
                dragEl.style.top = (origTop + pt.clientY - startY) + 'px';
            }

            function onEnd() {
                if (!dragging) return;
                dragging = false;
                dragEl.style.zIndex = 51;
                dragEl.style.cursor = 'grab';
                dragData.x = parseInt(dragEl.style.left) || 0;
                dragData.y = parseInt(dragEl.style.top) || 0;
                saveImages();
                // скидаємо на оригінальні елементи
                dragEl = el;
                dragData = data;
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchend', onEnd);
            }

            el.addEventListener('mousedown', onStart);
            el.addEventListener('touchstart', onStart, { passive: false });
        }

        function makeResizable(el, handle, data) {
            let startX, startY, startW, startH, resizing = false;

            function onStart(e) {
                if (el.classList.contains('cropping')) return;
                e.preventDefault();
                e.stopPropagation();
                resizing = true;
                const pt = e.touches ? e.touches[0] : e;
                startX = pt.clientX;
                startY = pt.clientY;
                startW = parseInt(el.style.width) || 200;
                startH = parseInt(el.style.height) || 200;
                el.style.zIndex = 63;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchend', onEnd);
            }

            function onMove(e) {
                if (!resizing) return;
                e.preventDefault();
                const pt = e.touches ? e.touches[0] : e;
                const newW = Math.max(60, startW + pt.clientX - startX);
                const newH = Math.max(60, startH + pt.clientY - startY);
                el.style.width = newW + 'px';
                el.style.height = newH + 'px';
            }

            function onEnd() {
                if (!resizing) return;
                resizing = false;
                el.style.zIndex = 51;
                data.w = parseInt(el.style.width) || 200;
                data.h = parseInt(el.style.height) || 200;
                saveImages();
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchend', onEnd);
            }

            handle.addEventListener('mousedown', onStart);
            handle.addEventListener('touchstart', onStart, { passive: false });
        }

        function makeResizableTL(el, handle, data) {
            let startX, startY, startW, startH, startLeft, startTop, resizing = false;

            function onStart(e) {
                if (el.classList.contains('cropping')) return;
                e.preventDefault();
                e.stopPropagation();
                resizing = true;
                const pt = e.touches ? e.touches[0] : e;
                startX = pt.clientX;
                startY = pt.clientY;
                startW = parseInt(el.style.width) || 200;
                startH = parseInt(el.style.height) || 200;
                startLeft = parseInt(el.style.left) || 0;
                startTop = parseInt(el.style.top) || 0;
                el.style.zIndex = 63;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchend', onEnd);
            }

            function onMove(e) {
                if (!resizing) return;
                e.preventDefault();
                const pt = e.touches ? e.touches[0] : e;
                const dx = pt.clientX - startX;
                const dy = pt.clientY - startY;
                const newW = Math.max(60, startW - dx);
                const newH = Math.max(60, startH - dy);
                // Move left/top proportionally so right/bottom stay fixed
                el.style.width = newW + 'px';
                el.style.height = newH + 'px';
                el.style.left = (startLeft + startW - newW) + 'px';
                el.style.top = (startTop + startH - newH) + 'px';
            }

            function onEnd() {
                if (!resizing) return;
                resizing = false;
                el.style.zIndex = 51;
                data.w = parseInt(el.style.width) || 200;
                data.h = parseInt(el.style.height) || 200;
                data.x = parseInt(el.style.left) || 0;
                data.y = parseInt(el.style.top) || 0;
                saveImages();
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchend', onEnd);
            }

            handle.addEventListener('mousedown', onStart);
            handle.addEventListener('touchstart', onStart, { passive: false });
        }

        function makeRotatable(el, handle, data) {
            let rotating = false;
            let startAngle = 0;
            let currentRotation = data.rotation || 0;

            function getCenter() {
                const rect = el.getBoundingClientRect();
                return {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            }

            function getAngle(cx, cy, px, py) {
                return Math.atan2(py - cy, px - cx) * (180 / Math.PI);
            }

            function onStart(e) {
                if (el.classList.contains('cropping')) return;
                e.preventDefault();
                e.stopPropagation();
                rotating = true;
                const pt = e.touches ? e.touches[0] : e;
                const center = getCenter();
                startAngle = getAngle(center.x, center.y, pt.clientX, pt.clientY) - currentRotation;
                handle.style.cursor = 'grabbing';
                el.style.zIndex = 64;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchend', onEnd);
            }

            function onMove(e) {
                if (!rotating) return;
                e.preventDefault();
                const pt = e.touches ? e.touches[0] : e;
                const center = getCenter();
                const angle = getAngle(center.x, center.y, pt.clientX, pt.clientY);
                currentRotation = angle - startAngle;
                el.style.transform = `rotate(${currentRotation}deg)`;
            }

            function onEnd() {
                if (!rotating) return;
                rotating = false;
                handle.style.cursor = 'grab';
                el.style.zIndex = 51;
                data.rotation = currentRotation;
                saveImages();
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('mouseup', onEnd);
                document.removeEventListener('touchend', onEnd);
            }

            handle.addEventListener('mousedown', onStart);
            handle.addEventListener('touchstart', onStart, { passive: false });
        }

        function deleteImage(id, el) {
            el.style.transition = 'all 0.2s ease';
            el.style.transform = 'scale(0.8)';
            el.style.opacity = '0';
            setTimeout(() => {
                el.remove();
                const list = getPageImages().filter(im => im.id !== id);
                setPageImages(list);
                saveImages();
            }, 200);
        }

        /* ── Видалення фону через @imgly/background-removal ── */
        var _bgRemoveFn = null;
        var _bgModelLoaded = false;

        async function removeBgFromImage(data, el, imgNode, btn) {
            if (btn.classList.contains('loading')) return;
            btn.classList.add('loading');
            btn.title = 'Обробка…';

            // Створюємо прогресбар поверх зображення
            const prog = document.createElement('div');
            prog.className = 'cutout-progress';
            prog.innerHTML = `
                <div class="cutout-progress-pct">0%</div>
                <div class="cutout-progress-track">
                    <div class="cutout-progress-fill"></div>
                </div>
                <div class="cutout-progress-label">Ініціалізація…</div>
                <div class="cutout-progress-sub"></div>
            `;
            el.appendChild(prog);

            const pctEl = prog.querySelector('.cutout-progress-pct');
            const fillEl = prog.querySelector('.cutout-progress-fill');
            const lblEl = prog.querySelector('.cutout-progress-label');
            const subEl = prog.querySelector('.cutout-progress-sub');

            const setProg = (pct, label, sub) => {
                if (fillEl) fillEl.style.width = pct + '%';
                if (pctEl) pctEl.textContent = Math.round(pct) + '%';
                if (lblEl) lblEl.textContent = label;
                if (subEl) subEl.textContent = sub || '';
            };

            const firstRun = !_bgModelLoaded;

            try {
                if (!_bgRemoveFn) {
                    setProg(2, 'Завантаження бібліотеки…',
                        'Модель завантажується, коли використовується вперше. Далі функція працюватиме миттєво.');
                    const mod = await import('https://esm.sh/@imgly/background-removal@1.5.5');
                    _bgRemoveFn = mod.removeBackground;
                }

                setProg(5, 'Читання зображення…', '');

                const resp = await fetch(data.src);
                const origBlob = await resp.blob();

                setProg(8, firstRun ? 'Завантаження AI-моделі…' : 'Обробка зображення…',
                    firstRun ? 'Модель завантажується, коли використовується вперше. Далі функція працюватиме миттєво.' : '');

                const resultBlob = await _bgRemoveFn(origBlob, {
                    model: 'isnet',
                    output: { format: 'image/png', quality: 1 },
                    progress: (key, current, total) => {
                        if (total > 0) {
                            const pct = current / total;
                            if (key.includes('fetch') || key.includes('download')) {
                                // Завантаження моделі: 8% → 72%
                                setProg(
                                    8 + Math.round(pct * 64),
                                    'Завантаження AI-моделі… ' + Math.round(pct * 100) + '%',
                                    'Модель завантажується, коли використовується вперше. Далі функція працюватиме миттєво.'
                                );
                            } else {
                                // Обробка: 72% → 95%
                                setProg(72 + Math.round(pct * 23), 'Обробка зображення…', '');
                            }
                        }
                    }
                });

                _bgModelLoaded = true;

                setProg(97, 'Фінальний рендер…', '');
                await new Promise(r => setTimeout(r, 200));

                const newSrc = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(resultBlob);
                });

                setProg(100, 'Готово!', '');
                await new Promise(r => setTimeout(r, 350));

                // Оновлюємо зображення
                imgNode.src = newSrc;
                data.src = newSrc;
                const list = getPageImages();
                const found = list.find(im => im.id === data.id);
                if (found) found.src = newSrc;
                setPageImages(list);
                saveImages();

                prog.remove();
                el.style.outline = '2px solid #22c55e';
                el.style.outlineOffset = '2px';
                setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = ''; }, 1200);

            } catch (err) {
                console.error('BG removal error:', err);
                prog.remove();
                el.style.outline = '2px solid #ef4444';
                el.style.outlineOffset = '2px';
                setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = ''; }, 1500);
            }

            btn.classList.remove('loading');
            btn.title = 'Вирізати фон (AI)';
        }

        function openImageCropper(data, imageEl, imgNode) {
            if (imageEl.classList.contains('cropping')) return;

            document.querySelectorAll('.board-image.cropping').forEach((node) => {
                const cancel = node.querySelector('.board-image-crop-action.cancel');
                if (cancel) cancel.click();
            });

            const original = new Image();
            original.onload = () => {
                const overlay = document.createElement('div');
                overlay.className = 'board-image-crop-overlay';

                const sel = document.createElement('div');
                sel.className = 'board-image-crop-selection';

                ['nw', 'ne', 'sw', 'se'].forEach(pos => {
                    const h = document.createElement('div');
                    h.className = 'board-image-crop-handle';
                    h.dataset.handle = pos;
                    h.style.top = pos.includes('n') ? '-6px' : '';
                    h.style.bottom = pos.includes('s') ? '-6px' : '';
                    h.style.left = pos.includes('w') ? '-6px' : '';
                    h.style.right = pos.includes('e') ? '-6px' : '';
                    h.style.cursor = `${pos}-resize`;
                    sel.appendChild(h);
                });

                const actions = document.createElement('div');
                actions.className = 'board-image-crop-actions';

                const applyBtn = document.createElement('button');
                applyBtn.className = 'board-image-crop-action apply';
                applyBtn.type = 'button';
                applyBtn.title = (uiText[state.lang] || uiText.ua).cropApply;
                applyBtn.textContent = '✓';

                const cancelBtn = document.createElement('button');
                cancelBtn.className = 'board-image-crop-action cancel';
                cancelBtn.type = 'button';
                cancelBtn.title = 'Скасувати';
                cancelBtn.textContent = '×';

                actions.appendChild(applyBtn);
                actions.appendChild(cancelBtn);
                imageEl.appendChild(overlay);
                imageEl.appendChild(sel);
                imageEl.appendChild(actions);
                imageEl.classList.add('cropping');

                let sx = 0, sy = 0, sw = 0, sh = 0;
                let mode = null;
                let startX = 0, startY = 0;
                let startSel = { x: 0, y: 0, w: 0, h: 0 };
                let alive = true;

                function updateMask() {
                    overlay.style.clipPath = `polygon(0 0,100% 0,100% 100%,0 100%,0 0,${sx}px ${sy}px,${sx + sw}px ${sy}px,${sx + sw}px ${sy + sh}px,${sx}px ${sy + sh}px,${sx}px ${sy}px)`;
                }

                function updateSelection(x, y, w, h) {
                    const maxW = imgNode.clientWidth;
                    const maxH = imgNode.clientHeight;
                    sx = Math.max(0, Math.min(x, maxW - 12));
                    sy = Math.max(0, Math.min(y, maxH - 12));
                    sw = Math.max(12, Math.min(w, maxW - sx));
                    sh = Math.max(12, Math.min(h, maxH - sy));
                    sel.style.left = sx + 'px';
                    sel.style.top = sy + 'px';
                    sel.style.width = sw + 'px';
                    sel.style.height = sh + 'px';
                    updateMask();
                }

                function initSelection() {
                    const w = imgNode.clientWidth;
                    const h = imgNode.clientHeight;
                    updateSelection(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
                }

                function stopDrag() {
                    mode = null;
                    document.removeEventListener('pointermove', onDrag);
                    document.removeEventListener('pointerup', stopDrag);
                }

                function cleanup() {
                    if (!alive) return;
                    alive = false;
                    stopDrag();
                    imageEl.classList.remove('cropping');
                    overlay.remove();
                    sel.remove();
                    actions.remove();
                }

                function startDrag(e) {
                    if (!alive) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const target = e.target;
                    mode = target.dataset && target.dataset.handle ? target.dataset.handle : 'move';
                    startX = e.clientX;
                    startY = e.clientY;
                    startSel = { x: sx, y: sy, w: sw, h: sh };
                    document.addEventListener('pointermove', onDrag);
                    document.addEventListener('pointerup', stopDrag);
                }

                function onDrag(e) {
                    if (!mode || !alive) return;
                    e.preventDefault();
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    if (mode === 'move') {
                        updateSelection(startSel.x + dx, startSel.y + dy, startSel.w, startSel.h);
                        return;
                    }
                    let nx = startSel.x;
                    let ny = startSel.y;
                    let nw = startSel.w;
                    let nh = startSel.h;
                    if (mode.includes('n')) { ny = startSel.y + dy; nh = startSel.h - dy; }
                    if (mode.includes('s')) nh = startSel.h + dy;
                    if (mode.includes('w')) { nx = startSel.x + dx; nw = startSel.w - dx; }
                    if (mode.includes('e')) nw = startSel.w + dx;
                    updateSelection(nx, ny, nw, nh);
                }

                function applyCrop() {
                    const displayW = imgNode.clientWidth;
                    const displayH = imgNode.clientHeight;
                    const scaleX = original.naturalWidth / displayW;
                    const scaleY = original.naturalHeight / displayH;
                    const cropX = Math.round(sx * scaleX);
                    const cropY = Math.round(sy * scaleY);
                    const cropW = Math.max(1, Math.round(sw * scaleX));
                    const cropH = Math.max(1, Math.round(sh * scaleY));
                    const canvas = document.createElement('canvas');
                    canvas.width = cropW;
                    canvas.height = cropH;
                    const cctx = canvas.getContext('2d');
                    cctx.drawImage(original, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
                    const src = canvas.toDataURL('image/png');

                    const oldW = parseInt(imageEl.style.width) || data.w || displayW;
                    const oldH = parseInt(imageEl.style.height) || data.h || displayH;
                    const newW = Math.max(60, Math.round(oldW * (sw / displayW)));
                    const newH = Math.max(60, Math.round(oldH * (sh / displayH)));

                    data.src = src;
                    data.w = newW;
                    data.h = newH;
                    imageEl.style.width = newW + 'px';
                    imageEl.style.height = newH + 'px';
                    imgNode.src = src;
                    saveImages();
                    cleanup();
                }

                sel.addEventListener('pointerdown', startDrag);
                applyBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
                cancelBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
                applyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    applyCrop();
                });
                cancelBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cleanup();
                });

                requestAnimationFrame(initSelection);
            };
            original.src = data.src;
        }

