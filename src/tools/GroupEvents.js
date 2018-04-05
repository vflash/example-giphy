/*
    // создание группы событий. для удобного подключения и отключения

    var events = GroupEvents(false);

    events(document, 'scroll', function(e) {
        // ...
    })

    events(document, 'resize', function(e) {
        // ...
    })

    events.start();
    // ....
    events.close();
*/

export default function GroupEvents(isConnected) {
    var connected = !!isConnected;
    var list = [];

    function groupEvents(node, event, handler, top) {
        list.push([node, event, handler, top]);

        if (connected) {
            up(node, event, handler, top);
        };

        return handler;
    };

    groupEvents.start = function() {
        if (connected) {
            return;
        };
        connected = true;

        for (var i = 0, x; x = list[i]; i++) {
            up(x[0], x[1], x[2], x[3]);
        };
    };

    groupEvents.stop = function() {
        if (!connected) {
            return;
        };
        connected = false;

        for (var i = 0, x; x = list[i]; i++) {
            dn(x[0], x[1], x[2], x[3]);
        };
    };

    groupEvents.clear = function() {
        if (connected) {
            connected = false;
            for (var i = 0, x; x = list[i]; i++) {
                dn(x[0], x[1], x[2], x[3]);
            };
        };

        list.length = 0;
    };


    groupEvents.replace = function(key, prev, next) {
        var prev = prev || key;
        var next = next || key;

        if (prev === next) {
            return
        };

        for (var i = 0, x; x = list[i]; i++) {
            if (x[0] !== prev) {
                continue;
            };

            x[0] = next;

            if (connected) {
                dn(prev, x[1], x[2], x[3]);
                up(next, x[1], x[2], x[3]);
            };
        };
    };

    return groupEvents;
};


function up(obj, evs, func, top) {
    if (!obj || typeof obj === 'string') {
        return;
    };

    if (func === 'break') {
        func = breakEvent;
    };

    var a = evs.split(/[\s,]+/);
    var i = 0;
    var e;

    while (e = a[i++]) {
        switch (e) {
            case 'mouseScroll':
                e = 'mousewheel';
            break;
            case 'resize':
                if (obj.nodeType == 9) {
                    obj = obj.defaultView || obj.parentWindow;
                };
            break;
            case 'scroll':
                if (obj.nodeType == 9) {
                    obj = obj.parentWindow || obj;
                };
            break;
        };

        obj.addEventListener(e, func, top ? true : false);
    };

    return func;
};


function dn(obj, evs, func, top) {
    if (func === 'break') {
        func = breakEvent;
    };

    if (!obj || typeof obj === 'string' || !evs || !func) {
        return;
    };

    var a = evs.split(/[\s,]+/);
    var i = 0;
    var e;

    while (e = a[i++]) {
        switch (e) {
            case 'mouseScroll':
                e = 'mousewheel';
            break;
            case 'resize':
                if (obj.nodeType === 9) {
                    obj = obj.defaultView || obj.parentWindow;
                };
            break;
            case 'scroll':
                if (obj.nodeType === 9) {
                    obj = obj.parentWindow || obj;
                };
            break;

        };

        obj.removeEventListener(e, func, !!top);
    };
};


function breakEvent(e) {
    if (e) {
        e.returnValue = false; // не удалять, используется в логике программ
        if (e.preventDefault) e.preventDefault();
    };

    return false;
};

