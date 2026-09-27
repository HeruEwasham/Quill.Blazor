const registeredBlots = new Set();

// Hjelpefunksjon som garanterer at Quill JS og CSS er fullstendig lastet inn
function ensureQuillLoaded(theme/*, syntax, highlightCss, highlightJs*/) {
    return new Promise((resolve, reject) => {
        if (theme == 'snow' && !document.getElementById('quill-snow-css')) {
                const link = document.createElement('link');
                link.id = 'quill-snow-css';
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css';
                document.head.appendChild(link);
        }
        else if (theme == 'bubble' && !document.getElementById('quill-bubble-css')) {
            const link = document.createElement('link');
            link.id = 'quill-bubble-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.bubble.css';
            document.head.appendChild(link);
        }

        /*if (syntax)
        {
            if (highlightCss && !document.getElementById('highlight-css')) {
                const link = document.createElement('link');
                link.id = 'highlight-css';
                link.rel = 'stylesheet';
                link.href = highlightCss;
                document.head.appendChild(link);
            }

            if (highlightJs && !document.getElementById('highlight-js-script'))
            {
                const script = document.createElement('script');
                script.id = 'highlight-js-script';
                script.src = highlightJs;
                script.addEventListener("load", () => {
                    window.hljs = hljs;
                    //hljs.highlightAll();
                    console.log("File loaded")
                });
                document.head.appendChild(script);
            }
        }*/

        if (window.Quill) {
            resolve();
            return;
        }

        const existingScript = document.getElementById('quill-js-script');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', (err) => reject(err));
            return;
        }

        const script = document.createElement('script');
        script.id = 'quill-js-script';
        script.src = 'https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js';
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });
}

