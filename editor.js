window.onload = function() {
    for (let el of Array.from(document.getElementsByClassName('tools'))) {
        let tsvg = insertElement('svg', el, 'tools-svg').with('viewBox', '-0.5 -0.5 1 1');
        insertElement('path', tsvg).with('d', svg(el.id)).with('fill', 'white');
        refresh(tsvg);
        el.with('onmousedown', `selectTool('${el.id}')`);
    }
    selectTool('hand');
    if (window.location.hash !== '') render(load(window.location.hash.slice(1)));
}

function selectTool(tool) {
    editorTool = tool;
    for (let el of Array.from(document.getElementsByClassName('tools'))) el.classList.remove('active');
    e(tool).classList.add('active')
    cleanElement('right')
    const panel = e('panel').panel;
    switch (tool) {
        case 'hand':
        case 'eraser': // global config
            let sizeControl = insertEntry('Size', 'number', 'number');
            sizeControl[1].with('min', 1).with('max', 256).with('step', 0.25).with('value', panel.size.x).with('id', 'right-size-x').with('onchange', `render(e('panel').panel)`);
            sizeControl[0].with('min', 1).with('max', 256).with('step', 0.25).with('value', panel.size.y).with('id', 'right-size-y').with('onchange', `render(e('panel').panel)`);
            insertColorEntry('Background', 'background', panel.style.background)
            insertColorEntry('Dot Color', 'dots', panel.style.dots)
            insertColorEntry('Dot Correct', 'rightDots', panel.style.rightDots)
            insertColorEntry('Line Color', 'stroke', panel.style.stroke)
            insertColorEntry('Line Correct', 'rightStroke', panel.style.rightStroke)
            insertEntry('Snap', 'number')[0].with('min', 0).with('max', 16).with('step', 0.05).with('value', editorParams.grid).with('onchange', 'editorParams.grid = this.value')
            insertElement('div', 'right', 'entry').with('id', 'right-save-wrapper');
            insertElement('button', 'right-save-wrapper', 'right-save', 'Save').with('onmousedown', 'saveButton()');
            insertElement('button', 'right-save-wrapper', 'right-save', 'Load').with('onmousedown', 'loadButton()');
            insertElement('div', 'right', 'entry').with('id', 'right-clear-wrapper');
            insertElement('button', 'right-clear-wrapper', 'right-save', 'Clear').with('onmousedown', `render(new Panel(e('right-size-x').value, e('right-size-y').value))`);
            insertElement('button', 'right-clear-wrapper', 'right-save', 'Grid').with('onmousedown', `render(simpleGrid(e('right-size-x').value, e('right-size-y').value))`);
            insertElement('div', 'right', 'entry').with('id', 'right-path-wrapper');
            insertElement('button', 'right-clear-wrapper', 'right-save', 'Set Path').with('onmousedown', `setPath(e('panel').panel)`);
            insertElement('button', 'right-clear-wrapper', 'right-save', 'Clear Path').with('onmousedown', `clearPath(e('panel').panel)`);
            insertElement('p', insertElement('div', 'right', 'entry'), null, panel.path ? `[${panel.path.join(', ')}]` : '').with('id', 'right-path');
            break;
        case 'dot': // square config
            insertEntry('Square', 'color')[0].with('id', 'right-dot-square-color').with('value', intToHex(editorParams.dotSquare)).with('onchange', `changeDotSquare(hexToInt(this.value + 'FF'))`)
            insertElement('div', 'right', 'entry').with('id', 'right-dot-square-wrapper');
            insertDotSquareEntry(-1).classList.add('active');
            insertDotSquareEntry(0x000000FF);
            insertDotSquareEntry(0xFF8800FF);
            insertDotSquareEntry(0x0000FFFF);
            let dotColorControl = insertEntry('Dot Color', 'color', 'checkbox')
            dotColorControl[0].with('id', 'right-dot-color-color').with('onchange', `editorParams.dotColor = e('right-dot-color-use').checked ? hexToInt(e('right-dot-color-color').value + 'FF') : -1`).with('value', intToHex(editorParams.dotColor))
            dotColorControl[1].with('id', 'right-dot-color-use').with('onchange', `editorParams.dotColor = e('right-dot-color-use').checked ? hexToInt(e('right-dot-color-color').value + 'FF') : -1`)
            insertEntry('Snap', 'number')[0].with('min', 0).with('max', 16).with('step', 0.05).with('value', editorParams.grid).with('onchange', 'editorParams.grid = this.value')
            break;
        case 'break': // nothing
            insertEntry('Snap', 'number')[0].with('min', 0).with('max', 16).with('step', 0.05).with('value', editorParams.grid).with('onchange', 'editorParams.grid = this.value')
            break;
    }
    render(panel);
}

