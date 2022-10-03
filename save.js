function saveButton() {
    navigator.clipboard.writeText(window.location.href + "#" + save());
    alert('Link saved to clipboard!')
}

function save() {
    const panel = e('panel').panel;
    let bytes = savePair(panel.size);
    bytes += ['background', 'dots', 'stroke', 'rightDots', 'rightStroke'].map(x => intToByte(panel.style[x])).join('');
    bytes += String.fromCharCode(panel.dots.length);
    for (let dot of panel.dots) bytes += saveDot(dot);
    bytes += String.fromCharCode(panel.breaks.length);
    for (let br of panel.breaks) bytes += savePair(br);
    if (!panel.path) bytes += intToShort(0xFFFF);
    else {
        bytes += intToShort(panel.path.length);
        for (let inst of panel.path) bytes += intToShort(inst);
    }
    return savePost(bytes, 'v1');
}

function saveDot(dot) {
    let bytes = savePair(dot.pos);
    let id = 0x0;
    let bytes2 = '';
    if (dot.color !== -1) {
        id += 0x8;
        bytes2 += intToByte(dot.color)
    }
    switch (dot.square) {
        case -1:
            break;
        case 0x000000FF:
            id += 0x1;
            break;
        case 0xFF8800FF:
            id += 0x2;
            break;
        case 0x0000FFFF:
            id += 0x3;
            break;
        default:
            id += 0x4;
            bytes2 += intToByte(dot.square)
            break;
    }
    return bytes + String.fromCharCode(id) + bytes2;
}

function savePair(p) {
    let farr = new Float32Array(2);
    farr[0] = p.x;
    farr[1] = p.y;
    const iarr = new Uint8Array(farr.buffer);
    let bytes = '';
    for (let i = 0; i < iarr.length; i++) bytes += String.fromCharCode(iarr[i]);
    return bytes;
}

function savePost(raw, version) {
    return version + '_' + runLength(btoa(raw).replace(/\+/g, '.').replace(/\//g, '-').replace(/\=/g, '_'));
}

function loadButton() {
    navigator.clipboard.readText().then(str => {
        console.log(str.replace(/https?:.+?#/, ''))
        let panel = load(str.replace(/https?:.+?#/, ''));
        if (panel === null) alert('Invalid Puzzle!')
        else render(panel);
    })
}

function load(raw) {
    [version, string] = [raw.slice(0, 2), loadPre(raw.slice(3))];
    switch (version) {
        case 'v1':
            return loadV1(string);
        default:
            return null;
    }
}

function loadPre(string) {
    return atob(derunLength(string).replace(/\./g, '+').replace(/\-/g, '/').replace(/\_/g, '='));
}

function loadV1(string) {
    let ptr = 0;
    let panel = new Panel(1, 1);
    panel.size = loadPair(string.slice(ptr, ptr + 8));
    ptr += 8;
    for (let style of ['background', 'dots', 'stroke', 'rightDots', 'rightStroke']) {
        panel.style[style] = byteToInt(string.slice(ptr, ptr + 4), false);
        ptr += 4;
    }
    const dots = string.charCodeAt(ptr);
    ptr++;
    for (let i = 0; i < dots; i++) {
        let res = loadDot(string, ptr);
        panel.dots.push(res.dot);
        ptr += res.offset;
    }
    const breaks = string.charCodeAt(ptr);
    ptr++;
    for (let i = 0; i < breaks; i++) {
        panel.breaks.push(loadPair(string.slice(ptr, ptr + 8)));
        ptr += 8;
    }
    const path = shortToInt(string.slice(ptr, ptr + 2), false);
    ptr += 2;
    if (path !== 0xFFFF) {
        panel.path = [];
        for (let i = 0; i < path; i++) {
            panel.path.push(shortToInt(string.slice(ptr, ptr + 2), false))
            ptr += 2;
        }
    }
    if (ptr !== string.length) {
        console.error('uh oh! something went wrong')
        return null;
    }
    return panel;
}

function loadPair(str) {
    let iarr = new Uint8Array(8);
    for (let i = 0; i < 8; i++) iarr[i] = str.charCodeAt(i);
    const farr = new Float32Array(iarr.buffer);
    return new Pair(Math.prec(farr[0]), Math.prec(farr[1])); // float->double cleanup :)
}

function loadDot(string, ptr) {
    let offset = 0;
    const pos = loadPair(string.slice(ptr, ptr + 8));
    ptr += 8; offset += 8;
    let res = new Dot(pos.x, pos.y);
    let id = string.charCodeAt(ptr);
    ptr++; offset++;
    if (id & 0x8) {
        res.color = intToByte(string.slice(ptr, ptr + 4));
        ptr += 4; offset += 4;
    }
    switch (id & 0x7) {
        case 0x0:
            res.square = -1;
            break;
        case 0x1:
            res.square = 0x000000FF;
            break;
        case 0x2:
            res.square = 0xFF8800FF;
            break;
        case 0x3:
            res.square = 0x0000FFFF;
            break;
        case 0x4:
            res.square = intToByte(string.slice(ptr, ptr + 4));
            ptr += 4; offset += 4;
            break;
    }
    return {
        dot: res,
        offset: offset
    }
}