export async function initialize(editorElement, dotNetRef, configJson, divId) {
    console.log("initialize start.");
    try {
        const config = JSON.parse(configJson);
        // Vent til Quill er 100% klar i nettleseren
        await ensureQuillLoaded(config.theme/*, config.syntax, config.highlightCss, config.highlightJs*/);
        
        const Embed = window.Quill.import('blots/embed');

        // 1. Registrer egne Blots dynamisk
        config.tokens.forEach(token => {
            if (!registeredBlots.has(token.id)) {
                const DynamicTokenBlot = class extends Embed {
                    
                    static create(args) {
                        let node = super.create();

                        if (args.visibleToken.innerHtml) {
                            node.innerHTML = args.visibleToken.innerHtml;
                        }

                        if (args.visibleToken.styles) {
                            for (const [key, value] of Object.entries(args.visibleToken.styles)) {
                                node.style.setProperty(key, value);
                            }
                        }

                        if (args.visibleToken.attributes) {
                            for (const [key, value] of Object.entries(args.visibleToken.attributes)) {
                                // If it's a boolean attribute and false, remove or skip it
                                if (value === false) continue;
                                
                                node.setAttribute(key, value.toString());
                            }
                        }

                        node.setAttribute('quillCustomToken-id', args.id);
                        node.setAttribute('quillCustomToken-value', args.value);
                        
                        node.addEventListener('click', (e) => {
                            const id = node.getAttribute('quillCustomToken-id');
                            const value = node.getAttribute('quillCustomToken-value');
                            
                            const blot = window.Quill.find(node);
                            const index = quill.getIndex(blot);

                            dotNetRef.invokeMethodAsync('OnTokenClicked', index, id, value);
                        });

                        return node;
                    }

                    static value(node) {
                        var attributes = {}
                        for (const attr of node.attributes) {
                            if (attr.name != 'quillcustomtoken-id' && attr.name != 'quillcustomtoken-value' && attr.name != 'style')
                            {
                                attributes[attr.name] = attr.value;
                            }
                        }
                        return {
                            id: node.getAttribute('quillCustomToken-id'),
                            value: node.getAttribute('quillCustomToken-value'),
                            visibleToken: {
                                innerHTML: node.firstElementChild.innerHTML,
                                styles: Object.fromEntries([...node.style].map(x => [x, node.style[x]])),
                                attributes: attributes
                            }
                        };
                    }
                };

                DynamicTokenBlot.blotName = token.id;
                DynamicTokenBlot.tagName = 'span';

                window.Quill.register(DynamicTokenBlot);
                registeredBlots.add(token.id);
            }
        });

        const handlers = {};
        config.tokens.forEach(token => {
            const buttonKey = token.id;
            handlers[buttonKey] = () => {
                dotNetRef.invokeMethodAsync('OnToolbarTokenClicked', token.id);
            };
        });

        const modules = {};
        if (config.history)
        {
            modules.history = config.history;
            handlers["undo"] = function() {
                this.quill.history.undo();
            };
            handlers["redo"] = function() {
                this.quill.history.redo();
            };
        }

        if (config.toolbarOptions)
        {
            modules.toolbar = {
                container: config.toolbarOptions,
                handlers: handlers
            };
        }

        const options = {
            theme: config.theme,
            //syntax: config.syntax,
            modules: modules,
            readOnly: config.readOnly
        };
        if (config.formats)
        {
            options.formats = config.formats;
        }
        if (config.placeholder)
        {
            options.placeholder = config.placeholder;
        }
        // 3. Initialiser editoren
        const quill = new window.Quill("#"+divId, options);

        quill.on('text-change', (delta, oldDelta, source) => {
            dotNetRef.invokeMethodAsync('CallOnTextChange', delta, oldDelta, source);
        });

        quill.on('selection-change', (range, oldRange, source) => {
            dotNetRef.invokeMethodAsync('CallOnSelectionChange', range, oldRange, source);
        });

        // Lagre instansen på elementet
        editorElement.__quillInstance = quill;

        const toolbarElement = quill.getModule('toolbar').container;
    
        config.tokens.forEach(token => {
            // Quill automatically assigns the class .ql-{key} to the button
            const buttonDom = toolbarElement.querySelector(`.ql-${token.id}`);
            if (buttonDom) {
                // Inject the raw SVG or text string passed from Blazor
                buttonDom.innerHTML = token.toolbarButtonHtmlContent;
            }
        });

        if (config.history)
        {
            const undoDom = toolbarElement.querySelector(`.ql-undo`);
            if (undoDom) {
                // Inject the raw SVG or text string passed from Blazor
                undoDom.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z"/></svg>';
            }
            const redoDom = toolbarElement.querySelector(`.ql-redo`);
            if (redoDom) {
                // Inject the raw SVG or text string passed from Blazor
                redoDom.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M396-200q-97 0-166.5-63T160-420q0-94 69.5-157T396-640h252L544-744l56-56 200 200-200 200-56-56 104-104H396q-63 0-109.5 40T240-420q0 60 46.5 100T396-280h284v80H396Z"/></svg>';
            }
        }

    } catch (error) {
        console.error("Klarte ikke å initialisere Quill-editoren:", error);
    }
}

export function insertToken(editorElement, id, value, visibleToken) {
    const quill = editorElement.__quillInstance;
    if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, id, { id: id, value: value, visibleToken: visibleToken }, window.Quill.sources.USER);
        quill.setSelection(range.index + 1, window.Quill.sources.USER);
    }
}

export function getCursorIndex(editorElement) {
    const quill = editorElement.__quillInstance;
    if (quill) {
        const range = quill.getSelection();
        return range ? range.index : 0;
    }
    return 0;
}

export function updateToken(editorElement, index, id, value, visibleToken) {
    const quill = editorElement.__quillInstance;
    quill.deleteText(index, 1);
    quill.insertEmbed(index, id, { id: id, value: value, visibleToken: visibleToken }, window.Quill.sources.USER);
}

export function clearHistory(editorElement)
{
    editorElement.__quillInstance.history.clear();
}

export function cutoffHistory(editorElement)
{
    editorElement.__quillInstance.history.cutoff();
}

export function undoHistory(editorElement)
{
    editorElement.__quillInstance.history.undo();
}

export function redoHistory(editorElement)
{
    editorElement.__quillInstance.history.redo();
}

export function deleteText(editorElement, index, length, source)
{
    editorElement.__quillInstance.deleteText(index, length, source);
}

export function getContents(editorElement)
{
    return editorElement.__quillInstance.getContents();
}

export function getLength(editorElement)
{
    return editorElement.__quillInstance.getLength();
}

