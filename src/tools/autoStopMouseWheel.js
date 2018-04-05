export default autoStopMouseWheel;

function autoStopMouseWheel(event, node, endSkipScrolling, noSkipScrolling) {
    if (event._breakAutoStopMouseWheel === true) {
        event._breakAutoStopMouseWheel = false;
        return;
    };

    var endSkip = noSkipScrolling ? false : !!endSkipScrolling;
    var e = event.nativeEvent;

    var delta = e.deltaY || -e.wheelDelta || e.detail;
    if (!delta) {
        return;
    };

    function stopWheel() {
        event.stopPropagation();
        e.preventDefault();
    };

    var scrollTop = node.scrollTop;
    var maxScroll = node.scrollTopMax;
    if (maxScroll == null) {
        maxScroll = node.scrollHeight - node.clientHeight;
    };

    if (maxScroll <= 0) {
        if (noSkipScrolling) {
            stopWheel();
        };
        return;
    };

    if (delta > 0) {
        if (scrollTop == maxScroll) {
            if (endSkip) return;
            stopWheel();
            return;
        };
    } else if (!scrollTop) {
        if (endSkip) return;
        stopWheel();
        return;
    };


    var newTop;
    if (e.deltaMode === 0) {
        //newTop = scrollTop + (1.1 * e.deltaY);
        newTop = scrollTop + (1 * e.deltaY);
    } else if (e.wheelDelta) {
        newTop = scrollTop + (-e.wheelDelta / (120/45)); // 45 зависит от настроект системы
    };

    if (newTop != null) {
        if ((newTop < 0) && scrollTop < 5) {
            node.scrollTop = 0;
            stopWheel();
            return;

        } else if ((newTop >= maxScroll) && (maxScroll - scrollTop) < 5) {
        //} else if (newTop > maxScroll) {
            node.scrollTop = maxScroll;
            stopWheel();
            return;
        };
    };

    event.stopPropagation();
};

