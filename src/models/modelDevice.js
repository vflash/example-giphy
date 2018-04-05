import view from 'src/models/view/view.js';

var debugMode = null;
//debugMode = 'desktop';
//debugMode = 'mobile';
//debugMode = 'tablet';


var IS_MOBILE_AGENT = debugMode ? debugMode == 'mobile' : null;
var IS_TABLET_AGENT = debugMode ? debugMode == 'tablet' : null;
var IS_LANDSCAPE = null; // true|false for sandbox

var documentElement = document.documentElement;
var hasChange = false;
var model;

if (IS_MOBILE_AGENT == null) {
    IS_MOBILE_AGENT = _isMobileAgent();
};

if (IS_TABLET_AGENT == null) {
    IS_TABLET_AGENT = _isTabletAgent();
};


export default model =  {
    mode: 'desktop',
    get mix() {
        return {deviceMode: model.mode};
    },

    viewport: null,
    remSize: 10, // сколько px в 1rem , диначически вычисляется и может изменяться
    clientHeight: 0,
    clientWidth: 0,
    height: 0, // виртуальный px
    width: 0, // виртуальный px
    pxrem: 0.1, // константа ..  сколько rem 1 виртуальный px

    isMobileAgent: !!IS_MOBILE_AGENT, // мобильное устройство
    isTabletAgent: !!IS_TABLET_AGENT, // // планшет
    isLandscape: IS_LANDSCAPE != null ? IS_LANDSCAPE : true, // альбомный

    get mixDesktop() {return {deviceModeDesktop: model.mode === 'desktop' || 'no'}},
    get mixCompact() {return {deviceModeCompact: model.mode === 'compact' || 'no'}},
    get mixMobile() {return {deviceModeMobile: model.mode === 'mobile' || 'no'}},

    get isDesktop() {return model.mode === 'desktop'},
    get isCompact() {return model.mode === 'compact'},
    get isMobile() {return model.mode === 'mobile'},
};


function getMode() {
    if (model.isTabletAgent) {
        return (model.isLandscape ? 'compact' : 'mobile');
    };

    if (model.isMobileAgent) {
        return 'mobile';
    };

    var width = model.width;
    if (width < 760) {
        return 'mobile';
    };

    return (model.width < 980
        ? 'compact'
        : 'desktop'
    );
};


function getViewport() {
    var mode = model.mode;

    if (model.isTabletAgent) {
        return (model.isLandscape
            ? 'tablet-landscape'
            : 'tablet-portrait'
        );
    };

    if (model.isMobileAgent) {
        return (model.isLandscape
            ? 'mobile-landscape'
            : 'mobile-portrait'
        );
    };

    return 'desktop'
};

function _isMobileAgent() {
    var userAgent = navigator.userAgent;
    return /Mobile|Android|iPhone|iPod|iPad|Windows\ CE|Opera\ M|BlackBerry/.test(userAgent)
};


new function() {
    setOrientationLandscape();
    setSize();
    setMode();
    updateViewport();
};


window.addEventListener('orientationchange', function() {
    setOrientationLandscape();
    setMode()
    update();
});

window.addEventListener("resize", function() {
    setOrientationLandscape();
    setSize();
    setMode();
    update();
});





function update() {
    var x = hasChange;

    hasChange = false;
    if (x) {
        //view.renderUpdate(updateViewport); // https://github.com/facebook/react/issues/6324
        view.refresh(updateViewport);
    };
};


function updateViewport() {
    var value = getViewport();
    if (model.viewport === value) {
        return;
    };

    model.viewport = value;

    var className = documentElement.className;
    var vp = '-viewport-' + value;

    if (/(\s|^)-viewport-/.test(className)) {
        className = className.replace(/(\s|^)-viewport-[^\s]+/, '$1' + vp);
    } else {
        className += ' ' + vp;
    };

    documentElement.className = className;
    setSize();
    update();

    setTimeout(resetScrollY, 400); // планшеты немного глючат
};

function resetScrollY() {
    var scrollMaxY = window.scrollMaxY;

    if (scrollMaxY == null) {
        var n = document.scrollingElement;
        if (!n || !window.scrollTo) {
            return;
        };

        scrollMaxY = n.scrollHeight - n.offsetHeight;
    };

    if (scrollMaxY < window.scrollY) {
        window.scrollTo(0, scrollMaxY - 1);
    };
};


function set(name, value) {
    if (model[name] !== value) {
        model[name] = value;
        hasChange = true;
    };
};

function setOrientationLandscape() {
    set('isLandscape', IS_LANDSCAPE != null ? IS_LANDSCAPE : !!is());

    function is() {
        try {
            if (window.screen.orientation != null) {
                return /^landscape/.test(window.screen.orientation.type)
            };
        } catch(e) {
        };

        if (window.orientation != null) {
            return Math.abs(window.orientation) === 90;
        };

        return !model.isMobile;
    };
};


function _isTabletAgent() {
    var userAgent = navigator.userAgent;
    if (/iPad|Tablet/.test(userAgent)) {
        return true;
    };

    if (IS_MOBILE_AGENT) {
        return screen.width > 700;
    };

    return false;
};

function setSize() {
    set('clientHeight', documentElement.clientHeight);
    set('clientWidth', documentElement.clientWidth);
    set('remSize', +('' + window.getComputedStyle(documentElement).fontSize).replace(/[^\d\.]/g, ''));


    var x = (model.clientHeight / model.remSize) / model.pxrem;
    set('height', Math.round(x));

    var x = (model.clientWidth / model.remSize) / model.pxrem;
    set('width', Math.round(x));
};

function setMode() {
    set('mode', getMode());
};
