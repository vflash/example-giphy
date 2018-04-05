import * as _cmps from '../cmps.js'; const {exComponentUpdate, getDOM, cmps, view, bem, jr, t} = _cmps;
import autoStopMouseWheel from 'src/tools/autoStopMouseWheel.js';
import getDragLayer from 'src/tools/getDragLayer.js'
import GroupEvents from 'src/tools/GroupEvents.js';

import './FmScrollBox.sass';
var b = bem('FmScrollBox');


cmps('FmScrollBox', {
    exComponentUpdate: function(props, state) {
        this._updateTime(); // пришла волна. возможно изменился контент
        return [];
    },

    defaultProps: {
        endSkipScrolling: false, // если компонет вложенный в кастомный скрол
        autoStopWheel: true,
        onTimedScroll: null,
        onScroll: null,
        height: null,
        width: null,
        theme: 'dark', // dark|light
        mixWrap: '',
        mixBox: '',
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, false);

        this._lastPosition = 0;
        this._clientHeight = 0;
        this._scrollHeight = 0;
        this._scrollWidth = 17;
        this._groupEvents = new GroupEvents(true);
        this._scrollY = 0;
    },

    render: function() {
        var props = this.props;
        var self = this;

        var height = props.height;
        var width = props.width;
        var theme = props.theme;

        return [
            {
                class: b('', this.props.mix),
                onMouseMove: props.onMouseMove,
                onMouseDown: props.onMouseDown,
                style: {
                    height: typeof height === 'number' ? height + 'px' : height || null,
                    width: typeof width === 'number' ? width + 'px' : width || null,
                },
            }
            , [
                {
                    class: b('wrap', this.props.mixWrap),
                    ref: 'wrap',
                    onScroll: this._onScroll,
                    onWheel: this._onWheel,
                }
                , [b('box', this.props.mixBox)
                    , jr.children(this)
                ]
            ]
            , [
                {
                    class: b('scrollbar-y-track', '-theme-' + theme
                        , this.props.mixYTrack
                    ),
                    ref: 'scrollYTrack',
                }
                , ({
                    class: b('scrollbar-y-thumb', '-theme-' + theme),
                    ref: 'scrollYThumb',
                    onMouseDown: this._onMouseDownY,
                })
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    componentWillUnmount: function() {
        clearTimeout(this._timmerResize);
        clearTimeout(this._timmerUpdate);

        this._groupEvents.stop();

        if (this._stopDrag) {
            this._stopDrag();
        };
    },

    componentDidMount: function() {
        var self = this;

        this._nodeScroll = getDOM(this.refs.wrap);

        this._updateBoxHeight();
        this._updateThumb();


        self._groupEvents(document, 'resize', upResize);
        function upResize() {
            self._updateSizeThumb();
            self._updateBoxHeight();
            self._updateThumb();
        };

        function timmerResize() {
            upResize()
            ticResize(3000);
        };

        function ticResize(tm) {
            self._timmerResize = setTimeout(timmerResize, tm);
        };

        ticResize(1200);
    },

    componentDidUpdate: function() {
        this._updateBoxHeight();
        this._updateThumb();
    },

    _updateTime: function() {
        if (this._timmerUpdate) {
            return;
        };

        var self = this;

        this._timmerUpdate = setTimeout(function() {
            self._updateBoxHeight();
            self._updateThumb();
        }, 200);
    },

    _onScroll: function() {
        var y = this._nodeScroll.scrollTop;
        if (y === this._scrollY) {
            return;
        };

        this._scrollY = y;

        var fn = this.props.onScroll;
        if (fn) {
            fn({target: this});
        };

        this._updateThumb();
    },


    _updateBoxHeight: function() {
        // высота блока и контента
        var n = this._nodeScroll;
        this._clientHeight = n.clientHeight;
        this._scrollHeight = n.scrollHeight;
    },


    _updateSizeThumb: function() {
        // размер нативного скрола
        var n = this._nodeScroll;
        var sizeY = n.offsetWidth - n.clientWidth;

        if (this._scrollWidth !== (this._scrollWidth = sizeY)) {
            n.style.marginRight = (-sizeY - 13) + 'px';
        };
    },

    _updateThumb: function() {
        var clientHeight = this._clientHeight;
        var scrollHeight = this._scrollHeight;
        var scrollTop = this._scrollY;

        var thumbScrollY = 100/(scrollHeight - clientHeight) * scrollTop;
        var thumbHeight = 100 * clientHeight/scrollHeight;

        var scrollYThumb = this.refs['scrollYThumb'];
        var nThumb, sThumb, _dom;
        function dom() {
            if (_dom) return;
            _dom = true;

            nThumb = getDOM(scrollYThumb);
            sThumb = nThumb.style;
        };

        var min = 30; // px
        var h = (Math.max(min/clientHeight * 100, thumbHeight));
        var y = (thumbScrollY - (h/100) * thumbScrollY);

        var hasYScroll = scrollHeight > clientHeight;
        if (this._hasYScroll !== hasYScroll) {
            this._hasYScroll = hasYScroll;
            dom();
            nThumb.parentNode.style.display = hasYScroll ? '' : 'none';
        };

        if (hasYScroll && this._vHeight !== h) {
            dom();
            sThumb.height = h + '%';
            this._vHeight = h;
        };

        if (this._vtop !== y) {
            dom();
            sThumb.top = y + '%';
            this._vtop = y;
        };
    },

    _onWheel: function(e) {
        if (!this.props.autoStopWheel) {
            return;
        };

        autoStopMouseWheel(e, this._nodeScroll
            , this.props.endSkipScrolling
            , false
        );
    },

    _onMouseDownY: function(e) {
        if (this.isScrollDrag || e.button) {
            return;
        };

        this.isScrollDrag = true;
        e.preventDefault();
        var self = this;

        var dragLayer = new getDragLayer(document);
        dragLayer.show();

        var ge = new GroupEvents(true);
        var startMouseY = e.clientY;
        var startMouseX = e.clientX;

        var startScrollYp = 100/(self._scrollHeight - self._clientHeight) * self._scrollY;
        var nScrollYTrack = getDOM(this.refs['scrollYTrack']);
        var trackHeight = Math.max(5, nScrollYTrack.clientHeight);
        var nWrap = this._nodeScroll;

        start();

        ge(document, 'mouseup', mouseup, true);
        ge(document, 'mousedown', mouseup);

        function mouseup(e) {
            //e.preventDefault();
            stopDrag();

            move();
            end();
        };

        var mouseY = startMouseY;
        var mouseX = startMouseX;
        var timmer;

        ge(document, 'mousemove', function(e) {
            mouseY = e.clientY;
            //mouseX = e.clientX;

            if (!timmer) {
                timmer = setTimeout(move, 16);
            };
        });

        function stopDrag() {
            clearTimeout(timmer);
            ge.stop();
            dragLayer.hide();

            self.isScrollDrag = false;
        };

        function start() {
            nScrollYTrack.setAttribute('data-scroll', 'show');
        };
        function end() {
            nScrollYTrack.removeAttribute('data-scroll', 'show');
        };

        function move() {
            timmer = null;

            //var maxDx = (self.getScrollMax() / self._scrollHeight) * self._clientHeight;
            var maxDx = trackHeight * (1 - (self._vHeight / 100));

            var dY = mouseY - startMouseY;
            var dYp = 100 * dY/maxDx;

            var y = (startScrollYp + dYp) * self.getScrollMax()/100;
            nWrap.scrollTop = ~~y;
        };
    },

    setScrollPosition: function(y) {this.setScrollY(y)},
    setScrollY: function (y) {
        this._nodeScroll.scrollTop = +y;
    },

    getScrollPosition: function () {return this.getScrollY()},
    getScrollY: function () {
        this._onScroll();

        return this._scrollY;
    },

    getScrollMax: function(v) {
        this._updateBoxHeight();

        return this._scrollHeight - this._clientHeight;
    },

    getClientHeight: function() {
        return this._nodeScroll.clientHeight;
    },

    isScrollBegin: function(d) {
        return this._scrollY  <= (+d || 0);
    },

    isScrollEnd: function(d) {
        var maxY = this._scrollHeight - this._clientHeight;
        var y = maxY - this._scrollY;
        return y <= (+d || 0);
    },

});
