//* ALL-IN-ONE PRODUTIL
//? @version 2022-10 patch 1

// Math

Math.lerp = function(a, b, t) { return a + ((b - a) * t); }
Math.clamp = function(x, a, b) { return Math.min(Math.max(x, Math.min(a, b)), Math.max(a, b)); }
Math.between = function(a, b, c) { return a <= b && b <= c; }
Math.div = function(n, a) { return Math.trunc(n / a); }
Math.demod = function(n, a) { return n - (n % a); }
Math.posmod = function(n, a) { return ((n % a) + a) % a; }
Math.color = function(a) { return "#" + a.toString(16).padStart(8, "0"); }
Math.prec = function(n, a=6) { return Math.round(n * Math.pow(10, a)) / Math.pow(10, a); }
Math.approxeq = function(a, b, t=10) { return this.prec(a, t) === this.prec(b, t); }
Math.dot = function(p1, p2) { return (p1.x * p2.x) + (p1.y * p2.y); }
function pointInLine(p, a, b) {
    if (a.x === b.x) return p.x === a.x;
    if (a.y === b.y) return p.y === a.y;
    return ((p.x - a.x) / (b.x - a.x)) === ((p.y - a.y) / (b.y - a.y));
}
function pointInSegment(p, a, b) {
    return pointInLine(p, a, b) && ((a.x <= p.x && p.x <= b.x) || (a.x >= p.x && p.x >= b.x)) && ((a.y <= p.y && p.y <= b.y) || (a.y >= p.y && p.y >= b.y));
}
function pointToLine(p0, p1, p2) { // three Pair
    return Math.abs(((p2.x - p1.x) * (p1.y - p0.y)) - ((p1.x - p0.x) * (p2.y - p1.y))) / Math.sqrt(((p2.x - p1.x) * (p2.x - p1.x)) + ((p2.y - p1.y) * (p2.y - p1.y)));
}
function pointToSegment(p, a, b) {
    if (Math.dot(Pair.subtract(b, a), Pair.subtract(p, b)) >= 0) return Pair.dist(p, b);
    else if (Math.dot(Pair.subtract(b, a), Pair.subtract(p, a)) <= 0) return Pair.dist(p, a);
    else return pointToLine(p, a, b);
}

// Array

function remove(arr, ...thing) { return arr.filter(x => !thing.includes(x)); }
function unique(arr) {
    let found = [];
    for (let i = 0; i < arr.length; i++) if (!found.includes(arr[i])) found.push(arr[i]);
    return found;
}
function transpose(arr) {
    let ret = [];
    for (let i in arr) for (let o of arr[i]) {
        ret[o] ??= []; ret[o].push(Number(i));
    }
    return ret;
}
function intersect(a, b) { return a.filter(k => b.includes(k)); } // intersection of two arrays
function intersects(a, b) { // check for intersection
    if (a.length == 0 && b.length == 0) return false;
    if (a.length == 1) return b.includes(a[0]); if (b.length == 1) return a.includes(b[0]);
    return a.reduce((k, p) => { return k || b.includes(p);}, false);
}

function subSort(a, b) {
    a = tokenizeByNumber(a.name ?? a);
    b = tokenizeByNumber(b.name ?? b);
    while (true) {
        if (!a.length && !b.length) return 0; if (!a.length) return -1; if (!b.length) return 1; // special handler for simpler strings
        if (typeof(a[0]) == 'number' && typeof(b[0]) == 'string') return -1; if (typeof(a[0]) == 'string' && typeof(b[0]) == 'number') return 1; // number goes first
        if (typeof(a[0]) == 'number') { let ret = a[0] - b[0]; if (ret !== 0) return ret; }
        else { let ret = a[0].localeCompare(b[0]); if (ret !== 0) return ret; }
        a.splice(0, 1); b.splice(0, 1);
    }
}

function tokenizeByNumber(c) {
    if (c === '') return [];
    let isNumber = isNaN(c[0])
    let ret = [], txt = ''
    for (let i = 0; i < c.length; i++) {
        if (isNumber === isNaN(c[i])) txt += c[i];
        else {
            if (!isNumber) txt = Number(txt);
            ret.push(txt);
            isNumber = !isNumber;
            txt = c[i];
        }
    }
    if (!isNumber) txt = Number(txt);
    ret.push(txt);
    return ret;
}

