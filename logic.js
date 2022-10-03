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
    sprites = []; // Sprite[]
    rules; // Rule[]
    style = {
        background: 0x000000FF, // color
        dots: 0xFFFFFFFF, // color
        rightDots: 0xDDAADDFF, // color upon winning
        stroke: 0xFFFFFFFF, // lines
        rightStroke: 0xFFFFFFFF, // lines upon winning
    }
    path = null;

    constructor(width, height, background=0x000000FF, dots=0xFFFFFFFF, rightDots=0xDDAADDFF, stroke=0xFFFFFFFF, rightStroke=0xFFFFFFFF, rules=[]) {
        this.size = new Pair(width, height);
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
    d; // SVG path string
    fill; // color
    pos; // Pair
    z;
    size; // Pair
    rot; // radian

    constructor(d, x, y, z=-1, fill=0xFFFFFFFF, xscale=1, yscale=xscale, rot=0) {
        this.d = d;
        this.pos = new Pair(x, y);
        this.z = z;
        this.fill = fill;
        this.size = new Pair(xscale, yscale);
        this.rot = rot;
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

