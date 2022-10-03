window.oncontextmenu = function() { return false; }

let _selected = -1;
let selected = -1;
let lines = [];
let pairs = [];
let dirty = false;
let solvePressed = false;
let undostack = [];
let editorTool = "hand"; // or SVG element id
let editorParams = {
    grid: 0.5,
    dotSquare: -1,
    dotColor: -1,
};

function reset() {
    playAudio('xau_reset', 0.8, 1);
    render(e('panel').panel);
}

function initUI() {
    const panel = e('panel').panel;
    setCSS('right', intToHex(panel.style.rightDots));
    setCSS('rightStroke', intToHex(panel.style.rightStroke));
    selected = -1;
    lines = [];
    pairs = [];
    dirty = false;
    if (solvePressed) resetStatus();
    undostack = [];
}

function handleClick(evt, i) {
    if (editorTool !== 'hand') return;
    switch (evt.button) {
        case 0:
            selectDot(i);
            break;
        case 1:
            reset();
            break;
        case 2:
            removeDot(i);
            break;
    }
    evt.preventDefault();
    evt.stopPropagation();
}

// onclick - select
function selectDot(id) {
    if (selected !== -1) return;
    if (solvePressed) resetStatus();
    selected = id;
    _selected = id;
    const panel = e('panel').panel;
    const stroke = intToHex(panel.style.stroke);
    insertElement('line', 'line', 'line').with('id', 'line-current')
        .with('x1', panel.dots[id].pos.x).with('y1', panel.dots[id].pos.y).with('x2', panel.dots[id].pos.x).with('y2', panel.dots[id].pos.y)
        .with('stroke', stroke).with('stroke-width', 0.2);
    insertElement('circle', 'line', 'line').with('id', 'c-current').with('r', 0.1).with('fill', stroke).with('cx', panel.dots[id].pos.x).with('cy', panel.dots[id].pos.y)
    refresh('panel-svg');
}

function removeDot(id) {
    if (selected !== -1) return;
    const panel = e('panel').panel;
    for (let i = 0; i < panel.dots.length; i++) {
        if (id === i) continue;
        let idx = getIndex(panel, i, id);
        if (lines.includes(idx)) {
            lines = remove(lines, idx);
            removeElement(`line-${idx}`)
        }
    }
}

// onmove - update
function updateLine(evt) {
    if ((editorTool === 'hand' || editorTool === 'eraser') && selected === -1) return
    const pt = e('panel').pointer
    pt.x = evt.clientX; pt.y = evt.clientY;
    const pos = pt.matrixTransform(e('panel-svg').getScreenCTM().inverse());
    e('editor-ghost').with('transform', `translate(${Math.demod(pos.x + (editorParams.grid / 2), editorParams.grid)}, ${Math.demod(pos.y + (editorParams.grid / 2), editorParams.grid)})`)
    if (selected !== -1) {
        e('line-current').with('x2', pos.x).with('y2', pos.y);
        e('c-current').with('cx', pos.x).with('cy', pos.y);
        const panel = e('panel').panel;
        const p1 = panel.dots[selected].pos;
        main: for (let i = 0; i < panel.dots.length; i++) {
            if (i === selected) continue;
            let length = pointToSegment(panel.dots[i].pos, p1, pos);
            if (length <= 0.25) {
                for (let brk of panel.breaks)
                    if (pointInSegment(brk, panel.dots[selected].pos, panel.dots[i].pos)) continue main;
                connectDot(i);
                e('line-current').with('x1', panel.dots[_selected].pos.x).with('y1', panel.dots[_selected].pos.y);
                undostack.push(selected);
                selected = i;
                break;
            }
        }        
    }
    refresh('panel-svg');
}

function connectDot(id) {
    const panel = e('panel').panel;
    const idx = getIndex(panel, _selected, id);
    if (!lines.includes(idx)) { 
        lines.push(idx);
        insertElement('line', 'line', 'line').with('id', `line-${idx}`)
            .with('x1', panel.dots[_selected].pos.x).with('y1', panel.dots[_selected].pos.y)
            .with('x2', panel.dots[id].pos.x).with('y2', panel.dots[id].pos.y)
            .with('stroke', intToHex(panel.style.stroke)).with('stroke-width', 0.2);
    } else {
        lines = remove(lines, idx);
        removeElement(`line-${idx}`)
    }
    _selected = id;
    dirty = true;
    playAudio('node_connect', 0.5, 2);
}

// onleave - deselect
function deselectDot(evt) {
    if (selected === -1) return;
    selected = -1;
    removeElement('line-current');
    removeElement('c-current');
    refresh('panel-svg');
}

function getIndex(panel, a, b) {
    return Math.min(a, b) * panel.dots.length + Math.max(a, b);
}

function undo() {
    if (undostack.length) connectDot(undostack.pop())
    if (solvePressed) resetStatus();
    refresh('panel-svg');
    playAudio('puzzle_undo', 0.8, 1);
}

function resetStatus() {
    for (let el of Array.from(document.getElementsByClassName('dot-circle'))) el.classList.remove('right', 'wrong')
    for (let el of Array.from(document.getElementsByClassName('line'))) el.classList.remove('rightStroke');
    solvePressed = false;
    refresh('panel-svg');
}

function drawEditorGhost() {
    const panel = e('panel').panel;
    if (editorTool === 'hand' || editorTool === 'eraser') return;
    insertElement('path', 'editor-ghost').with('d', svg(editorTool)).with('fill', intToHex((editorTool === 'dot' && editorParams.dotColor !== -1) ? editorParams.dotColor : panel.style.dots));
    if (editorTool === 'dot' && editorParams.dotSquare !== -1) insertElement('path', 'editor-ghost').with('d', svg('square')).with('fill', intToHex(editorParams.dotSquare));
}

function destroyEditorGhost() {
    cleanElement('editor-ghost');
}

document.onkeydown = function(evt) {
    switch (evt.key) {
        case " ":
            solve('panel');
            break;
        case "C":
        case "c":
        case "Z":
        case "z":
            undo();
            break;
        case "R":
        case "r":
            reset();
            break;
    }
}

async function playAudio(audio, min=1, max=1) {
    let a = new Audio(`./sfx/${audio}.wav`);
    a.loop = false;
    a.preservesPitch = false;
    a.playbackRate = min + (Math.random() * (max - min));
    a.play(); 
}