// Color

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return (Math.round(r * 255) * 65536) + (Math.round(g * 255) * 256) + Math.round(b * 255);
}

function col(x) { return Math.round(x * 255).toString(16).padStart(2, '0'); }

function hexToInt(hex) {
    return parseInt(hex.slice(1), 16) >>> 0;
}
function intToHex(int) {
    return '#' + Number(int).toString(16).padStart(8, '0');
}

function getCSS(v) {
    return getComputedStyle(document.querySelector(':root')).getPropertyValue(`--${v}`);
}

function setCSS(v, value) {
    document.querySelector(':root').style.setProperty(`--${v}`, value);
    return value;
}

// String

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();});
};

String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < 32; i++) {
        chr   = this.charCodeAt(i % this.length);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function sNull(str, def) { 
    if (!str?.length) return null;
    switch (typeof(str) == 'string' ? str.toLowerCase() : str) {
        case 'null':
        case def:
            return null;
        case '':
        case 'undefined':
            return undefined;
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            if (!isNaN(str)) return Number(str);
            return str;
    }
}

const _keyStr = " 123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.-0"

window.runLength = function (str) {
    let res = "";
    let cur = '';
    let rep = 0;
    str += '!'; // terminate
    for (let i = 0; i < str.length; i++) {
        if (rep == 64) {
            res += '~0' + cur;
            rep = 0;
        }
        if (cur != str[i]) {
            if (rep > 3) {
                res += '~' + _keyStr[rep] + cur;
            } else res += cur.repeat(rep);
            cur = str[i];
            rep = 1;
        } else rep++;
    }
    return res;
}

window.derunLength = function (str) {
    let res = ""
    for (let i = 0; i < str.length; i++) {
        if (str[i] == '~') {
            res += str[i + 2].repeat(_keyStr.indexOf(str[i + 1]));
            i += 2;
        } else res += str[i];
    }
    return res;
}

window.runLengthV2 = function (str) {
    let res = "";
    let cur = '';
    let rep = 0;
    str += '!'; // terminate
    //* STAGE 1: SINGLE LETTER RLE
    for (let i = 0; i < str.length; i++) {
        if (rep == 64) {
            res += '~~0' + cur;
            rep = 0;
        }
        if (cur != str[i]) {
            if (rep > 4) {
                res += '~~' + _keyStr[rep] + cur;
            } else res += cur.repeat(rep);
            cur = str[i];
            rep = 1;
        } else rep++;
    }
    //* STAGE 2: 4 LETTER RLE
    str = res;
    res = "";
    cur = '';
    rep = 0;
    str += '!!!!'; // terminate
    for (let i = 0; i < str.length - 3;) {
        if (rep == 64) {
            res += '~0' + cur;
            rep = 0;
        }
        if (rep) {
            if (cur == str.slice(i, i + 4)) {
                rep++;
                i += 4;
            } else {
                res += '~' + _keyStr[rep] + cur
                cur = '';
                rep = 0;
            }
        } else {
            if (str.slice(i, i + 4) == str.slice(i + 4, i + 8)) {
                cur = str.slice(i, i + 4)
                rep = 1;
                i += 4;
            } else {
                res += str[i];
                i++;
            }
        }
    }
    res = res.replace(/\!+/g, '');
    return res;
}

window.derunLengthV2 = function (str) {
    let res = ""
    for (let i = 0; i < str.length; i++) {
        if (str.slice(i, i + 2) == '~~') {
            res += '~~';
            i++;
        } else if (str[i] == '~') {
            res += str.slice(i + 2, i + 6).repeat(_keyStr.indexOf(str[i + 1]));
            i += 5;
        } else res += str[i];
    }
    str = res;
    res = "";
    for (let i = 0; i < str.length; i++) {
        if (str.slice(i, i + 2) == '~~') {
            res += str[i + 3].repeat(_keyStr.indexOf(str[i + 2]));
            i += 3;
        } else res += str[i];
    }
    return res;
}

const base = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzゝぁあぃいぅうぇえぉおゕかきくゖけこさしすせそたちっつてとなにぬねのはひふへほまみむめもゃやゅゆょよらりるれろゎわゐゑをんヽァアィイゥウェエォオヵカキㇰクヶケコサㇱシㇲスセソタチッツテㇳトナニㇴヌネノㇵハㇶヒㇷフㇸヘㇹホマミㇺムメモャヤュユョヨㇻラㇼリㇽルㇾレㇿロヮワヰヱヲンㄅㆠㄆㆴㄇㄈㄪㄉㄊㆵㄋㄌㄍㆣㄎㆶㄫㆭㄏㆷㄐㆢㄑㄒㄬㄓㄔㄕㄖㄗㆡㄘㄙㄚㆩㄛㆧㆦㄜㄝㆤㆥㄞㆮㄟㄠㆯㄡㄢㄣㄤㆲㄥㆰㆱㆬㄦㄧㆪㆳㄨㆫㆨㄩæɓƃƈđɖɗƌðǝəɛƒǥɠɣƣƕħıɨɩƙłƚɲƞŋœøɔɵȣƥʀʃŧƭʈɯʊʋƴƶȥʒƹȝþƿƨƽƅʔɐɑɒʙƀɕʣʥʤɘɚɜɝɞʚɤʩɡɢʛʜɦɧɪʝɟʄʞʪʫʟɫɬɭɮƛʎɱɴɳɶɷɸʠĸɹɺɻɼɽɾɿʁʂƪʅʆʨƾʦʧƫʇʉɥɰʌʍʏƍʐʑƺʓƻʕʡʢʖǀǁǂǃʗʘʬʭαβγδεϝϛζηθικλμνξοπϟϙρστυφχψωϡϳϗаәӕбвгґғҕдԁђԃҙеєжҗзԅѕӡԇиҋіјкқӄҡҟҝлӆљԉмӎнӊңӈҥњԋоөпҧҁрҏсԍҫтԏҭћуүұѹфхҳһѡѿѽѻцҵчҷӌҹҽҿџшщъыьҍѣэюяѥѧѫѩѭѯѱѳѵҩӀ҃҄҅҆֊ᐁᐂᐃᐄᐅᐆᐇᐈᐉᐊᐋᐌᐍᐎᐏᐐᐑᐒᐓᐔᐕᐖᐗᐘᐙᐚᐛᐜᐝᐞᐟᐠᐡᐢᐣᐤᐥᐦᐧᐨᐩᐪᐫᐬᐭᐮᐯᐰᐱᐲᐳᐴᐵᐶᐷᐸᐹᐺᐻᐼᐽᐾᐿᑀᑁᑂᑃᑄᑅᑆᑇᑈᑉᑊᑋᑌᑍᑎᑏᑐᑑᑒᑓᑔᑕᑖᑗᑘᑙᑚᑛᑜᑝᑞᑟᑠᑡᑢᑣᑤᑥᑦᑧᑨᑩᑪᑫᑬᑭᑮᑯᑰᑱᑲᑳᑴᑵᑶᑷᑸᑹᑺᑻᑼᑽᑾᑿᒀᒁᒂᒃᒄᒅᒆᒇᒈᒉᒊᒋᒌᒍᒎᒏᒐᒑᒒᒓᒔᒕᒖᒗᒘᒙᒚᒛᒜᒝᒞᒟᒠᒡᒢᒣᒤᒥᒦᒧᒨᒩᒪᒫᒬᒭᒮᒯᒰᒱᒲᒳᒴᒵᒶᒷᒸᒹᒺᒻᒼᒽᒾᒿᓀᓁᓂᓃᓄᓅᓆᓇᓈᓉᓊᓋᓌᓍᓎᓏᓐᓑᓒᓓᓔᓕᓖᓗᓘᓙᓚᓛᓜᓝᓞᓟᓠᓡᓢᓣᓤᓥᓦᓧᓨᓩᓪᓫᓬᓭᓮᓯᓰᓱᓲᓳᓴᓵᓶᓷᓸᓹᓺᓻᓼᓽᓾᓿᔀᔁᔂᔃᔄᔅᔆᔇᔈᔉᔊᔋᔌᔍᔎᔏᔐᔑᔒᔓᔔᔕᔖᔗᔘᔙᔚᔛᔜᔝᔞᔟᔠᔡᔢᔣᔤᔥᔦᔧᔨᔩᔪᔫᔬᔭᔮᔯᔰᔱᔲᔳᔴᔵᔶᔷᔸᔹᔺᔻᔼᔽᔾᔿᕀᕁᕂᕃᕄᕅᕆᕇᕈᕉᕊᕋᕌᕍᕎᕏᕐᕑᕒᕓᕔᕕᕖᕗᕘᕙᕚᕛᕜᕝᕞᕟᕠᕡᕢᕣᕤᕥᕦᕧᕨᕩᕪᕫᕬᕭᕮᕯᕰᕱᕲᕳᕴᕵᕶᕷᕸᕹᕺᕻᕽᙯᕾᕿᖀᖁᖂᖃᖄᖅᖆᖇᖈᖉᖊᖋᖌᖍᙰᖎᖏᖐᖑᖒᖓᖔᖕᙱᙲᙳᙴᙵᙶᖖᖗᖘᖙᖚᖛᖜᖝᖞᖟᖠᖡᖢᖣᖤᖥᖦᕼᖧᖨᖩᖪᖫᖬᖭᖮᖯᖰᖱᖲᖳᖴᖵᖶᖷᖸᖹᖺᖻᖼᖽᖾᖿᗀᗁᗂᗃᗄᗅᗆᗇᗈᗉᗊᗋᗌᗍᗎᗏᗐᗑᗒᗓᗔᗕᗖᗗᗘᗙᗚᗛᗜᗝᗞᗟᗠᗡᗢᗣᗤᗥᗦᗧᗨᗩᗪᗫᗬᗭᗮᗯᗰᗱᗲᗳᗴᗵᗶᗷᗸᗹᗺᗻᗼᗽᗾᗿᘀᘁᘂᘃᘄᘅᘆᘇᘈᘉᘊᘋᘌᘍᘎᘏᘐᘑᘒᘓᘔᘕᘖᘗᘘᘙᘚᘛᘜᘝᘞᘟᘠᘡᘢᘣᘤᘥᘦᘧᘨᘩᘪᘫᘬᘭᘮᘯᘰᘱᘲᘳᘴᘵᘶᘷᘸᘹᘺᘻᘼᘽᘾᘿᙀᙁᙂᙃᙄᙅᙆᙇᙈᙉᙊᙋᙌᙍᙎᙏᙐᙑᙒᙓᙔᙕᙖᙗᙘᙙᙚᙛᙜᙝᙞᙟᙠᙡᙢᙣᙤᙥᙦᙧᙨᙩᙪᙫᙬᚁᚂᚃᚄᚅᚆᚇᚈᚉᚊᚋᚌᚍᚎᚏᚐᚑᚒᚓᚔᚕᚖᚗᚘᚙᚚᚠᚡᚢᚤᚥᚦᚧᛰᚨᚩᚬᚭᚮᚯᚰᚱᚲᚳᚴᚵᚶᚷᚹᛩᚺᚻᚼᚽᚾᚿᛀᛁᛂᛃᛄᛅᛆᛮᛇᛈᛕᛉᛊᛋᛪᛌᛍᛎᛏᛐᛑᛒᛓᛔᛖᛗᛘᛙᛯᛚᛛᛜᛝᛞᛟᚪᚫᚣᛠᛣᚸᛤᛡᛢᛥᛦᛧᛨ᠐᠑᠒᠓᠔᠕᠖᠗᠘᠙ᢀᢁᢂᢃᢄᢅᢆᡃᠠᢇᠡᡄᡝᠢᡅᡞᡳᢈᡟᠣᡆᠤᡇᡡᠥᡈᠦᡉᡠᠧᠨᠩᡊᡢᢊᢛᠪᡋᠫᡌᡦᠬᡍᠭᡎᡤᢚᡥᠮᡏᠯᠰᠱᡧᢜᢝᢢᢤᢥᠲᡐᡨᠳᡑᡩᠴᡒᡱᡜᢋᠵᡓᡪᡷᠶᡕᡲᠷᡵᠸᡖᠹᡫᡶᠺᡗᡣᡴᢉᠻᠼᡔᡮᠽᡯᡘᡬᠾᡙᡭᠿᡀᡁᡂᡚᡛᡰᢌᢞᢍᢎᢟᢏᢐᢘᢠᢑᢡᢒᢓᢨᢔᢣᢕᢙᢖᢗᢦᢧᢩաբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆՙ፩፪፫፬፭፮፯፰፱ሀሁሂሃሄህሆለሉሊላሌልሎሏሐሑሒሓሔሕሖሗመሙሚማሜምሞሟሠሡሢሣሤሥሦሧረሩሪራሬርሮሯሰሱሲሳሴስሶሷሸሹሺሻሼሽሾሿቀቁቂቃቄቅቆቈቊቋቌቍቐቑቒቓቔቕቖቘቚቛቜቝበቡቢባቤብቦቧቨቩቪቫቬቭቮቯተቱቲታቴትቶቷቸቹቺቻቼችቾቿኀኁኂኃኄኅኆኈኊኋኌኍነኑኒናኔንኖኗኘኙኚኛኜኝኞኟአኡኢኣኤእኦኧከኩኪካኬክኮኰኲኳኴኵኸኹኺኻኼኽኾዀዂዃዄዅወዉዊዋዌውዎዐዑዒዓዔዕዖዘዙዚዛዜዝዞዟዠዡዢዣዤዥዦዧየዩዪያዬይዮደዱዲዳዴድዶዷዸዹዺዻዼዽዾዿጀጁጂጃጄጅጆጇገጉጊጋጌግጎጐጒጓጔጕጘጙጚጛጜጝጞጠጡጢጣጤጥጦጧጨጩጪጫጬጭጮጯጰጱጲጳጴጵጶጷጸጹጺጻጼጽጾጿፀፁፂፃፄፅፆፈፉፊፋፌፍፎፏፐፑፒፓፔፕፖፗፘፙፚᎠᎡᎢᎣᎤᎥᎦᎧᎨᎩᎪᎫᎬᎭᎮᎯᎰᎱᎲᎳᎴᎵᎶᎷᎸᎹᎺᎻᎼᎽᎾᎿᏀᏁᏂᏃᏄᏅᏆᏇᏈᏉᏊᏋᏌᏍᏎᏏᏐᏑᏒᏓᏔᏕᏖᏗᏘᏙᏚᏛᏜᏝᏞᏟᏠᏡᏢᏣᏤᏥᏦᏧᏨᏩᏪᏫᏬᏭᏮᏯᏰᏱᏲᏳᏴ𐌀𐌁𐌂𐌃𐌄𐌅𐌆𐌇𐌈𐌉𐌊𐌋𐌌𐌍𐌎𐌏𐌐𐌑𐌒𐌓𐌔𐌕𐌖𐌗𐌘𐌙𐌚𐌛𐌜𐌝𐌞𐌰𐌱𐌲𐌳𐌴𐌵𐌶𐌷𐌸𐌹𐌺𐌻𐌼𐌽𐌾𐌿𐍀𐍁𐍂𐍃𐍄𐍅𐍆𐍇𐍈𐍉𐍊";

function idn(x) {
    if (x < base.length) return base[x];
    x -= base.length;
    if (x <= 0x2BA3) return String.fromCodePoint(0xAC00 + x); // Hangul Syllable
    x -= 0x2BA4;
    if (x <= 0x19B5) return String.fromCodePoint(0x3400 + x); // CJK Extension A
    x -= 0x19B6;
    if (x <= 0x5145) return String.fromCodePoint(0x4E00 + x); // CJK Ideograph
    x -= 0x5146;
    if (x <= 0x048C) return String.fromCodePoint(0xA000 + x); // Yi Letters
    x -= 0x048D;
    if (x <= 0xA6D6) return String.fromCodePoint(0x20000 + x); // CJK Extension B+
    throw Error('x is over 0xFFFF; WTF?');
}

function deidn(x, y) {
    let c = x.charCodeAt(0);
    let isSurrogate = (0xD800 <= c && c <= 0xDFFF);
    if (isSurrogate) c = 0x10000 + ((x.charCodeAt(0) - 0xD800) * 0x400) + (y.charCodeAt(0) - 0xDC00);
    let ret = base.length;
    if (0xAC00 <= c && c <= 0xD7A3) return [ret + c - 0xAC00, isSurrogate];
    ret += 0x2BA4;
    if (0x3400 <= c && c <= 0x4DB5) return [ret + c - 0x3400, isSurrogate];
    ret += 0x19B6;
    if (0x4E00 <= c && c <= 0x9F45) return [ret + c - 0x4E00, isSurrogate];
    ret += 0x5146;
    if (0xA000 <= c && c <= 0xA48C) return [ret + c - 0xA000, isSurrogate];
    ret += 0x048D;
    if (0x20000 <= c && c <= 0x2A6D6) return [ret + c - 0x20000, isSurrogate];
    return [base.indexOf(x), isSurrogate];
}

// Date

function toJSDate(num) {
    if (typeof(num) == 'string') {
        if (isNaN(num)) num = new Date(num);
        else num = Number(num);
    }
    if (typeof(num) == 'number') num = new Date(num);
    return `${String(num.getFullYear()).padStart(4, '0')}-${String(num.getMonth()+1).padStart(2, '0')}-${String(num.getDate()).padStart(2, '0')}`
}

// Bits

function bits(str, a, b) {
    return ((str.hashCode() >>> 0) >> Math.min(a, b)) & ((1 << (Math.abs(a - b))) - 1);
}

function makeBitSwitch(...bits) {
    let cur = 1;
    let res = 0;
    for (const b of bits) {
        if (b) res += cur;
        cur <<= 1;
    }
    res += cur;
    return res;
}

function readBitSwitch(bs) {
    let cur = 0;
    let res = [];
    while ((bs >> cur) > 1) {
        if ((bs >> cur) % 2) res.push(true);
        else res.push(false);
        cur++;
    }
    return res;
}

function intToByte(n) {
    return String.fromCharCode(((n & 0xff000000) >>> 24), ((n & 0x00ff0000) >>> 16), ((n & 0x0000ff00) >>> 8), n & 0x000000ff);
}

function intToShort(n) {
    return String.fromCharCode(((n & 0xFF00) >>> 8), n & 0xFF);
}

function byteToInt(b, signed) {
    let i = (b.charCodeAt(0) << 24 >>> 0) + (b.charCodeAt(1) << 16 >>> 0) + (b.charCodeAt(2) << 8 >>> 0) + (b.charCodeAt(3) >>> 0);
    if ((i & 0x80000000) && signed) return i - 0x100000000;
    else return i;
}

function shortToInt(b, signed) {
    let i = (b.charCodeAt(0) << 8 >>> 0) + (b.charCodeAt(1) >>> 0);
    if ((i & 0x8000) && signed) return i - 0x10000;
    else return i;
}

// Element

function e(id) { return document.getElementById(id); }

function cleanElement(el) { if (typeof(el) == 'string') el = e(el); while (el?.hasChildNodes()) el.removeChild(el.firstChild); return el; }

function removeElement(el) { if (typeof(el) == 'string') el = e(el); let parent = el.parentElement; parent.removeChild(el); return parent; }

function insertElement(type, parent, classList, html) {
    let el = document.createElement(type);
    if (![undefined, null, false].includes(html)) el.innerHTML = html;
    if (classList) {
        if (typeof(classList) == 'string') classList = [classList];
        if (classList.length) el.classList.add(...classList);
    } 
    if (parent) {
        if (typeof(parent) == 'string') parent = e(parent);
        if (parent) parent.appendChild(el);
    }
    return el;
}

function insertSpacer(parent) { return insertElement('div', parent, ['spacer']); }

Element.prototype.with = function(attribute, value) {
    this.setAttribute(attribute, value);
    return this;
}

function refresh(svg) {
    if (typeof(svg) == 'string') svg = e(svg);
    svg.parentElement.innerHTML += " ";
}