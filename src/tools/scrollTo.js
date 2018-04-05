window._scrollTo = scrollTo;
export default scrollTo;

var scrollingElement = document.scrollingElement;
var de = document.documentElement;
var now = Date.now || function() {
    return +new Date();
};

function easing(t) {
    return t*(2-t);
};

function _get() {
    return Math.round(scrollingElement.scrollTop);
};

function _set(y) {
    window.scrollTo(0, y);
};

function _max() {
    var x = scrollingElement.scrollMaxHeight;
    if (x == null) {
        x = scrollingElement.scrollHeight - scrollingElement.clientHeight;
    };

    return x;
};


function conA(a, b) {
    de.addEventListener(a, b, true)
};
function conB(a, b) {
    de.removeEventListener(a, b, true)
};

function connect(fn, is) {
    var set = is ? conA : conB;
    set('touchstart', fn);
    //set('touchmove', fn);
    set('mousedown', fn);
    //set('wheel', fn);
};


function scrollTo(y, get, set, max) {
    var resolve;
    var prom = new Promise(_resolve => {resolve = _resolve});

    var max = get ? max : _max;
    if (max) {
        y = Math.min(y, max());
    };

    var get = get || _get;
    var set = set || _set;
    var res = true;
    var y = Math.max(y, 0);

    var startY = get();
    var deltaY = Math.round(y - startY);

    if (!deltaY || (y !== y)) {
        resolve(true);
        return prom;
    };

    var delay = 450;
    var lastY = startY;
    var start = now();

    function onBreak() {
        lastY = null;
        res = false;
    };

    function up(y) {
        y = Math.round(y);

        if (lastY == null || Math.abs(lastY - get()) > 2) {
            return false;
        };

        set(lastY = y);
        return true;
    };

    function tic() {
        var tx = (now() - start) / delay;

        var dy = deltaY * easing(tx);
        var y = startY + dy;

        if ((dy ? up(y) : true) && (tx < 1)) {
            setTimeout(tic, 16);
            return;
        };

        connect(onBreak, false);
        resolve(res);
    };

    connect(onBreak, true);
    tic();

    return prom;
};