function insertDotSquareEntry(color=-1) {
    let button = insertElement('button', 'right-dot-square-wrapper', ['tools-right', 'right-dot-square-button']).with('onmousedown', 'changeDotSquare(this.color)')
    button.color = color;
    let tsvg = insertElement('svg', button).with('viewBox', '-0.3 -0.3 0.6 0.6');
    insertElement('path', tsvg).with('d', svg('dot')).with('fill', 'white')
    if (color !== -1) insertElement('path', tsvg).with('d', svg('square')).with('fill', intToHex(color))
    refresh(tsvg);
    return button;
}

function changeDotSquare(color) {
    editorParams.dotSquare = color;
    e('right-dot-square-color').with('value', intToHex(editorParams.dotSquare).slice(0, 7));
    for (let el of Array.from(document.getElementsByClassName('right-dot-square-button')))
        if (el.color === color) el.classList.add('active')
        else el.classList.remove('active')
}

function insertColorEntry(label, change, def=0x000000FF) {
    let wrapper = insertElement('div', 'right', 'entry')
    insertElement('p', wrapper, 'right-label', label);
    insertElement('input', wrapper, 'right-input').with('type', 'color').with('id', `right-style-${change}-color`).with('onchange', `updateStyle('${change}')`).with('value', intToHex(def).slice(0, 7));
    insertElement('input', wrapper, 'right-input').with('type', 'range').with('id', `right-style-${change}-alpha`).with('onchange', `updateStyle('${change}')`).with('min', 0).with('max', 255).with('step', 1).with('value', def & 0xFF);
}

function insertEntry(label, ...type) {
    let wrapper = insertElement('div', 'right', 'entry')
    insertElement('p', wrapper, 'right-label', label);
    let ret = [];
    for (t of type) ret.push(insertElement('input', wrapper, 'right-input').with('type', t));
    return ret;
}

function updateStyle(change) {
    const panel = e('panel').panel;
    panel.style[change] = hexToInt(e(`right-style-${change}-color`).value + parseInt(e(`right-style-${change}-alpha`).value).toString(16).padStart(2, '0'));
    render(panel);
}

function placeEditorSymbols(evt) {
    if (editorTool === 'hand') return;
    const pt = e('panel').pointer
    pt.x = evt.clientX; pt.y = evt.clientY;
    let posRaw = pt.matrixTransform(e('panel-svg').getScreenCTM().inverse());
    const pos = new Pair(Math.demod(posRaw.x + (editorParams.grid / 2), editorParams.grid), Math.demod(posRaw.y + (editorParams.grid / 2), editorParams.grid)); 
    if (editorTool === 'eraser' || evt.button === 2) eraseSymbolAt(pos);
    if (evt.button === 0) placeSymbolAt(pos);
}

function eraseSymbolAt(pos, refresh=true) {
    const panel = e('panel').panel;
    panel.dots = panel.dots.filter(x => !Pair.equal(x.pos, pos));
    panel.breaks = panel.breaks.filter(x => !Pair.equal(x, pos));
    if (refresh) render(panel);
    clearPath(panel);
    return panel;
}

function placeSymbolAt(pos) {
    const panel = eraseSymbolAt(pos, false);
    switch (editorTool) {
        case 'dot':
            panel.dots.push(new Dot(pos.x, pos.y, editorParams.dotSquare, editorParams.dotColor));
            break;
        case 'break':
            panel.breaks.push(pos);
            break;
    }
    render(panel);
    return panel;
}

function simpleGrid(x, y) {
    let panel = new Panel(x, y);
    for (let i = 0.5; i < x; i++) for (let j = 0.5; j < y; j++) panel.dots.push(new Dot(i, j));
    return panel;
}

function setPath(panel) {
    panel.path = [...lines];
    if (e('right-path')) e('right-path').innerHTML = `[${panel.path.join(', ')}]`;
}

function clearPath(panel) {
    panel.path = null;
    if (e('right-path')) e('right-path').innerHTML = '';
}