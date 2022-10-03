function solve(id) {
    const panel = e(id).panel;
    let invalid = [];
    if (panel.path) {
        if (lines.length !== panel.path.length) for (let i = 0; i < panel.dots.length; i++) invalid.push(i);
        else {
            let l2 = [...lines].sort();
            let p2 = [...panel.path].sort();
            if (!l2.every((x, i) => x === p2[i])) for (let i = 0; i < panel.dots.length; i++) invalid.push(i);
        }
    } else {
        if (dirty) makePairs(panel);
        let regions = [];
        for (let i = 0; i < panel.dots.length; i++) {
            if (panel.dots[i].square === -1) continue;
            if (regions.flat().includes(i)) continue;
            // for all square not in regions yet
            regions.push(getRegion(i));
        }
        for (let region of regions) invalid.push(...dotCheck(panel, region));
    }
    if (invalid.length) {
        for (let i of invalid) e(`dot-${i}`).classList.add('wrong');
        playAudio('xau_puzzle_fail')
    }
    else {
        for (let el of Array.from(document.getElementsByClassName('dot-circle'))) el.classList.add('right');
        for (let el of Array.from(document.getElementsByClassName('line'))) el.classList.add('rightStroke');
        playAudio('xau_puzzle_solve')
    }
    solvePressed = true;
}

function makePairs(panel) {
    pairs = [];
    for (line of lines) pairs.push(new Pair(line % panel.dots.length, Math.div(line, panel.dots.length)))
}

function getRegion(i, region=[]) {
    region.push(i);
    const connected = getConnected(i);
    for (let neighbor of connected) if (!region.includes(neighbor)) getRegion(neighbor, region);
    return region;
}

function dotCheck(panel, region) {
    let color = null;
    let invalid = [];
    const squares = region.filter(x => panel.dots[x].square !== -1);
    if (squares.length === 1) return squares;
    for (let i of squares) { // handle color
        if (panel.dots[i].square === 0x000000FF) continue;
        if (color === null) color = panel.dots[i].square;
        else if (color !== panel.dots[i].square) {
            color = -1;
            break;
        }
    }
    if (color === -1) invalid.push(...squares.filter(x => panel.dots[x].square !== 0x000000FF))
    invalid.push(...squares.filter(x => getConnected(x).length !== 1));
    return unique(invalid);
}

function getConnected(i) {
    return pairs.filter(x => x.x === i || x.y === i).map(x => x.x === i ? x.y : x.x);
}