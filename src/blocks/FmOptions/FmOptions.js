import * as _cmps from '../cmps.js'; const {exComponentUpdate, getDOM, cmps, view, bem, jr, t} = _cmps;
import autoStopMouseWheel from 'src/tools/autoStopMouseWheel.js';

import '../FmScrollBox/FmScrollBox.js';
import './FmOptions.sass';
var b = bem('FmOptions');

export function filterOptions(options, search, limit) {
    if (!options || !options.length) {
        return options || [];
    };

    if (search) {
        let filter = search.toLocaleLowerCase();
        options = options.filter((item, index) => {
            return item[1].toLocaleLowerCase().indexOf(filter) !== -1;
        });
    };

    if (limit != null && options.length > limit) {
        options = options.slice(0, limit);
    };

    return options;
};


cmps('FmOptions_Option', {
    init: function() {
        exComponentUpdate(this, true);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var {isCursor, search, value, text, index} = props;

        return [
            {
                class: b('Option', '-cursor' + (isCursor ? '' : '-no')),
                //onMouseEnter: this._onMouseEnter,
                onMouseMove: this._onMouseEnter,
                onClick: this._onClick,
            }
            , ['text'
                , (!!search
                    ? jr.map(toSearchList(text, search), (text, index) => {
                        return (index % 2
                            ? [{tag: 'b', key: index}, text]
                            : text || null
                        );
                    })
                    : ('' + text)
                )
            ]
        ];
    },

    _onMouseEnter: function(e) {
        this.props.onHover(this.props.index);
    },

    _onClick: function(e) {
        e.preventDefault();
        var {props} = this;

        props.onClick({
            index: props.index,
            value: props.value,
        });
    },
});


cmps('FmOptions', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        statusText: null,
        onSelect: null, // null|function
        onHover: null,
        // selected: null, // null|[...] выбранные пункты
        options: null,
        filter: false, // фильтрация по строке поиска
        center: false, // курсор отображать по центру
        search: '',
        cursor: null, // подсветка навигации
        limit: null,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var options = props.options || [];
        var search = (props.search || '').trim();
        var cursor = props.cursor;

        options = filterOptions(options, props.filter ? search : null, props.limit);

        return [
            {
                //class: b('', props.mix),
                class: cmps.FmScrollBox,
                onMouseDown: this._onMouseDown,
                mix: b('', props.mix),
                ref: 'box',
            }

            , jr.map(options, (item, index) => {
                return ({
                    class: cmps.FmOptions_Option,
                    onHover: props.onHover ? this._onHoverOption : null,
                    onClick: this._onClick,
                    isCursor: cursor === index,
                    search: search,
                    index: index,
                    value: item[0],
                    text: item[1],
                    key: index,
                    ref: 'i' + index,
                });
            })

            , (!!props.statusText
                ? [b('status'), props.statusText]
                : null
            )
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    componentDidUpdate: function(prevProps) {
        var cursor = this.props.cursor;

        if (prevProps.cursor !== cursor) {
            let {_cursorHover} = this;
            this._cursorHover = null;

            if (_cursorHover === cursor) {
                this._timeChangeCursor = null;
                return;
            };

            this._timeChangeCursor = +new Date();
            if (!this._scrollTo(cursor, prevProps.cursor == null)) {
                this._timeChangeCursor = null;
            };
        };
    },

    componentDidMount: function() {
        this._scrollTo(this.props.cursor, true);
    },

    _onHoverOption: function(index) {
        var {props} = this;
        var fn = props.onHover;

        if (+new Date() - this._timeChangeCursor < 300) {
            return;
        };

        if (!fn || props.cursor === index || this._cursorHover === index) {
            return;
        };

        this._timeChangeCursor = null;
        this._cursorHover = index;

        fn({target: this, index});
    },

    _onMouseDown: function(e) {
        e.preventDefault();
    },

    _onClick: function(e) {
        var fn = this.props.onSelect;
        if (fn) {
            fn({
                index: e.index,
                value: e.value,
                target: this,
            });
        };
    },

    _scrollTo: function(cursor, center) {
        if (!this.props.cursor) {
            this._setScrollY(0);
            return false;
        };

        var elm = getDOM(this.refs['i' + cursor]);
        var box = this.refs['box'];

        if (!elm) {
            return false;
        };

        var height = box.getClientHeight();
        var scroll = box.getScrollY();;
        var top = elm.offsetTop;
        var x;

        if (center) {
            this._setScrollY(Math.max(0, ~~(top - height/2 + elm.offsetHeight/2)));
            return true;
        };

        if (scroll + height - 3 < top + elm.offsetHeight) {
            x = Math.max(0, Math.min(top, top - height + elm.offsetHeight));
            this._setScrollY(x);
            return true;
        } else if (scroll > top) {
            this._setScrollY(top < 3 ? 0 : top);
            return true;
        };

        return false;
    },

    _setScrollY: function(y) {
        this.refs.box.setScrollY(y);
    },

    getVisibleOptions: function() {
        var props = this.props;
        var search = props.filter ? (props.search || '').trim() : null;
        return filterOptions(props.options, search, props.limit);
    },

    scrollTo: function() {
        this._scrollTo(this.props.cursor, true);
    },

    get: function(index) {
        return (typeof index === 'number'
            ? this.getVisibleOptions()[index] || null
            : null
        );
    },
});

function toSearchList(text, search) {
    if (!search) {
        return [text];
    };

    var m = text.toLocaleLowerCase().split(search.toLocaleLowerCase());
    if (m.length < 2) {
        return [text];
    };

    var searchLength = search.length;
    var textLength = text.length;
    var res = [];
    var i = 0;

    if (!m[m.length - 1]) {
        //m.length -= 1;
    };

    var lastIndex = m.length - 1;

    m.forEach((x, index) => {
        if (index === lastIndex && !x) {
            return;
        };

        var {length} = x;
        res.push(length ? text.substr(i, length) : '');
        if (index === lastIndex) {
            return;
        };

        i += length;
        res.push(text.substr(i, searchLength));
        i += searchLength;
    });

    return res;
};
