    /* === TRANSLITERATION (KMU №55 EN + German) === */
    (function () {
        let currentLang = 'en';
        var _savedRange = null;

        var modal   = document.getElementById('translitModal');
        var srcEl   = document.getElementById('tlSource');
        var resEl   = document.getElementById('tlResult');
        var btnEn   = document.getElementById('tlLangEn');
        var btnDe   = document.getElementById('tlLangDe');
        var insertBtn = document.getElementById('tlInsertBtn');

        var APOSTROPHES = new Set(["'", '\u2019', 'ʼ']);
        var UA_VOWELS   = new Set(['а','е','и','і','є','ї','о','у','ю','я','А','Е','И','І','Є','Ї','О','У','Ю','Я']);

        function isApostrophe(c) { return APOSTROPHES.has(c); }

        function isPos0(text, i) {
            if (i === 0) return true;
            var prev = text[i - 1];
            return prev === ' ' || prev === '-' || prev === '\u00ad';
        }

        function isVowelUA(c) { return UA_VOWELS.has(c); }

        function outputEndsWithVowel(result) {
            if (!result) return false;
            return 'aeiouyAEIOUY'.includes(result[result.length - 1]);
        }

        function deCaseOut(str, srcChar) {
            var isUpper = srcChar === srcChar.toUpperCase() && srcChar !== srcChar.toLowerCase();
            if (!isUpper) return str.toLowerCase();
            if (str.length <= 1) return str.toUpperCase();
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }

        function replaceZgh(result, srcG) {
            var isUpperG = srcG === 'Г';
            var repl = isUpperG ? 'Zgh' : 'zgh';
            if (result.endsWith('z')) return result.slice(0, -1) + repl;
            if (result.endsWith('Z')) return result.slice(0, -1) + repl;
            return result + (isUpperG ? 'H' : 'h');
        }

        var EN_MAP = {
            'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e',
            'ж':'zh','з':'z','и':'y','і':'i','к':'k','л':'l','м':'m',
            'н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u',
            'ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch',
            'А':'A','Б':'B','В':'V','Г':'H','Ґ':'G','Д':'D','Е':'E',
            'Ж':'Zh','З':'Z','И':'Y','І':'I','К':'K','Л':'L','М':'M',
            'Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U',
            'Ф':'F','Х':'Kh','Ц':'Ts','Ч':'Ch','Ш':'Sh','Щ':'Shch'
        };

        var DE_MAP = {
            'а':'a','б':'b','в':'w','г':'h','ґ':'g','д':'d','е':'e',
            'з':'s','и':'y','і':'i','й':'j','к':'k','л':'l','м':'m',
            'н':'n','о':'o','п':'p','р':'r','т':'t','у':'u','ф':'f',
            'х':'ch','ц':'z','ш':'sch','щ':'schtsch','ч':'tsch',
            'А':'A','Б':'B','В':'W','Г':'H','Ґ':'G','Д':'D','Е':'E',
            'З':'S','И':'Y','І':'I','Й':'J','К':'K','Л':'L','М':'M',
            'Н':'N','О':'O','П':'P','Р':'R','Т':'T','У':'U','Ф':'F',
            'Х':'Ch','Ц':'Z','Ш':'Sch','Щ':'Schtsch','Ч':'Tsch'
        };

        function transliterate(text) {
            if (!text) return '';
            var result = '';
            for (var i = 0; i < text.length; i++) {
                var c = text[i];
                if (c === 'ь' || c === 'Ь' || isApostrophe(c)) continue;

                if (c === 'г' || c === 'Г') {
                    var prev = text[i - 1];
                    if (prev === 'з' || prev === 'З') result = replaceZgh(result, c);
                    else result += (c === 'Г' ? 'H' : 'h');
                    continue;
                }

                var pos0 = isPos0(text, i);
                switch (c) {
                    case 'Є': result += pos0 ? 'Ye' : 'Ie'; break;
                    case 'є': result += pos0 ? 'ye' : 'ie'; break;
                    case 'Ї': result += pos0 ? 'Yi' : 'I'; break;
                    case 'ї': result += pos0 ? 'yi' : 'i'; break;
                    case 'Й': result += pos0 ? 'Y' : 'I'; break;
                    case 'й': result += pos0 ? 'y' : 'i'; break;
                    case 'Ю': result += pos0 ? 'Yu' : 'Iu'; break;
                    case 'ю': result += pos0 ? 'yu' : 'iu'; break;
                    case 'Я': result += pos0 ? 'Ya' : 'Ia'; break;
                    case 'я': result += pos0 ? 'ya' : 'ia'; break;
                    default:
                        if (EN_MAP[c] !== undefined) result += EN_MAP[c];
                        else result += c;
                }
            }
            return result;
        }

        function transliterateDE(text) {
            if (!text) return '';
            var result = '';
            for (var i = 0; i < text.length; i++) {
                var c  = text[i];
                var c2 = i + 1 < text.length ? text[i + 1] : '';

                if (c === 'ь' || c === 'Ь' || isApostrophe(c)) continue;

                if (c === 'Д' && c2 === 'Ж') { result += 'DSCH'; i++; continue; }
                if (c === 'д' && c2 === 'ж') { result += 'dsch'; i++; continue; }
                if (c === 'Д' && c2 === 'ж') { result += 'Dsch'; i++; continue; }
                if (c === 'д' && c2 === 'Ж') { result += 'Dsch'; i++; continue; }
                if (c === 'Д' && c2 === 'З') { result += 'DS'; i++; continue; }
                if (c === 'д' && c2 === 'з') { result += 'ds'; i++; continue; }
                if (c === 'Д' && c2 === 'з') { result += 'Ds'; i++; continue; }
                if (c === 'д' && c2 === 'З') { result += 'Ds'; i++; continue; }

                if ((c === 'г' || c === 'Г') && i > 0 && (text[i - 1] === 'з' || text[i - 1] === 'З')) {
                    var sghOut = (c === 'Г' || text[i - 1] === 'З') ? 'Sgh' : 'sgh';
                    if (result.endsWith('s')) result = result.slice(0, -1) + sghOut;
                    else if (result.endsWith('S')) result = result.slice(0, -1) + sghOut;
                    else result += sghOut;
                    i++;
                    continue;
                }

                if ((c === 'с' || c === 'С') && (c2 === 'х' || c2 === 'Х')) {
                    result += deCaseOut('sch', c);
                    i++;
                    continue;
                }

                if (c === 'Є') { result += 'Je'; continue; }
                if (c === 'є') { result += 'je'; continue; }
                if (c === 'Ї') { result += 'Ji'; continue; }
                if (c === 'ї') { result += 'ji'; continue; }
                if (c === 'Ю') { result += 'Ju'; continue; }
                if (c === 'ю') { result += 'ju'; continue; }
                if (c === 'Я') { result += 'Ja'; continue; }
                if (c === 'я') { result += 'ja'; continue; }

                if (c === 'Ж') { result += 'Sch'; continue; }
                if (c === 'ж') { result += 'sch'; continue; }

                if (c === 'с' || c === 'С') {
                    var prevOutV = outputEndsWithVowel(result);
                    var nextV    = isVowelUA(c2);
                    if (prevOutV && nextV) result += (c === 'С' ? 'SS' : 'ss');
                    else result += (c === 'С' ? 'S' : 's');
                    continue;
                }

                if (DE_MAP[c] !== undefined) result += DE_MAP[c];
                else result += c;
            }
            return result;
        }

        function updateResult() {
            if (!srcEl || !resEl) return;
            var text = srcEl.value;
            var out  = currentLang === 'de' ? transliterateDE(text) : transliterate(text);
            resEl.textContent = out;
            if (insertBtn) insertBtn.disabled = !out.trim();
        }

        function updateToggleUI() {
            if (btnEn) btnEn.classList.toggle('active', currentLang === 'en');
            if (btnDe) btnDe.classList.toggle('active', currentLang === 'de');
        }

        window.setTranslitLang = function(lang) {
            currentLang = lang === 'de' ? 'de' : 'en';
            updateToggleUI();
            updateResult();
        };

        window.openTranslitModal = function(text, range) {
            _savedRange = range || null;
            if (srcEl) srcEl.value = text || '';
            currentLang = (typeof state !== 'undefined' && state.lang === 'de') ? 'de' : 'en';
            updateToggleUI();
            updateResult();
            if (modal) modal.classList.add('visible');
            setTimeout(function() { if (srcEl) srcEl.focus(); }, 100);
        };

        window.closeTranslitModal = function() {
            if (modal) modal.classList.remove('visible');
        };

        window.translitInsertResult = function() {
            var text = resEl ? resEl.textContent.trim() : '';
            if (!text) return;
            closeTranslitModal();
            setTimeout(function() {
                var editor = document.getElementById('boardEditor');
                if (!editor) return;
                editor.focus();
                if (_savedRange) {
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(_savedRange);
                    sel.deleteFromDocument();
                }
                document.execCommand('insertText', false, text);
                if (typeof saveState === 'function') saveState();
            }, 80);
        };

        if (srcEl) {
            srcEl.addEventListener('input', updateResult);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal && modal.classList.contains('visible')) closeTranslitModal();
        });
    })();
