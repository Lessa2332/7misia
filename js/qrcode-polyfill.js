        (function () {
            function safeText(text) {
                return String(text == null ? '' : text);
            }

            function sanitizeStyle(styleText) {
                var allowed = {
                    color: true,
                    'background-color': true,
                    'text-align': true,
                    'font-weight': true,
                    'font-style': true,
                    'text-decoration': true,
                    'vertical-align': true,
                    'white-space': true,
                    'display': true,
                    'line-height': true,
                    'font-size': true,
                    'font-family': true,
                    'border-collapse': true,
                    'border': true,
                    'border-color': true,
                    'border-style': true,
                    'border-width': true,
                    'width': true,
                    'height': true,
                    'min-width': true,
                    'padding': true,
                    'padding-left': true,
                    'padding-right': true,
                    'padding-top': true,
                    'padding-bottom': true,
                    'margin': true,
                    'margin-top': true,
                    'margin-bottom': true,
                    'margin-left': true,
                    'margin-right': true
                };
                return safeText(styleText).split(';').map(function (part) {
                    var idx = part.indexOf(':');
                    if (idx === -1) return '';
                    var prop = part.slice(0, idx).trim().toLowerCase();
                    var val = part.slice(idx + 1).trim();
                    if (!allowed[prop]) return '';
                    if (/url\s*\(|expression\s*\(|javascript:/i.test(val)) return '';
                    return prop + ':' + val;
                }).filter(Boolean).join(';');
            }

            window.sanitizeNotebookHtml = function (html) {
                var template = document.createElement('template');
                template.innerHTML = safeText(html);
                var allowedTags = {
                    BR: true, DIV: true, P: true, SPAN: true,
                    B: true, STRONG: true, I: true, EM: true, U: true, S: true,
                    SUP: true, SUB: true,
                    OL: true, UL: true, LI: true,
                    A: true,
                    TABLE: true, THEAD: true, TBODY: true, TFOOT: true,
                    TR: true, TD: true, TH: true, COLGROUP: true, COL: true
                };
                var allowedAttrs = {
                    class: true, style: true, title: true, contenteditable: true,
                    colspan: true, rowspan: true,
                    href: true, target: true, rel: true,
                    start: true, type: true, reversed: true, value: true,
                    'data-zone-id': true, 'data-student-uid': true,
                    'data-assigned-to': true, 'data-edited-by': true
                };

                function clean(node) {
                    Array.from(node.childNodes).forEach(function (child) {
                        if (child.nodeType === Node.COMMENT_NODE) {
                            child.remove();
                            return;
                        }
                        if (child.nodeType !== Node.ELEMENT_NODE) return;
                        if (!allowedTags[child.tagName]) {
                            child.replaceWith(document.createTextNode(child.textContent || ''));
                            return;
                        }
                        Array.from(child.attributes).forEach(function (attr) {
                            var name = attr.name.toLowerCase();
                            if (name.indexOf('on') === 0 || !allowedAttrs[name]) {
                                child.removeAttribute(attr.name);
                                return;
                            }
                            if (name === 'style') {
                                var cleanStyle = sanitizeStyle(attr.value);
                                if (cleanStyle) child.setAttribute('style', cleanStyle);
                                else child.removeAttribute('style');
                            }
                            if ((name === 'colspan' || name === 'rowspan') && !/^[1-9]\d?$/.test(attr.value)) {
                                child.removeAttribute(attr.name);
                            }
                        });
                        clean(child);
                    });
                }

                clean(template.content);
                return template.innerHTML;
            };

            window.sanitizeNotebookPlain = function (text) {
                var div = document.createElement('div');
                div.textContent = safeText(text);
                return div.innerHTML;
            };

            if (!window.html2canvas) {
                window.html2canvas = function (element, options) {
                    options = options || {};
                    return new Promise(function (resolve) {
                        var rect = element && element.getBoundingClientRect ? element.getBoundingClientRect() : { width: 900, height: 600 };
                        var scale = options.scale || window.devicePixelRatio || 1;
                        var width = Math.max(1, Math.round((options.width || rect.width || 900) * scale));
                        var height = Math.max(1, Math.round((options.height || rect.height || 600) * scale));
                        var canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        var ctx = canvas.getContext('2d');
                        ctx.fillStyle = options.backgroundColor || '#ffffff';
                        ctx.fillRect(0, 0, width, height);
                        ctx.scale(scale, scale);
                        ctx.fillStyle = '#475569';
                        ctx.font = '16px Arial, sans-serif';
                        var text = (element && element.innerText ? element.innerText : '').split(/\n/).filter(Boolean);
                        var y = 30;
                        text.slice(0, 40).forEach(function (line) {
                            ctx.fillText(line.slice(0, 100), 24, y);
                            y += 24;
                        });
                        resolve(canvas);
                    });
                };
                window.html2canvas.isLocalFallback = true;
            }

            if (!window.QRCode) {
                window.QRCode = function (el, opts) {
                    opts = opts || {};
                    var size = opts.width || opts.height || 160;
                    var text = safeText(opts.text || '');
                    var canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    var ctx = canvas.getContext('2d');
                    ctx.fillStyle = opts.colorLight || '#ffffff';
                    ctx.fillRect(0, 0, size, size);
                    ctx.fillStyle = opts.colorDark || '#1e293b';
                    var hash = 0;
                    for (var i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
                    var cells = 21;
                    var cell = Math.max(2, Math.floor(size / cells));
                    for (var y = 0; y < cells; y++) {
                        for (var x = 0; x < cells; x++) {
                            var finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
                            var bit = finder ? (x === 0 || y === 0 || x === 6 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5)) : (((x * 31 + y * 17 + hash) % 5) === 0);
                            if (bit) ctx.fillRect(x * cell + 4, y * cell + 4, cell, cell);
                        }
                    }
                    ctx.fillStyle = '#64748b';
                    ctx.font = Math.max(9, Math.floor(size / 18)) + 'px Arial, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('QR offline', size / 2, size - 8);
                    if (el) {
                        el.innerHTML = '';
                        el.appendChild(canvas);
                    }
                };
                window.QRCode.CorrectLevel = { L: 1, M: 2, Q: 3, H: 4 };
                window.QRCode.isLocalFallback = true;
            }
        })();
