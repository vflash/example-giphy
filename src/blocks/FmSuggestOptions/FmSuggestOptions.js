import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, getDOM, cmps, view, bem, jr, t} = _cmps;

import '../FmScrollBox/FmScrollBox.js';

import './FmSuggestOptions.sass';
var b = bem('FmSuggestOptions');


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

export function filterOptions(options, search, limit) {
    if (!options || !options.length) {
        return options || [];
    };


    if (search) {
        let filter = search.toLocaleLowerCase();

        options = options.filter((item, index) => {
            return item.toLocaleLowerCase().indexOf(filter) !== -1;
        });
    };

    if (limit != null && options.length > limit) {
        options = options.slice(0, limit);
    };

    return options;
};

function propsList(props) {
    var list = props.list;
    if (!Array.isArray(list)) {
        let data = list;
        list = [];
        for (let i in data) {
            list.push('' + data[i]);
        };

        list.sort();
    };

    return list;
};


cmps('FmSuggestOptions_Option', {
    init: function() {
        exComponentUpdate(this, true);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var {cursor, search, value} = props;
        var text = '' + value;

        return [
            {
                class: b('option', '-cursor' + (cursor ? '' : '-no')),
                //onMouseEnter: this._onMouseEnter,
                onMouseDown: this._onMouseEnter,
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


cmps('FmSuggestOptions', {
    exComponentUpdate: function(props, state) {
        return [state, props.list];
    },

    defaultProps: {
        position: 'bottomLeft, topLeft, bottomLeft', // позичия BoxNear
        filter: filterOptions, // function
        search: '',
        list: [],
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, true);

        this._lastRenderList = [propsList(this.props), null, ''];
        this._renderAll = false; // если ниразу не показывали то не рендрим список
        this._cursor = null; // null | 0,1,2,...
        this._search = '';
        this._show = false;
    },

    render: function() {
        var props = this.props;
        var self = this;

        var search = this._search;
        var isShow = this._show;

        if (isShow) {
            var [list, cursor, search] = this._getList(search);
            if (list.length) {
                this._lastRenderList = [list, cursor];
            } else {
                isShow = false;
            };
        };

        if (!isShow) {
            var [list, cursor, search] = this._lastRenderList;
        };

        if (isShow) {
            this._renderAll = true;
        };

        return [
            {
                floatBox: 'rootFloatBoxInputNode',
                position: props.position,
                getNear: this._getNear,
                class: cmps.BoxNear,
                skin: 'select', //pure|menu|title
                fixed: false,
                show: isShow,
                mix: b('menu'),
                ref: 'menu',
            }
            , [
                {
                    class: cmps.FmScrollBox,
                    onMouseDown: this._onMouseDown,
                    mix: b('options', props.mix),
                    ref: 'box',
                }
                , (this._renderAll
                    ? jr.map(list, (value, index) => {
                        return ({
                            onHover: this._onHover,
                            onClick: this._onClick,
                            class: cmps.FmSuggestOptions_Option,
                            cursor: cursor === index,
                            search,
                            value,
                            index,
                            ref: 'i' + index,
                            key: index,
                        });
                    })
                    : null
                )
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    _onMouseDown: function(e) {
        this.props.reFocus();
        e.preventDefault();
    },

    _onClick: function(e) {
        this.enter(e.value);
    },

    _onHover: function(i) {
        this.update({_cursor: i});
    },

    _getNear: function() {
        var near = this.props.getNear();
        var box = this.refs.box;
        if (!near || !box) {
            return near;
        };

        getDOM(box).style.minWidth = (getDOM(near).clientWidth - 2) + 'px';
        return near;
    },


    _cursorScrollUp: function(center) {
        var cursor = this._cursor;

        if (!cursor) {
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
        };

        if (scroll > top) {
            this._setScrollY(top < 3 ? 0 : top);
            return true;
        };

        return false;
    },

    _setScrollY: function(y) {
        this.refs.box.setScrollY(y);
    },


    _getList: function(search) {
        var cursor = this._cursor;
        var props = this.props;
        var list = (props.filter || filterOptions)(propsList(props), search);
        var max = 0;

        if (max && (list.length > max)) {
            list.length = max;
        };

        if (cursor >= list.length) {
            cursor = list.length ? list.length - 1 : null;
        };

        return [list, cursor, search];
    },

    _down: function() { // курсор вниз
        var [list, cursor] = this._getList(this._search);
        this.update({
            _cursor: cursor != null ? Math.max(0, Math.min(list.length - 1, cursor + 1)) : 0,
        });

        this._cursorScrollUp();
    },

    _up: function() { // курсор вверх
        var [list, cursor] = this._getList(this._search);
        if (cursor == null) {
            return false;
        };

        this.update({
            _cursor: cursor > 0 ? Math.max(0, Math.min(list.length - 1, cursor - 1)) : 0,
        });

        this._cursorScrollUp();
        return true;
    },

    scrollTo: function() {
        this._cursorScrollUp(true);
    },

    search: function(search) {
        if (this._search !== search) {
            this._search = '' + search;
            this._cursor = null;
            this._show = !!this._search;

            this._setScrollY(0);
            this.update();
        };
    },

    enter: function(value) {
        var value = this.get();
        if (value == null) {
            return false;
        };

        this.update({
            _search: value,
            _show: false,
        });

        if (!value) {
            return false;
        };

        var fn = this.props.onSelect;
        if (fn) {
            fn({value});
        };

        return true;
    },

    show: function() {
        this.update({_show: true});
    },

    hide: function() {
        var value = this.get();

        this.update({_show: false});
        return value != null;
    },

    down: function(search) { // курсор вниз
        if (this._show) {
            this._down();
            return true;
        };

        this.update(
            {
                _search: search == null ? this._search : search,
                _cursor: 0,
                _show: true,
            }
            , () => {
                this._cursorScrollUp()
            }
        );

        return true;
    },

    up: function() {
        return this._up();
    },

    get: function() {
        if (!this._show) {
            return null;
        };

        var [list, cursor] = this._getList(this._search);
        return cursor != null ? list[cursor] : null;
    },

});


