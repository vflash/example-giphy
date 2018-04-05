import * as _cmps from '../cmps.js'; const {exComponentUpdate, getDOM, cmps, view, bem, jr, t} = _cmps;
import {filterOptions} from '../FmOptions/FmOptions.js';

import '../FmOptions/FmOptions.js';
import '../FmInput/FmInput.js';
import '../BoxNear/BoxNear.js';

import './FmSelectFind.sass';
var b = bem('FmSelectFind');




cmps('FmSelectFind', {
    exComponentUpdate: function(props, state) {
        var error = props.error || false;
        return [
            error.isContextObject ? !!error.error : !!error,
            props.options,
            state,
        ];
    },

    defaultProps: {
        onlyOption: false, // метод get возврашает значения только из списка option
        onChange: null, // function

        placeholder: '',
        autoFocus: false,
        position: 'bottomLeft, topLeft, bottomLeft', // позичия BoxNear
        disabled: false,
        options: [],
        error: false,
        //label: 'Empty label',
        label: void(0), // null|string
        title: '',
        value: '', // only string
        name: null, // string
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, true);

        this._minWidth = null,
        this._isFocus = false;
        this._isShow = false; // показать список
        this._cursor = null;
        this._search = null;
        this._value = null;
    },

    render: function() {
        var props = this.props;
        var self = this;

        var error = props.error || false;

        var value = this._value;
        if (value == null) {
            value = props.value;
        };

        var disabled = !!props.disabled;
        var options = props.options;
        if (!options || !options.length) {
            disabled = true;
        };

        var valueText = findText(props.options, value);
        var isError = error.isContextObject ? !!error.error : !!error;
        var isFocus = this._isFocus;
        var isShow = this._isShow;
        var search = this._search;
        var cursor = this._cursor;

        if (!isShow) {
            cursor = this._cursorRender;
            search = this._searchRender;
        };

        var options = filterOptions(props.options, search);
        if (cursor == null && !search && isShow) {
            cursor = this._cursor = findCursor(options, value);
        };

        this._cursorRender = cursor;
        this._searchRender = search;

        return [
            {
                class: cmps.FmInput,

                onMouseDown: this._onMouseDownInput,
                onKeyDown: this._onKeyDown,
                onChange: this._onChangeInput,
                onFocus: this._onFocus,
                onBlur: this._onBlur,

                placeholderAsText: !!valueText && (!isShow || !isFocus),
                placeholder: valueText || props.placeholder,
                autoFocus: props.autoFocus,
                disabled: disabled,
                readonly: !isFocus,
                label: null,
                error: !!isError,
                modeActive: isFocus || !!valueText,
                value: isFocus ? this._search : '',
                title: props.title,
                label: props.label,
                name: props.name,

                mixPadRight: b('padRight'),
                mix: b('', props.mix, {
                    disabled: !!disabled || 'no',
                    pointer: !isShow || !isFocus,
                }),
                ref: 'input',
            }
            , (!!options.length
                ? [
                    {
                        floatBox: 'rootFloatBoxInputNode',
                        position: props.position,
                        getNear: this._getNear,
                        class: cmps.BoxNear,
                        skin: 'select', //pure|menu|title
                        fixed: false,
                        show: isShow,
                        ref: 'floatBox',
                    }
                    , ({
                        class: cmps.FmOptions,
                        onSelect: this._onSelect,
                        onHover: this._onHover,
                        options: options,
                        cursor: cursor != null && cursor >=0 ? cursor : null,
                        filter: true,
                        search: search,
                        show: !!isShow,
                        mix: b('options'),
                        ref: 'options',
                    })
                ]
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
    componentDidMount: function() {
        var cmp = this.refs.floatBox;
        if (cmp) {
            cmp.up();
        };
    },

    _onChangeInput: function(e) {
        e.cancel();

        this.update({
            _cursor: (e.value||'').trim() ? 0 : null,
            _search: e.value || null,
            _isShow: true,
        }, () => {
            if (!this._search) {
                this._scrollToCursor();
            };
        });
    },

    _onMouseDownInput: function() {
        if (new Date() - this._timeFocus < 30) {
            return;
        };

        if (!this._isShow) {
            this.update({_isShow: true, _cursor: null}, this._scrollToCursor);
            return;
        };

        if (!this._search) {
            this.update({_isShow: false});
        };
    },

    _onFocus: function() {
        this._timeFocus = +new Date();

        clearTimeout(this._timmerBlur);
        if (this._isFocus) {
            return;
        };

        var props = this.props;
        var value = this._value;
        if (value == null) {
            value = props.value;
        };

        if (findIndex(props.options, value) === -1) {
            this.update({
                _isFocus: true,
                _isShow: true,
                _cursor: -1,
            });
        };

        this.update({
            _isFocus: true,
        });
    },

    _onBlur: function() {
        this._timmerBlur = setTimeout(() => {
            this.update({
                _isFocus: false,
                _isShow: false,
                _cursor: null,
                _search: null,
            });
        }, 20);
    },


    _onKeyDown: function(e) {
        var isShow = this._isShow;
        var cursor = this._cursor;
        var search = this._search;
        var key = e.key;

        if (key === 'Escape') {
            e.preventDefault();
            if (this._search) {
                this.update({_cursor: null,_search: null}, this._scrollToCursor);
                return;
            };

            this.update({
                _isShow: false,
                _cursor: null,
            });
            return;
        };

        if (key === 'Enter') {
            e.preventDefault();

            let options = filterOptions(this.props.options, search);
            let selected = cursor != null && cursor >= 0 ? options[cursor] : null;
            if (selected) {
                this._onChange({value: selected[0]});
            };
            return;
        };


        if (key !== 'ArrowDown' && key !== 'ArrowUp') {
            return;
        };

        e.preventDefault();

        var value = this._value;
        if (value == null) {
            value = str(this.props.value);
        };

        if (key === 'ArrowUp') {
            if (cursor != null) {
                //cursor = cursor > 0 ? cursor - 1 : 0;
                cursor = cursor > 0 ? cursor - 1 : search ? 0 : -1;

                if (cursor === -1) {
                    isShow = false;
                };
            };

        } else {
            if (isShow || cursor === -1 || !value) {
                cursor = cursor != null && cursor >= 0 ? cursor + 1 : 0;
            };

            isShow = true;
        };

        if (cursor != null && cursor >= 0) {
            let options = filterOptions(this.props.options, search);
            cursor = (options.length
                ? Math.min(options.length - 1, cursor)
                : null
            );
        };

        this.update({_cursor: cursor, _isShow: isShow}
            , !this._isShow ? this._scrollToCursor : null
        );
    },

    _onSelect: function(e) {
        this._cursorRender = e.index;
        this.update({cursor: e.index});

        this._onChange(e);
    },

    _onHover: function(e) {
        this.update({_cursor: e.index});
    },

    _onChange: function(e) {
        var isReadonly = !!(this.props.readonly || this.getContext('readonly'));
        if (isReadonly) {
            return;
        };

        var error = this.props.error || false;
        var value = str(e.value);
        var fn = this.props.onChange;

        if (fn) {
            var isCancel = false;
            let e;

            fn(e = {
                cancel: function() {isCancel = true},
                target: this,
                value: value,
            });

            value = e.value;

            if (isCancel) {
                return;
            };
        };

        this.getContext('changeEvent');

        if (error.isContextObject && !!error.error) {
            this._value = value;
            error.error = false;

            view.update();
            return;
        };

        this.update({
            _isShow: false,
            _cursor: null,
            _search: null,
            _value: value,
        });
    },

    _scrollToCursor: function() {
        var inp = this.refs['options'];
        inp && inp.scrollTo(true);
    },

    _getNear: function() {
        var input = this.refs.input;
        if (!input) {
            return;
        };

        getDOM(this.refs.options).style.minWidth = (getDOM(input).clientWidth - 2) + 'px';
        return input;
    },

    reset: function() {
        this.update({_value: null});
    },

    focus: function() {
        this.refs['input'].focus();
    },

    set: function(value) {
        var option = find(this.props.options, value);
        if (option) {
            this._onChange({value: option[0]});
        };
    },

    get: function() { // strict - только из options
        var value = this._value;
        var props = this.props;

        value = value == null ? props.value : value;

        if (props.onlyOption) {
            return (findIndex(props.options, value) !== -1
                ? value
                : null
            );
        };

        return str(value);
    },
});


function findCursor(options, id) {
    if (id == null) {
        return null;
    };

    var i = findIndex(options, id);
    return i >= 0 ? i : null;
};

function findText(options, id) {
    var i = findIndex(options, id);
    return i >= 0 ? ('' + options[i][1]).trim() : null;
};

function findIndex(options, id) {
    if (!options) {
        return -1;
    };

    var i = options.length;
    while(i--) {
        if (options[i][0] == id) {
            break;
        };
    };

    return i;
};

function find(options, value) {
    var i = findIndex(options, id);
    return i !== -1 ? options[i] : null;
};

function str(value, def) {
    return value != null ? '' + value : (def != null ? '' + def : '');
};
