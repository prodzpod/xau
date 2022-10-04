class Pair {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    static add(a, b) {
        return new Pair(a.x + b.x, a.y + b.y);
    }
    static subtract(a, b) {
        return new Pair(a.x - b.x, a.y - b.y);
    }
    static multiply(a, n) {
        return new Pair(a.x * n, a.y * n);
    }
    static dist(a, b) {
        return Math.sqrt(Math.hypot(a.x - b.x, a.y - b.y));
    }
    static equal(a, b) {
        return a.x === b.x && a.y === b.y;
    }
}

class Panel {
    size; // Pair
    dots = []; // Dot[]
    breaks = []; // Pair[]
    bg = []; // Sprite[]
    fg = []; // Sprite[]
    rules; // Rule[]
    style = {
        background: 0x000000FF, // color
        dots: 0xFFFFFFFF, // color
        rightDots: 0xDDAADDFF, // color upon winning
        stroke: 0xFFFFFFFF, // lines
        rightStroke: 0xFFFFFFFF, // lines upon winning
    }
    path = null;
    regions = 0;

    constructor(width, height, regions=0, background=0x000000FF, dots=0xFFFFFFFF, rightDots=0xDDAADDFF, stroke=0xFFFFFFFF, rightStroke=0xFFFFFFFF, rules=[]) {
        this.size = new Pair(width, height);
        this.regions = regions;
        this.style.background = background;
        this.style.dots = dots;
        this.style.stroke = stroke;
        this.style.rightDots = rightDots;
        this.style.rightStroke = rightStroke;
        this.rules = rules;
    }

    // Add simple dots, manually push for complex dots
    addDots(square=-1, ...poss) {
        for (let i = 0; i < poss.length; i += 2) {
            this.dots.push(new Dot(poss[i], poss[i+1], square));
        }
        return this;
    }

    addBreak(...poss) {
        for (let i = 0; i < poss.length; i += 2) {
            this.breaks.push(new Pair(poss[i], poss[i+1]));
        }
        return this;
    }
}

class Sprite {
    url; // Duh
    pos; // Pair
    size; // Pair
    
    constructor(url, x, y, xscale=1, yscale=xscale) {
        this.url = url;
        this.pos = new Pair(x, y);
        this.size = new Pair(xscale, yscale);
    }
}

class Dot {
    pos; // Pair
    color; // color or -1 (-1 uses Panel's data)
    square; // color or -1 (if color, it's considered square)

    constructor(x, y, square=-1, color=-1) {
        this.pos = new Pair(x, y);
        this.square = square;
        this.color = color;
    }
}