export function getText(editorElement, index = 0, length = null)
{
    if (length)
    {
        return editorElement.__quillInstance.getText(index, length);
    }
    else
    {
        return editorElement.__quillInstance.getText(index);
    }
}

export function getSemanticHTML(editorElement, index = 0, length = null)
{
    if (length)
    {
        return editorElement.__quillInstance.getSemanticHTML(index, length);
    }
    else
    {
        return editorElement.__quillInstance.getSemanticHTML(index);
    }
}

export function insertEmbed(editorElement, index, type, value, source)
{
    return editorElement.__quillInstance.insertEmbed(index, type, value, source);
}

export function insertTextSign1(editorElement, index, text, source)
{
    return editorElement.__quillInstance.insertText(index, text, source);
}

export function insertTextSign2(editorElement, index, text, format, value, source)
{
    return editorElement.__quillInstance.insertText(index, text, format, value, source);
}

export function insertTextSign3(editorElement, index, text, formats, source)
{
    return editorElement.__quillInstance.insertText(index, text, formats, source);
}

export function setContents(editorElement, delta, source)
{
    return editorElement.__quillInstance.setContents(delta, source);
}

export function setText(editorElement, text, source)
{
    return editorElement.__quillInstance.setText(text, source);
}

export function updateContents(editorElement, delta, source)
{
    return editorElement.__quillInstance.updateContents(delta, source);
}

export function format(editorElement, name, value, source)
{
    return editorElement.__quillInstance.format(name, value, source);
}

export function formatLineSign1(editorElement, index, length, source)
{
    return editorElement.__quillInstance.formatLine(index, length, source);
}

export function formatLineSign2(editorElement, index, length, format, value, source)
{
    return editorElement.__quillInstance.formatLine(index, length, format, value, source);
}

export function formatLineSign3(editorElement, index, length, formats, source)
{
    return editorElement.__quillInstance.formatLine(index, length, formats, source);
}

export function formatTextSign1(editorElement, index, length, source)
{
    return editorElement.__quillInstance.formatText(index, length, source);
}

export function formatTextSign2(editorElement, index, length, format, value, source)
{
    return editorElement.__quillInstance.formatText(index, length, format, value, source);
}

export function formatTextSign3(editorElement, index, length, formats, source)
{
    return editorElement.__quillInstance.formatText(index, length, formats, source);
}

export function getFormatSign1(editorElement)
{
    return editorElement.__quillInstance.getFormat();
}

export function getFormatSign2(editorElement, range)
{
    return editorElement.__quillInstance.getFormat(range);
}

export function getFormatSign3(editorElement, index, length)
{
    return editorElement.__quillInstance.getFormat(index, length);
}

export function removeFormat(editorElement, index, length, source)
{
    return editorElement.__quillInstance.removeFormat(index, length, source);
}

export function getBounds(editorElement, index, length)
{
    return editorElement.__quillInstance.getBounds(index, length);
}

export function getSelection(editorElement, focus)
{
    return editorElement.__quillInstance.getSelection(focus);
}

export function setSelectionSign1(editorElement, index, length, source)
{
    editorElement.__quillInstance.setSelection(index, length, source);
}

export function setSelectionSign2(editorElement, range, source)
{
    editorElement.__quillInstance.setSelection(range, source);
}

export function scrollSelectionIntoView(editorElement)
{
    editorElement.__quillInstance.scrollSelectionIntoView();
}

export function blur(editorElement)
{
    editorElement.__quillInstance.blur();
}

export function disable(editorElement)
{
    editorElement.__quillInstance.disable();
}

export function enable(editorElement, enabled)
{
    editorElement.__quillInstance.enable(enabled);
}

export function focusSign1(editorElement)
{
    editorElement.__quillInstance.focus();
}

export function focusSign2(editorElement, preventScroll)
{
    editorElement.__quillInstance.focus({ preventScroll });
}

export function hasFocus(editorElement)
{
    return editorElement.__quillInstance.hasFocus();
}

export function update(editorElement)
{
    editorElement.__quillInstance.update();
}

export function scrollRectIntoView(editorElement, bounds)
{
    editorElement.__quillInstance.scrollRectIntoView(bounds);
}