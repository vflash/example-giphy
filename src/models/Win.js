'use strict';
// ----------------------------------------------------------
import expansionEvent from 'src/tools/expansionEvent.js';
import GroupEvents from 'src/tools/GroupEvents.js';
import scrollTo from 'src/tools/scrollTo.js';
import expand from 'src/tools/expand.js';

module.exports = createWin;


var supportPageOffset = window.pageXOffset !== undefined;
function getWindowScroll() {
    return (supportPageOffset
        ? {x: 0 /*window.pageXOffset*/, y: window.pageYOffset}
        : {x: 0 /*window.scrollX*/, y: window.scrollY}
    );
};


function createWin(ctx) {
    var isFreezeScroll = true;
    var isMount;

    var win = expand(this, expansionEvent, {
        get isFreeze() {
            return isStopScroll();
        },
        get path() {
            return (ctx.getPage() || false).href;
        },

        groupEvents: new GroupEvents(true),
        isActive: ctx.isActive ? true : false,
        isPopup: ctx.isPopup ? true : false,
        scrollY: ctx.scrollY || getScrollPage(ctx.getPage()) || 0,
        scrollX: ctx.scrollX || 0,
        title: ctx.title || '',

        setPageHasChanged: function() {
            var page = ctx.getPage();
            if (page) {
                page.hasChanged = true;
            };
        },

        setTitle: function(title) {
            this.title = title;
            if (this.isActive) {
                ctx.title(title);
            };
        },

        get scrollHeigt() {
            return ctx.getScrollHeight();
        },

        get scrollTopMax() {
            return ctx.scrollTopMax();
        },

        get clientHeight() {
            return ctx.getClientHeight();
        },

        smoothScrollY: function(y) {
            return scrollTo(y
                , (y) => ctx.getScroll().y
                , (y) => win.setScroll(null, y)
                , (y) => ctx.getScrollTopMax()
            );
        },

        setScroll: function(x, y) {
            var change = false;
            if (typeof x === 'number') win.scrollX = x;
            if (typeof y === 'number') win.scrollY = y;

            ctx.setScroll(win.scrollX, win.scrollY);
        },

        upScroll: function(full) {
            ctx.setScroll(win.scrollX, win.scrollY);
        },

        _setActive: function(isActive) {
            var isActive = !!isActive;

            if (win.isActive == isActive) {
                return;
            };

            if (win.isActive) {
                var sc = ctx.getScroll();
                win._evScroll(sc.x, sc.y);
            } else {
                freezeScroll();
            };

            win.isActive = isActive;

            if (isActive) {
                ctx.title(win.title);
            };

            win.emit('active', isActive);
        },

        _evChangePage: function(nextPage) {
            var scrollTop = getScrollPage(nextPage);
            if (scrollTop !== null) {
                win.setScroll(null, 0);
            } else {
                win.upScroll();
            };

            freezeScroll();
        },

        _evScroll: function(x, y) {
            if (isStopScroll()) {
                ctx.setScroll(win.scrollX, win.scrollY);
                return;
            };

            if (win.scrollY !== y || win.scrollX !== x) {
                win.scrollX = x;
                win.scrollY = y;
                win.emit('scroll', {x: x, y: y});
            };
        },

        _unmount: function() {
            win.groupEvents.stop();
            stopFreezeScroll();
            win.isActive = false;
        },

        _mount: function() {
            if (isMount) return;
            isMount = true;

            if (isFreezeScroll) {
                freezeScroll();
            };

            ctx.setScroll(win.scrollX, win.scrollY);
            win.emit('mount');
        },

        _getWindowScroll: getWindowScroll,
    });

    function isStopScroll() {
        return isFreezeScroll || !win.isActive;
    };

    var eventsFreeze = ['wheel', 'mousewheel', 'touchstart', 'mousedown'];
    var timmerFreezeScroll;

    function freezeScroll() {
        isFreezeScroll = true;
        var xtimeout = 2000;

        if (!timmerFreezeScroll) {
            eventsFreeze.forEach(function(name) {
                document.addEventListener(name, stopFreezeScroll, true)
            });
        } else {
            clearTimeout(timmerFreezeScroll);
        };

        timmerFreezeScroll = setTimeout(stopFreezeScroll, xtimeout);
    };

    function stopFreezeScroll() {
        if (!isFreezeScroll) {
            return;
        };

        eventsFreeze.forEach(function(name) {document.removeEventListener(name, stopFreezeScroll, true)});
        clearTimeout(timmerFreezeScroll);
        timmerFreezeScroll = null;
        isFreezeScroll = false;

        win.emit('stopFreezeScroll');
    };

    function getScrollPage(page) {
        if (!page) {
            return null;
        };

        var scrollTop = page.scroll;
        if (typeof scrollTop === 'number') {
            return scrollTop;
        };

        return scrollTop !== false ? 0 : null;
    };

    return win;
};
