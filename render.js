function render(panel) {
    cleanElement('panel');
    e('panel').panel = panel;
    if (e('right-size-x')) panel.size = new Pair(e('right-size-x').value, e('right-size-y').value)
    e('panel').style.width = 128 * panel.size.x;
    e('panel').style.height = 128 * panel.size.y;
    e('left').style.height = 128 * panel.size.y;
    e('right').style.height = 128 * panel.size.y;
    insertElement('div', 'panel', 'undo').with('id', 'undo').with('onmousedown', `undo()`)
    let tsvg = insertElement('svg', 'undo').with('viewBox', '-0.5 -0.5 1 1')
    insertElement('path', tsvg).with('d', svg('undo')).with('fill', 'white');
    refresh(tsvg);
    insertElement('div', 'panel', 'restart').with('id', 'restart').with('onmousedown', `reset()`)
    tsvg = insertElement('svg', 'restart').with('viewBox', '-0.5 -0.5 1 1')
    insertElement('path', tsvg).with('d', svg('restart')).with('fill', 'white');
    refresh(tsvg);
    insertElement('svg', 'panel', 'panel').with('id', 'panel-svg').with('viewBox', `0 0 ${panel.size.x} ${panel.size.y}`)
    initUI();
    insertElement('rect', 'panel-svg').with('id', 'bg').with('width', panel.size.x).with('height', panel.size.y).with('fill', intToHex(panel.style.background))
    insertElement('g', 'panel-svg').with('id', 'sprite-back')
    drawSprites('sprite-back', panel.sprites.filter(x => x.z < 0));
    insertElement('g', 'panel-svg').with('id', 'line')
    insertElement('g', 'panel-svg').with('id', 'sprite')
    drawSprites('sprite', panel.sprites.filter(x => x.z === 0));
    insertElement('g', 'panel-svg').with('id', 'symbol');
    const dotColor = intToHex(panel.style.dots);
    // break
    for (let pos of panel.breaks)
        insertElement('path', 'symbol').with('d', svg('break')).with('fill', dotColor).with('transform', `translate(${pos.x}, ${pos.y})`)
    // dot
    for (let i = 0; i < panel.dots.length; i++) {
        let dot = panel.dots[i];
        let el = insertElement('g', 'symbol', 'dot').with('transform', `translate(${dot.pos.x}, ${dot.pos.y})`).with('onmousedown', `handleClick(event, ${i})`)
        insertElement('path', el, 'dot-circle').with('id', `dot-${i}`).with('d', svg('dot')).with('fill', dot.color === -1 ? dotColor : intToHex(dot.color))
        if (dot.square !== -1) insertElement('path', el).with('d', svg('square')).with('fill', intToHex(dot.square))
    }
    insertElement('g', 'panel-svg').with('id', 'sprite-front')
    drawSprites('sprite-front', panel.sprites.filter(x => x.z > 0));
    insertElement('g', 'panel-svg').with('id', 'editor-ghost').with('style', 'opacity: 0.5;')
    refresh('panel-svg')
    e('panel').pointer = e('panel-svg').createSVGPoint();
    document.onmousemove = updateLine;
    document.onmouseup = deselectDot;
    e('panel').onmouseenter = drawEditorGhost;
    e('panel').onmouseleave = destroyEditorGhost;
    e('panel').onmousedown = placeEditorSymbols;
    insertElement('div', 'panel', 'solve').with('id', 'solve').with('onmousedown', `solve('panel')`)
    tsvg = insertElement('svg', 'solve').with('viewBox', '-0.5 -0.5 1 1').with('style', 'height: 100%; margin: 0 auto; display: block;')
    insertElement('path', tsvg).with('d', svg('solve')).with('fill', 'white');
    refresh(tsvg);
}

function drawSprites(id, sprites) {
    for (let sprite of sprites)
        insertElement('path', id).with('d', svg(sprite.d)).with('fill', intToHex(sprite.fill)).with('transform', `scale(${sprite.size.x}, ${sprite.size.y}) rotate(${sprite.rot}) translate(${sprite.pos.x}, ${sprite.pos.y})`)
}

const SVG_LIST = {
    hand: "M-.2-.3 0-.3 0 0 .2 0 .2.3-.2.3",
    eraser: "M0 .3.3 0 0-.3-.3 0M.1-.3.3-.1.4-.2.2-.4",
    dot: "M0 .25A.25.25 90 000-.25.25.25 90 000 .25",
    square: "M-.15-.15.15-.15.15.15-.15.15-.15-.15-.1-.1-.1.1.1.1.1-.1-.1-.1",
    break: "M-.15-.15.15-.15.15.15-.15.15",
    undo: "M.3-.1 0-.1 0-.3-.3 0 0 .3 0 .1.3.1",
    restart: "M-.2-.1.2-.1.1.3-.1.3M-.2-.2.2-.2.1-.3-.1-.3",
    solve: "M-.1-.1-.2 0 0 .2.3-.1.2-.2 0 0"
};
function svg(d) {
    return SVG_LIST[d] ?? d;
}