import * as _cmps from '../cmps.js'; const {exComponentUpdate, getDOM, cmps, view, bem, jr, t} = _cmps;
import GroupEvents from 'src/tools/GroupEvents.js';

import './BoxNear.sass';
var b = bem('BoxNear');

//view.emit('openBoxNear')

cmps('BoxNear', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {

        outListExceptions: null, // array - список элементов клик по которому не приводит к onOut
        outOpenFloatBox: true, // если открылся другой блок
        outWhenScroll: true, // если произошла прокрутка то скрывать элемент
        outClick: 'x-click', // если был клик по элементу с заданным классом
        onOut: null,

        hideMouseLeave: false, // если курсор вышел за приделы (false|true|timeout)
        hideOut: false,

        marginNear: 0, // отступ от элемента позиционирования
        getNearRect: null, // function, возврашает обьект getBoundingClientRect
        getNear: null, // function

        floatBox: 'rootFloatBoxNode',
        position: 'bottomRight',
        fixed: true, // блок не будет смешаться чтобы поподать в экран
        skin: 'menu', //pure|menu|title
        show: false,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, false);

        this._groupEvents = new GroupEvents(true);
        this._isShowPrev = null;
        this._show = null;
    },

    render: function() {
        var props = this.props;
        var self = this;

        var position = this._position;
        var isShow = this.isShow() && !!position;
        var isInit = !!position;
        var skin = props.skin;

        var mixShow = '-show' + (isShow ? '' : '-no');
        var mixSkin = {skin: props.skin};
        var mixPos = '-pos-' + position;

        var arrowLeft = this._arrowLeft || 0;
        var arrowTop = this._arrowTop || 0;


        return [b('', mixShow, '-init' + (isInit ? '' : '-no'))
            , [
                {
                    onMouseEnter: this._onMouseEnter,
                    onMouseLeave: this._onMouseLeave,
                    onClick: this._onClick,
                    class: b('wrap', mixPos, mixShow, mixSkin),
                    ref: 'wrap',
                }
                , (skin === 'menu' || skin === 'title'
                    ? [b('bgbox', mixSkin)
                        , {
                            class: b('arrow', mixPos, mixSkin),
                            style: {
                                left: arrowLeft || '',
                                top: arrowTop || '',
                            },
                            key: 'arr'
                        }
                    ]
                    : null
                )
                , (skin === 'select'
                    ? [b('bgbox', mixSkin)]
                    : null
                )

                , [b('box')
                    , [{class: b('content', mixSkin, props.mix), ref: 'content'}
                        , jr.children(this)
                    ]
                ]
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    componentDidUpdate: function(prevProps) {
        this._upPosition();
        this._emitOpen();
    },

    componentWillUnmount: function() {
        //this.getContext('rootFloatBoxNode').removeChild(getDOM(this));
        this._xParentNode.appendChild(getDOM(this));

        clearTimeout(this._timmerHide);
        clearTimeout(this._timmerTic);
        this._groupEvents.stop();
    },

    componentDidMount: function() {
        this._xParentNode = getDOM(this).parentNode;
        this.getContext(this.props.floatBox).appendChild(getDOM(this));

        var self = this;
        var win = this.getContext('win');
        var ge = this._groupEvents;

        ge(document, 'mousedown', this._checkOut, true);
        ge(document, 'scroll', () => {
            if (this.props.outWhenScroll) {
                this._emitOut();
            };
        });

        ge(view, 'openFloatBox', (e) => {
            if (e.context !== this.props.floatBox) {
                return;
            };

            if (this.outOpenFloatBox || e.target === this || !this.isShow()) {
                return;
            };

            this._emitOut();
        });

        if (win) {
            ge(win, 'active', (isActive) => {
                if (!isActive) {
                    this._emitOut();
                };
            });
        };

        ge(win || window, 'scroll', this._upPosition);
        ge(win || window, 'resize', this._upPosition);

        function tic() {
            self._upPosition();
            self._timmerTic = setTimeout(tic, 3500);
        };

        tic();

        this._emitOpen();
    },

    _onMouseEnter: function() {
        this.clearHide();
    },

    _onMouseLeave: function() {
        var x = this.props.hideMouseLeave;
        if (x === true) {
            x = 500;
        };

        if (x) {
            this.hide(x)
        };
    },

    _onClick: function(e) {
        var {outClick} = this.props;

        if (outClick === true) {
            this._emitOut();
            return;
        };

        if (!outClick) {
            return;
        };

        var rootNode = getDOM(this);
        var n = e.target;

        while(n) {
            if (n === rootNode) {
                return;
            };

            if (n.classList.contains(outClick)) {
                break;
            };

            n = n.parentNode;
        };

        if (n) {
            this._emitOut();
        };
    },

    _emitOpen: function() {
        var isShow = this.isShow();
        if (isShow !== !!this._isShowPrev) {
            this._isShowPrev = isShow;
            if (isShow) {
                view.emit('openFloatBox', {
                    context: this.props.floatBox,
                    target: this,
                });
            };
        };
    },

    _upPosition: function(props) {
        var props = this.props;
        // if (!this.isShow() && this._position) {
        //     return;
        // };

        var nearNode = getDOM(props.getNear());
        if (!nearNode || props.getNearRect) {
            return;
        };

        var contentNode = this.refs.content;
        var arrowNode = this.refs.arrow;
        var rootNode = getDOM(this);

        var sz = contentNode.getBoundingClientRect();
        var rc = (!props.getNearRect
            ? nearNode.getBoundingClientRect()
            : props.getNearRect()
        );

        rc = upRect(props.marginNear, rc);
        sz = upRect(0, sz);

        var height = _height(sz);
        var width = _width(sz);
        var pos = getPositionNear(props.position, !!props.fixed, rc, sz);

        if (!this.isShow() && this._position) {
            if (this._position === pos.position) {
                return;
            };
        };

        rootNode.style.left = pos.left + 'px';
        rootNode.style.top = pos.top + 'px';

        this.update({
            _position: pos.position,
            _arrowLeft: pos.arrowLeft,
            _arrowTop: pos.arrowTop,
            _left: pos.left,
            _top: pos.top,
        });
    },

    _checkOut: function(e) {
        var props = this.props;
        if (!this.isShow()) {
            return;
        };

        var nearNode = props.getNear ? getDOM(props.getNear()) : null;
        var rootNode = getDOM(this);

        var outListExceptions = this.props.outListExceptions || (nearNode ? [nearNode] : []);
        var n = e.target;

        while(n) {
            if (n === rootNode || (outListExceptions.indexOf(n) !== -1)) {
                return;
            };
            n = n.parentNode;
        };

        this._emitOut();
    },

    _emitOut: function() {
        if (this.props.hideOut) {
            this.hide(this.props.hideOut);
        };

        var fn = this.props.onOut;
        if (fn) {
            fn({target: this});
        };
    },

    clearHide: function() {
        clearTimeout(this._timmerHide);
    },

    setShow: function(x) {
        this.update({_show: !!x});
        this.clearHide();
    },

    isShow: function() {
        var show = this._show;
        if (show == null) {
            show = !!this.props.show;
        };

        return show;
    },

    toggle: function() {
        this.update({_show: !this.isShow()});
    },

    reset: function() {
        this.update({_show: null});
    },

    show: function(x) {
        this.clearHide();
        this.update({_show: x !== false});
    },

    hide: function(timeout) {
        this.clearHide();

        if (!timeout || typeof timeout !== 'number') {
            this.update({_show: false});
            return;
        };

        this._timmerHide = setTimeout(() => {
            this.update({_show: false});
        }, timeout)
    },

    up: function() {
        this._upPosition();
    },
});

function _height(sz) {
    var x = sz.height;
    return typeof x === 'number' ? x : sz.bottom - sz.top;
};
function _width(sz) {
    var x = sz.width;
    return typeof x === 'number' ? x : sz.right - sz.left;
};

function getClientSize(d) {
	if (!d) d = document;

	var v = d.documentElement;
	return {
        height: v.clientHeight,
        width: v.clientWidth,
    };
};


function upRect(margin, rc) {
    var {bottom, right, left, top} = rc;
    if (margin) {
        var mr = Array.isArray(margin) ? margin : [+margin || 0];
        switch(mr.length) {
            case 3:
                mr  = [mr[0], mr[1], mr[2], mr[1]];
                break;
            case 2:
                mr  = [mr[0], mr[1], mr[0], mr[1]];
                break;
            case 1:
                mr  = [mr[0], mr[0], mr[0], mr[0]];
                break;
            case 0:
                mr  = [0, 0, 0, 0];
                break;
        };

    } else {
        return {
            height: right - left,
            height: bottom - top,
            bottom,
            right,
            left,
            top,
        };
    };

    return {
        height: (right - left) + (mr[0] + mr[2]),
        height: (bottom - top) + (mr[1] + mr[3]),

        bottom: bottom + mr[2],
        right: right + mr[1],
        left: left - mr[3],
        top: top - mr[0],
    };
};

function getPositionNear(position, fixed, rc, sz) {
    var paddingWin = 16;
    var cwh = getClientSize();
    var arrowPaddingMin = 15;
    var arrowPadding = 30;
    var arrowLeft = 0;
    var arrowTop = 0;
    var h = _height(sz);
    var w = _width(sz);
    var x;
    var y;

    var arrowPadY = Math.max(arrowPaddingMin, Math.min(arrowPadding, _height(rc) / 2));
    var arrowPadX = Math.max(arrowPaddingMin, Math.min(arrowPadding, _width(rc) / 2));

    function toShiftX() {
        if (fixed) {
            return;
        };

        var dx = (x + w) - Math.max(rc.right, cwh.width - paddingWin);
        if (dx > 0) {
            x = x - dx;
        };

        if (x < paddingWin) {
            x = paddingWin;
        };
    };

    function setXY() {
        // название говорит какая точка у элемента возле кторого позиционируем
        switch(position) {
            // --------------------------------------------
            // -- bottom

            case 'bottomCenterRight':
                position = 'bottomCenter';
                x = Math.floor(rc.left + (rc.right - rc.left)/2 - w/2);
                y = rc.bottom;

                if (x + w > rc.right) {
                    position = 'bottomCenterRight';
                    x = rc.right - w;
                };
                break;

            case 'bottomCenterLeft':
                position = 'bottomCenter';
                x = Math.floor(rc.left + (rc.right - rc.left)/2 - w/2);
                y = rc.bottom;

                if (x < rc.left) {
                    position = 'bottomCenterLeft';
                    x = rc.left;
                };
                break;

            case 'bottomCenter':
            case 'bottom':
                position = 'bottomCenter';
                x = Math.floor(rc.left + (rc.right - rc.left)/2 - w/2);
                y = rc.bottom;

                toShiftX();
                arrowLeft = (rc.left + _width(rc) / 2) - x;
                break;

            case 'bottomRight':
                x = rc.right - w;
                y = rc.bottom;

                toShiftX();
                arrowLeft = (rc.right - arrowPadX) - x;
                break;

            case 'bottomLeft':
                y = rc.bottom;
                x = rc.left;

                toShiftX();
                arrowLeft = (rc.left + arrowPadX) - x;

                break;

            // --------------------------------------------
            // -- top

            case 'topCenterRight':
                position = 'topCenter';
                x = Math.floor(rc.left + (rc.right - rc.left)/2 - w/2);
                y = rc.top - h;

                if (x + w > rc.right) {
                    position = 'topCenterRight';
                    x = rc.right - w;
                };
                break;

            case 'topCenterLeft':
                position = 'topCenter';
                x = Math.floor(rc.left + (rc.right - rc.left)/2 - w/2);
                y = rc.top - h;

                if (x < rc.left) {
                    position = 'topCenterLeft';
                    x = rc.left;
                };
                break;

            case 'topCenter':
            case 'top':
                position = 'topCenter';
                x = Math.floor(rc.left + (rc.right - rc.left)/2 - w/2);
                y = rc.top - h;

                toShiftX();
                arrowLeft = (rc.left + _width(rc) / 2) - x;
                break;

            case 'topRight':
                x = rc.right - w;
                y = rc.top - h;
                break;

            case 'topLeft':
                y = rc.top - h;
                x = rc.left;
                break;


            // --------------------------------------------
            // -- left
            case 'leftTop':
                y = rc.top;
                x = rc.left - w;
                break;

            case 'leftCenter':
                y = rc.top + (rc.bottom - rc.top)/2 - h/2;
                x = rc.left - w;
                break;

            case 'leftBottom':
                x = rc.left - w;
                y = rc.top + (rc.bottom - rc.top) - h;
                break;

            // --------------------------------------------
            // -- right
            case 'rightTop':
                y = rc.top;
                x = rc.right;
                break;

            case 'rightCenter':
                y = rc.top + (rc.bottom - rc.top)/2 - h/2;
                x = rc.right;
                break;

            case 'rightBottom':
                y = rc.top + (rc.bottom - rc.top) - h;
                x = rc.right;
                break;
        };

    };

    var positionList = position.split(/[\s\,]+/g);
    for (let i = 0, l = positionList.length; i < l;) {
        position = positionList[i];
        setXY();

        if (++i >= l) {
            break;
        };

        if (/^bottom/.test(position)) {
            if (y + h > cwh.height - 10) {
                continue;
            };
        };

        if (/^top/.test(position)) {
            if (y < 10) {
                continue;
            };
        };

        // if (x + w > cwh.width - paddingWin) {
        //     continue;
        // };

        break;
    };

    x = Math.floor(x) || 0;
    y = Math.floor(y) || 0;

    return {
        arrowLeft,
        arrowTop,
        position,
        left: x,
        top: y,
    };
};

