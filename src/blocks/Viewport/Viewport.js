import * as _cmps from '../cmps.js'; const {exComponentUpdate, PropTypes, cmps, bem, jr, t} = _cmps;
import view from 'src/models/view/view.js';
import Win from 'src/models/Win.js';

var isScrollTopMax = document.documentElement.scrollTopMax != null;
var isFix = (false
    || (document.scrollingElement === document.body)
    || (/\bTrident\b/.test(navigator.userAgent))
);


import './Viewport.sass';
var b = bem('Viewport');


cmps('Viewport', {
    /*
    exComponentUpdate: function(props, state) {
        return [
        ];
    },
    */

    defaultProps: {
        isActive: false,
        isPopup: false,
        layout: null,
        page: null,
        mix: '',
    },

    context: {
        NUMBER_PAGE: function() {
            return (this.props.page||false).NUMBER_PAGE;
        },
        page: function() {
            return this.props.page;
        },
        win: function() {
            return this._win;
        },
    },

    init: function () {
        //exComponentUpdate(null, false);

        this._currentPage = null;
        this._isWinActive = null;


        var self = this;
        var scrollingElement = document.scrollingElement || document.documentElement;
        var de = document.documentElement;

        var getScrollTopMax = function() {
            if (!isScrollTopMax) {
                return Math.max(0, getScrollHeight() - getClientHeight());
            };

            if (!win.isActive) {
                var sbox = self.refs['root'];
                if (sbox) {
                    return sbox.scrollTopMax;
                };
            };

            return scrollingElement.scrollTopMax;
        };

        var getClientHeight = function() {
            if (!win.isActive) {
                var sbox = self.refs['root'];
                if (sbox) {
                    return sbox.clientHeight;
                };
            };

            return de.clientHeight;
        };

        var getScrollHeight = function() {
            if (!win.isActive) {
                var sbox = self.refs['root'];
                return sbox ? sbox.scrollHeight : 0;
            };

            return de.scrollHeight;
        };

        var win = new Win({
            isActive: !!self.props.isActive,
            isPopup: !!self.props.isPopup,
            getPage: function() {
                return self.props.page;
            },

            getScrollHeight,
            getScrollTopMax,
            getClientHeight,

            getScroll: function(x, y) {
                if (!win.isActive) {
                    var sbox = self.refs['root'];
                    return {
                        x: 0,
                        y: sbox ? sbox.scrollTop : 0,
                    };
                };

                return win._getWindowScroll();
            },

            setScroll: function(x, y) {
                if (!win.isActive) {
                    var sbox = self.refs['root'];
                    if (sbox) {
                        sbox.scrollTop = y;
                    };
                } else {
                    window.scrollTo(x, y);
                };
            },

            title: function(title) {
                //document.title = title;
            }
        });

        this._win = win;
        return {};
    },

    render: function () {
        var props = this.props
        var page = props.page;
        var self = this;

        var isActive = !!props.isActive;

        var mixNoActiveWidth = !isActive ? '-noActiveWidth' : '';
        var mixActive = isActive ? '-isActive' : '-noActive';

        return [
            {
                class: b('', props.mix, mixActive, isFix ? mixNoActiveWidth : null),
                ref: 'root',
            }
            , [b('wrap', mixActive, isFix ? null : mixNoActiveWidth)
                , ({
                    class: props.layout,
                    isActive: isActive,
                    page: page,
                    ref: 'v',
                })
            ]
        ];
    },

    componentWillUnmount: function() {
        this._win._unmount();
    },

    componentWillReceiveProps: function(nextProps) {
        var curProps = this.props;

        if (this._win.isActive) {
            this._win._setActive(nextProps.isActive);
        };
    },

    componentDidUpdate: function() {
        this._upActive();
    },

    componentDidMount: function() {
        var win = this._win;
        var self = this;

        var supportPageOffset = window.pageXOffset !== undefined;

        win.groupEvents(document, 'scroll', function(e) {
            if (!win.isActive || win.isFreezeScroll) {
                return;
            };

            var sc = win._getWindowScroll();
            win._evScroll(sc.x, sc.y);
        });

        win.groupEvents(document, 'resize', function(e) {
            if (!win.isActive) {
                return;
            };

            win.emit('resize');
        });

        win._mount();
        this._upActive();
    },


    _upActive: function() {
        var win = this._win;

        this._win._setActive(this.props.isActive);

        if (this._currentPage !== this.props.page) {
            this._currentPage = this.props.page
            win._evChangePage(this._currentPage);
            return;
        };

        if (this._isWinActive !== win.isActive) {
            this._isWinActive = win.isActive;

            win.upScroll();
            return;
        };
    },

});
